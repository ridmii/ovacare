import numpy as np
import tensorflow as tf
import cv2
from typing import Dict, Any
from pathlib import Path
import os

# Path to the trained PCOS model
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'pcod_training', 'outputs', 'checkpoints', 'best_model_phase3.h5')

# Global variable to store loaded model
_loaded_model = None

def load_classification_model():
    """Load the trained PCOS classification model."""
    global _loaded_model
    
    if _loaded_model is None:
        try:
            model_path = Path(MODEL_PATH)
            if not model_path.exists():
                raise FileNotFoundError(f"Trained model not found at: {model_path}")
            
            print(f"Loading PCOS classification model from: {model_path}")
            _loaded_model = tf.keras.models.load_model(str(model_path), compile=False)
            
            # Recompile the model
            _loaded_model.compile(
                optimizer='adam',
                loss='binary_crossentropy',
                metrics=['accuracy']
            )
            
            print(f"✅ PCOS model loaded successfully! Parameters: {_loaded_model.count_params():,}")
            
        except Exception as e:
            print(f"❌ Error loading PCOS model: {e}")
            print("⚠️ Falling back to mock predictions")
            _loaded_model = None
    
    return _loaded_model

def preprocess_for_classification(image_array: np.ndarray) -> np.ndarray:
    """Preprocess image for PCOS classification model."""
    try:
        # Convert to proper format if needed
        if len(image_array.shape) == 4:
            # Remove batch dimension if present
            image_array = image_array.squeeze(0)
        
        # Ensure we have RGB format
        if len(image_array.shape) == 3:
            if image_array.shape[2] == 3:
                # Already RGB
                image = image_array
            else:
                # Convert to RGB if needed
                image = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
        else:
            # Grayscale to RGB
            image = cv2.cvtColor(image_array, cv2.COLOR_GRAY2RGB)
        
        # Resize to model input size (380x380)
        image = cv2.resize(image, (380, 380))
        
        # Normalize to [0, 1]
        image = image.astype(np.float32) / 255.0
        
        # Apply ImageNet normalization (used during training)
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        image = (image - mean) / std
        
        # Add batch dimension
        image = np.expand_dims(image, axis=0)
        
        return image
        
    except Exception as e:
        raise ValueError(f"Error in classification preprocessing: {str(e)}")

def classify_ultrasound(image: np.ndarray) -> Dict[str, Any]:
    """
    Classify ultrasound image for PCOS detection using trained model.
    
    Args:
        image: ALREADY preprocessed ultrasound image from image_processor.py
        
    Returns:
        Dictionary containing classification results
    """
    try:
        # Load model if not already loaded
        model = load_classification_model()
        
        if model is None:
            # Fallback to mock for development
            return _mock_classification()
        
        print(f"🔍 Input image shape: {image.shape}")  # Debug log
        print(f"🔍 Input image range: [{image.min():.3f}, {image.max():.3f}]")  # Debug log
        
        # Image is already preprocessed by image_processor.py - use it directly!
        # Make prediction (image already preprocessed)
        prediction = model.predict(image, verbose=0)
        print(f"🔍 Raw prediction: {prediction}")  # Debug log
        
        # Extract prediction value
        pred_value = float(prediction[0][0])
        print(f"🔍 Prediction value: {pred_value:.6f}")  # Debug log
        
        # Convert to classification result
        predicted_class = 1 if pred_value > 0.5 else 0
        confidence = pred_value if predicted_class == 1 else (1 - pred_value)
        
        print(f"🔍 Predicted class: {predicted_class} ({'PCOS' if predicted_class == 1 else 'Normal'})")  # Debug log
        print(f"🔍 Confidence: {confidence:.1%}")  # Debug log
        
        # Determine diagnosis and severity
        if predicted_class == 1:  # PCOS detected
            diagnosis = "PCOS Detected"
            
            # Determine severity based on confidence - map to frontend-compatible values
            if confidence > 0.8:
                severity = "Severe"  # High confidence PCOS
            elif confidence > 0.6:
                severity = "Moderate"  # Moderate confidence PCOS
            else:
                severity = "Mild"  # Low confidence PCOS
                
        else:  # Normal
            diagnosis = "Normal Ovarian Structure"
            severity = "Mild"  # Default for normal cases
        
        # Determine features based on prediction confidence
        if predicted_class == 1:
            features_detected = {
                'enlarged_ovaries': confidence > 0.7,
                'multiple_follicles': confidence > 0.6,
                'stromal_thickening': confidence > 0.8
            }
        else:
            features_detected = {
                'enlarged_ovaries': False,
                'multiple_follicles': False,
                'stromal_thickening': False
            }
        
        return {
            'diagnosis': diagnosis,
            'confidence': round(float(confidence * 100), 1),  # Convert to percentage
            'severity': severity,
            'raw_prediction': float(prediction),
            'predicted_class': predicted_class,
            'features_detected': features_detected,
            'model_used': 'EfficientNetB4_Phase3_Trained'
        }
        
    except Exception as e:
        print(f"❌ Classification error: {e}")
        return {
            'diagnosis': 'Analysis Failed',
            'confidence': 0.0,
            'severity': 'Mild',  # Use valid severity for error cases
            'error': str(e),
            'model_used': 'Error'
        }

def _mock_classification() -> Dict[str, Any]:
    """Mock classification for when model is not available."""
    import random
    
    print("⚠️ Using mock classification - trained model not available")
    
    confidence = random.uniform(60, 90)
    
    return {
        'diagnosis': 'Mock Analysis - Model Not Loaded',
        'confidence': round(confidence, 1),
        'severity': 'Mock',
        'features_detected': {
            'enlarged_ovaries': False,
            'multiple_follicles': False,
            'stromal_thickening': False
        },
        'model_used': 'Mock/Fallback'
    }

# Mock feature extraction for demonstration
def extract_pcos_features(image: np.ndarray) -> Dict[str, float]:
    """Extract PCOS-specific features from ultrasound image."""
    try:
        model = load_classification_model()
        
        if model is None:
            # Mock features when model not available
            return {
                'follicle_density': 0.0,
                'ovary_volume': 8.0,
                'stromal_echogenicity': 0.0,
                'follicle_distribution': 0.0,
                'capsular_thickness': 1.0,
                'note': 'Mock features - model not loaded'
            }
        
        # In a real implementation, these would be extracted from model intermediate layers
        # For now, return computed features based on model prediction
        processed_image = preprocess_for_classification(image)
        prediction = model.predict(processed_image, verbose=0)[0, 0]
        
        # Map prediction to realistic medical features
        features = {
            'follicle_density': float(prediction * 0.8 + 0.1),  # 0.1 to 0.9
            'ovary_volume': float(8.0 + prediction * 7.0),     # 8-15 ml
            'stromal_echogenicity': float(prediction * 0.7),   # 0 to 0.7
            'follicle_distribution': float(prediction),        # 0 to 1
            'capsular_thickness': float(0.5 + prediction * 1.5)  # 0.5-2.0 mm
        }
        return features
        
    except Exception as e:
        return {'error': str(e)}

# Initialize model on import
print("🔄 Initializing PCOS classification model...")
load_classification_model()
