"""
PCOS Dataset Organizer for Mixed Image Folders
Organizes train/val/test folders with mixed images into proper class structure
"""

import os
import shutil
import pandas as pd
import numpy as np
from pathlib import Path
import re
from collections import defaultdict, Counter
import json
from datetime import datetime

class PCOSDatasetOrganizer:
    def __init__(self, dataset_path):
        self.dataset_path = Path(dataset_path)
        self.splits = ['train', 'val', 'test']
        self.classes = ['infected', 'noninfected']  # infected = PCOS positive, noninfected = Normal
        
        # Label detection patterns (case-insensitive)
        self.positive_patterns = [
            r'pcos',
            r'infected',
            r'positive',
            r'pos[\W]',  # pos followed by non-word character
            r'abnormal',
            r'cyst',
            r'polycystic'
        ]
        
        self.negative_patterns = [
            r'normal',
            r'noninfected',
            r'non[\W]?infected',
            r'negative',
            r'neg[\W]',  # neg followed by non-word character
            r'healthy',
            r'clean'
        ]
        
        # Statistics tracking
        self.stats = {
            'original_counts': {},
            'label_detection': {},
            'final_counts': {},
            'moved_files': {}
        }
    
    def analyze_dataset_structure(self):
        """
        Analyze current dataset structure and image counts
        """
        print("🔍 Analyzing Current Dataset Structure")
        print("=" * 50)
        
        for split in self.splits:
            split_path = self.dataset_path / split
            if not split_path.exists():
                print(f"❌ {split}/ folder not found!")
                continue
            
            # Get all image files
            image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff']
            all_files = []
            for ext in image_extensions:
                all_files.extend(list(split_path.glob(ext)))
                all_files.extend(list(split_path.glob(ext.upper())))
            
            self.stats['original_counts'][split] = len(all_files)
            
            print(f"📁 {split}/: {len(all_files)} images")
            
            # Show sample filenames
            if all_files:
                print("   Sample filenames:")
                for i, file in enumerate(all_files[:5]):
                    print(f"     {i+1}. {file.name}")
        
        total_images = sum(self.stats['original_counts'].values())
        print(f"\n📊 Total images found: {total_images}")
        return total_images
    
    def detect_label_patterns(self):
        """
        Analyze all filenames to detect labeling patterns
        """
        print("\n🔬 Detecting Label Patterns in Filenames")
        print("=" * 50)
        
        all_labels = {}
        pattern_stats = defaultdict(int)
        
        for split in self.splits:
            split_path = self.dataset_path / split
            if not split_path.exists():
                continue
            
            # Get all image files
            image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff']
            all_files = []
            for ext in image_extensions:
                all_files.extend(list(split_path.glob(ext)))
                all_files.extend(list(split_path.glob(ext.upper())))
            
            split_labels = self._extract_labels_from_filenames(all_files, split)
            all_labels.update(split_labels)
            
            # Count patterns found in this split
            positive_count = sum(1 for label_info in split_labels.values() if label_info['label'] == 1)
            negative_count = sum(1 for label_info in split_labels.values() if label_info['label'] == 0)
            unclear_count = len(all_files) - len(split_labels)
            
            print(f"\n📁 {split}/ analysis:")
            print(f"   ✅ PCOS/Infected detected: {positive_count}")
            print(f"   ✅ Normal/Noninfected detected: {negative_count}")
            if unclear_count > 0:
                print(f"   ⚠️  Unclear/Unlabeled: {unclear_count}")
            
            self.stats['label_detection'][split] = {
                'positive': positive_count,
                'negative': negative_count,
                'unclear': unclear_count,
                'total_files': len(all_files)
            }
        
        return all_labels
    
    def _extract_labels_from_filenames(self, files, split):
        """
        Extract labels from individual filenames using pattern matching
        """
        labels = {}
        
        for file_path in files:
            filename = file_path.name.lower()
            
            # Check for positive patterns (PCOS/infected)
            positive_match = any(re.search(pattern, filename, re.IGNORECASE) for pattern in self.positive_patterns)
            
            # Check for negative patterns (Normal/noninfected)  
            negative_match = any(re.search(pattern, filename, re.IGNORECASE) for pattern in self.negative_patterns)
            
            if positive_match and not negative_match:
                # Positive case
                labels[file_path.name] = {
                    'label': 1,  # infected/PCOS
                    'confidence': 'high',
                    'pattern_matched': self._get_matched_pattern(filename, self.positive_patterns),
                    'split': split,
                    'path': file_path
                }
            elif negative_match and not positive_match:
                # Negative case
                labels[file_path.name] = {
                    'label': 0,  # noninfected/normal
                    'confidence': 'high',
                    'pattern_matched': self._get_matched_pattern(filename, self.negative_patterns),
                    'split': split,
                    'path': file_path
                }
            elif positive_match and negative_match:
                # Conflicting patterns - need manual review
                print(f"⚠️  Conflicting patterns in: {file_path.name}")
                labels[file_path.name] = {
                    'label': None,
                    'confidence': 'conflict',
                    'pattern_matched': 'conflict',
                    'split': split,
                    'path': file_path
                }
            # If no patterns match, the file is not added to labels (will be flagged as unclear)
        
        return labels
    
    def _get_matched_pattern(self, filename, patterns):
        """
        Return which pattern was matched
        """
        for pattern in patterns:
            if re.search(pattern, filename, re.IGNORECASE):
                return pattern
        return None
    
    def handle_unclear_files(self, all_labels):
        """
        Handle files that couldn't be automatically labeled
        """
        unclear_files = []
        conflict_files = []
        
        for split in self.splits:
            split_path = self.dataset_path / split
            if not split_path.exists():
                continue
            
            # Get all files in split
            image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff']
            all_files = []
            for ext in image_extensions:
                all_files.extend(list(split_path.glob(ext)))
                all_files.extend(list(split_path.glob(ext.upper())))
            
            for file_path in all_files:
                if file_path.name not in all_labels:
                    unclear_files.append(file_path)
                elif all_labels[file_path.name]['confidence'] == 'conflict':
                    conflict_files.append(file_path)
        
        if unclear_files or conflict_files:
            print(f"\n⚠️  Files Requiring Manual Review")
            print("=" * 50)
            
            if unclear_files:
                print(f"📋 {len(unclear_files)} files with unclear naming:")
                for i, file in enumerate(unclear_files[:10]):  # Show first 10
                    print(f"   {i+1}. {file.name}")
                if len(unclear_files) > 10:
                    print(f"   ... and {len(unclear_files) - 10} more files")
            
            if conflict_files:
                print(f"🔄 {len(conflict_files)} files with conflicting patterns:")
                for file in conflict_files:
                    print(f"   - {file.name}")
            
            return self._manual_labeling_interface(unclear_files + conflict_files, all_labels)
        
        return all_labels
    
    def _manual_labeling_interface(self, unclear_files, all_labels):
        """
        Interactive interface for manual labeling
        """
        if not unclear_files:
            return all_labels
        
        print(f"\n🏷️  Manual Labeling Interface")
        print("=" * 50)
        print("For each file, enter:")
        print("  1 or 'pcos' or 'infected' → PCOS/Infected class")
        print("  0 or 'normal' or 'noninfected' → Normal/Noninfected class")
        print("  's' → Skip this file")
        print("  'q' → Quit and save progress")
        print("  'auto' → Try automatic labeling for remaining files")
        
        for i, file_path in enumerate(unclear_files):
            print(f"\n[{i+1}/{len(unclear_files)}] File: {file_path.name}")
            print(f"Path: {file_path}")
            
            while True:
                response = input("Label (1/0/pcos/normal/s/q/auto): ").strip().lower()
                
                if response == 'q':
                    print("Quitting manual labeling...")
                    return all_labels
                elif response == 's':
                    print("Skipped")
                    break
                elif response == 'auto':
                    print("Attempting automatic labeling for remaining files...")
                    # Try looser patterns for remaining files
                    remaining_files = unclear_files[i:]
                    auto_labels = self._try_automatic_labeling(remaining_files)
                    all_labels.update(auto_labels)
                    return all_labels
                elif response in ['1', 'pcos', 'infected', 'positive']:
                    all_labels[file_path.name] = {
                        'label': 1,
                        'confidence': 'manual',
                        'pattern_matched': 'manual_positive',
                        'split': self._get_split_from_path(file_path),
                        'path': file_path
                    }
                    print("✅ Labeled as PCOS/Infected")
                    break
                elif response in ['0', 'normal', 'noninfected', 'negative']:
                    all_labels[file_path.name] = {
                        'label': 0,
                        'confidence': 'manual', 
                        'pattern_matched': 'manual_negative',
                        'split': self._get_split_from_path(file_path),
                        'path': file_path
                    }
                    print("✅ Labeled as Normal/Noninfected")
                    break
                else:
                    print("Invalid input. Please enter 1, 0, pcos, normal, s, q, or auto")
        
        return all_labels
    
    def _try_automatic_labeling(self, files):
        """
        Try automatic labeling with looser patterns
        """
        auto_labels = {}
        
        # Try numeric patterns, position-based patterns, etc.
        for file_path in files:
            filename = file_path.name.lower()
            
            # Try number-based patterns (assume even = normal, odd = pcos, etc.)
            # This is just an example - adjust based on your actual data
            numbers = re.findall(r'\d+', filename)
            if numbers:
                # This is a heuristic - you'd need to adjust based on your actual naming convention
                first_number = int(numbers[0])
                if first_number % 2 == 0:  # Example heuristic
                    label = 0  # normal
                else:
                    label = 1  # pcos
                
                auto_labels[file_path.name] = {
                    'label': label,
                    'confidence': 'auto_heuristic',
                    'pattern_matched': f'numeric_heuristic_{first_number}',
                    'split': self._get_split_from_path(file_path),
                    'path': file_path
                }
        
        return auto_labels
    
    def _get_split_from_path(self, file_path):
        """
        Determine which split (train/val/test) a file belongs to
        """
        path_parts = file_path.parts
        for part in path_parts:
            if part in self.splits:
                return part
        return 'unknown'
    
    def create_organized_structure(self, all_labels, backup_original=True):
        """
        Create the organized folder structure and move files
        """
        print(f"\n📁 Creating Organized Dataset Structure")
        print("=" * 50)
        
        # Backup original structure if requested
        if backup_original:
            backup_path = self.dataset_path.parent / f"{self.dataset_path.name}_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            print(f"💾 Creating backup at: {backup_path}")
            shutil.copytree(self.dataset_path, backup_path)
        
        # Create class subdirectories
        for split in self.splits:
            split_path = self.dataset_path / split
            if not split_path.exists():
                continue
            
            for class_name in self.classes:
                class_dir = split_path / class_name
                class_dir.mkdir(exist_ok=True)
                print(f"✅ Created: {class_dir}")
        
        # Move files to appropriate class directories
        move_stats = defaultdict(lambda: defaultdict(int))
        moved_files = []
        failed_moves = []
        
        for filename, label_info in all_labels.items():
            if label_info['label'] is None:
                # Skip files with no label
                continue
            
            source_path = label_info['path']
            split = label_info['split']
            class_name = self.classes[label_info['label']]  # 0=noninfected, 1=infected
            
            # Destination path
            dest_dir = self.dataset_path / split / class_name
            dest_path = dest_dir / filename
            
            # Move file
            try:
                if source_path.exists() and source_path.parent.name != class_name:
                    shutil.move(str(source_path), str(dest_path))
                    move_stats[split][class_name] += 1
                    moved_files.append({
                        'filename': filename,
                        'from': str(source_path),
                        'to': str(dest_path),
                        'label': label_info['label'],
                        'class': class_name,
                        'confidence': label_info['confidence']
                    })
                elif source_path.parent.name == class_name:
                    # File already in correct location
                    move_stats[split][class_name] += 1
            except Exception as e:
                failed_moves.append({
                    'filename': filename,
                    'error': str(e),
                    'source': str(source_path)
                })
                print(f"❌ Failed to move {filename}: {e}")
        
        # Store movement statistics
        self.stats['moved_files'] = moved_files
        self.stats['final_counts'] = dict(move_stats)
        
        # Print results
        print(f"\n📊 File Movement Results")
        print("=" * 30)
        for split, classes in move_stats.items():
            print(f"{split.upper()}:")
            for class_name, count in classes.items():
                print(f"  {class_name}: {count} images")
        
        if failed_moves:
            print(f"\n❌ {len(failed_moves)} files failed to move")
            for failure in failed_moves[:5]:  # Show first 5 failures
                print(f"  - {failure['filename']}: {failure['error']}")
        
        print(f"\n✅ Successfully organized {len(moved_files)} images")
        return move_stats, moved_files, failed_moves
    
    def validate_organization(self):
        """
        Validate the organized structure and check for issues
        """
        print(f"\n✅ Validating Organized Structure")
        print("=" * 50)
        
        validation_results = {}
        total_images = 0
        
        for split in self.splits:
            split_path = self.dataset_path / split
            validation_results[split] = {}
            
            if not split_path.exists():
                print(f"❌ {split}/ folder missing")
                continue
            
            for class_name in self.classes:
                class_path = split_path / class_name
                if class_path.exists():
                    # Count images in class folder
                    image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff']
                    class_images = []
                    for ext in image_extensions:
                        class_images.extend(list(class_path.glob(ext)))
                        class_images.extend(list(class_path.glob(ext.upper())))
                    
                    count = len(class_images)
                    validation_results[split][class_name] = count
                    total_images += count
                    
                    print(f"📁 {split}/{class_name}/: {count} images")
                else:
                    print(f"❌ {split}/{class_name}/ folder missing")
                    validation_results[split][class_name] = 0
            
            # Check for any remaining loose files in split root
            loose_files = []
            image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff']
            for ext in image_extensions:
                loose_files.extend(list(split_path.glob(ext)))
                loose_files.extend(list(split_path.glob(ext.upper())))
            
            if loose_files:
                print(f"⚠️  {len(loose_files)} loose files still in {split}/ root:")
                for file in loose_files[:5]:
                    print(f"    - {file.name}")
                if len(loose_files) > 5:
                    print(f"    ... and {len(loose_files) - 5} more")
        
        print(f"\n📊 Validation Summary:")
        print(f"Total images in organized structure: {total_images}")
        
        original_total = sum(self.stats['original_counts'].values())
        if total_images == original_total:
            print("✅ All images accounted for")
        else:
            print(f"⚠️  Mismatch: Original={original_total}, Organized={total_images}")
        
        return validation_results
    
    def generate_csv_backup(self, all_labels):
        """
        Generate CSV files with label information as backup
        """
        print(f"\n💾 Generating CSV Backup Files")
        print("=" * 50)
        
        # Prepare data for CSV
        csv_data = []
        for filename, label_info in all_labels.items():
            if label_info['label'] is not None:
                csv_data.append({
                    'filename': filename,
                    'label': label_info['label'],
                    'class': self.classes[label_info['label']],
                    'split': label_info['split'],
                    'confidence': label_info['confidence'],
                    'pattern_matched': label_info['pattern_matched']
                })
        
        # Create main labels CSV
        df = pd.DataFrame(csv_data)
        main_csv_path = self.dataset_path / 'dataset_labels.csv'
        df.to_csv(main_csv_path, index=False)
        print(f"✅ Created: {main_csv_path}")
        
        # Create split-specific CSVs
        for split in self.splits:
            split_data = df[df['split'] == split]
            if not split_data.empty:
                split_csv_path = self.dataset_path / f'{split}_labels.csv'
                split_data.to_csv(split_csv_path, index=False)
                print(f"✅ Created: {split_csv_path}")
        
        # Create summary statistics CSV
        summary_stats = []
        for split in self.splits:
            if split in self.stats['final_counts']:
                for class_name, count in self.stats['final_counts'][split].items():
                    summary_stats.append({
                        'split': split,
                        'class': class_name,
                        'count': count
                    })
        
        df_summary = pd.DataFrame(summary_stats)
        summary_csv_path = self.dataset_path / 'dataset_summary.csv'
        df_summary.to_csv(summary_csv_path, index=False)
        print(f"✅ Created: {summary_csv_path}")
        
        return main_csv_path, summary_csv_path
    
    def generate_final_report(self):
        """
        Generate a comprehensive final report
        """
        print(f"\n📋 Final Organization Report")
        print("=" * 50)
        
        # Create report data
        report = {
            'timestamp': datetime.now().isoformat(),
            'dataset_path': str(self.dataset_path),
            'organization_stats': self.stats,
            'final_structure': {}
        }
        
        # Final structure summary
        for split in self.splits:
            if split in self.stats['final_counts']:
                report['final_structure'][split] = self.stats['final_counts'][split]
                
                total_in_split = sum(self.stats['final_counts'][split].values())
                infected_count = self.stats['final_counts'][split].get('infected', 0)
                noninfected_count = self.stats['final_counts'][split].get('noninfected', 0)
                
                if total_in_split > 0:
                    infected_pct = (infected_count / total_in_split) * 100
                    noninfected_pct = (noninfected_count / total_in_split) * 100
                    
                    print(f"\n📊 {split.upper()} Distribution:")
                    print(f"   Infected (PCOS): {infected_count:,} images ({infected_pct:.1f}%)")
                    print(f"   Noninfected (Normal): {noninfected_count:,} images ({noninfected_pct:.1f}%)")
                    print(f"   Total: {total_in_split:,} images")
        
        # Overall statistics
        total_infected = sum(counts.get('infected', 0) for counts in self.stats['final_counts'].values())
        total_noninfected = sum(counts.get('noninfected', 0) for counts in self.stats['final_counts'].values())
        grand_total = total_infected + total_noninfected
        
        print(f"\n🎯 Overall Dataset Statistics:")
        print(f"   Total Images: {grand_total:,}")
        print(f"   PCOS/Infected: {total_infected:,} ({(total_infected/grand_total)*100:.1f}%)")
        print(f"   Normal/Noninfected: {total_noninfected:,} ({(total_noninfected/grand_total)*100:.1f}%)")
        
        # Class balance analysis
        if grand_total > 0:
            balance_ratio = min(total_infected, total_noninfected) / max(total_infected, total_noninfected)
            print(f"   Class Balance Ratio: {balance_ratio:.2f} (1.0 = perfect balance)")
            
            if balance_ratio < 0.5:
                print(f"   ⚠️  Significant class imbalance detected!")
                print(f"      Consider data augmentation for minority class")
            elif balance_ratio < 0.8:
                print(f"   ⚠️  Moderate class imbalance")
            else:
                print(f"   ✅ Well-balanced dataset")
        
        # Save report to JSON
        report_path = self.dataset_path / 'organization_report.json'
        with open(report_path, 'w') as f:
            # Convert Path objects to strings for JSON serialization
            json_safe_stats = json.loads(json.dumps(self.stats, default=str))
            report['organization_stats'] = json_safe_stats
            json.dump(report, f, indent=2, default=str)
        
        print(f"\n💾 Full report saved to: {report_path}")
        
        return report

def main():
    """
    Main function to organize PCOS dataset
    """
    print("🩺 PCOS Dataset Organizer")
    print("=" * 50)
    print("Organizes mixed image folders into proper class structure")
    print("for TensorFlow/Keras training\n")
    
    # Get dataset path from user
    dataset_path = input("Enter path to your dataset (with train/val/test folders): ").strip()
    
    if not dataset_path:
        dataset_path = "assets"  # Default path based on user's description
    
    dataset_path = Path(dataset_path)
    
    if not dataset_path.exists():
        print(f"❌ Dataset path not found: {dataset_path}")
        print("Please check the path and try again.")
        return
    
    # Initialize organizer
    organizer = PCOSDatasetOrganizer(dataset_path)
    
    # Step 1: Analyze current structure
    total_images = organizer.analyze_dataset_structure()
    
    if total_images == 0:
        print("❌ No images found in dataset!")
        return
    
    # Step 2: Detect label patterns
    all_labels = organizer.detect_label_patterns()
    
    # Step 3: Handle unclear files
    if len(all_labels) < total_images:
        print(f"\n⚠️  {total_images - len(all_labels)} files need manual review")
        all_labels = organizer.handle_unclear_files(all_labels)
    
    # Step 4: Show labeling summary before proceeding
    labeled_count = len([l for l in all_labels.values() if l['label'] is not None])
    print(f"\n📊 Labeling Summary:")
    print(f"   Successfully labeled: {labeled_count}/{total_images} images")
    
    if labeled_count < total_images * 0.8:
        response = input(f"⚠️  Only {(labeled_count/total_images)*100:.1f}% of images are labeled. Continue? (y/n): ")
        if response.lower() != 'y':
            print("Organization cancelled.")
            return
    
    # Step 5: Create organized structure
    print(f"\n🚀 Creating organized structure...")
    move_stats, moved_files, failed_moves = organizer.create_organized_structure(all_labels)
    
    # Step 6: Validate organization
    validation_results = organizer.validate_organization()
    
    # Step 7: Generate CSV backups
    main_csv, summary_csv = organizer.generate_csv_backup(all_labels)
    
    # Step 8: Generate final report
    report = organizer.generate_final_report()
    
    print(f"\n🎉 Dataset Organization Complete!")
    print(f"✅ Organized {len(moved_files)} images into class folders")
    print(f"✅ Generated CSV backup files")
    print(f"✅ Created validation report")
    
    if failed_moves:
        print(f"⚠️  {len(failed_moves)} files failed to move - check report for details")
    
    print(f"\n📁 Final Structure:")
    print(f"   {dataset_path}/")
    for split in ['train', 'val', 'test']:
        if split in validation_results:
            print(f"   ├── {split}/")
            for class_name in ['infected', 'noninfected']:
                count = validation_results[split].get(class_name, 0)
                print(f"   │   ├── {class_name}/  ({count} images)")

if __name__ == "__main__":
    main()