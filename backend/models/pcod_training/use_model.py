"""
PCOS Model - Simple Usage Script
Your training is COMPLETE! Use this to make predictions.
"""

import tensorflow as tf
import numpy as np
import cv2
import json
from pathlib import Path

def predict_pcos_simple(image_path, model_path=None):
    """
    Simple PCOS prediction function
    
    Args:
        image_path: Path to ultrasound image
        model_path: Path to model (uses Phase 3 by default)
    
    Returns:
        dict: Prediction results
    """
    if model_path is None:
        model_path = r"C:\Users\heyri\OneDrive\Desktop\ovacare\backend\models\pcod_training\outputs\checkpoints\best_model_phase3.h5"
    
    try:
        # Load model with compile=False to avoid custom object issues
        print("Loading PCOS detection model...")
        model = tf.keras.models.load_model(model_path, compile=False)
        print(f"✅ Model loaded: {model.count_params():,} parameters")
        
        # Load and preprocess image
        print(f"Processing image: {image_path}...")
        image = cv2.imread(str(image_path))
        if image is None:
            return {"error": f"Cannot load image: {image_path}"}
        
        # Preprocess for EfficientNet
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = cv2.resize(image, (380, 380))  # EfficientNetB4 size
        image = image.astype(np.float32) / 255.0
        
        # ImageNet normalization
        mean = [0.485, 0.456, 0.406]
        std = [0.229, 0.224, 0.225]
        image = (image - np.array(mean)) / np.array(std)
        
        # Add batch dimension
        image = np.expand_dims(image, axis=0)
        
        # Predict
        prediction = model.predict(image, verbose=0)[0, 0]
        
        # Interpret
        is_pcos = prediction > 0.5
        confidence = prediction if is_pcos else (1 - prediction)
        
        result = {
            "image_file": str(image_path),
            "prediction": "PCOS Detected" if is_pcos else "Normal",
            "probability": float(prediction),
            "confidence": float(confidence),
            "interpretation": get_medical_interpretation(prediction),
            "model_info": "EfficientNetB4 - 3-phase trained model"
        }
        
        return result
        
    except Exception as e:
        return {"error": f"Prediction failed: {e}"}

def get_medical_interpretation(probability):
    """Get medical interpretation"""
    if probability > 0.8:
        return "High confidence PCOS detection - recommend medical consultation"
    elif probability > 0.6:
        return "Moderate PCOS indicators - consider medical follow-up"
    elif probability > 0.4:
        return "Some PCOS indicators - regular monitoring recommended"
    else:
        return "Low PCOS probability - continue routine screening"

def print_model_info():
    """Print information about your trained models"""
    base_path = Path(r"C:\Users\heyri\OneDrive\Desktop\ovacare\backend\models\pcod_training\outputs\checkpoints")
    
    print("🧠 YOUR TRAINED PCOS MODELS")
    print("="*50)
    
    for phase in [1, 2, 3]:
        model_file = base_path / f"best_model_phase{phase}.h5"
        if model_file.exists():
            size_mb = model_file.stat().st_size / (1024*1024)
            print(f"✅ Phase {phase}: {model_file.name} ({size_mb:.1f} MB)")
        else:
            print(f"❌ Phase {phase}: Not found")
    
    print(f"\n🎯 RECOMMENDED FOR USE: Phase 3 (best_model_phase3.h5)")
    print(f"📁 Location: {base_path}")
    print(f"🏗️ Architecture: EfficientNetB4 with custom medical head")
    print(f"🎯 Target: >90% accuracy PCOS detection")

# Example usage
if __name__ == "__main__":
    print("🎉 PCOS DETECTION MODEL - READY TO USE!")
    print("="*50)
    
    # Show model info
    print_model_info()
    
    # Example prediction (uncomment and provide image path)
    # image_path = r"path\to\your\ultrasound_image.jpg" 
    # result = predict_pcos_simple(image_path)
    # print(f"\n🔬 PREDICTION RESULT:")
    # print(json.dumps(result, indent=2))
    
    print(f"\n📝 HOW TO USE:")
    print(f"1. Uncomment the example lines above")
    print(f"2. Replace 'path\\to\\your\\ultrasound_image.jpg' with real image path")  
    print(f"3. Run: python use_model.py")
    print(f"\n⚠️ Medical Disclaimer: For screening assistance only!")