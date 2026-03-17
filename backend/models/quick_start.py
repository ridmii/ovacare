"""
Quick Start Guide for PCOS Detection Model Training
This script demonstrates how to use the training pipeline with your mixed-folder dataset
"""

import os
import sys
from pathlib import Path

# Add the models directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pcos_training_pipeline import PCOSDatasetOrganizer, PCOSModelTrainer, optimize_memory

def quick_start_training():
    """
    Quick start example for your specific dataset structure
    """
    print("🩺 PCOS Detection Model - Quick Start")
    print("=" * 50)
    
    # STEP 1: Configure your paths
    print("Step 1: Configure dataset paths")
    print("-" * 30)
    
    # Update these paths to match your dataset location
    ORIGINAL_DATASET_PATH = "path/to/your/dataset"  # Contains train/, val/, test/ folders with mixed images
    ORGANIZED_DATASET_PATH = "organized_pcos_dataset"  # Where organized dataset will be saved
    
    # Check if paths need to be updated
    if not os.path.exists(ORIGINAL_DATASET_PATH):
        print(f"❌ Dataset not found at: {ORIGINAL_DATASET_PATH}")
        print("Please update ORIGINAL_DATASET_PATH in this script to point to your dataset")
        return
    
    # STEP 2: Optimize memory for 15GB RAM
    print("\nStep 2: Optimizing memory for 15GB RAM")
    print("-" * 30)
    optimize_memory()
    print("✅ Memory optimization applied")
    
    # STEP 3: Analyze and organize dataset
    print("\nStep 3: Analyzing dataset structure")
    print("-" * 30)
    
    organizer = PCOSDatasetOrganizer(
        dataset_path=ORIGINAL_DATASET_PATH,
        output_path=ORGANIZED_DATASET_PATH
    )
    
    # Try to extract labels from filenames first
    print("Attempting to extract labels from filenames...")
    labels = organizer.analyze_dataset(method='filename')
    
    if not labels:
        print("❌ Could not extract labels from filenames")
        print("Please check if your filenames contain keywords like:")
        print("  - 'pcos', 'infected', 'positive' for PCOS cases")
        print("  - 'normal', 'noninfected', 'negative' for normal cases")
        print("\nAlternatively, prepare a CSV file with filename,label columns")
        return
    
    print(f"✅ Successfully extracted labels for {len(labels)} images")
    
    # Organize dataset into proper structure
    print("\nOrganizing dataset into train/val/test folders...")
    stats = organizer.organize_dataset(labels)
    print("✅ Dataset organized successfully")
    
    # STEP 4: Initialize trainer
    print("\nStep 4: Initializing model trainer")
    print("-" * 30)
    
    trainer = PCOSModelTrainer(
        dataset_path=ORGANIZED_DATASET_PATH,
        img_size=(224, 224),  # Good balance of quality vs memory
        batch_size=16  # Conservative batch size for 15GB RAM
    )
    
    # Create data generators
    train_gen, val_gen, test_gen = trainer.create_data_generators()
    print(f"✅ Data generators created")
    print(f"   Training samples: {train_gen.samples}")
    print(f"   Validation samples: {val_gen.samples}")
    print(f"   Test samples: {test_gen.samples}")
    
    # STEP 5: Build and compile model
    print("\nStep 5: Building model architecture")
    print("-" * 30)
    
    # Use efficient MobileNetV2-based model for your RAM constraints
    model = trainer.build_efficient_model()
    trainer.compile_model()
    
    print("✅ Model built and compiled")
    print(f"   Total parameters: {model.count_params():,}")
    
    # Show model summary
    model.summary()
    
    # STEP 6: Train the model
    print("\nStep 6: Training the model")
    print("-" * 30)
    print("Starting training... This may take several hours depending on dataset size")
    
    history = trainer.train_model(
        train_gen, 
        val_gen, 
        epochs=30  # Adjust based on your needs
    )
    
    print("✅ Training completed")
    
    # STEP 7: Evaluate model
    print("\nStep 7: Evaluating model performance")
    print("-" * 30)
    
    results = trainer.evaluate_model(test_gen)
    
    print(f"📊 Final Results:")
    print(f"   Test Accuracy: {results['test_accuracy']:.4f}")
    print(f"   Test Precision: {results['test_precision']:.4f}")
    print(f"   Test Recall: {results['test_recall']:.4f}")
    
    # Calculate F1 score
    precision = results['test_precision']
    recall = results['test_recall']
    f1_score = 2 * (precision * recall) / (precision + recall)
    print(f"   F1 Score: {f1_score:.4f}")
    
    # STEP 8: Generate visualizations
    print("\nStep 8: Generating visualizations")
    print("-" * 30)
    
    trainer.plot_training_history(history)
    trainer.plot_confusion_matrix(results['confusion_matrix'])
    
    print("✅ Training pipeline completed successfully!")
    print(f"💾 Model saved as: best_pcos_model.h5")
    print(f"📈 Training plots saved as: training_history.png, confusion_matrix.png")

def check_dataset_structure(dataset_path):
    """
    Utility function to analyze your current dataset structure
    """
    print("🔍 Dataset Structure Analysis")
    print("=" * 50)
    
    dataset_path = Path(dataset_path)
    
    if not dataset_path.exists():
        print(f"❌ Dataset path not found: {dataset_path}")
        return
    
    for split in ['train', 'val', 'test']:
        split_path = dataset_path / split
        if split_path.exists():
            files = list(split_path.glob('*.jpg')) + list(split_path.glob('*.png')) + list(split_path.glob('*.jpeg'))
            print(f"📁 {split}/ folder: {len(files)} images")
            
            # Sample filenames to understand naming pattern
            if files:
                print(f"   Sample files:")
                for file in files[:3]:
                    print(f"     - {file.name}")
        else:
            print(f"❌ {split}/ folder not found")
    
    print("\n💡 Tips for filename-based labeling:")
    print("   - Include 'pcos', 'infected', or 'positive' for PCOS cases")
    print("   - Include 'normal', 'noninfected', or 'negative' for normal cases")
    print("   - Example: 'pcos_patient_001.jpg' or 'normal_case_042.png'")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='PCOS Detection Model Training')
    parser.add_argument('--dataset_path', type=str, 
                       help='Path to your mixed-folder dataset')
    parser.add_argument('--check_structure', action='store_true',
                       help='Only analyze dataset structure without training')
    
    args = parser.parse_args()
    
    if args.check_structure and args.dataset_path:
        check_dataset_structure(args.dataset_path)
    elif args.dataset_path:
        # Update the dataset path in the quick_start function
        print(f"Using dataset path: {args.dataset_path}")
        quick_start_training()
    else:
        print("Please provide --dataset_path argument")
        print("Example usage:")
        print("  python quick_start.py --dataset_path /path/to/your/dataset")
        print("  python quick_start.py --dataset_path /path/to/your/dataset --check_structure")