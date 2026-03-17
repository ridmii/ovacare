"""
Simple test to debug model predictions
"""

import tensorflow as tf
import numpy as np
import cv2
from pathlib import Path

def test_model_prediction():
    """Test the model with a known normal ultrasound image"""
    
    # Paths
    model_path = r"C:\Users\heyri\OneDrive\Desktop\ovacare\backend\models\pcod_training\outputs\checkpoints\best_model_phase3.h5"
    test_image_path = r"C:\Users\heyri\OneDrive\Desktop\ovacare\frontend\public\assets\test\noninfected\Image_004.jpg"
    
    print("🔍 Testing Model Prediction")
    print("=" * 50)
    print(f"Model: {model_path}")
    print(f"Test Image: {test_image_path}")
    print(f"Expected: NORMAL/NON-PCOS (class 0)")
    print()
    
    try:
        # Load model
        print("Loading model...")
        model = tf.keras.models.load_model(model_path, compile=False)
        print(f"✅ Model loaded: {model.count_params():,} parameters")
        
        # Load and preprocess image
        print("Loading test image...")
        image = cv2.imread(test_image_path)
        if image is None:
            print(f"❌ Cannot load image: {test_image_path}")
            return
        
        print(f"Original image shape: {image.shape}")
        
        # Preprocess exactly as in training
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = cv2.resize(image, (380, 380))  
        image = image.astype(np.float32) / 255.0
        
        # ImageNet normalization
        mean = [0.485, 0.456, 0.406]
        std = [0.229, 0.224, 0.225]
        image = (image - np.array(mean)) / np.array(std)
        
        # Add batch dimension
        image = np.expand_dims(image, axis=0)
        print(f"Preprocessed shape: {image.shape}")
        
        # Make prediction
        print("Making prediction...")
        prediction = model.predict(image, verbose=0)
        print(f"Raw prediction: {prediction}")
        print(f"Prediction shape: {prediction.shape}")
        
        # Interpret results
        pred_value = float(prediction[0][0])
        predicted_class = 1 if pred_value > 0.5 else 0
        confidence = pred_value if predicted_class == 1 else (1 - pred_value)
        
        print()
        print("RESULTS:")
        print(f"Raw prediction value: {pred_value:.6f}")
        print(f"Predicted class: {predicted_class} ({'PCOS' if predicted_class == 1 else 'Normal'})")
        print(f"Confidence: {confidence:.1%}")
        
        # Check correctness
        expected_class = 0  # Normal (noninfected)
        is_correct = predicted_class == expected_class
        print(f"Expected class: {expected_class} (Normal)")
        print(f"Prediction correct: {'✅ YES' if is_correct else '❌ NO'}")
        
        if not is_correct:
            print()
            print("🚨 ISSUE DETECTED:")
            print("Model is predicting PCOS for a normal image!")
            print("This suggests a problem with:")
            print("1. Model training/convergence")
            print("2. Preprocessing mismatch") 
            print("3. Class label confusion")
            
    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_model_prediction()