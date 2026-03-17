"""
PCOS Detection Model Configuration
All hyperparameters and settings for training pipeline
"""

import os
from pathlib import Path

class Config:
    """Configuration class for PCOS detection model training"""
    
    # ==================== DATASET CONFIGURATION ====================
    # Dataset paths
    BASE_DIR = Path("C:/Users/heyri/OneDrive/Desktop/ovacare")
    PROJECT_ROOT = BASE_DIR / "backend/models/pcod_training"  # For relative paths
    DATASET_PATH = BASE_DIR / "frontend/public/assets"
    
    TRAIN_DIR = DATASET_PATH / "train"
    VAL_DIR = DATASET_PATH / "val"
    TEST_DIR = DATASET_PATH / "test"
    
    # Output directories
    OUTPUT_DIR = BASE_DIR / "backend/models/pcod_training/outputs"
    MODELS_DIR = OUTPUT_DIR / "trained_models"
    CHECKPOINTS_DIR = OUTPUT_DIR / "checkpoints"
    EXPORTS_DIR = OUTPUT_DIR / "exports"
    LOGS_DIR = OUTPUT_DIR / "logs"
    PLOTS_DIR = OUTPUT_DIR / "plots"
    REPORTS_DIR = OUTPUT_DIR / "reports"
    GRADCAM_DIR = OUTPUT_DIR / "gradcam"
    
    # Class names
    CLASS_NAMES = ['noninfected', 'infected']  # 0: Normal, 1: PCOS
    NUM_CLASSES = 2
    
    # ==================== MODEL CONFIGURATION ====================
    # Architecture
    MODEL_NAME = "EfficientNetB4"
    INPUT_SIZE = (380, 380)  # EfficientNetB4 optimal size
    INPUT_SHAPE = (380, 380, 3)
    
    # Transfer Learning
    IMAGENET_WEIGHTS = True
    POOLING = 'avg'
    
    # Custom classifier head
    DROPOUT_RATE = 0.3
    DENSE_UNITS = 256
    ACTIVATION = 'relu'
    FINAL_ACTIVATION = 'sigmoid'  # Binary classification
    
    # ==================== TRAINING CONFIGURATION ====================
    # Training Strategy - 3 Phase Training
    PHASE_1_EPOCHS = 10  # Freeze base, train classifier
    PHASE_2_EPOCHS = 30  # Fine-tune last 100 layers
    PHASE_3_EPOCHS = 10  # Full model fine-tuning
    TOTAL_EPOCHS = PHASE_1_EPOCHS + PHASE_2_EPOCHS + PHASE_3_EPOCHS
    
    # Fine-tuning layers
    FINE_TUNE_AT = 100  # Number of layers from top for phase 2
    
    # Batch configuration
    BATCH_SIZE = 16  # Optimized for 15GB RAM
    GRADIENT_ACCUMULATION_STEPS = 2  # Effective batch size = 32
    
    # Optimizer settings
    INITIAL_LR = 1e-3      # Phase 1: High LR for new classifier
    FINE_TUNE_LR = 1e-4    # Phase 2: Lower LR for fine-tuning
    FULL_TUNE_LR = 1e-5    # Phase 3: Very low LR for full fine-tuning
    
    WEIGHT_DECAY = 1e-4
    BETA_1 = 0.9
    BETA_2 = 0.999
    EPSILON = 1e-7
    
    # Loss function - Focal Loss for class imbalance
    FOCAL_LOSS_GAMMA = 2.0
    FOCAL_LOSS_ALPHA = 0.25
    FOCAL_ALPHA = FOCAL_LOSS_ALPHA  # Alias for compatibility
    FOCAL_GAMMA = FOCAL_LOSS_GAMMA  # Alias for compatibility
    LABEL_SMOOTHING = 0.0
    
    # ==================== DATA AUGMENTATION ====================
    # Rotation and geometric transforms
    ROTATION_RANGE = 20      # ±20 degrees
    ZOOM_RANGE = 0.2        # 0.8-1.2x zoom
    WIDTH_SHIFT_RANGE = 0.1
    HEIGHT_SHIFT_RANGE = 0.1
    HORIZONTAL_FLIP = True
    VERTICAL_FLIP = True
    
    # Intensity transforms
    BRIGHTNESS_RANGE = 0.2   # ±20%
    CONTRAST_RANGE = 0.2     # ±20%
    
    # Medical-specific augmentations
    ELASTIC_ALPHA = 120
    ELASTIC_SIGMA = 6
    RANDOM_ERASING_PROB = 0.2
    RANDOM_ERASING_AREA = 0.1
    
    # Normalization (ImageNet stats)
    IMAGENET_MEAN = [0.485, 0.456, 0.406]
    IMAGENET_STD = [0.229, 0.224, 0.225]
    NORMALIZATION_MEAN = IMAGENET_MEAN  # Alias for compatibility
    NORMALIZATION_STD = IMAGENET_STD     # Alias for compatibility
    
    # ==================== VALIDATION CONFIGURATION ====================
    # K-Fold Cross Validation
    K_FOLDS = 5
    CV_RANDOM_STATE = 42
    
    # Ensemble configuration
    NUM_ENSEMBLE_MODELS = 3
    ENSEMBLE_WEIGHTS = [0.4, 0.3, 0.3]  # Weighted averaging
    
    # ==================== CALLBACKS CONFIGURATION ====================
    # Early Stopping
    EARLY_STOPPING_PATIENCE = 10
    EARLY_STOPPING_MONITOR = 'val_accuracy'
    EARLY_STOPPING_MODE = 'max'
    EARLY_STOPPING_RESTORE = True
    
    # Model Checkpoint
    CHECKPOINT_MONITOR = 'val_accuracy'
    CHECKPOINT_MODE = 'max'
    CHECKPOINT_SAVE_BEST = True
    CHECKPOINT_SAVE_WEIGHTS = False
    
    # Reduce LR on Plateau
    REDUCE_LR_MONITOR = 'val_loss'
    REDUCE_LR_FACTOR = 0.2
    REDUCE_LR_PATIENCE = 5
    REDUCE_LR_MIN_LR = 1e-7
    
    # Cosine Annealing
    COSINE_RESTARTS = True
    COSINE_T_MUL = 2
    COSINE_M_MUL = 1.0
    
    # ==================== MEMORY OPTIMIZATION ====================
    # Mixed Precision Training
    MIXED_PRECISION = True
    
    # Memory growth settings
    GPU_MEMORY_GROWTH = True
    
    # Data loading
    NUM_WORKERS = 4
    PREFETCH_BUFFER = 2
    CACHE_DATASET = False  # Set True if dataset fits in memory
    
    # Progressive loading
    PROGRESSIVE_LOADING = True
    INITIAL_IMAGE_SIZE = (224, 224)
    PROGRESSIVE_EPOCHS = [15, 30]  # When to increase resolution
    PROGRESSIVE_SIZES = [(256, 256), (320, 320), (380, 380)]
    
    # ==================== EVALUATION CONFIGURATION ====================
    # Metrics to track
    METRICS = [
        'accuracy',
        'precision',
        'recall',
        'auc',
        'f1_score'
    ]
    
    # Evaluation thresholds
    CLASSIFICATION_THRESHOLD = 0.5
    ROC_THRESHOLDS = 100
    
    # ==================== GRAD-CAM CONFIGURATION ====================
    # Layers for Grad-CAM visualization
    GRADCAM_LAYERS = ['top_conv', 'block7a_expand_conv', 'block6a_expand_conv']
    
    # Sample images for Grad-CAM
    GRADCAM_SAMPLES = 20  # Number of samples per class
    GRADCAM_COLORMAP = 'jet'
    
    # ==================== EXPORT CONFIGURATION ====================
    # Model export formats
    EXPORT_H5 = True
    EXPORT_SAVEDMODEL = True
    EXPORT_TFLITE = True
    EXPORT_TFLITE_QUANTIZED = True
    
    # TensorFlow Lite optimization
    TFLITE_OPTIMIZATION = True
    TFLITE_TARGET_SPEC = None  # Can be set for mobile/edge devices
    
    # ==================== LOGGING CONFIGURATION ====================
    # TensorBoard
    TENSORBOARD_UPDATE_FREQ = 'batch'
    TENSORBOARD_PROFILE_BATCH = 0
    
    # Console logging
    LOG_LEVEL = 'INFO'
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Progress tracking
    PROGRESS_BAR = True
    VERBOSE = 1
    
    # ==================== REPRODUCIBILITY ====================
    RANDOM_SEED = 42
    TF_DETERMINISTIC = True
    
    @classmethod
    def create_directories(cls):
        """Create all necessary output directories"""
        directories = [
            cls.OUTPUT_DIR,
            cls.MODELS_DIR,
            cls.CHECKPOINTS_DIR,
            cls.EXPORTS_DIR,
            cls.LOGS_DIR,
            cls.PLOTS_DIR,
            cls.REPORTS_DIR,
            cls.GRADCAM_DIR
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
        
        print(f"✅ Created output directories in: {cls.OUTPUT_DIR}")
    
    @classmethod
    def get_phase_config(cls, phase):
        """Get configuration for specific training phase"""
        phase_configs = {
            1: {
                'epochs': cls.PHASE_1_EPOCHS,
                'learning_rate': cls.INITIAL_LR,
                'freeze_base': True,
                'fine_tune_layers': 0,
                'description': 'Freeze base, train classifier'
            },
            2: {
                'epochs': cls.PHASE_2_EPOCHS,
                'learning_rate': cls.FINE_TUNE_LR,
                'freeze_base': False,
                'fine_tune_layers': cls.FINE_TUNE_AT,
                'description': f'Fine-tune last {cls.FINE_TUNE_AT} layers'
            },
            3: {
                'epochs': cls.PHASE_3_EPOCHS,
                'learning_rate': cls.FULL_TUNE_LR,
                'freeze_base': False,
                'fine_tune_layers': 0,
                'description': 'Full model fine-tuning'
            }
        }
        return phase_configs.get(phase, {})
    
    @classmethod
    def print_config(cls):
        """Print configuration summary"""
        print("\n" + "="*60)
        print("🎯 PCOS DETECTION MODEL CONFIGURATION")
        print("="*60)
        
        print(f"\n📁 DATASET:")
        print(f"   Path: {cls.DATASET_PATH}")
        print(f"   Classes: {cls.CLASS_NAMES}")
        print(f"   Input size: {cls.INPUT_SHAPE}")
        
        print(f"\n🏗️ MODEL:")
        print(f"   Architecture: {cls.MODEL_NAME}")
        print(f"   Transfer learning: {cls.IMAGENET_WEIGHTS}")
        print(f"   Dropout rate: {cls.DROPOUT_RATE}")
        
        print(f"\n🎓 TRAINING:")
        print(f"   Total epochs: {cls.TOTAL_EPOCHS}")
        print(f"   Phase 1: {cls.PHASE_1_EPOCHS} epochs (freeze base)")
        print(f"   Phase 2: {cls.PHASE_2_EPOCHS} epochs (fine-tune)")
        print(f"   Phase 3: {cls.PHASE_3_EPOCHS} epochs (full tune)")
        print(f"   Batch size: {cls.BATCH_SIZE}")
        print(f"   K-folds: {cls.K_FOLDS}")
        
        print(f"\n📊 EVALUATION:")
        print(f"   Metrics: {', '.join(cls.METRICS)}")
        print(f"   Grad-CAM layers: {cls.GRADCAM_LAYERS}")
        
        print(f"\n💾 OUTPUT:")
        print(f"   Directory: {cls.OUTPUT_DIR}")
        print(f"   Formats: H5, SavedModel, TFLite")
        
        print("="*60 + "\n")

# Global configuration instance
config = Config()