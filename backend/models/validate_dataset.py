"""
Dataset Validation and Analysis Script
Validates organized PCOS dataset and provides detailed statistics
"""

import os
import pandas as pd
from pathlib import Path
from collections import defaultdict
import json

def validate_dataset_structure(dataset_path):
    """
    Validate the organized dataset structure
    """
    dataset_path = Path(dataset_path)
    
    print("🔍 Validating Dataset Structure")
    print("=" * 40)
    
    required_splits = ['train', 'val', 'test']
    required_classes = ['infected', 'noninfected']
    
    validation_errors = []
    structure_info = {}
    
    # Check main structure
    for split in required_splits:
        split_path = dataset_path / split
        structure_info[split] = {}
        
        if not split_path.exists():
            validation_errors.append(f"Missing {split}/ folder")
            continue
        
        print(f"\n📁 Checking {split}/ folder...")
        
        for class_name in required_classes:
            class_path = split_path / class_name
            
            if not class_path.exists():
                validation_errors.append(f"Missing {split}/{class_name}/ folder")
                structure_info[split][class_name] = 0
                continue
            
            # Count images in class folder
            image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff']
            images = []
            for ext in image_extensions:
                images.extend(list(class_path.glob(ext)))
                images.extend(list(class_path.glob(ext.upper())))
            
            count = len(images)
            structure_info[split][class_name] = count
            
            print(f"   ✅ {class_name}/: {count} images")
            
            if count == 0:
                validation_errors.append(f"No images in {split}/{class_name}/ folder")
        
        # Check for loose files in split root
        loose_files = []
        for ext in ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff']:
            loose_files.extend(list(split_path.glob(ext)))
            loose_files.extend(list(split_path.glob(ext.upper())))
        
        if loose_files:
            validation_errors.append(f"{len(loose_files)} loose files in {split}/ root")
            print(f"   ⚠️  {len(loose_files)} files not in class folders")
    
    return structure_info, validation_errors

def analyze_class_distribution(structure_info):
    """
    Analyze class distribution and balance
    """
    print("\n📊 Class Distribution Analysis")
    print("=" * 40)
    
    total_infected = 0
    total_noninfected = 0
    
    for split, classes in structure_info.items():
        infected_count = classes.get('infected', 0)
        noninfected_count = classes.get('noninfected', 0)
        split_total = infected_count + noninfected_count
        
        total_infected += infected_count
        total_noninfected += noninfected_count
        
        if split_total > 0:
            infected_pct = (infected_count / split_total) * 100
            noninfected_pct = (noninfected_count / split_total) * 100
            
            print(f"\n{split.upper()}:")
            print(f"   Infected:     {infected_count:,} ({infected_pct:.1f}%)")
            print(f"   Non-infected: {noninfected_count:,} ({noninfected_pct:.1f}%)")
            print(f"   Total:        {split_total:,}")
    
    # Overall statistics
    grand_total = total_infected + total_noninfected
    
    print(f"\nOVERALL DATASET:")
    print(f"   Total Images:  {grand_total:,}")
    print(f"   Infected:      {total_infected:,} ({(total_infected/grand_total)*100:.1f}%)")
    print(f"   Non-infected:  {total_noninfected:,} ({(total_noninfected/grand_total)*100:.1f}%)")
    
    # Class balance analysis
    if grand_total > 0:
        balance_ratio = min(total_infected, total_noninfected) / max(total_infected, total_noninfected)
        print(f"   Balance Ratio: {balance_ratio:.3f}")
        
        if balance_ratio < 0.5:
            print(f"   🔴 Severe class imbalance! Consider data augmentation")
        elif balance_ratio < 0.7:
            print(f"   🟡 Moderate class imbalance")
        elif balance_ratio < 0.9:
            print(f"   🟢 Minor class imbalance")
        else:
            print(f"   🟢 Well balanced dataset")
    
    return {
        'total_infected': total_infected,
        'total_noninfected': total_noninfected,
        'grand_total': grand_total,
        'balance_ratio': balance_ratio,
        'split_distribution': structure_info
    }

def check_for_csv_files(dataset_path):
    """
    Check for and analyze CSV backup files
    """
    dataset_path = Path(dataset_path)
    
    print("\n💾 Checking CSV Backup Files")
    print("=" * 40)
    
    csv_files = {
        'main_labels': dataset_path / 'dataset_labels.csv',
        'summary': dataset_path / 'dataset_summary.csv',
        'train': dataset_path / 'train_labels.csv',
        'val': dataset_path / 'val_labels.csv',
        'test': dataset_path / 'test_labels.csv',
        'report': dataset_path / 'organization_report.json'
    }
    
    csv_info = {}
    
    for name, filepath in csv_files.items():
        if filepath.exists():
            print(f"   ✅ {filepath.name}")
            
            if filepath.suffix == '.csv':
                try:
                    df = pd.read_csv(filepath)
                    csv_info[name] = {
                        'path': str(filepath),
                        'rows': len(df),
                        'columns': list(df.columns)
                    }
                    
                    if 'label' in df.columns:
                        label_counts = df['label'].value_counts()
                        print(f"      Labels: {dict(label_counts)}")
                        
                except Exception as e:
                    print(f"      ❌ Error reading CSV: {e}")
            
            elif filepath.suffix == '.json':
                try:
                    with open(filepath) as f:
                        report_data = json.load(f)
                    csv_info[name] = {
                        'path': str(filepath),
                        'timestamp': report_data.get('timestamp', 'Unknown')
                    }
                except Exception as e:
                    print(f"      ❌ Error reading JSON: {e}")
        else:
            print(f"   ❌ {filepath.name} (missing)")
    
    return csv_info

def sample_files_check(dataset_path, num_samples=3):
    """
    Check sample files from each class to verify organization
    """
    dataset_path = Path(dataset_path)
    
    print(f"\n🔍 Sampling Files for Verification")
    print("=" * 40)
    
    splits = ['train', 'val', 'test']
    classes = ['infected', 'noninfected']
    
    for split in splits:
        print(f"\n{split.upper()}:")
        
        for class_name in classes:
            class_path = dataset_path / split / class_name
            
            if not class_path.exists():
                continue
            
            # Get sample files
            image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff']
            images = []
            for ext in image_extensions:
                images.extend(list(class_path.glob(ext)))
                images.extend(list(class_path.glob(ext.upper())))
            
            if images:
                sample_size = min(num_samples, len(images))
                samples = images[:sample_size]
                
                print(f"   {class_name}/ ({len(images)} total):")
                for sample in samples:
                    print(f"     - {sample.name}")
            else:
                print(f"   {class_name}/ (empty)")

def generate_validation_report(dataset_path):
    """
    Generate a comprehensive validation report
    """
    print("\n📋 Generating Validation Report")
    print("=" * 40)
    
    # Run all validation checks
    structure_info, validation_errors = validate_dataset_structure(dataset_path)
    distribution_stats = analyze_class_distribution(structure_info)
    csv_info = check_for_csv_files(dataset_path)
    
    # Compile report
    report = {
        'dataset_path': str(dataset_path),
        'validation_timestamp': pd.Timestamp.now().isoformat(),
        'structure_valid': len(validation_errors) == 0,
        'validation_errors': validation_errors,
        'structure_info': structure_info,
        'distribution_stats': distribution_stats,
        'csv_files': csv_info
    }
    
    # Save validation report
    report_path = Path(dataset_path) / 'validation_report.json'
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2, default=str)
    
    print(f"✅ Validation report saved: {report_path}")
    
    # Print summary
    print(f"\n🎯 Validation Summary")
    print("=" * 30)
    
    if validation_errors:
        print(f"❌ {len(validation_errors)} validation errors found:")
        for error in validation_errors:
            print(f"   - {error}")
    else:
        print("✅ Dataset structure is valid!")
    
    print(f"\n📊 Quick Stats:")
    print(f"   Total Images: {distribution_stats['grand_total']:,}")
    print(f"   Class Balance: {distribution_stats['balance_ratio']:.3f}")
    
    return report

def main():
    """
    Main validation function
    """
    import sys
    
    print("✅ PCOS Dataset Validation Tool")
    print("=" * 40)
    
    # Get dataset path
    if len(sys.argv) > 1:
        dataset_path = sys.argv[1]
    else:
        dataset_path = input("Enter path to organized dataset: ").strip()
    
    if not dataset_path:
        print("❌ No path provided")
        return
    
    dataset_path = Path(dataset_path)
    
    if not dataset_path.exists():
        print(f"❌ Path not found: {dataset_path}")
        return
    
    # Run validation
    try:
        # Structure validation
        structure_info, validation_errors = validate_dataset_structure(dataset_path)
        
        # Distribution analysis
        distribution_stats = analyze_class_distribution(structure_info)
        
        # CSV files check
        csv_info = check_for_csv_files(dataset_path)
        
        # Sample files check
        sample_files_check(dataset_path)
        
        # Generate comprehensive report
        report = generate_validation_report(dataset_path)
        
        print(f"\n🎉 Validation Complete!")
        
        if not validation_errors:
            print("✅ Your dataset is properly organized and ready for training!")
        else:
            print("⚠️  Some issues found - check the report for details")
            
    except Exception as e:
        print(f"❌ Validation failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()