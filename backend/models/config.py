# PCOS Model Training Configuration
# Modify these settings based on your specific requirements

# Dataset Configuration
DATASET_CONFIG = {
    # Path to your original mixed dataset
    "original_dataset_path": "path/to/your/mixed/dataset",
    
    # Path where organized dataset will be saved
    "organized_dataset_path": "organized_pcos_dataset",
    
    # CSV file path if using CSV labeling method (optional)
    "csv_labels_path": None,  # e.g., "labels.csv"
    
    # Labeling method: 'filename', 'csv', or 'manual'
    "labeling_method": "filename",
    
    # Keywords for automatic filename labeling
    "positive_keywords": ["pcos", "infected", "positive", "pos", "abnormal"],
    "negative_keywords": ["normal", "noninfected", "negative", "neg", "healthy"],
}

# Model Configuration
MODEL_CONFIG = {
    # Image input size (height, width)
    "img_size": (224, 224),
    
    # Batch size (adjust based on your RAM - lower for 15GB)
    "batch_size": 16,
    
    # Model architecture: 'efficient' (MobileNetV2) or 'custom' (Custom CNN)
    "architecture": "efficient",
    
    # Number of training epochs
    "epochs": 30,
    
    # Learning rate
    "learning_rate": 0.0001,
    
    # Early stopping patience
    "early_stopping_patience": 10,
    
    # Learning rate reduction patience
    "lr_reduction_patience": 5,
}

# Data Augmentation Configuration
AUGMENTATION_CONFIG = {
    # Training data augmentation settings
    "rotation_range": 20,
    "width_shift_range": 0.2,
    "height_shift_range": 0.2,
    "horizontal_flip": True,
    "zoom_range": 0.2,
    "shear_range": 0.1,
    "fill_mode": "nearest",
}

# Memory Optimization Configuration
MEMORY_CONFIG = {
    # Use mixed precision for memory efficiency
    "use_mixed_precision": True,
    
    # Limit GPU memory growth
    "gpu_memory_growth": True,
    
    # Prefetch buffer size
    "prefetch_buffer_size": 2,
}

# Output Configuration
OUTPUT_CONFIG = {
    # Directory to save model and results
    "output_dir": "model_outputs",
    
    # Model filename
    "model_filename": "best_pcos_model.h5",
    
    # Save training plots
    "save_plots": True,
    
    # Plot filenames
    "training_history_plot": "training_history.png",
    "confusion_matrix_plot": "confusion_matrix.png",
    
    # Save detailed results
    "save_results_json": True,
    "results_filename": "training_results.json",
}