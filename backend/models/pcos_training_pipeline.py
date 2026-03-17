"""
PCOS Detection Model Training Pipeline
Handles mixed folder structure and provides complete training solution
"""

import os
import shutil
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import json
import re

class PCOSDatasetOrganizer:
    def __init__(self, dataset_path, output_path):
        self.dataset_path = Path(dataset_path)
        self.output_path = Path(output_path)
        self.label_methods = {
            'filename': self._extract_labels_from_filename,
            'csv': self._extract_labels_from_csv,
            'manual': self._extract_labels_manually
        }
    
    def _extract_labels_from_filename(self, filename):
        """
        Extract labels from filename patterns
        Common patterns:
        - 'pcos_001.jpg' -> 1 (positive)
        - 'normal_001.jpg' -> 0 (negative)
        - 'infected_001.jpg' -> 1
        - 'noninfected_001.jpg' -> 0
        """
        filename = filename.lower()
        
        # Define positive indicators
        positive_keywords = ['pcos', 'infected', 'positive', 'pos', 'abnormal']
        negative_keywords = ['normal', 'noninfected', 'negative', 'neg', 'healthy']
        
        for keyword in positive_keywords:
            if keyword in filename:
                return 1
        
        for keyword in negative_keywords:
            if keyword in filename:
                return 0
        
        # If no clear pattern, return None for manual review
        return None
    
    def _extract_labels_from_csv(self, csv_path):
        """
        Extract labels from CSV file
        Expected format: filename, label
        """
        df = pd.read_csv(csv_path)
        labels_dict = {}
        
        for _, row in df.iterrows():
            filename = row['filename'] if 'filename' in df.columns else row['image']
            label = row['label'] if 'label' in df.columns else row['class']
            
            # Convert label to binary (0/1)
            if isinstance(label, str):
                label = 1 if label.lower() in ['pcos', 'infected', 'positive', '1'] else 0
            
            labels_dict[filename] = int(label)
        
        return labels_dict
    
    def _extract_labels_manually(self, files_list):
        """
        Manual labeling interface for unclear cases
        """
        labels_dict = {}
        
        print("Manual labeling required. For each file, enter:")
        print("1 for PCOS/Infected")
        print("0 for Normal/Non-infected")
        print("s to skip")
        print("q to quit and save progress")
        
        for i, file in enumerate(files_list):
            if i % 10 == 0:
                print(f"Progress: {i}/{len(files_list)} files labeled")
            
            while True:
                label = input(f"Label for {file.name}: ").strip().lower()
                if label == 'q':
                    return labels_dict
                elif label == 's':
                    break
                elif label in ['0', '1']:
                    labels_dict[file.name] = int(label)
                    break
                else:
                    print("Invalid input. Enter 0, 1, s, or q")
        
        return labels_dict
    
    def analyze_dataset(self, method='filename', csv_path=None):
        """
        Analyze the dataset structure and extract labels
        """
        all_files = []
        labels = {}
        
        # Collect all image files
        for split in ['train', 'val', 'test']:
            split_path = self.dataset_path / split
            if split_path.exists():
                files = list(split_path.glob('*.jpg')) + list(split_path.glob('*.png')) + list(split_path.glob('*.jpeg'))
                all_files.extend([(f, split) for f in files])
        
        print(f"Found {len(all_files)} total images")
        
        # Extract labels based on method
        if method == 'filename':
            for file_path, split in all_files:
                label = self._extract_labels_from_filename(file_path.name)
                if label is not None:
                    labels[file_path.name] = {'label': label, 'split': split, 'path': file_path}
        
        elif method == 'csv' and csv_path:
            csv_labels = self._extract_labels_from_csv(csv_path)
            for file_path, split in all_files:
                if file_path.name in csv_labels:
                    labels[file_path.name] = {
                        'label': csv_labels[file_path.name], 
                        'split': split, 
                        'path': file_path
                    }
        
        # Handle unlabeled files
        unlabeled_files = [f for f, s in all_files if f.name not in labels]
        if unlabeled_files:
            print(f"Warning: {len(unlabeled_files)} files could not be automatically labeled")
            print("Sample unlabeled files:")
            for f in unlabeled_files[:5]:
                print(f"  {f.name}")
            
            manual_labels = self._extract_labels_manually(unlabeled_files)
            for file_path in unlabeled_files:
                if file_path.name in manual_labels:
                    labels[file_path.name] = {
                        'label': manual_labels[file_path.name],
                        'split': next(s for f, s in all_files if f == file_path),
                        'path': file_path
                    }
        
        return labels
    
    def organize_dataset(self, labels_dict):
        """
        Organize dataset into proper folder structure for Keras
        """
        # Create output directory structure
        for split in ['train', 'val', 'test']:
            for class_name in ['infected', 'noninfected']:
                (self.output_path / split / class_name).mkdir(parents=True, exist_ok=True)
        
        # Copy files to organized structure
        stats = {'train': {'infected': 0, 'noninfected': 0},
                'val': {'infected': 0, 'noninfected': 0},
                'test': {'infected': 0, 'noninfected': 0}}
        
        for filename, info in labels_dict.items():
            label = info['label']
            split = info['split']
            source_path = info['path']
            
            class_name = 'infected' if label == 1 else 'noninfected'
            dest_path = self.output_path / split / class_name / filename
            
            shutil.copy2(source_path, dest_path)
            stats[split][class_name] += 1
        
        # Print statistics
        print("\nDataset organization complete!")
        for split, classes in stats.items():
            print(f"{split.upper()}: Infected={classes['infected']}, Non-infected={classes['noninfected']}")
        
        # Save label information
        with open(self.output_path / 'dataset_info.json', 'w') as f:
            json.dump({
                'total_files': len(labels_dict),
                'statistics': stats,
                'label_distribution': {
                    'infected': sum(1 for v in labels_dict.values() if v['label'] == 1),
                    'noninfected': sum(1 for v in labels_dict.values() if v['label'] == 0)
                }
            }, f, indent=2)
        
        return stats

class PCOSModelTrainer:
    def __init__(self, dataset_path, img_size=(224, 224), batch_size=32):
        self.dataset_path = Path(dataset_path)
        self.img_size = img_size
        self.batch_size = batch_size
        self.model = None
        
    def create_data_generators(self):
        """
        Create data generators with appropriate augmentation
        """
        # Data augmentation for training
        train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            horizontal_flip=True,
            zoom_range=0.2,
            shear_range=0.1,
            fill_mode='nearest'
        )
        
        # No augmentation for validation and test
        val_test_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)
        
        # Create generators
        train_generator = train_datagen.flow_from_directory(
            self.dataset_path / 'train',
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='binary',
            shuffle=True
        )
        
        val_generator = val_test_datagen.flow_from_directory(
            self.dataset_path / 'val',
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='binary',
            shuffle=False
        )
        
        test_generator = val_test_datagen.flow_from_directory(
            self.dataset_path / 'test',
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='binary',
            shuffle=False
        )
        
        return train_generator, val_generator, test_generator
    
    def build_efficient_model(self):
        """
        Build memory-efficient model optimized for 15GB RAM
        Using MobileNetV2 as base - lightweight and effective
        """
        # Use MobileNetV2 as base (lightweight, good for limited RAM)
        base_model = tf.keras.applications.MobileNetV2(
            input_shape=(*self.img_size, 3),
            include_top=False,
            weights='imagenet'
        )
        
        # Freeze base model initially
        base_model.trainable = False
        
        # Add custom classification head
        model = tf.keras.Sequential([
            base_model,
            tf.keras.layers.GlobalAveragePooling2D(),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.Dropout(0.5),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        
        self.model = model
        return model
    
    def build_custom_cnn(self):
        """
        Build custom CNN for comparison - more memory efficient
        """
        model = tf.keras.Sequential([
            # Input layer
            tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(*self.img_size, 3)),
            tf.keras.layers.MaxPooling2D(2, 2),
            
            # Second block
            tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
            tf.keras.layers.MaxPooling2D(2, 2),
            
            # Third block
            tf.keras.layers.Conv2D(128, (3, 3), activation='relu'),
            tf.keras.layers.MaxPooling2D(2, 2),
            
            # Fourth block
            tf.keras.layers.Conv2D(256, (3, 3), activation='relu'),
            tf.keras.layers.MaxPooling2D(2, 2),
            
            # Classifier
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dropout(0.5),
            tf.keras.layers.Dense(512, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(256, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        
        self.model = model
        return model
    
    def compile_model(self):
        """
        Compile model with appropriate optimizer and metrics
        """
        self.model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
            loss='binary_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
    
    def train_model(self, train_gen, val_gen, epochs=50):
        """
        Train model with callbacks for optimization
        """
        callbacks = [
            tf.keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            ),
            tf.keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7
            ),
            tf.keras.callbacks.ModelCheckpoint(
                'best_pcos_model.h5',
                monitor='val_accuracy',
                save_best_only=True
            )
        ]
        
        history = self.model.fit(
            train_gen,
            epochs=epochs,
            validation_data=val_gen,
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def evaluate_model(self, test_gen):
        """
        Comprehensive model evaluation
        """
        # Basic evaluation
        test_loss, test_acc, test_precision, test_recall = self.model.evaluate(test_gen, verbose=0)
        
        # Detailed predictions
        predictions = self.model.predict(test_gen)
        y_pred = (predictions > 0.5).astype(int).flatten()
        y_true = test_gen.classes
        
        # Classification report
        report = classification_report(y_true, y_pred, 
                                     target_names=['Non-infected', 'Infected'],
                                     output_dict=True)
        
        # Confusion matrix
        cm = confusion_matrix(y_true, y_pred)
        
        return {
            'test_accuracy': test_acc,
            'test_precision': test_precision,
            'test_recall': test_recall,
            'classification_report': report,
            'confusion_matrix': cm,
            'predictions': predictions,
            'y_true': y_true,
            'y_pred': y_pred
        }
    
    def plot_training_history(self, history):
        """
        Plot training curves
        """
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Accuracy
        axes[0,0].plot(history.history['accuracy'], label='Training Accuracy')
        axes[0,0].plot(history.history['val_accuracy'], label='Validation Accuracy')
        axes[0,0].set_title('Model Accuracy')
        axes[0,0].set_xlabel('Epoch')
        axes[0,0].set_ylabel('Accuracy')
        axes[0,0].legend()
        
        # Loss
        axes[0,1].plot(history.history['loss'], label='Training Loss')
        axes[0,1].plot(history.history['val_loss'], label='Validation Loss')
        axes[0,1].set_title('Model Loss')
        axes[0,1].set_xlabel('Epoch')
        axes[0,1].set_ylabel('Loss')
        axes[0,1].legend()
        
        # Precision
        axes[1,0].plot(history.history['precision'], label='Training Precision')
        axes[1,0].plot(history.history['val_precision'], label='Validation Precision')
        axes[1,0].set_title('Model Precision')
        axes[1,0].set_xlabel('Epoch')
        axes[1,0].set_ylabel('Precision')
        axes[1,0].legend()
        
        # Recall
        axes[1,1].plot(history.history['recall'], label='Training Recall')
        axes[1,1].plot(history.history['val_recall'], label='Validation Recall')
        axes[1,1].set_title('Model Recall')
        axes[1,1].set_xlabel('Epoch')
        axes[1,1].set_ylabel('Recall')
        axes[1,1].legend()
        
        plt.tight_layout()
        plt.savefig('training_history.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def plot_confusion_matrix(self, cm, class_names=['Non-infected', 'Infected']):
        """
        Plot confusion matrix
        """
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=class_names, yticklabels=class_names)
        plt.title('Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.show()

# Memory optimization settings for 15GB RAM
def optimize_memory():
    """
    Optimize TensorFlow for 15GB RAM
    """
    # Limit GPU memory growth
    gpus = tf.config.experimental.list_physical_devices('GPU')
    if gpus:
        try:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
        except RuntimeError as e:
            print(e)
    
    # Set mixed precision for memory efficiency
    tf.keras.mixed_precision.set_global_policy('mixed_float16')

if __name__ == "__main__":
    # Example usage
    print("PCOS Detection Model Training Pipeline")
    print("=====================================")
    
    # Optimize memory
    optimize_memory()
    
    # Step 1: Organize dataset
    organizer = PCOSDatasetOrganizer(
        dataset_path="path/to/your/mixed/dataset",
        output_path="path/to/organized/dataset"
    )
    
    # Analyze and extract labels (try filename method first)
    labels = organizer.analyze_dataset(method='filename')
    
    # If filename method doesn't work well, try CSV method
    # labels = organizer.analyze_dataset(method='csv', csv_path='labels.csv')
    
    # Organize the dataset
    stats = organizer.organize_dataset(labels)
    
    # Step 2: Train model
    trainer = PCOSModelTrainer(
        dataset_path="path/to/organized/dataset",
        img_size=(224, 224),  # Smaller size for memory efficiency
        batch_size=16  # Smaller batch size for 15GB RAM
    )
    
    # Create data generators
    train_gen, val_gen, test_gen = trainer.create_data_generators()
    
    # Build model (choose one)
    model = trainer.build_efficient_model()  # Recommended for your RAM
    # model = trainer.build_custom_cnn()  # Alternative
    
    # Compile model
    trainer.compile_model()
    
    # Print model summary
    print(model.summary())
    
    # Train model
    history = trainer.train_model(train_gen, val_gen, epochs=30)
    
    # Evaluate model
    results = trainer.evaluate_model(test_gen)
    
    # Plot results
    trainer.plot_training_history(history)
    trainer.plot_confusion_matrix(results['confusion_matrix'])
    
    print(f"Test Accuracy: {results['test_accuracy']:.4f}")
    print(f"Test Precision: {results['test_precision']:.4f}")
    print(f"Test Recall: {results['test_recall']:.4f}")