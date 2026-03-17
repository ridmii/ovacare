"""
Quick Model Export - Rebuild and Save Clean
Avoid all the complex loading issues by rebuilding the architecture
"""

import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB4
from tensorflow.keras import layers, Model
import numpy as np
import json
from pathlib import Path
import time
from config import config

def create_clean_model():
    """Create the exact model architecture that was trained"""
    print("🏗️ Building clean EfficientNetB4 model architecture...")
    
    # Build base model
    base_model = EfficientNetB4(
        weights='imagenet',
        include_top=False,
        input_shape=config.INPUT_SHAPE,
        pooling='avg'
    )
    
    # Add custom head (match training architecture)
    x = base_model.output
    x = layers.Dropout(0.3, name='final_dropout_1')(x)
    x = layers.Dense(256, activation='relu', name='final_dense')(x)
    x = layers.Dropout(0.3, name='final_dropout_2')(x)
    predictions = layers.Dense(1, activation='sigmoid', name='final_predictions')(x)
    
    # Create model
    model = Model(inputs=base_model.input, outputs=predictions, name='pcos_detection_clean')
    
    # Compile
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
        loss='binary_crossentropy',
        metrics=['accuracy', 'AUC']
    )
    
    print(f"✅ Clean model created: {model.count_params():,} parameters")
    return model

def load_trained_weights(model):
    """Load weights from the best trained model"""
    print("📁 Loading trained weights...")
    
    weight_files = [
        config.CHECKPOINTS_DIR / 'best_model_phase3.h5',
        config.CHECKPOINTS_DIR / 'best_model_phase2.h5',
        config.CHECKPOINTS_DIR / 'best_model_phase1.h5'
    ]
    
    for weight_file in weight_files:
        if weight_file.exists():
            try:
                print(f"   📂 Loading from: {weight_file}")
                model.load_weights(weight_file)
                print("   ✅ Weights loaded successfully!")
                return True
            except Exception as e:
                print(f"   ⚠️ Failed to load {weight_file}: {e}")
                continue
    
    print("❌ Could not load any weights file")
    return False

def export_clean_model():
    """Export the clean, working model"""
    print("\n💾 EXPORTING CLEAN MODEL")
    print("="*40)
    
    # Create clean model
    model = create_clean_model()
    
    # Load trained weights
    if not load_trained_weights(model):
        print("❌ Cannot export without trained weights")
        return False
    
    # Create export dir
    exports_dir = config.OUTPUT_DIR / "exports" 
    exports_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        # Export 1: Keras H5 format (simplest and most reliable)
        print("💾 Exporting as Keras H5 format...")
        h5_dir = exports_dir / "h5"
        h5_dir.mkdir(exist_ok=True) 
        h5_path = h5_dir / "pcos_model_final.h5"
        
        model.save(h5_path, save_format='h5')
        h5_size = h5_path.stat().st_size / (1024*1024)
        print(f"   ✅ H5 export: {h5_path} ({h5_size:.1f} MB)")
        
        # Export 2: TensorFlow Lite (mobile deployment)
        print("📱 Exporting as TensorFlow Lite...")
        tflite_dir = exports_dir / "tflite"
        tflite_dir.mkdir(exist_ok=True)
        
        converter = tf.lite.TFLiteConverter.from_keras_model(model)
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        tflite_model = converter.convert()
        
        tflite_path = tflite_dir / "pcos_model_mobile.tflite"
        with open(tflite_path, 'wb') as f:
            f.write(tflite_model)
        
        tflite_size = tflite_path.stat().st_size / (1024*1024)
        compression_ratio = h5_size / tflite_size
        print(f"   ✅ TFLite export: {tflite_path} ({tflite_size:.1f} MB, {compression_ratio:.1f}x smaller)")
        
        # Export 3: Weights only (for rebuilding)
        print("⚖️ Exporting weights only...")
        weights_dir = exports_dir / "weights"
        weights_dir.mkdir(exist_ok=True)
        weights_path = weights_dir / "pcos_model_weights.h5"
        
        model.save_weights(weights_path)
        weights_size = weights_path.stat().st_size / (1024*1024)
        print(f"   ✅ Weights export: {weights_path} ({weights_size:.1f} MB)")
        
        # Create comprehensive metadata
        print("📋 Creating model documentation...")
        
        model_metadata = {
            'model_information': {
                'name': 'PCOS Detection Model',
                'version': '1.0.0',
                'architecture': 'EfficientNetB4 with custom classification head',
                'created_date': time.strftime('%Y-%m-%d %H:%M:%S'),
                'training_strategy': '3-phase progressive unfreezing',
                'total_parameters': int(model.count_params()),
                'trainable_parameters': int(sum([tf.keras.backend.count_params(w) for w in model.trainable_weights])),
                'model_size_mb': float(h5_size),
                'input_shape': list(config.INPUT_SHAPE),
                'output_classes': list(config.CLASS_NAMES),
                'target_accuracy': '90%+'
            },
            'exported_formats': {
                'keras_h5': {
                    'file': str(h5_path.name),
                    'path': str(h5_path),
                    'size_mb': float(h5_size),
                    'description': 'Main model file for production use',
                    'usage': 'tf.keras.models.load_model(path)'
                },
                'tensorflow_lite': {
                    'file': str(tflite_path.name),
                    'path': str(tflite_path),
                    'size_mb': float(tflite_size),
                    'compression_ratio': f'{compression_ratio:.1f}x',
                    'description': 'Optimized for mobile and edge deployment',
                    'usage': 'tf.lite.Interpreter(model_path=path)'
                },
                'weights_only': {
                    'file': str(weights_path.name),
                    'path': str(weights_path),
                    'size_mb': float(weights_size),
                    'description': 'Weights file for custom model rebuilding',
                    'usage': 'model.load_weights(path)'
                }
            },
            'preprocessing_requirements': {
                'step_1': 'Resize image to 380x380 pixels',
                'step_2': 'Convert to RGB if needed',
                'step_3': 'Normalize pixel values to [0, 1] range (divide by 255)',
                'step_4': 'Apply ImageNet normalization',
                'mean_values': [0.485, 0.456, 0.406],
                'std_values': [0.229, 0.224, 0.225],
                'formula': '(pixel_value/255.0 - mean) / std',
                'final_shape': '(1, 380, 380, 3) for single image prediction'
            },
            'output_interpretation': {
                'type': 'Binary classification',
                'output_range': '[0, 1]',
                'threshold': 0.5,
                'class_mapping': {
                    '0': 'Non-infected (Normal ovarian structure)',  
                    '1': 'Infected (PCOS indicators detected)'
                },
                'confidence_levels': {
                    'high_confidence': '> 0.8 (strong indication)',
                    'moderate_confidence': '0.6 - 0.8 (moderate indication)', 
                    'low_confidence': '< 0.6 (weak indication)'
                },
                'medical_interpretation': {
                    'high_pcos_score': 'Recommend immediate medical consultation',
                    'moderate_pcos_score': 'Consider medical follow-up examination',
                    'low_pcos_score': 'Continue regular medical screening'
                }
            },
            'deployment_instructions': {
                'production_web': 'Use Keras H5 model with Flask/FastAPI',
                'mobile_app': 'Use TensorFlow Lite model',
                'edge_device': 'Use TensorFlow Lite with quantization',
                'research': 'Use weights file with custom architecture'
            },
            'performance_notes': {
                'training_dataset': '11,784 ultrasound images',
                'validation_method': 'Hold-out validation set', 
                'training_phases': 3,
                'expected_accuracy': '> 90%',
                'inference_time': 'Typically < 100ms on modern CPU',
                'memory_usage': f'~{h5_size:.0f}MB when loaded'
            },
            'legal_disclaimer': {
                'medical_use': 'FOR SCREENING ASSISTANCE ONLY',
                'limitation': 'This model is not a replacement for professional medical diagnosis',
                'recommendation': 'Always consult qualified healthcare professionals',
                'liability': 'Model predictions should not be used as sole basis for medical decisions'
            }
        }
        
        metadata_path = exports_dir / "model_documentation.json"
        with open(metadata_path, 'w') as f:
            json.dump(model_metadata, f, indent=4)
        
        # Create simple Python inference script  
        create_inference_script(exports_dir, h5_path)
        
        # Create final summary
        summary_text = f'''
PCOS DETECTION MODEL - EXPORT SUMMARY
{'='*50}

✅ MODEL SUCCESSFULLY EXPORTED!

📊 Model Details:
   • Architecture: EfficientNetB4 with custom classification head
   • Parameters: {model.count_params():,}
   • Input Shape: {config.INPUT_SHAPE}
   • Training: 3-phase progressive unfreezing
   • Target: >90% accuracy on PCOS detection

📁 Exported Files:
   • Main Model: {h5_path.name} ({h5_size:.1f} MB)
   • Mobile Version: {tflite_path.name} ({tflite_size:.1f} MB, {compression_ratio:.1f}x smaller)
   • Weights Only: {weights_path.name} ({weights_size:.1f} MB)
   • Documentation: model_documentation.json
   • Inference Script: inference_demo.py

🚀 Ready for Deployment:
   • Production: Use {h5_path.name}
   • Mobile: Use {tflite_path.name}  
   • Research: Use {weights_path.name}

⚕️  Medical Use:
   • Screening assistance for PCOS detection
   • Always consult medical professionals
   • Model output is probability score (0-1)
   • Threshold: 0.5 for classification

📋 Full documentation available in model_documentation.json
'''
        
        summary_path = exports_dir / "EXPORT_SUMMARY.txt"
        with open(summary_path, 'w') as f:
            f.write(summary_text)
        
        print(f"✅ Export completed successfully!")
        print(f"📁 All files saved to: {exports_dir}")
        print(f"📋 Documentation: {metadata_path}")
        print(f"📝 Summary: {summary_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Export error: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_inference_script(export_dir, model_path):
    """Create ready-to-use inference script"""
    script_content = f'''#!/usr/bin/env python3
"""
PCOS Detection Model - Ready-to-Use Inference Script
Usage: python inference_demo.py <image_path>

This script demonstrates how to use the trained PCOS detection model
for predicting from ultrasound images.
"""

import sys
import tensorflow as tf
import numpy as np
import cv2
from pathlib import Path

# Configuration
MODEL_PATH = r"{model_path}"
INPUT_SHAPE = {config.INPUT_SHAPE}
CLASS_NAMES = {config.CLASS_NAMES}

def preprocess_ultrasound_image(image_path):
    """
    Preprocess ultrasound image for PCOS prediction
    
    Args:
        image_path (str/Path): Path to ultrasound image
        
    Returns:
        np.array: Preprocessed image tensor ready for model input
    """
    # Load image
    image = cv2.imread(str(image_path))
    if image is None:
        raise ValueError(f"Cannot load image: {{image_path}}")
    
    # Convert BGR to RGB (OpenCV loads as BGR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Resize to model input size
    image = cv2.resize(image, INPUT_SHAPE[:2])
    
    # Convert to float32 and normalize to [0, 1]
    image = image.astype(np.float32) / 255.0
    
    # Apply ImageNet normalization (used during training)
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    image_normalized = (image - mean) / std
    
    # Add batch dimension: (height, width, channels) -> (1, height, width, channels)
    image_batch = np.expand_dims(image_normalized, axis=0)
    
    return image_batch

def predict_pcos(model, image_path):
    """
    Predict PCOS from ultrasound image
    
    Args:
        model: Loaded TensorFlow/Keras model
        image_path (str/Path): Path to ultrasound image
        
    Returns:
        dict: Prediction results with interpretation
    """
    # Preprocess image
    processed_image = preprocess_ultrasound_image(image_path)
    
    # Make prediction
    prediction = model.predict(processed_image, verbose=0)[0, 0]
    
    # Interpret prediction
    predicted_class = 1 if prediction > 0.5 else 0
    confidence = prediction if predicted_class == 1 else (1 - prediction)
    
    # Clinical interpretation
    if prediction > 0.8:
        clinical_note = "High confidence PCOS indicators detected - recommend immediate medical evaluation"
        urgency = "HIGH"
    elif prediction > 0.6:
        clinical_note = "Moderate PCOS indicators detected - consider medical consultation"
        urgency = "MODERATE"
    elif prediction > 0.4:
        clinical_note = "Some PCOS indicators present - regular monitoring recommended"
        urgency = "LOW"
    else:
        clinical_note = "Low PCOS probability - continue routine screening"
        urgency = "ROUTINE"
    
    return {{
        "image_file": str(image_path),
        "predicted_class": CLASS_NAMES[predicted_class],
        "predicted_class_index": int(predicted_class),
        "probability_score": float(prediction),
        "confidence_level": float(confidence),
        "clinical_interpretation": clinical_note,
        "urgency_level": urgency,
        "threshold_used": 0.5,
        "model_note": "For screening assistance only - not a diagnostic tool"
    }}

def main():
    """Main inference function"""
    # Check command line arguments
    if len(sys.argv) != 2:
        print("Usage: python inference_demo.py <image_path>")
        print("Example: python inference_demo.py ultrasound_scan.jpg")
        return
    
    image_path = Path(sys.argv[1])
    
    # Validate image file
    if not image_path.exists():
        print(f"Error: Image file not found: {{image_path}}")
        return
    
    if not image_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.bmp']:
        print(f"Warning: Unexpected file format: {{image_path.suffix}}")
        print("Supported formats: .jpg, .jpeg, .png, .bmp")
    
    try:
        # Load model
        print("Loading PCOS detection model...")
        model = tf.keras.models.load_model(MODEL_PATH)
        print(f"✅ Model loaded successfully: {{model.count_params():,}} parameters")
        
        # Make prediction
        print(f"\\nAnalyzing ultrasound image: {{image_path.name}}")
        result = predict_pcos(model, image_path)
        
        # Display results
        print("\\n" + "="*60)
        print("🔬 PCOS DETECTION RESULTS")
        print("="*60)
        print(f"📁 Image File: {{result['image_file']}}")
        print(f"🎯 Prediction: **{{result['predicted_class']}}**")
        print(f"📊 Confidence: {{result['confidence_level']:.1%}}")
        print(f"🔢 Raw Score: {{result['probability_score']:.4f}} (threshold: {{result['threshold_used']}})")
        print(f"⚡ Urgency: {{result['urgency_level']}}")
        print(f"\\n💡 Clinical Interpretation:")
        print(f"   {{result['clinical_interpretation']}}")
        print(f"\\n⚠️  Important Medical Disclaimer:")
        print(f"   {{result['model_note']}}")
        print(f"   Always consult qualified healthcare professionals for diagnosis.")
        print(f"   This AI model is designed for screening assistance only.")
        print("="*60)
        
    except Exception as e:
        print(f"\\n❌ Error during prediction: {{e}}")
        print("\\nTroubleshooting:")
        print("• Ensure the image file is valid and readable")
        print("• Check that TensorFlow is properly installed")
        print("• Verify the model file is not corrupted")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
'''
    
    script_path = export_dir / "inference_demo.py"
    with open(script_path, 'w') as f:
        f.write(script_content)
    
    print(f"🐍 Inference script: {script_path}")

def main():
    print("🎉 PCOS MODEL - FINAL CLEAN EXPORT")
    print("="*50)
    print("🎯 Creating production-ready model exports...")
    print("="*50)
    
    success = export_clean_model()
    
    if success:
        print(f"\n🎉 SUCCESS! PCOS MODEL EXPORT COMPLETED!")
        print("="*50)
        print("🚀 Your PCOS detection model is ready for deployment!")
        print("📁 Check outputs/exports/ for all model files")
        print("🐍 Use inference_demo.py for testing predictions")
        print("📋 Read model_documentation.json for complete details")
        print("⚕️ Model ready for medical screening assistance")
        print("="*50)
    else:
        print("❌ Export failed")

if __name__ == "__main__":
    main()