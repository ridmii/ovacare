"""
Model Visualization and Explainability
Grad-CAM implementation and comprehensive visualization suite
"""

import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
import cv2
import seaborn as sns
from pathlib import Path
import random
from tensorflow.keras.models import Model
import pandas as pd
from config import config
from data_pipeline import DataPipeline

class GradCAM:
    """Gradient-weighted Class Activation Mapping implementation"""
    
    def __init__(self, model, layer_name=None):
        """
        Initialize Grad-CAM
        
        Args:
            model: Trained Keras model
            layer_name: Name of target layer for visualization
        """
        self.model = model
        
        # Auto-detect best layer if not provided
        if layer_name is None:
            self.layer_name = self._find_target_layer()
        else:
            self.layer_name = layer_name
            
        print(f"🎯 Using layer '{self.layer_name}' for Grad-CAM")
        
        # Create Grad-CAM model
        self.grad_model = self._create_grad_model()
    
    def _find_target_layer(self):
        """Automatically find the best layer for Grad-CAM"""
        # Look for common layer names in reverse order
        target_patterns = [
            'block7a_expand_activation',  # EfficientNet
            'top_activation',
            'block6a_expand_activation',
            'conv5_block3_out',           # ResNet
            'mixed10',                    # InceptionV3
            'block_16_depthwise_relu',    # MobileNet
            'conv2d_4'                    # Generic
        ]
        
        layer_names = [layer.name for layer in self.model.layers]
        
        # Try to find best layer
        for pattern in target_patterns:
            for layer_name in reversed(layer_names):
                if pattern in layer_name:
                    return layer_name
        
        # Fallback: use last convolutional layer
        for layer in reversed(self.model.layers):
            if 'conv' in layer.name.lower() or 'activation' in layer.name.lower():
                return layer.name
        
        # Final fallback
        return self.model.layers[-3].name  # Typically before global pooling
    
    def _create_grad_model(self):
        """Create model for computing gradients"""
        target_layer = self.model.get_layer(self.layer_name)
        
        grad_model = Model(
            inputs=self.model.inputs,
            outputs=[target_layer.output, self.model.output]
        )
        
        return grad_model
    
    def generate_heatmap(self, image, class_idx=None, alpha=0.4):
        """
        Generate Grad-CAM heatmap
        
        Args:
            image: Input image (preprocessed)
            class_idx: Target class index (None for predicted class)
            alpha: Overlay transparency
            
        Returns:
            heatmap, overlay, prediction
        """
        # Ensure image has batch dimension
        if len(image.shape) == 3:
            image = np.expand_dims(image, axis=0)
        
        # Record operations for automatic differentiation
        with tf.GradientTape() as tape:
            # Get activations and predictions
            conv_outputs, predictions = self.grad_model(image)
            
            # Use predicted class if not specified
            if class_idx is None:
                if predictions.shape[-1] == 1:  # Binary classification
                    class_idx = 0
                    loss = predictions[:, 0]
                else:  # Multi-class
                    class_idx = tf.argmax(predictions[0])
                    loss = predictions[:, class_idx]
            else:
                if predictions.shape[-1] == 1:  # Binary classification
                    loss = predictions[:, 0] if class_idx == 1 else 1 - predictions[:, 0]
                else:
                    loss = predictions[:, class_idx]
        
        # Calculate gradients
        grads = tape.gradient(loss, conv_outputs)
        
        # Pool gradients over all axes except channel axis
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        
        # Multiply feature maps by corresponding gradients
        conv_outputs = conv_outputs[0]
        heatmap = tf.reduce_mean(tf.multiply(pooled_grads, conv_outputs), axis=-1)
        
        # Normalize heatmap
        heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
        heatmap = heatmap.numpy()
        
        # Resize heatmap to original image size
        original_image = image[0]
        if len(original_image.shape) == 3:
            img_height, img_width = original_image.shape[:2]
        else:
            img_height, img_width = original_image.shape[-2:]
            
        heatmap = cv2.resize(heatmap, (img_width, img_height))
        
        # Create colored heatmap
        heatmap_colored = cv2.applyColorMap(
            np.uint8(255 * heatmap), cv2.COLORMAP_JET
        )
        heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
        
        # Create overlay
        if original_image.max() <= 1.0:
            original_display = (original_image * 255).astype(np.uint8)
        else:
            original_display = original_image.astype(np.uint8)
            
        overlay = cv2.addWeighted(
            original_display, 1 - alpha, heatmap_colored, alpha, 0
        )
        
        # Get prediction info
        pred_proba = float(predictions[0, 0] if predictions.shape[-1] == 1 else 
                          predictions[0, class_idx])
        
        return heatmap, overlay, pred_proba

class ModelVisualizer:
    """Comprehensive model visualization suite"""
    
    def __init__(self):
        self.config = config
        self.model = None
        self.grad_cam = None
        
    def load_model(self, model_path):
        """Load trained model"""
        print(f"📁 Loading model for visualization: {model_path}")
        
        try:
            self.model = tf.keras.models.load_model(str(model_path), compile=False)
            print("   ✅ Model loaded successfully")
            
            # Initialize Grad-CAM
            self.grad_cam = GradCAM(self.model)
            print("   ✅ Grad-CAM initialized")
            
            return self.model
            
        except Exception as e:
            print(f"   ❌ Error loading model: {e}")
            return None
    
    def visualize_predictions(self, test_generator, num_samples=16, save_results=True):
        """Visualize model predictions with Grad-CAM"""
        print(f"👁️ Visualizing {num_samples} predictions with Grad-CAM...")
        
        if self.model is None or self.grad_cam is None:
            print("❌ Model not loaded!")
            return None
        
        # Collect samples
        samples = self._collect_samples(test_generator, num_samples)
        
        if not samples:
            print("❌ No samples collected!")
            return None
        
        # Create visualization
        fig, axes = plt.subplots(4, 4, figsize=(20, 20))
        fig.suptitle('PCOS Detection: Predictions with Grad-CAM Visualization', 
                    fontsize=16, fontweight='bold')
        
        for i, (image, true_label, image_path) in enumerate(samples[:16]):
            if i >= 16:
                break
                
            row = i // 4
            col = i % 4
            
            # Generate Grad-CAM
            try:
                heatmap, overlay, pred_proba = self.grad_cam.generate_heatmap(image)
                
                # Determine prediction
                pred_label = 1 if pred_proba > 0.5 else 0
                confidence = pred_proba if pred_label == 1 else (1 - pred_proba)
                
                # Create display image
                display_image = overlay
                
                # Add to plot
                axes[row, col].imshow(display_image)
                axes[row, col].axis('off')
                
                # Create title with prediction info
                true_class = self.config.CLASS_NAMES[true_label]
                pred_class = self.config.CLASS_NAMES[pred_label]
                
                # Color based on correctness
                color = 'green' if true_label == pred_label else 'red'
                
                title = f"True: {true_class}\\nPred: {pred_class} ({confidence:.3f})"
                axes[row, col].set_title(title, color=color, fontweight='bold')
                
            except Exception as e:
                print(f"   ⚠️ Error processing sample {i}: {e}")
                axes[row, col].text(0.5, 0.5, f'Error\\n{str(e)[:30]}...', 
                                  ha='center', va='center', transform=axes[row, col].transAxes)
                axes[row, col].axis('off')
        
        plt.tight_layout()
        
        if save_results:
            viz_path = self.config.PLOTS_DIR / 'gradcam_predictions.png'
            plt.savefig(viz_path, dpi=300, bbox_inches='tight')
            print(f"   📁 Saved: {viz_path}")
        
        plt.close()
        
        return samples
    
    def _collect_samples(self, test_generator, num_samples):
        """Collect diverse samples for visualization"""
        samples = []
        samples_per_class = num_samples // 2
        
        class_counts = {0: 0, 1: 0}
        
        for batch_x, batch_y in test_generator:
            for i in range(len(batch_x)):
                label = int(batch_y[i])
                
                if class_counts[label] < samples_per_class:
                    image = batch_x[i]
                    samples.append((image, label, f"batch_image_{len(samples)}"))
                    class_counts[label] += 1
                
                # Check if we have enough samples
                if sum(class_counts.values()) >= num_samples:
                    break
            
            if sum(class_counts.values()) >= num_samples:
                break
        
        return samples
    
    def analyze_feature_maps(self, image, layers_to_analyze=None):
        """Analyze and visualize feature maps at different layers"""
        print("🔍 Analyzing feature maps...")
        
        if self.model is None:
            print("❌ Model not loaded!")
            return None
        
        # Default layers to analyze
        if layers_to_analyze is None:
            layers_to_analyze = self._select_analysis_layers()
        
        # Create models for each layer
        layer_outputs = []
        layer_names = []
        
        for layer_name in layers_to_analyze:
            try:
                layer_model = Model(
                    inputs=self.model.input,
                    outputs=self.model.get_layer(layer_name).output
                )
                
                # Get feature maps
                if len(image.shape) == 3:
                    image_batch = np.expand_dims(image, axis=0)
                else:
                    image_batch = image
                
                features = layer_model.predict(image_batch, verbose=0)
                layer_outputs.append(features[0])
                layer_names.append(layer_name)
                
            except Exception as e:
                print(f"   ⚠️ Could not analyze layer {layer_name}: {e}")
        
        # Visualize feature maps
        self._plot_feature_maps(layer_outputs, layer_names, image)
        
        return layer_outputs, layer_names
    
    def _select_analysis_layers(self):
        """Select interesting layers for feature map analysis"""
        layer_names = [layer.name for layer in self.model.layers]
        
        # Look for key layers
        analysis_layers = []
        
        # Early layers
        for name in layer_names:
            if 'block1' in name and 'activation' in name:
                analysis_layers.append(name)
                break
        
        # Middle layers
        for name in layer_names:
            if 'block3' in name and 'activation' in name:
                analysis_layers.append(name)
                break
        
        # Later layers
        for name in layer_names:
            if 'block6' in name and 'activation' in name:
                analysis_layers.append(name)
                break
        
        # Final conv layer
        analysis_layers.append(self.grad_cam.layer_name)
        
        return analysis_layers[:4]  # Limit to 4 layers
    
    def _plot_feature_maps(self, layer_outputs, layer_names, original_image):
        """Plot feature maps from different layers"""
        n_layers = len(layer_outputs)
        
        fig, axes = plt.subplots(n_layers + 1, 8, figsize=(24, 3 * (n_layers + 1)))
        
        # Original image
        if original_image.max() <= 1.0:
            display_image = original_image
        else:
            display_image = original_image / 255.0
            
        axes[0, 0].imshow(display_image)
        axes[0, 0].set_title('Original Image', fontweight='bold')
        axes[0, 0].axis('off')
        
        # Hide remaining slots in first row
        for j in range(1, 8):
            axes[0, j].axis('off')
        
        # Plot feature maps for each layer
        for i, (features, layer_name) in enumerate(zip(layer_outputs, layer_names)):
            layer_row = i + 1
            
            # Select 8 interesting channels
            n_channels = min(features.shape[-1], 8)
            channel_indices = np.linspace(0, features.shape[-1] - 1, n_channels, dtype=int)
            
            for j, channel_idx in enumerate(channel_indices):
                feature_map = features[:, :, channel_idx]
                
                # Normalize for display
                if feature_map.max() > feature_map.min():
                    feature_map = (feature_map - feature_map.min()) / (feature_map.max() - feature_map.min())
                
                axes[layer_row, j].imshow(feature_map, cmap='viridis')
                axes[layer_row, j].set_title(f'{layer_name}\\nCh {channel_idx}', fontsize=8)
                axes[layer_row, j].axis('off')
        
        plt.tight_layout()
        
        # Save plot
        feature_path = self.config.PLOTS_DIR / 'feature_maps_analysis.png'
        plt.savefig(feature_path, dpi=300, bbox_inches='tight')
        print(f"   📁 Feature maps saved: {feature_path}")
        
        plt.close()
    
    def create_activation_maximization(self, class_idx=1, iterations=100):
        """Create input that maximally activates a specific class"""
        print(f"🧠 Creating activation maximization for class {class_idx}...")
        
        if self.model is None:
            print("❌ Model not loaded!")
            return None
        
        # Initialize random input
        input_img = tf.Variable(
            tf.random.uniform((1, *self.config.INPUT_SHAPE), -1, 1),
            dtype=tf.float32
        )
        
        # Define loss function
        def activation_loss(img):
            prediction = self.model(img)
            if prediction.shape[-1] == 1:  # Binary classification
                return prediction[0, 0] if class_idx == 1 else -prediction[0, 0]
            else:
                return prediction[0, class_idx]
        
        # Optimize input to maximize activation
        optimizer = tf.optimizers.Adam(learning_rate=0.01)
        
        for i in range(iterations):
            with tf.GradientTape() as tape:
                loss = -activation_loss(input_img)  # Negative because we want to maximize
                
            gradients = tape.gradient(loss, input_img)
            optimizer.apply_gradients([(gradients, input_img)])
            
            # Apply constraints
            input_img.assign(tf.clip_by_value(input_img, -2, 2))
            
            if i % 20 == 0:
                current_activation = activation_loss(input_img)
                print(f"   Iteration {i}: Activation = {current_activation:.4f}")
        
        # Convert to displayable image
        result_img = input_img.numpy()[0]
        result_img = (result_img - result_img.min()) / (result_img.max() - result_img.min())
        
        # Plot result
        plt.figure(figsize=(8, 8))
        plt.imshow(result_img)
        plt.title(f'Activation Maximization - Class {self.config.CLASS_NAMES[class_idx]}')
        plt.axis('off')
        
        # Save image
        activation_path = self.config.PLOTS_DIR / f'activation_maximization_class_{class_idx}.png'
        plt.savefig(activation_path, dpi=300, bbox_inches='tight')
        print(f"   📁 Activation maximization saved: {activation_path}")
        
        plt.close()
        
        return result_img
    
    def compare_grad_cam_methods(self, image, true_label):
        """Compare different Grad-CAM variants"""
        print("⚖️ Comparing Grad-CAM methods...")
        
        methods = {
            'Standard Grad-CAM': self._standard_gradcam,
            'Guided Grad-CAM': self._guided_gradcam,
            'Grad-CAM++': self._gradcam_plus_plus
        }
        
        fig, axes = plt.subplots(2, 3, figsize=(18, 12))
        
        # Original image
        if image.max() <= 1.0:
            display_image = image
        else:
            display_image = image / 255.0
        
        axes[0, 0].imshow(display_image)
        axes[0, 0].set_title('Original Image')
        axes[0, 0].axis('off')
        
        # Apply each method
        for i, (method_name, method_func) in enumerate(methods.items()):
            try:
                heatmap, overlay, confidence = method_func(image)
                
                row = i // 3
                col = (i + 1) % 3
                
                axes[row, col].imshow(overlay)
                axes[row, col].set_title(f'{method_name}\\nConfidence: {confidence:.3f}')
                axes[row, col].axis('off')
                
            except Exception as e:
                print(f"   ⚠️ Error with {method_name}: {e}")
                row = i // 3
                col = (i + 1) % 3
                axes[row, col].text(0.5, 0.5, f'Error\\n{method_name}', 
                                  ha='center', va='center', transform=axes[row, col].transAxes)
                axes[row, col].axis('off')
        
        # Hide unused subplot
        axes[1, 2].axis('off')
        
        plt.tight_layout()
        
        comparison_path = self.config.PLOTS_DIR / 'gradcam_comparison.png'
        plt.savefig(comparison_path, dpi=300, bbox_inches='tight')
        print(f"   📁 Comparison saved: {comparison_path}")
        
        plt.close()
    
    def _standard_gradcam(self, image):
        """Standard Grad-CAM implementation"""
        return self.grad_cam.generate_heatmap(image)
    
    def _guided_gradcam(self, image):
        """Guided Grad-CAM (simplified version)"""
        # This is a simplified version - full implementation would require model modifications
        heatmap, overlay, confidence = self.grad_cam.generate_heatmap(image)
        
        # Apply guided backprop effect (simplified)
        heatmap = np.maximum(heatmap, 0)  # Keep only positive gradients
        
        # Recreate overlay with guided heatmap
        heatmap_colored = cv2.applyColorMap(
            np.uint8(255 * heatmap), cv2.COLORMAP_JET
        )
        heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
        
        if image.max() <= 1.0:
            original_display = (image * 255).astype(np.uint8)
        else:
            original_display = image.astype(np.uint8)
            
        guided_overlay = cv2.addWeighted(
            original_display, 0.6, heatmap_colored, 0.4, 0
        )
        
        return heatmap, guided_overlay, confidence
    
    def _gradcam_plus_plus(self, image):
        """Grad-CAM++ (simplified version)"""
        # This is a simplified version of Grad-CAM++
        heatmap, overlay, confidence = self.grad_cam.generate_heatmap(image)
        
        # Apply non-linear transformation to emphasize important regions
        heatmap = np.power(heatmap, 1.5)  # Enhance high-activation regions
        heatmap = heatmap / heatmap.max()  # Renormalize
        
        # Recreate overlay
        heatmap_colored = cv2.applyColorMap(
            np.uint8(255 * heatmap), cv2.COLORMAP_PLASMA
        )
        heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
        
        if image.max() <= 1.0:
            original_display = (image * 255).astype(np.uint8)
        else:
            original_display = image.astype(np.uint8)
            
        plus_plus_overlay = cv2.addWeighted(
            original_display, 0.6, heatmap_colored, 0.4, 0
        )
        
        return heatmap, plus_plus_overlay, confidence
    
    def generate_comprehensive_visualization_report(self, test_generator):
        """Generate comprehensive visualization report"""
        print("\\n📊 Generating comprehensive visualization report...")
        
        # Create samples for different analyses
        samples = self._collect_samples(test_generator, 8)
        
        if not samples:
            print("❌ No samples available!")
            return
        
        # 1. Prediction visualizations
        print("   📸 Creating prediction visualizations...")
        self.visualize_predictions(test_generator, num_samples=16)
        
        # 2. Feature map analysis
        print("   🗺️ Analyzing feature maps...")
        if samples:
            self.analyze_feature_maps(samples[0][0])
        
        # 3. Activation maximization
        print("   🧠 Creating activation maximizations...")
        for class_idx in range(len(self.config.CLASS_NAMES)):
            self.create_activation_maximization(class_idx)
        
        # 4. Method comparison
        print("   ⚖️ Comparing Grad-CAM methods...")
        if samples:
            self.compare_grad_cam_methods(samples[0][0], samples[0][1])
        
        print("\\n✅ Comprehensive visualization report completed!")
        print(f"📁 All visualizations saved in: {self.config.PLOTS_DIR}")

def main():
    """Main visualization function"""
    print("👁️ PCOS Model Visualization Pipeline")
    print("="*50)
    
    # Initialize visualizer
    visualizer = ModelVisualizer()
    
    # Find best model
    best_model_path = config.CHECKPOINTS_DIR / 'best_model_phase3.h5'
    
    if not best_model_path.exists():
        print(f"❌ Model not found: {best_model_path}")
        return None
    
    # Load model
    model = visualizer.load_model(best_model_path)
    
    if model is None:
        return None
    
    # Load test data
    pipeline = DataPipeline()
    dataset_paths = pipeline.load_dataset_paths()
    train_gen, val_gen, test_gen = pipeline.create_generators(dataset_paths, use_class_weights=False)
    
    # Generate comprehensive visualization report
    visualizer.generate_comprehensive_visualization_report(test_gen)
    
    print("\\n✅ Visualization completed!")
    
    return visualizer

if __name__ == "__main__":
    visualization_results = main()