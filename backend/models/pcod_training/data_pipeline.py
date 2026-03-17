"""
Medical Image Data Pipeline
Advanced augmentation pipeline specifically designed for PCOS ultrasound images
"""

import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for server environment

import tensorflow as tf
import numpy as np
import albumentations as A
import cv2
from pathlib import Path
import matplotlib.pyplot as plt
import random
from sklearn.utils.class_weight import compute_class_weight
from config import config

class MedicalImageAugmentation:
    """Advanced augmentation for medical ultrasound images"""
    
    def __init__(self, config_obj):
        self.config = config_obj
        self.train_transform = self._create_train_transform()
        self.val_transform = self._create_val_transform()
        
    def _create_train_transform(self):
        """Create training augmentation pipeline"""
        return A.Compose([
            # Spatial transformations (conservative for medical images)
            A.ShiftScaleRotate(
                shift_limit=0.15,
                scale_limit=0.1,
                rotate_limit=15,
                p=0.7,
                border_mode=cv2.BORDER_CONSTANT,
                value=0
            ),
            
            # Horizontal flip (safe for ultrasound)
            A.HorizontalFlip(p=0.5),
            
            # Elastic deformation (minimal for medical accuracy)
            A.ElasticTransform(
                alpha=50,
                sigma=5,
                alpha_affine=5,
                p=0.3
            ),
            
            # Optical distortion (subtle)
            A.OpticalDistortion(
                distort_limit=0.1,
                shift_limit=0.05,
                p=0.3
            ),
            
            # Intensity transformations
            A.RandomBrightnessContrast(
                brightness_limit=0.2,
                contrast_limit=0.2,
                p=0.8
            ),
            
            # Gamma correction (important for ultrasound)
            A.RandomGamma(
                gamma_limit=(80, 120),
                p=0.5
            ),
            
            # Noise addition
            A.OneOf([
                A.GaussNoise(var_limit=(10.0, 50.0)),
                A.ISONoise(color_shift=(0.01, 0.05), intensity=(0.1, 0.5)),
                A.MultiplicativeNoise(multiplier=(0.95, 1.05), per_channel=True),
            ], p=0.6),
            
            # Blur effects
            A.OneOf([
                A.Blur(blur_limit=3),
                A.GaussianBlur(blur_limit=3),
                A.MotionBlur(blur_limit=3),
            ], p=0.4),
            
            # CLAHE (Contrast Limited Adaptive Histogram Equalization)
            A.CLAHE(
                clip_limit=2.0,
                tile_grid_size=(8, 8),
                p=0.6
            ),
            
            # Sharpen
            A.Sharpen(
                alpha=(0.1, 0.3),
                lightness=(0.8, 1.2),
                p=0.4
            ),
            
            # Normalize to model input range
            A.Normalize(
                mean=self.config.NORMALIZATION_MEAN,
                std=self.config.NORMALIZATION_STD,
                max_pixel_value=255.0
            ),
        ])
    
    def _create_val_transform(self):
        """Create validation/test augmentation pipeline"""
        return A.Compose([
            # Only normalization for validation
            A.Normalize(
                mean=self.config.NORMALIZATION_MEAN,
                std=self.config.NORMALIZATION_STD,
                max_pixel_value=255.0
            ),
        ])

class PCOSDataGenerator(tf.keras.utils.Sequence):
    """Custom data generator for PCOS dataset with medical augmentation"""
    
    def __init__(self, file_paths, labels, batch_size=32, 
                 image_size=(224, 224), augmentation=None, 
                 is_training=True, shuffle=True):
        """
        Initialize data generator
        
        Args:
            file_paths: List of image file paths
            labels: List of corresponding labels
            batch_size: Batch size
            image_size: Target image size (height, width)
            augmentation: Augmentation transform
            is_training: Whether this is training data
            shuffle: Whether to shuffle data
        """
        self.file_paths = np.array(file_paths)
        self.labels = np.array(labels)
        self.batch_size = batch_size
        self.image_size = image_size
        self.augmentation = augmentation
        self.is_training = is_training
        self.shuffle = shuffle
        self.indices = np.arange(len(self.file_paths))
        
        if self.shuffle:
            np.random.shuffle(self.indices)
    
    def __len__(self):
        """Number of batches per epoch"""
        return int(np.ceil(len(self.file_paths) / self.batch_size))
    
    def __getitem__(self, index):
        """Generate one batch of data"""
        # Get batch indices
        start_idx = index * self.batch_size
        end_idx = min((index + 1) * self.batch_size, len(self.indices))
        batch_indices = self.indices[start_idx:end_idx]
        
        # Generate data
        batch_x, batch_y = self._generate_batch(batch_indices)
        
        return batch_x, batch_y
    
    def on_epoch_end(self):
        """Updates indexes after each epoch"""
        if self.shuffle:
            np.random.shuffle(self.indices)
    
    def _generate_batch(self, batch_indices):
        """Generate batch of images and labels"""
        batch_size = len(batch_indices)
        batch_x = np.zeros((batch_size, *self.image_size, 3), dtype=np.float32)
        batch_y = np.zeros(batch_size, dtype=np.int32)
        
        for i, idx in enumerate(batch_indices):
            # Load and preprocess image
            image = self._load_image(self.file_paths[idx])
            
            if self.augmentation:
                # Apply augmentation
                transformed = self.augmentation(image=image)
                image = transformed['image']
            else:
                # Basic normalization
                image = image.astype(np.float32) / 255.0
            
            batch_x[i] = image
            batch_y[i] = self.labels[idx]
        
        return batch_x, batch_y
    
    def _load_image(self, image_path):
        """Load and resize image"""
        try:
            # Read image
            image = cv2.imread(str(image_path))
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            # Convert BGR to RGB
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Resize image
            image = cv2.resize(image, self.image_size, interpolation=cv2.INTER_AREA)
            
            return image
            
        except Exception as e:
            print(f"Error loading image {image_path}: {e}")
            # Return black image as fallback
            return np.zeros((*self.image_size, 3), dtype=np.uint8)

class DataPipeline:
    """Main data pipeline class"""
    
    def __init__(self):
        self.config = config
        self.augmentation = MedicalImageAugmentation(self.config)
        self.class_names = self.config.CLASS_NAMES
        self.class_weights = None
        
    def load_dataset_paths(self):
        """Load all image paths and labels"""
        print("📁 Loading dataset paths...")
        
        train_paths, train_labels = self._load_split_paths('train')
        val_paths, val_labels = self._load_split_paths('val')
        test_paths, test_labels = self._load_split_paths('test')
        
        print(f"   📊 Train: {len(train_paths):,} images")
        print(f"   📊 Validation: {len(val_paths):,} images")
        print(f"   📊 Test: {len(test_paths):,} images")
        print(f"   📊 Total: {len(train_paths) + len(val_paths) + len(test_paths):,} images")
        
        return {
            'train': (train_paths, train_labels),
            'val': (val_paths, val_labels),
            'test': (test_paths, test_labels)
        }
    
    def _load_split_paths(self, split):
        """Load paths and labels for a specific split"""
        paths = []
        labels = []
        
        split_dir = self.config.DATASET_PATH / split
        
        for class_idx, class_name in enumerate(self.class_names):
            class_dir = split_dir / class_name
            
            if class_dir.exists():
                # Get all image files
                image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']
                image_files = []
                
                for ext in image_extensions:
                    image_files.extend(list(class_dir.glob(ext)))
                
                # Add to lists
                paths.extend(image_files)
                labels.extend([class_idx] * len(image_files))
                
                print(f"     {split}/{class_name}: {len(image_files):,} images")
        
        return paths, labels
    
    def calculate_class_weights(self, train_labels):
        """Calculate class weights for imbalanced dataset"""
        print("⚖️ Calculating class weights...")
        
        unique_labels = np.unique(train_labels)
        class_weights_array = compute_class_weight(
            'balanced', 
            classes=unique_labels, 
            y=train_labels
        )
        
        self.class_weights = dict(zip(unique_labels, class_weights_array))
        
        print("   Class weights:")
        for class_idx, weight in self.class_weights.items():
            class_name = self.class_names[class_idx]
            print(f"     {class_name}: {weight:.3f}")
        
        return self.class_weights
    
    def create_generators(self, dataset_paths, use_class_weights=True):
        """Create data generators for training"""
        print("🔄 Creating data generators...")
        
        train_paths, train_labels = dataset_paths['train']
        val_paths, val_labels = dataset_paths['val']
        test_paths, test_labels = dataset_paths['test']
        
        # Calculate class weights if needed
        if use_class_weights:
            self.calculate_class_weights(train_labels)
        
        # Create generators
        train_gen = PCOSDataGenerator(
            train_paths, train_labels,
            batch_size=self.config.BATCH_SIZE,
            image_size=self.config.INPUT_SHAPE[:2],
            augmentation=self.augmentation.train_transform,
            is_training=True,
            shuffle=True
        )
        
        val_gen = PCOSDataGenerator(
            val_paths, val_labels,
            batch_size=self.config.BATCH_SIZE,
            image_size=self.config.INPUT_SHAPE[:2],
            augmentation=self.augmentation.val_transform,
            is_training=False,
            shuffle=False
        )
        
        test_gen = PCOSDataGenerator(
            test_paths, test_labels,
            batch_size=self.config.BATCH_SIZE,
            image_size=self.config.INPUT_SHAPE[:2],
            augmentation=self.augmentation.val_transform,
            is_training=False,
            shuffle=False
        )
        
        print(f"   ✅ Train generator: {len(train_gen)} batches")
        print(f"   ✅ Validation generator: {len(val_gen)} batches")
        print(f"   ✅ Test generator: {len(test_gen)} batches")
        
        return train_gen, val_gen, test_gen
    
    def visualize_augmentations(self, dataset_paths, num_examples=4):
        """Visualize augmentation examples"""
        print(f"👁️ Generating augmentation examples...")
        
        train_paths, train_labels = dataset_paths['train']
        
        # Select random samples from each class
        class_0_indices = [i for i, label in enumerate(train_labels) if label == 0]
        class_1_indices = [i for i, label in enumerate(train_labels) if label == 1]
        
        selected_indices = []
        selected_indices.extend(random.sample(class_0_indices, min(num_examples//2, len(class_0_indices))))
        selected_indices.extend(random.sample(class_1_indices, min(num_examples//2, len(class_1_indices))))
        
        # Create visualization
        fig, axes = plt.subplots(2, len(selected_indices), figsize=(20, 8))
        fig.suptitle('Data Augmentation Examples', fontsize=16, fontweight='bold')
        
        for i, idx in enumerate(selected_indices):
            image_path = train_paths[idx]
            label = train_labels[idx]
            class_name = self.class_names[label]
            
            # Load original image
            original = cv2.imread(str(image_path))
            original = cv2.cvtColor(original, cv2.COLOR_BGR2RGB)
            original = cv2.resize(original, self.config.INPUT_SHAPE[:2])
            
            # Apply augmentation
            augmented = self.augmentation.train_transform(image=original)['image']
            
            # Denormalize for display
            augmented_display = (augmented * np.array(self.config.NORMALIZATION_STD) + 
                               np.array(self.config.NORMALIZATION_MEAN))
            augmented_display = np.clip(augmented_display, 0, 1)
            
            # Plot original
            axes[0, i].imshow(original)
            axes[0, i].set_title(f'Original\\n{class_name}')
            axes[0, i].axis('off')
            
            # Plot augmented
            axes[1, i].imshow(augmented_display)
            axes[1, i].set_title('Augmented')
            axes[1, i].axis('off')
        
        plt.tight_layout()
        
        # Save visualization
        self.config.PLOTS_DIR.mkdir(parents=True, exist_ok=True)
        plot_path = self.config.PLOTS_DIR / 'augmentation_examples.png'
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        print(f"   📁 Saved: {plot_path}")
        
        # Close the plot to free memory
        plt.close()
    
    
    def create_tf_datasets(self, train_gen, val_gen, test_gen):
        """Create TensorFlow datasets from generators"""
        print("🔧 Creating TensorFlow datasets...")
        
        def generator_wrapper(gen):
            """Wrapper to convert generator to tf.data format"""
            for batch_x, batch_y in gen:
                yield batch_x, batch_y
        
        # Create datasets
        train_dataset = tf.data.Dataset.from_generator(
            lambda: generator_wrapper(train_gen),
            output_types=(tf.float32, tf.int32),
            output_shapes=([None, *self.config.INPUT_SHAPE], [None])
        )
        
        val_dataset = tf.data.Dataset.from_generator(
            lambda: generator_wrapper(val_gen),
            output_types=(tf.float32, tf.int32),
            output_shapes=([None, *self.config.INPUT_SHAPE], [None])
        )
        
        test_dataset = tf.data.Dataset.from_generator(
            lambda: generator_wrapper(test_gen),
            output_types=(tf.float32, tf.int32),
            output_shapes=([None, *self.config.INPUT_SHAPE], [None])
        )
        
        # Optimize datasets
        train_dataset = train_dataset.prefetch(tf.data.AUTOTUNE)
        val_dataset = val_dataset.prefetch(tf.data.AUTOTUNE)
        test_dataset = test_dataset.prefetch(tf.data.AUTOTUNE)
        
        print("   ✅ TensorFlow datasets created and optimized")
        
        return train_dataset, val_dataset, test_dataset
    
    def run_pipeline(self):
        """Run complete data pipeline"""
        print("🚀 Running complete data pipeline...")
        print("="*60)
        
        # Load dataset
        dataset_paths = self.load_dataset_paths()
        
        # Create generators
        train_gen, val_gen, test_gen = self.create_generators(dataset_paths)
        
        # Create visualizations
        self.visualize_augmentations(dataset_paths)
        
        # Create TF datasets
        train_dataset, val_dataset, test_dataset = self.create_tf_datasets(
            train_gen, val_gen, test_gen
        )
        
        print("\n" + "="*60)
        print("✅ Data pipeline complete!")
        print("🎯 Ready for model training!")
        
        return {
            'generators': (train_gen, val_gen, test_gen),
            'datasets': (train_dataset, val_dataset, test_dataset),
            'class_weights': self.class_weights,
            'paths': dataset_paths
        }

def main():
    """Main function to run data pipeline"""
    pipeline = DataPipeline()
    return pipeline.run_pipeline()

if __name__ == "__main__":
    pipeline_data = main()
    
    print("\n🔍 Pipeline data available:")
    print(f"   📊 Class weights: {pipeline_data['class_weights']}")
    print(f"   📁 Data generators created")
    print(f"   🔧 TensorFlow datasets optimized")
    print(f"   ✅ Ready for training!")