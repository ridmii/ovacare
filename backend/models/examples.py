"""
Examples for handling different mixed-folder scenarios
Choose the method that best fits your dataset structure
"""

import os
import pandas as pd
from pathlib import Path
from pcos_training_pipeline import PCOSDatasetOrganizer

def example_1_filename_based_labeling():
    """
    Example 1: Labels can be extracted from filenames
    Works when your files are named like:
    - pcos_001.jpg, pcos_patient_042.png
    - normal_001.jpg, healthy_case_123.png  
    - infected_ultrasound_001.jpg
    - noninfected_scan_042.jpg
    """
    print("=== Example 1: Filename-based labeling ===")
    
    organizer = PCOSDatasetOrganizer(
        dataset_path="your/mixed/dataset/path",
        output_path="organized_dataset"
    )
    
    # This will automatically detect labels from filenames
    labels = organizer.analyze_dataset(method='filename')
    
    if labels:
        print(f"Successfully labeled {len(labels)} images")
        stats = organizer.organize_dataset(labels)
    else:
        print("Could not extract labels from filenames")
        print("Check if your filenames contain keywords like 'pcos', 'normal', etc.")

def example_2_csv_based_labeling():
    """
    Example 2: You have a separate CSV file with labels
    CSV format should be:
    filename,label
    image_001.jpg,1
    image_002.jpg,0
    image_003.jpg,pcos
    image_004.jpg,normal
    """
    print("=== Example 2: CSV-based labeling ===")
    
    # First, create your CSV file if you don't have one
    # You can create it manually or use this helper function
    create_sample_csv()
    
    organizer = PCOSDatasetOrganizer(
        dataset_path="your/mixed/dataset/path",
        output_path="organized_dataset"
    )
    
    # Use CSV file for labeling
    labels = organizer.analyze_dataset(
        method='csv', 
        csv_path="image_labels.csv"
    )
    
    if labels:
        print(f"Successfully labeled {len(labels)} images from CSV")
        stats = organizer.organize_dataset(labels)

def example_3_manual_labeling():
    """
    Example 3: Manual labeling when automatic methods don't work
    You'll be prompted to label images one by one
    """
    print("=== Example 3: Manual labeling ===")
    
    organizer = PCOSDatasetOrganizer(
        dataset_path="your/mixed/dataset/path",
        output_path="organized_dataset"
    )
    
    # This will prompt you to manually label each image
    labels = organizer.analyze_dataset(method='manual')
    
    if labels:
        print(f"Successfully labeled {len(labels)} images manually")
        stats = organizer.organize_dataset(labels)

def example_4_mixed_approach():
    """
    Example 4: Combination approach
    Try automatic methods first, then manual for remaining
    """
    print("=== Example 4: Mixed approach ===")
    
    organizer = PCOSDatasetOrganizer(
        dataset_path="your/mixed/dataset/path",
        output_path="organized_dataset"
    )
    
    # Step 1: Try filename-based labeling
    print("Step 1: Trying filename-based labeling...")
    labels = organizer.analyze_dataset(method='filename')
    
    # Step 2: If CSV exists, try that for remaining unlabeled files
    csv_path = "image_labels.csv"
    if os.path.exists(csv_path) and len(labels) < expected_total_images():
        print("Step 2: Using CSV for remaining files...")
        csv_labels = organizer.analyze_dataset(method='csv', csv_path=csv_path)
        labels.update(csv_labels)
    
    # Step 3: Manual labeling for any remaining files
    remaining_files = get_unlabeled_files(organizer.dataset_path, labels)
    if remaining_files:
        print(f"Step 3: Manual labeling for {len(remaining_files)} remaining files...")
        manual_labels = organizer._extract_labels_manually(remaining_files)
        # Add manual labels to the main labels dict
        for file_path in remaining_files:
            if file_path.name in manual_labels:
                labels[file_path.name] = {
                    'label': manual_labels[file_path.name],
                    'split': 'train',  # You'll need to determine split
                    'path': file_path
                }
    
    if labels:
        print(f"Total labeled images: {len(labels)}")
        stats = organizer.organize_dataset(labels)

def create_sample_csv():
    """
    Helper function to create a sample CSV labels file
    Modify this based on your actual image names and labels
    """
    # Sample data - replace with your actual filenames and labels
    sample_data = {
        'filename': [
            'ultrasound_001.jpg',
            'ultrasound_002.jpg', 
            'ultrasound_003.jpg',
            'ultrasound_004.jpg',
            'scan_001.png',
            'scan_002.png'
        ],
        'label': [1, 0, 1, 0, 1, 0]  # 1 = PCOS, 0 = Normal
    }
    
    df = pd.DataFrame(sample_data)
    df.to_csv('image_labels.csv', index=False)
    print("Created image_labels.csv - modify this file with your actual data")

def analyze_your_dataset():
    """
    Helper function to analyze your current dataset structure
    Run this first to understand your data
    """
    print("=== Dataset Analysis ===")
    
    dataset_path = Path("your/mixed/dataset/path")  # Update this path
    
    if not dataset_path.exists():
        print("❌ Please update the dataset_path variable to point to your data")
        return
    
    for split in ['train', 'val', 'test']:
        split_path = dataset_path / split
        if split_path.exists():
            # Get all image files
            image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff']
            all_files = []
            for ext in image_extensions:
                all_files.extend(list(split_path.glob(ext)))
                all_files.extend(list(split_path.glob(ext.upper())))
            
            print(f"\n📁 {split}/ folder:")
            print(f"   Total images: {len(all_files)}")
            
            if all_files:
                print(f"   Sample filenames:")
                for i, file in enumerate(all_files[:5]):
                    print(f"     {i+1}. {file.name}")
                
                # Analyze filename patterns
                analyze_filename_patterns(all_files)

def analyze_filename_patterns(files):
    """
    Analyze filename patterns to suggest labeling approach
    """
    print(f"   Filename pattern analysis:")
    
    # Check for common keywords
    positive_keywords = ['pcos', 'infected', 'positive', 'pos', 'abnormal']
    negative_keywords = ['normal', 'noninfected', 'negative', 'neg', 'healthy']
    
    pos_count = 0
    neg_count = 0
    unclear_count = 0
    
    for file in files:
        filename_lower = file.name.lower()
        has_positive = any(keyword in filename_lower for keyword in positive_keywords)
        has_negative = any(keyword in filename_lower for keyword in negative_keywords)
        
        if has_positive:
            pos_count += 1
        elif has_negative:
            neg_count += 1
        else:
            unclear_count += 1
    
    print(f"     - Likely PCOS/Positive: {pos_count} files")
    print(f"     - Likely Normal/Negative: {neg_count} files") 
    print(f"     - Unclear naming: {unclear_count} files")
    
    if unclear_count > 0:
        print(f"   ⚠️  {unclear_count} files need manual review or CSV labeling")
    
    if pos_count > 0 or neg_count > 0:
        print(f"   ✅ {pos_count + neg_count} files can be auto-labeled from filenames")

def expected_total_images():
    """
    Helper to get expected total number of images
    Replace with actual count from your dataset
    """
    return 1000  # Update with your actual total

def get_unlabeled_files(dataset_path, labels):
    """
    Get files that haven't been labeled yet
    """
    all_files = []
    for split in ['train', 'val', 'test']:
        split_path = dataset_path / split
        if split_path.exists():
            files = list(split_path.glob('*.jpg')) + list(split_path.glob('*.png'))
            all_files.extend(files)
    
    unlabeled = [f for f in all_files if f.name not in labels]
    return unlabeled

if __name__ == "__main__":
    print("PCOS Dataset Organization Examples")
    print("=" * 50)
    print()
    print("Choose the example that best fits your situation:")
    print()
    print("1. analyze_your_dataset() - Start here to understand your data")
    print("2. example_1_filename_based_labeling() - If your filenames contain labels") 
    print("3. example_2_csv_based_labeling() - If you have/can create a CSV file")
    print("4. example_3_manual_labeling() - For manual labeling")
    print("5. example_4_mixed_approach() - Combination of all methods")
    print()
    print("To run an example:")
    print("  python examples.py")
    print("  Then uncomment the example you want to test")
    
    # Uncomment the example you want to run:
    
    # Step 1: Always start with this
    # analyze_your_dataset()
    
    # Step 2: Choose based on your data structure
    # example_1_filename_based_labeling()
    # example_2_csv_based_labeling()
    # example_3_manual_labeling()
    # example_4_mixed_approach()