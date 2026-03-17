"""
Model Export and Deployment
Export trained models for production deployment
"""

import tensorflow as tf
import numpy as np
import json
import time
from pathlib import Path
import zipfile
import shutil
import onnx
import tf2onnx
from config import config

class ModelExporter:
    """Export models for production deployment"""
    
    def __init__(self):
        self.config = config
        self.model = None
        self.export_info = {}
        
    def load_model(self, model_path):
        """Load trained model for export"""
        print(f"📁 Loading model for export: {model_path}")
        
        try:
            self.model = tf.keras.models.load_model(str(model_path))
            print("   ✅ Model loaded successfully")
            print(f"   📊 Model parameters: {self.model.count_params():,}")
            
            return self.model
            
        except Exception as e:
            print(f"   ❌ Error loading model: {e}")
            return None
    
    def export_savedmodel(self, export_name="pcos_model"):
        """Export as TensorFlow SavedModel format"""
        print("💾 Exporting as TensorFlow SavedModel...")
        
        if self.model is None:
            print("❌ No model loaded!")
            return None
        
        # Create export directory
        export_dir = self.config.EXPORTS_DIR / "savedmodel" / export_name
        export_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            # Save the model
            tf.saved_model.save(self.model, str(export_dir))
            
            # Verify the saved model
            loaded_model = tf.saved_model.load(str(export_dir))
            print("   ✅ SavedModel format verified")
            
            # Get model info
            model_info = self._get_model_info()
            
            # Save metadata
            metadata = {
                'format': 'SavedModel',
                'export_time': time.strftime('%Y-%m-%d %H:%M:%S'),
                'model_info': model_info,
                'input_shape': self.config.INPUT_SHAPE,
                'class_names': self.config.CLASS_NAMES,
                'preprocessing': {
                    'normalization_mean': self.config.NORMALIZATION_MEAN,
                    'normalization_std': self.config.NORMALIZATION_STD,
                    'input_range': [0, 1]
                }
            }
            
            metadata_path = export_dir / 'metadata.json'
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=4)
            
            print(f"   📁 Exported to: {export_dir}")
            print(f"   📋 Metadata saved: {metadata_path}")
            
            self.export_info['savedmodel'] = {
                'path': export_dir,
                'size_mb': self._get_directory_size(export_dir)
            }
            
            return export_dir
            
        except Exception as e:
            print(f"   ❌ Export failed: {e}")
            return None
    
    def export_h5(self, export_name="pcos_model"):
        """Export as Keras H5 format"""
        print("💾 Exporting as Keras H5 format...")
        
        if self.model is None:
            print("❌ No model loaded!")
            return None
        
        # Create export directory
        export_dir = self.config.EXPORTS_DIR / "h5"
        export_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            # Save as H5
            h5_path = export_dir / f"{export_name}.h5"
            self.model.save(str(h5_path))
            
            # Save model architecture
            arch_path = export_dir / f"{export_name}_architecture.json"
            with open(arch_path, 'w') as f:
                f.write(self.model.to_json())
            
            # Save weights separately
            weights_path = export_dir / f"{export_name}_weights.h5"
            self.model.save_weights(str(weights_path))
            
            # Get model info
            model_info = self._get_model_info()
            
            # Save metadata
            metadata = {
                'format': 'H5',
                'export_time': time.strftime('%Y-%m-%d %H:%M:%S'),
                'model_info': model_info,
                'files': {
                    'full_model': str(h5_path.name),
                    'architecture': str(arch_path.name),
                    'weights': str(weights_path.name)
                },
                'input_shape': self.config.INPUT_SHAPE,
                'class_names': self.config.CLASS_NAMES,
                'preprocessing': {
                    'normalization_mean': self.config.NORMALIZATION_MEAN,
                    'normalization_std': self.config.NORMALIZATION_STD,
                    'input_range': [0, 1]
                }
            }
            
            metadata_path = export_dir / f"{export_name}_metadata.json"
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=4)
            
            print(f"   📁 Full model: {h5_path}")
            print(f"   🏗️ Architecture: {arch_path}")
            print(f"   ⚖️ Weights: {weights_path}")
            print(f"   📋 Metadata: {metadata_path}")
            
            self.export_info['h5'] = {
                'path': export_dir,
                'size_mb': self._get_file_size(h5_path)
            }
            
            return export_dir
            
        except Exception as e:
            print(f"   ❌ H5 export failed: {e}")
            return None
    
    def export_tflite(self, export_name="pcos_model", quantization='float16'):
        """Export as TensorFlow Lite format"""
        print(f"📱 Exporting as TensorFlow Lite ({quantization})...")
        
        if self.model is None:
            print("❌ No model loaded!")
            return None
        
        # Create export directory
        export_dir = self.config.EXPORTS_DIR / "tflite"
        export_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            # Convert to TFLite
            converter = tf.lite.TFLiteConverter.from_keras_model(self.model)
            
            # Set optimization
            if quantization == 'float16':
                converter.optimizations = [tf.lite.Optimize.DEFAULT]
                converter.target_spec.supported_types = [tf.float16]
                suffix = 'float16'
            elif quantization == 'int8':
                converter.optimizations = [tf.lite.Optimize.DEFAULT]
                converter.representative_dataset = self._get_representative_dataset
                converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
                converter.inference_input_type = tf.uint8
                converter.inference_output_type = tf.uint8
                suffix = 'int8'
            else:
                converter.optimizations = [tf.lite.Optimize.OPTIMIZE_FOR_SIZE]
                suffix = 'optimized'
            
            # Convert
            tflite_model = converter.convert()
            
            # Save TFLite model
            tflite_path = export_dir / f"{export_name}_{suffix}.tflite"
            with open(tflite_path, 'wb') as f:
                f.write(tflite_model)
            
            # Test the converted model
            interpreter = tf.lite.Interpreter(model_content=tflite_model)
            interpreter.allocate_tensors()
            
            # Get input and output details
            input_details = interpreter.get_input_details()
            output_details = interpreter.get_output_details()
            
            print("   ✅ TFLite model verified")
            print(f"   📊 Input shape: {input_details[0]['shape']}")
            print(f"   📊 Output shape: {output_details[0]['shape']}")
            
            # Calculate compression ratio
            original_size = self._estimate_model_size()
            tflite_size = self._get_file_size(tflite_path)
            compression_ratio = original_size / tflite_size if tflite_size > 0 else 0
            
            # Save metadata
            metadata = {
                'format': 'TensorFlow Lite',
                'quantization': quantization,
                'export_time': time.strftime('%Y-%m-%d %H:%M:%S'),
                'input_details': {
                    'shape': input_details[0]['shape'].tolist(),
                    'dtype': str(input_details[0]['dtype']),
                    'name': input_details[0]['name']
                },
                'output_details': {
                    'shape': output_details[0]['shape'].tolist(),
                    'dtype': str(output_details[0]['dtype']),
                    'name': output_details[0]['name']
                },
                'compression_ratio': f"{compression_ratio:.1f}x",
                'model_size_mb': tflite_size,
                'input_shape': self.config.INPUT_SHAPE,
                'class_names': self.config.CLASS_NAMES,
                'preprocessing': {
                    'normalization_mean': self.config.NORMALIZATION_MEAN,
                    'normalization_std': self.config.NORMALIZATION_STD,
                    'input_range': [0, 1] if quantization != 'int8' else [0, 255]
                }
            }
            
            metadata_path = export_dir / f"{export_name}_{suffix}_metadata.json"
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=4)
            
            print(f"   📁 TFLite model: {tflite_path}")
            print(f"   📋 Metadata: {metadata_path}")
            print(f"   🗜️ Compression: {compression_ratio:.1f}x smaller")
            
            self.export_info['tflite'] = {
                'path': tflite_path,
                'size_mb': tflite_size,
                'compression_ratio': compression_ratio
            }
            
            return tflite_path
            
        except Exception as e:
            print(f"   ❌ TFLite export failed: {e}")
            return None
    
    def export_onnx(self, export_name="pcos_model"):
        """Export as ONNX format"""
        print("🔄 Exporting as ONNX format...")
        
        if self.model is None:
            print("❌ No model loaded!")
            return None
        
        # Create export directory
        export_dir = self.config.EXPORTS_DIR / "onnx"
        export_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            # Convert to ONNX
            onnx_path = export_dir / f"{export_name}.onnx"
            
            model_proto, _ = tf2onnx.convert.from_keras(
                self.model,
                input_signature=None,
                opset=None,
                custom_ops=None,
                custom_op_handlers=None,
                custom_rewriter=None,
                inputs_as_nchw=None,
                extra_opset=None,
                shape_override=None,
                target=None,
                large_model=False,
                output_path=str(onnx_path)
            )
            
            # Verify ONNX model
            onnx_model = onnx.load(str(onnx_path))
            onnx.checker.check_model(onnx_model)
            
            print("   ✅ ONNX model verified")
            
            # Get model info
            model_info = self._get_model_info()
            
            # Save metadata
            metadata = {
                'format': 'ONNX',
                'export_time': time.strftime('%Y-%m-%d %H:%M:%S'),
                'model_info': model_info,
                'input_shape': self.config.INPUT_SHAPE,
                'class_names': self.config.CLASS_NAMES,
                'preprocessing': {
                    'normalization_mean': self.config.NORMALIZATION_MEAN,
                    'normalization_std': self.config.NORMALIZATION_STD,
                    'input_range': [0, 1]
                },
                'usage_note': 'Use ONNX Runtime for inference'
            }
            
            metadata_path = export_dir / f"{export_name}_metadata.json"
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=4)
            
            print(f"   📁 ONNX model: {onnx_path}")
            print(f"   📋 Metadata: {metadata_path}")
            
            self.export_info['onnx'] = {
                'path': onnx_path,
                'size_mb': self._get_file_size(onnx_path)
            }
            
            return onnx_path
            
        except Exception as e:
            print(f"   ❌ ONNX export failed: {e}")
            print("   💡 Note: Install tf2onnx for ONNX export support")
            return None
    
    def create_inference_examples(self):
        """Create inference examples for different formats"""
        print("📝 Creating inference examples...")
        
        examples_dir = self.config.EXPORTS_DIR / "inference_examples"
        examples_dir.mkdir(parents=True, exist_ok=True)
        
        # Python inference example
        python_example = f'''
"""
PCOS Detection Model - Inference Example
Generated on: {time.strftime('%Y-%m-%d %H:%M:%S')}
"""

import tensorflow as tf
import numpy as np
import cv2
from pathlib import Path

class PCOSPredictor:
    """PCOS Detection Predictor"""
    
    def __init__(self, model_path, model_format='savedmodel'):
        """
        Initialize predictor
        
        Args:
            model_path: Path to the model
            model_format: 'savedmodel', 'h5', 'tflite'
        """
        self.model_format = model_format
        self.input_shape = {self.config.INPUT_SHAPE}
        self.class_names = {self.config.CLASS_NAMES}
        self.norm_mean = {self.config.NORMALIZATION_MEAN}
        self.norm_std = {self.config.NORMALIZATION_STD}
        
        # Load model
        if model_format == 'savedmodel':
            self.model = tf.saved_model.load(model_path)
            self.predict_fn = self.model.signatures['serving_default']
        elif model_format == 'h5':
            self.model = tf.keras.models.load_model(model_path)
        elif model_format == 'tflite':
            self.interpreter = tf.lite.Interpreter(model_path=model_path)
            self.interpreter.allocate_tensors()
            self.input_details = self.interpreter.get_input_details()
            self.output_details = self.interpreter.get_output_details()
    
    def preprocess_image(self, image_path):
        """Preprocess image for prediction"""
        # Load image
        image = cv2.imread(str(image_path))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Resize
        image = cv2.resize(image, self.input_shape[:2])
        
        # Normalize
        image = image.astype(np.float32) / 255.0
        image = (image - np.array(self.norm_mean)) / np.array(self.norm_std)
        
        # Add batch dimension
        image = np.expand_dims(image, axis=0)
        
        return image
    
    def predict(self, image_path):
        """Make prediction on image"""
        # Preprocess
        image = self.preprocess_image(image_path)
        
        # Predict based on model format
        if self.model_format == 'savedmodel':
            prediction = self.predict_fn(tf.constant(image))
            probability = float(list(prediction.values())[0][0])
        elif self.model_format == 'h5':
            prediction = self.model.predict(image, verbose=0)
            probability = float(prediction[0, 0])
        elif self.model_format == 'tflite':
            self.interpreter.set_tensor(self.input_details[0]['index'], image)
            self.interpreter.invoke()
            prediction = self.interpreter.get_tensor(self.output_details[0]['index'])
            probability = float(prediction[0, 0])
        
        # Convert to class prediction
        predicted_class = 1 if probability > 0.5 else 0
        confidence = probability if predicted_class == 1 else (1 - probability)
        
        return {{
            'class': self.class_names[predicted_class],
            'class_index': predicted_class,
            'probability': probability,
            'confidence': confidence
        }}

# Example usage
if __name__ == "__main__":
    # Initialize predictor
    predictor = PCOSPredictor('path/to/model', 'savedmodel')
    
    # Make prediction
    result = predictor.predict('path/to/ultrasound_image.jpg')
    
    print(f"Prediction: {{result['class']}}")
    print(f"Confidence: {{result['confidence']:.3f}}")
    
    # Medical interpretation
    if result['class'] == 'infected' and result['confidence'] > 0.8:
        print("⚠️  High confidence PCOS detection - recommend medical consultation")
    elif result['class'] == 'infected' and result['confidence'] > 0.6:
        print("⚠️  Moderate confidence PCOS detection - consider medical follow-up")
    else:
        print("✅ Low PCOS probability - but regular screening recommended")
'''
        
        python_path = examples_dir / 'python_inference.py'
        with open(python_path, 'w') as f:
            f.write(python_example)
        
        # JavaScript/Node.js example
        js_example = f'''
/**
 * PCOS Detection Model - JavaScript Inference Example
 * Generated on: {time.strftime('%Y-%m-%d %H:%M:%S')}
 * Requires: @tensorflow/tfjs-node (for Node.js) or @tensorflow/tfjs (for browser)
 */

const tf = require('@tensorflow/tfjs-node');
// For browser: import * as tf from '@tensorflow/tfjs';

class PCOSPredictor {{
    constructor(modelUrl) {{
        this.modelUrl = modelUrl;
        this.model = null;
        this.inputShape = {self.config.INPUT_SHAPE};
        this.classNames = {self.config.CLASS_NAMES};
        this.normMean = {self.config.NORMALIZATION_MEAN};
        this.normStd = {self.config.NORMALIZATION_STD};
    }}
    
    async loadModel() {{
        console.log('Loading PCOS detection model...');
        this.model = await tf.loadLayersModel(this.modelUrl);
        console.log('Model loaded successfully!');
    }}
    
    preprocessImage(imageData) {{
        // Convert image to tensor
        let imageTensor = tf.browser.fromPixels(imageData);
        
        // Resize to model input size
        imageTensor = tf.image.resizeBilinear(
            imageTensor, 
            [this.inputShape[0], this.inputShape[1]]
        );
        
        // Normalize to [0, 1]
        imageTensor = imageTensor.div(255.0);
        
        // Apply normalization
        const normMeanTensor = tf.tensor(this.normMean);
        const normStdTensor = tf.tensor(this.normStd);
        imageTensor = imageTensor.sub(normMeanTensor).div(normStdTensor);
        
        // Add batch dimension
        imageTensor = imageTensor.expandDims(0);
        
        return imageTensor;
    }}
    
    async predict(imageElement) {{
        if (!this.model) {{
            throw new Error('Model not loaded. Call loadModel() first.');
        }}
        
        // Preprocess image
        const preprocessed = this.preprocessImage(imageElement);
        
        // Make prediction
        const prediction = await this.model.predict(preprocessed);
        const probability = await prediction.data();
        
        // Convert to result
        const prob = probability[0];
        const predictedClass = prob > 0.5 ? 1 : 0;
        const confidence = predictedClass === 1 ? prob : (1 - prob);
        
        return {{
            class: this.classNames[predictedClass],
            classIndex: predictedClass,
            probability: prob,
            confidence: confidence
        }};
    }}
}}

// Example usage
async function example() {{
    const predictor = new PCOSPredictor('path/to/model.json');
    await predictor.loadModel();
    
    // For browser: get image element
    // const imageElement = document.getElementById('ultrasound-image');
    
    // For Node.js: load image file
    // const imageBuffer = fs.readFileSync('ultrasound.jpg');
    // const imageElement = tf.node.decodeImage(imageBuffer);
    
    // const result = await predictor.predict(imageElement);
    // console.log('Prediction:', result.class);
    // console.log('Confidence:', result.confidence.toFixed(3));
}}
'''
        
        js_path = examples_dir / 'javascript_inference.js'
        with open(js_path, 'w') as f:
            f.write(js_example)
        
        # Create deployment guide
        deployment_guide = f'''
# PCOS Detection Model - Deployment Guide

Generated on: {time.strftime('%Y-%m-%d %H:%M:%S')}

## Model Information
- Architecture: EfficientNetB4
- Input Shape: {self.config.INPUT_SHAPE}
- Classes: {self.config.CLASS_NAMES}
- Target Accuracy: >90%

## Available Formats

### 1. TensorFlow SavedModel (Recommended for Python/Production)
- **Path**: exports/savedmodel/
- **Use Case**: Python applications, TensorFlow Serving
- **Pros**: Full TensorFlow compatibility, easy deployment
- **Cons**: Larger file size

### 2. Keras H5 Format
- **Path**: exports/h5/
- **Use Case**: Python applications, research
- **Pros**: Simple loading, widely supported
- **Cons**: TensorFlow specific

### 3. TensorFlow Lite (Mobile/Edge)
- **Path**: exports/tflite/
- **Use Case**: Mobile apps, edge devices
- **Pros**: Smaller size, optimized for mobile
- **Cons**: Limited operation support

### 4. ONNX Format (Cross-platform)
- **Path**: exports/onnx/
- **Use Case**: Cross-platform deployment
- **Pros**: Framework agnostic
- **Cons**: May need conversion verification

## Preprocessing Requirements

All input images must be:
1. Resized to {self.config.INPUT_SHAPE[0]}x{self.config.INPUT_SHAPE[1]} pixels
2. Normalized to [0, 1] range (divide by 255.0)
3. Apply normalization: (image - mean) / std
   - Mean: {self.config.NORMALIZATION_MEAN}
   - Std: {self.config.NORMALIZATION_STD}

## Class Interpretation

- **Non-infected** (0): Normal ovarian structure
- **Infected/PCOS** (1): PCOS indicators detected

## Medical Considerations

⚠️ **Important**: This model is for screening assistance only.
- Always consult medical professionals for diagnosis
- Consider model confidence levels in decision making
- Regular medical screening recommended regardless of model output

## Production Deployment Recommendations

1. **Web API**: Use TensorFlow Serving with SavedModel
2. **Mobile App**: Use TensorFlow Lite with quantization
3. **Edge Device**: Use TensorFlow Lite INT8 quantization
4. **Cross-platform**: Use ONNX with appropriate runtime

## Performance Guidelines

- Batch processing recommended for multiple images
- GPU acceleration available for supported formats
- Memory usage scales with batch size
- Consider model ensemble for higher accuracy

## Example Deployment Architectures

### Flask Web API
```python
from flask import Flask, request, jsonify
from pcos_predictor import PCOSPredictor

app = Flask(__name__)
predictor = PCOSPredictor('exports/savedmodel/pcos_model')

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['image']
    result = predictor.predict(file)
    return jsonify(result)
```

### TensorFlow Serving
```bash
docker run -p 8501:8501 \\
  --mount type=bind,source=$(pwd)/exports/savedmodel,target=/models/pcos_model \\
  -e MODEL_NAME=pcos_model -t tensorflow/serving
```

### Mobile App Integration
```kotlin
// Android with TensorFlow Lite
val interpreter = Interpreter(loadModelFile())
interpreter.run(inputArray, outputArray)
```

## Monitoring and Maintenance

- Monitor prediction confidence distributions
- Log predictions for model performance tracking  
- Regular model retraining with new data
- A/B testing for model updates
'''
        
        guide_path = examples_dir / 'DEPLOYMENT_GUIDE.md'
        with open(guide_path, 'w') as f:
            f.write(deployment_guide)
        
        print(f"   📁 Python example: {python_path}")
        print(f"   📁 JavaScript example: {js_path}")
        print(f"   📁 Deployment guide: {guide_path}")
    
    def create_deployment_package(self, export_name="pcos_model"):
        """Create complete deployment package"""
        print("📦 Creating deployment package...")
        
        # Create package directory
        package_dir = self.config.EXPORTS_DIR / "deployment_package"
        package_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy all exports
        for format_name, info in self.export_info.items():
            format_dir = package_dir / format_name
            format_dir.mkdir(exist_ok=True)
            
            if format_name == 'savedmodel':
                shutil.copytree(info['path'], format_dir / export_name, dirs_exist_ok=True)
            else:
                shutil.copytree(info['path'], format_dir, dirs_exist_ok=True)
        
        # Copy inference examples
        examples_src = self.config.EXPORTS_DIR / "inference_examples"
        examples_dst = package_dir / "inference_examples"
        if examples_src.exists():
            shutil.copytree(examples_src, examples_dst, dirs_exist_ok=True)
        
        # Create package info
        package_info = {
            'package_name': f'PCOS_Detection_Model_{export_name}',
            'created_time': time.strftime('%Y-%m-%d %H:%M:%S'),
            'model_info': self._get_model_info(),
            'available_formats': list(self.export_info.keys()),
            'total_size_mb': sum([info['size_mb'] for info in self.export_info.values()]),
            'usage': 'See DEPLOYMENT_GUIDE.md for usage instructions'
        }
        
        info_path = package_dir / 'package_info.json'
        with open(info_path, 'w') as f:
            json.dump(package_info, f, indent=4)
        
        # Create ZIP archive
        zip_path = self.config.EXPORTS_DIR / f"{export_name}_deployment_package.zip"
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in package_dir.rglob('*'):
                for file in files:
                    file_path = Path(root) / file
                    arcname = file_path.relative_to(package_dir)
                    zipf.write(file_path, arcname)
        
        print(f"   📦 Deployment package created: {zip_path}")
        print(f"   📊 Package size: {self._get_file_size(zip_path):.1f} MB")
        print(f"   📋 Package info: {info_path}")
        
        return zip_path
    
    def _get_representative_dataset(self):
        """Get representative dataset for int8 quantization"""
        # This would normally use actual training data
        # For now, generate random samples
        for _ in range(100):
            yield [tf.random.normal((1, *self.config.INPUT_SHAPE), dtype=tf.float32)]
    
    def _get_model_info(self):
        """Get model information"""
        if self.model is None:
            return {}
        
        return {
            'total_parameters': int(self.model.count_params()),
            'trainable_parameters': int(sum([tf.keras.backend.count_params(w) for w in self.model.trainable_weights])),
            'layers': len(self.model.layers),
            'input_shape': self.config.INPUT_SHAPE,
            'output_shape': self.model.output_shape
        }
    
    def _estimate_model_size(self):
        """Estimate model size in MB"""
        if self.model is None:
            return 0
        
        # Rough estimation: 4 bytes per parameter
        return (self.model.count_params() * 4) / (1024 * 1024)
    
    def _get_file_size(self, file_path):
        """Get file size in MB"""
        try:
            return Path(file_path).stat().st_size / (1024 * 1024)
        except:
            return 0
    
    def _get_directory_size(self, directory_path):
        """Get directory size in MB"""
        try:
            total_size = 0
            for file_path in Path(directory_path).rglob('*'):
                if file_path.is_file():
                    total_size += file_path.stat().st_size
            return total_size / (1024 * 1024)
        except:
            return 0
    
    def export_all_formats(self, export_name="pcos_model"):
        """Export model in all supported formats"""
        print("🚀 Exporting model in all formats...")
        print("="*50)
        
        if self.model is None:
            print("❌ No model loaded!")
            return None
        
        # Create base export directory
        self.config.EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
        
        export_results = {}
        
        # 1. Export as SavedModel
        savedmodel_path = self.export_savedmodel(export_name)
        if savedmodel_path:
            export_results['savedmodel'] = savedmodel_path
        
        # 2. Export as H5
        h5_path = self.export_h5(export_name)
        if h5_path:
            export_results['h5'] = h5_path
        
        # 3. Export as TensorFlow Lite (multiple quantizations)
        for quantization in ['float16', 'int8']:
            tflite_path = self.export_tflite(export_name, quantization)
            if tflite_path:
                export_results[f'tflite_{quantization}'] = tflite_path
        
        # 4. Export as ONNX
        onnx_path = self.export_onnx(export_name)
        if onnx_path:
            export_results['onnx'] = onnx_path
        
        # 5. Create inference examples
        self.create_inference_examples()
        
        # 6. Create deployment package
        package_path = self.create_deployment_package(export_name)
        
        # Print summary
        print("\\n" + "="*50)
        print("✅ Export completed!")
        print(f"📁 All exports saved in: {self.config.EXPORTS_DIR}")
        
        print("\\n📊 Export Summary:")
        total_size = 0
        for format_name, info in self.export_info.items():
            print(f"   {format_name.upper()}: {info['size_mb']:.1f} MB")
            total_size += info['size_mb']
        
        print(f"\\n🎯 Total exported size: {total_size:.1f} MB")
        print(f"📦 Deployment package: {package_path}")
        
        return export_results

def main():
    """Main export function"""
    print("📦 PCOS Model Export Pipeline")
    print("="*40)
    
    # Initialize exporter
    exporter = ModelExporter()
    
    # Find best model
    best_model_path = config.CHECKPOINTS_DIR / 'best_model_phase3.h5'
    
    if not best_model_path.exists():
        print(f"❌ Model not found: {best_model_path}")
        return None
    
    # Load model
    model = exporter.load_model(best_model_path)
    
    if model is None:
        return None
    
    # Export in all formats
    export_results = exporter.export_all_formats("pcos_efficientnetb4_v1")
    
    print("\\n✅ Model export completed!")
    print("🚀 Ready for production deployment!")
    
    return export_results

if __name__ == "__main__":
    export_results = main()