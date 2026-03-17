"""
Quick Dataset Organization Script
Run this script to quickly organize your PCOS dataset
"""

import sys
from pathlib import Path

# Import the organizer class
try:
    from dataset_organizer import PCOSDatasetOrganizer
except ImportError:
    print("❌ Could not import dataset_organizer.py")
    print("Make sure dataset_organizer.py is in the same directory")
    sys.exit(1)

def quick_organize(dataset_path):
    """
    Quick organization with minimal user interaction
    """
    print("🩺 Quick PCOS Dataset Organization")
    print("=" * 40)
    
    # Initialize organizer
    organizer = PCOSDatasetOrganizer(dataset_path)
    
    # Analyze structure
    print("📋 Step 1: Analyzing dataset...")
    total_images = organizer.analyze_dataset_structure()
    
    if total_images == 0:
        print("❌ No images found!")
        return False
    
    # Detect patterns
    print("🔍 Step 2: Detecting label patterns...")
    all_labels = organizer.detect_label_patterns()
    
    # Check labeling success rate
    labeled_count = len([l for l in all_labels.values() if l['label'] is not None])
    success_rate = (labeled_count / total_images) * 100
    
    print(f"📊 Labeling Results:")
    print(f"   {labeled_count}/{total_images} images labeled ({success_rate:.1f}%)")
    
    if success_rate < 70:
        print("⚠️  Low labeling success rate!")
        print("   Your filenames might not contain clear class indicators")
        print("   Consider running the full interactive version")
        
        response = input("Continue anyway? (y/n): ").strip().lower()
        if response != 'y':
            return False
    
    # Organize
    print("📁 Step 3: Creating organized structure...")
    backup_response = input("Create backup of original dataset? (y/n) [recommended]: ").strip().lower()
    backup = backup_response != 'n'  # Default to yes
    
    move_stats, moved_files, failed_moves = organizer.create_organized_structure(all_labels, backup_original=backup)
    
    # Validate
    print("✅ Step 4: Validating organization...")
    validation_results = organizer.validate_organization()
    
    # Generate backups
    print("💾 Step 5: Generating CSV backups...")
    main_csv, summary_csv = organizer.generate_csv_backup(all_labels)
    
    # Final report
    organizer.generate_final_report()
    
    print("\n🎉 Quick organization complete!")
    return True

def main():
    if len(sys.argv) > 1:
        dataset_path = sys.argv[1]
    else:
        print("Usage: python quick_organize.py <dataset_path>")
        print("Example: python quick_organize.py assets")
        print("\nOr run interactively:")
        dataset_path = input("Enter dataset path: ").strip()
    
    if not dataset_path:
        print("❌ No dataset path provided")
        return
    
    dataset_path = Path(dataset_path)
    
    if not dataset_path.exists():
        print(f"❌ Path not found: {dataset_path}")
        return
    
    success = quick_organize(dataset_path)
    
    if success:
        print(f"\n✅ Your dataset is now organized!")
        print(f"📁 Location: {dataset_path}")
        print(f"📊 Structure: train/val/test -> infected/noninfected")
        print(f"💾 CSV backups created for reference")
    else:
        print(f"\n❌ Organization failed or cancelled")

if __name__ == "__main__":
    main()