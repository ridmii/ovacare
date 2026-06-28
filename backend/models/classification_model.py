import numpy as np
from typing import Dict, Any
from pathlib import Path
import os
import random

# Path to the trained PCOS model
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'pcod_training', 'outputs', 'checkpoints', 'best_model_phase3.h5')

# Global variable to store loaded model
_loaded_model = None

def load_classification_model():
    """Load or mock the trained PCOS classification model."""
    global _loaded_model
    
    if _loaded_model is None:
        try:
            model_path = Path(MODEL_PATH)
            if not model_path.exists():
                # Use a mock model for development
                print(f"⚠️  Model not found at: {model_path}")
                print("Using mock classification model for development")
                _loaded_model = "mock_model"
                return _loaded_model
            else:
                # Will load tensorflow model if available
                try:
                    import tensorflow as tf
                    print(f"Loading PCOS classification model from: {model_path}")
                    _loaded_model = tf.keras.models.load_model(str(model_path), compile=False)
                    _loaded_model.compile(
                        optimizer='adam',
                        loss='binary_crossentropy',
                        metrics=['accuracy']
                    )
                    print(f"✅ PCOS model loaded successfully!")
                    return _loaded_model
                except ImportError:
                    print("TensorFlow not available - using mock model")
                    _loaded_model = "mock_model"
                    return _loaded_model
            
        except Exception as e:
            print(f"❌ Error loading PCOS model: {e}")
            print("⚠️ Falling back to mock predictions")
            _loaded_model = "mock_model"
            return _loaded_model
    
    return _loaded_model

def classify_ultrasound(image: np.ndarray) -> Dict[str, Any]:
    """
    Classify ultrasound image for PCOS detection.
    
    Args:
        image: Preprocessed ultrasound image
        
    Returns:
        Dictionary containing classification results
    """
    try:
        # Load model
        model = load_classification_model()
        
        if model == "mock_model" or model is None:
            # Return mock classification
            return _mock_classification()
        
        print(f"🔍 Input image shape: {image.shape}")
        
        # Make prediction
        prediction = model.predict(image, verbose=0)
        pred_value = float(prediction[0][0])
        
        # Convert to classification result
        predicted_class = 1 if pred_value > 0.5 else 0
        confidence = pred_value if predicted_class == 1 else (1 - pred_value)
        
        # Determine diagnosis and severity
        if predicted_class == 1:  # PCOS detected
            diagnosis = "PCOS Detected"
            
            if confidence > 0.8:
                severity = "Severe"
            elif confidence > 0.6:
                severity = "Moderate"
            else:
                severity = "Mild"
        else:  # Normal
            diagnosis = "Normal Ovarian Structure"
            severity = "Mild"
        
        return {
            'diagnosis': diagnosis,
            'confidence': round(float(confidence * 100), 1),
            'severity': severity,
            'predicted_class': predicted_class,
            'model_used': 'EfficientNetB4_Phase3_Trained'
        }
        
    except Exception as e:
        print(f"❌ Classification error: {e}")
        return {
            'diagnosis': 'Analysis Failed',
            'confidence': 0.0,
            'severity': 'Mild',
            'error': str(e),
            'model_used': 'Error'
        }

def _mock_classification() -> Dict[str, Any]:
    """Mock classification for when model is not available."""
    confidence = random.uniform(65, 85)
    diagnosis = "Normal Ovarian Structure" if random.random() > 0.4 else "PCOS Detected"
    
    return {
        'diagnosis': diagnosis,
        'confidence': round(confidence, 1),
        'severity': 'Mild' if diagnosis == "Normal Ovarian Structure" else 'Moderate',
        'model_used': 'Mock/Development'
    }

# Initialize model on import
print("🔄 Initializing PCOS classification model...")
load_classification_model()
