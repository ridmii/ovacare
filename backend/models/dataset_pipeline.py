"""
PCOS Dataset Management Tool
Complete pipeline for organizing and validating PCOS datasets
"""

import os
import sys
from pathlib import Path

def print_menu():
    """
    Print the main menu
    """
    print("\n" + "="*50)
    print("🔬 PCOS Dataset Management Pipeline")
    print("="*50)
    print("1. 📁 Quick Organization (Automatic pattern detection)")
    print("2. 🔧 Advanced Organization (Manual control)")
    print("3. ✅ Validate Organized Dataset")
    print("4. 📊 Generate Training Summary")
    print("5. 🚀 Start Model Training")
    print("6. ❓ Help & Documentation")
    print("0. 🚪 Exit")
    print("-"*50)

def quick_organize_option():
    """
    Run quick organization with automatic pattern detection
    """
    print("\n📁 Quick Dataset Organization")
    print("-" * 30)
    
    # Get source path
    source_path = input("Enter path to mixed images folder: ").strip()
    
    if not source_path:
        print("❌ No path provided")
        return
    
    source_path = Path(source_path)
    
    if not source_path.exists():
        print(f"❌ Path not found: {source_path}")
        return
    
    # Import and run quick organizer
    try:
        sys.path.append(str(Path(__file__).parent))
        from quick_organize import PCOSQuickOrganizer
        
        organizer = PCOSQuickOrganizer(str(source_path))
        organizer.organize()
        
        print("\n✅ Quick organization complete!")
        print("📋 Run validation (option 3) to check results")
        
    except ImportError:
        print("❌ quick_organize.py not found. Please ensure all files are in the same directory.")
    except Exception as e:
        print(f"❌ Organization failed: {e}")

def advanced_organize_option():
    """
    Run advanced organization with manual control
    """
    print("\n🔧 Advanced Dataset Organization")
    print("-" * 30)
    
    # Get source path
    source_path = input("Enter path to mixed images folder: ").strip()
    
    if not source_path:
        print("❌ No path provided")
        return
    
    source_path = Path(source_path)
    
    if not source_path.exists():
        print(f"❌ Path not found: {source_path}")
        return
    
    # Import and run advanced organizer
    try:
        sys.path.append(str(Path(__file__).parent))
        from dataset_organizer import PCOSDatasetOrganizer
        
        organizer = PCOSDatasetOrganizer(str(source_path))
        organizer.organize_dataset()
        
        print("\n✅ Advanced organization complete!")
        print("📋 Run validation (option 3) to check results")
        
    except ImportError:
        print("❌ dataset_organizer.py not found. Please ensure all files are in the same directory.")
    except Exception as e:
        print(f"❌ Organization failed: {e}")

def validate_dataset_option():
    """
    Run dataset validation
    """
    print("\n✅ Dataset Validation")
    print("-" * 30)
    
    # Get dataset path
    dataset_path = input("Enter path to organized dataset: ").strip()
    
    if not dataset_path:
        print("❌ No path provided")
        return
    
    dataset_path = Path(dataset_path)
    
    if not dataset_path.exists():
        print(f"❌ Path not found: {dataset_path}")
        return
    
    # Import and run validator
    try:
        sys.path.append(str(Path(__file__).parent))
        from validate_dataset import generate_validation_report
        
        report = generate_validation_report(dataset_path)
        
        if not report['validation_errors']:
            print("\n🎉 Dataset is ready for training!")
        else:
            print("\n⚠️ Check validation report for issues")
            
    except ImportError:
        print("❌ validate_dataset.py not found. Please ensure all files are in the same directory.")
    except Exception as e:
        print(f"❌ Validation failed: {e}")

def generate_summary_option():
    """
    Generate training summary for organized dataset
    """
    print("\n📊 Training Summary Generator")
    print("-" * 30)
    
    # Get dataset path
    dataset_path = input("Enter path to organized dataset: ").strip()
    
    if not dataset_path:
        print("❌ No path provided")
        return
    
    dataset_path = Path(dataset_path)
    
    if not dataset_path.exists():
        print(f"❌ Path not found: {dataset_path}")
        return
    
    # Check dataset structure
    required_folders = ['train', 'val', 'test']
    
    print(f"\n📂 Checking dataset structure...")
    
    for folder in required_folders:
        folder_path = dataset_path / folder
        
        if not folder_path.exists():
            print(f"❌ Missing {folder}/ folder")
            return
        
        # Check for class folders
        infected_path = folder_path / 'infected'
        noninfected_path = folder_path / 'noninfected'
        
        if not infected_path.exists() or not noninfected_path.exists():
            print(f"❌ Missing class folders in {folder}/")
            return
        
        # Count images
        image_exts = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff']
        
        infected_count = 0
        noninfected_count = 0
        
        for ext in image_exts:
            infected_count += len(list(infected_path.glob(ext))) + len(list(infected_path.glob(ext.upper())))
            noninfected_count += len(list(noninfected_path.glob(ext))) + len(list(noninfected_path.glob(ext.upper())))
        
        total_count = infected_count + noninfected_count
        
        print(f"✅ {folder}/ - {total_count} images ({infected_count} infected, {noninfected_count} non-infected)")
    
    # Generate TensorFlow config
    config_content = f"""'''
TensorFlow Training Configuration for PCOS Dataset
Generated automatically from your organized dataset
'''

import tensorflow as tf
from pathlib import Path

# Dataset paths
DATASET_PATH = r"{dataset_path}"
TRAIN_DIR = DATASET_PATH + "/train"
VAL_DIR = DATASET_PATH + "/val"
TEST_DIR = DATASET_PATH + "/test"

# Training parameters
BATCH_SIZE = 32
IMG_SIZE = (224, 224)
NUM_CLASSES = 2  # infected, noninfected
EPOCHS = 50

# Data augmentation
data_augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip('horizontal'),
    tf.keras.layers.RandomRotation(0.2),
    tf.keras.layers.RandomZoom(0.2),
    tf.keras.layers.RandomBrightness(0.2)
])

# Create data generators
train_ds = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode='categorical'  # or 'binary' for binary classification
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    VAL_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode='categorical'
)

test_ds = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode='categorical'
)

# Performance optimization
AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
test_ds = test_ds.cache().prefetch(buffer_size=AUTOTUNE)

print("📊 Dataset loaded successfully!")
print(f"Training batches: {{len(train_ds)}}")
print(f"Validation batches: {{len(val_ds)}}")
print(f"Test batches: {{len(test_ds)}}")
"""
    
    # Save config
    config_path = dataset_path / 'tensorflow_config.py'
    with open(config_path, 'w') as f:
        f.write(config_content)
    
    print(f"\n✅ Configuration saved: {config_path}")
    print("🚀 Your dataset is ready for TensorFlow training!")

def start_training_option():
    """
    Start model training
    """
    print("\n🚀 Start Model Training")
    print("-" * 30)
    
    print("Training options:")
    print("1. Quick Training (Use our pre-built pipeline)")
    print("2. Custom Training (Use your own script)")
    
    choice = input("Select option (1-2): ").strip()
    
    if choice == '1':
        # Get dataset path
        dataset_path = input("Enter path to organized dataset: ").strip()
        
        if not dataset_path or not Path(dataset_path).exists():
            print("❌ Invalid dataset path")
            return
        
        # Check if training pipeline exists
        pipeline_path = Path(__file__).parent / '../pcos_training_pipeline.py'
        
        if pipeline_path.exists():
            print("🚀 Starting training with our pipeline...")
            print(f"📁 Dataset: {dataset_path}")
            print("💡 Run this command in your terminal:")
            print(f"    python {pipeline_path} --dataset_path {dataset_path}")
        else:
            print("❌ Training pipeline not found")
            print("💡 Create your own training script using the generated tensorflow_config.py")
    
    elif choice == '2':
        print("💡 Use the generated tensorflow_config.py in your dataset folder")
        print("💡 Import it in your training script to load the organized dataset")
    else:
        print("❌ Invalid option")

def show_help():
    """
    Show help and documentation
    """
    help_text = """
🔬 PCOS Dataset Management Pipeline - Help
================================================

WORKFLOW:
1. Organize mixed images into proper structure
2. Validate organization quality
3. Generate training configuration
4. Train your model

ORGANIZATION OPTIONS:
📁 Quick Organization:
   - Automatic filename pattern detection
   - Fast setup for common naming patterns
   - Best for: "PCOS_xxx.jpg", "Normal_xxx.jpg" files

🔧 Advanced Organization:
   - Manual labeling interface
   - Custom pattern configuration
   - Best for: Complex or unclear filenames

DATASET STRUCTURE:
Your organized dataset will look like:
📂 dataset/
   📂 train/
      📂 infected/     (PCOS positive images)
      📂 noninfected/  (Normal/healthy images)
   📂 val/
      📂 infected/
      📂 noninfected/
   📂 test/
      📂 infected/
      📂 noninfected/

FILES CREATED:
- dataset_labels.csv     (Complete image labels)
- train_labels.csv       (Training split labels)
- val_labels.csv         (Validation split labels)
- test_labels.csv        (Test split labels)
- organization_report.json (Process summary)
- validation_report.json (Quality check results)
- tensorflow_config.py   (Ready-to-use TensorFlow setup)

TRAINING TIPS:
✅ Aim for 70-20-10 split (train-val-test)
✅ Balance classes (similar number of infected/noninfected)
✅ Validate dataset before training
✅ Use data augmentation for small datasets

TROUBLESHOOTING:
❌ "No pattern detected": Use Advanced Organization
❌ "Class imbalance": Consider data augmentation
❌ "Missing folders": Re-run organization
❌ "Validation errors": Check file naming and structure

Need help? Check the validation report for detailed diagnostics.
    """
    print(help_text)
    input("\nPress Enter to continue...")

def main():
    """
    Main application loop
    """
    while True:
        print_menu()
        
        try:
            choice = input("Select option (0-6): ").strip()
            
            if choice == '0':
                print("\n👋 Goodbye!")
                break
            
            elif choice == '1':
                quick_organize_option()
            
            elif choice == '2':
                advanced_organize_option()
            
            elif choice == '3':
                validate_dataset_option()
            
            elif choice == '4':
                generate_summary_option()
            
            elif choice == '5':
                start_training_option()
            
            elif choice == '6':
                show_help()
            
            else:
                print("❌ Invalid option. Please select 0-6.")
            
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()