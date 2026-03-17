"""
Dataset Organization Verification
Verify and analyze the PCOS dataset structure and statistics
"""

import os
import numpy as np
from pathlib import Path
from PIL import Image
import matplotlib.pyplot as plt
import seaborn as sns
from collections import defaultdict
import pandas as pd
from config import config

class DatasetOrganizer:
    """Verify and analyze dataset organization"""
    
    def __init__(self):
        self.config = config
        self.stats = defaultdict(dict)
        
    def verify_structure(self):
        """Verify dataset folder structure"""
        print("🔍 Verifying dataset structure...")
        
        required_dirs = [
            self.config.DATASET_PATH,
            self.config.TRAIN_DIR,
            self.config.VAL_DIR,
            self.config.TEST_DIR
        ]
        
        missing_dirs = []
        for dir_path in required_dirs:
            if not dir_path.exists():
                missing_dirs.append(str(dir_path))
            else:
                print(f"   ✅ {dir_path.name}/")
        
        if missing_dirs:
            print(f"   ❌ Missing directories: {missing_dirs}")
            return False
        
        # Verify class subdirectories
        for split in ['train', 'val', 'test']:
            split_dir = self.config.DATASET_PATH / split
            for class_name in self.config.CLASS_NAMES:
                class_dir = split_dir / class_name
                if not class_dir.exists():
                    print(f"   ❌ Missing: {split}/{class_name}/")
                    return False
                else:
                    print(f"   ✅ {split}/{class_name}/")
        
        print("✅ Dataset structure verified!")
        return True
    
    def count_images(self):
        """Count images in each split and class"""
        print("\n📊 Counting images...")
        
        total_images = 0
        split_totals = {}
        
        for split in ['train', 'val', 'test']:
            split_dir = self.config.DATASET_PATH / split
            split_count = 0
            class_counts = {}
            
            for class_name in self.config.CLASS_NAMES:
                class_dir = split_dir / class_name
                
                if class_dir.exists():
                    image_files = list(class_dir.glob('*.jpg')) + \
                                 list(class_dir.glob('*.jpeg')) + \
                                 list(class_dir.glob('*.png'))
                    
                    class_count = len(image_files)
                    class_counts[class_name] = class_count
                    split_count += class_count
                    
                    print(f"   {split.upper()} {class_name}: {class_count:,} images")
                else:
                    class_counts[class_name] = 0
                    print(f"   {split.upper()} {class_name}: 0 images (directory missing)")
            
            split_totals[split] = split_count
            total_images += split_count
            self.stats[split] = class_counts
            print(f"   {split.upper()} TOTAL: {split_count:,} images\n")
        
        print(f"🎯 GRAND TOTAL: {total_images:,} images")
        
        # Calculate percentages
        for split in ['train', 'val', 'test']:
            percentage = (split_totals[split] / total_images) * 100 if total_images > 0 else 0
            print(f"   {split.upper()}: {percentage:.1f}% of dataset")
        
        self.total_images = total_images
        return self.stats
    
    def analyze_class_balance(self):
        """Analyze class distribution and balance"""
        print("\n⚖️ Analyzing class balance...")
        
        total_infected = 0
        total_noninfected = 0
        
        for split in ['train', 'val', 'test']:
            infected = self.stats[split].get('infected', 0)
            noninfected = self.stats[split].get('noninfected', 0)
            
            total_infected += infected
            total_noninfected += noninfected
            
            if infected + noninfected > 0:
                infected_pct = (infected / (infected + noninfected)) * 100
                noninfected_pct = (noninfected / (infected + noninfected)) * 100
                
                print(f"   {split.upper()}:")
                print(f"     🔴 Infected: {infected:,} ({infected_pct:.1f}%)")
                print(f"     🟢 Non-infected: {noninfected:,} ({noninfected_pct:.1f}%)")
        
        # Overall balance
        total = total_infected + total_noninfected
        if total > 0:
            infected_pct = (total_infected / total) * 100
            noninfected_pct = (total_noninfected / total) * 100
            
            print(f"\n   OVERALL BALANCE:")
            print(f"     🔴 Infected: {total_infected:,} ({infected_pct:.1f}%)")
            print(f"     🟢 Non-infected: {total_noninfected:,} ({noninfected_pct:.1f}%)")
            
            # Balance ratio
            balance_ratio = min(infected_pct, noninfected_pct) / max(infected_pct, noninfected_pct)
            print(f"     📊 Balance ratio: {balance_ratio:.3f}")
            
            if balance_ratio > 0.8:
                print("     ✅ Well balanced dataset")
            elif balance_ratio > 0.6:
                print("     ⚠️ Moderately imbalanced dataset")
            else:
                print("     ❌ Highly imbalanced dataset - consider class weights")
        
        return {
            'infected': total_infected,
            'noninfected': total_noninfected,
            'balance_ratio': balance_ratio if 'balance_ratio' in locals() else 0
        }
    
    def sample_image_analysis(self, num_samples=100):
        """Analyze sample images for size, format, etc."""
        print(f"\n🖼️ Analyzing {num_samples} sample images...")
        
        image_info = {
            'widths': [],
            'heights': [],
            'formats': [],
            'modes': [],
            'file_sizes': []
        }
        
        samples_collected = 0
        
        for split in ['train', 'val', 'test']:
            if samples_collected >= num_samples:
                break
                
            for class_name in self.config.CLASS_NAMES:
                if samples_collected >= num_samples:
                    break
                    
                class_dir = self.config.DATASET_PATH / split / class_name
                
                if class_dir.exists():
                    image_files = list(class_dir.glob('*.jpg')) + \
                                 list(class_dir.glob('*.jpeg')) + \
                                 list(class_dir.glob('*.png'))
                    
                    for image_file in image_files:
                        if samples_collected >= num_samples:
                            break
                        
                        try:
                            with Image.open(image_file) as img:
                                image_info['widths'].append(img.width)
                                image_info['heights'].append(img.height)
                                image_info['formats'].append(img.format)
                                image_info['modes'].append(img.mode)
                                
                            # File size
                            file_size = image_file.stat().st_size / (1024 * 1024)  # MB
                            image_info['file_sizes'].append(file_size)
                            
                            samples_collected += 1
                            
                        except Exception as e:
                            print(f"     ⚠️ Error reading {image_file.name}: {e}")
        
        if samples_collected > 0:
            # Calculate statistics
            widths = np.array(image_info['widths'])
            heights = np.array(image_info['heights'])
            file_sizes = np.array(image_info['file_sizes'])
            
            print(f"\n   📐 IMAGE DIMENSIONS:")
            print(f"     Width - Min: {widths.min()}, Max: {widths.max()}, "
                  f"Mean: {widths.mean():.1f}, Std: {widths.std():.1f}")
            print(f"     Height - Min: {heights.min()}, Max: {heights.max()}, "
                  f"Mean: {heights.mean():.1f}, Std: {heights.std():.1f}")
            
            print(f"\n   📁 FILE INFO:")
            print(f"     Formats: {set(image_info['formats'])}")
            print(f"     Color modes: {set(image_info['modes'])}")
            print(f"     Average size: {file_sizes.mean():.2f} MB")
            print(f"     Size range: {file_sizes.min():.2f} - {file_sizes.max():.2f} MB")
            
            # Check for consistency
            unique_dimensions = set(zip(widths, heights))
            if len(unique_dimensions) == 1:
                print("     ✅ All images have consistent dimensions")
            else:
                print(f"     ⚠️ {len(unique_dimensions)} different dimensions found")
                print(f"     📊 Most common: {max(unique_dimensions, key=list(zip(widths, heights)).count)}")
        
        return image_info
    
    def create_visualization(self):
        """Create visualization of dataset statistics"""
        print("\n📊 Creating dataset visualization...")
        
        # Ensure plots directory exists
        self.config.PLOTS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Create figure with subplots
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle('PCOS Dataset Analysis', fontsize=16, fontweight='bold')
        
        # 1. Images per split
        splits = list(self.stats.keys())
        split_totals = [sum(self.stats[split].values()) for split in splits]
        
        axes[0, 0].bar(splits, split_totals, color=['#3498db', '#e74c3c', '#2ecc71'])
        axes[0, 0].set_title('Images per Split')
        axes[0, 0].set_ylabel('Number of Images')
        for i, v in enumerate(split_totals):
            axes[0, 0].text(i, v + max(split_totals)*0.01, f'{v:,}', 
                           ha='center', fontweight='bold')
        
        # 2. Class distribution per split
        x = np.arange(len(splits))
        width = 0.35
        
        infected_counts = [self.stats[split].get('infected', 0) for split in splits]
        noninfected_counts = [self.stats[split].get('noninfected', 0) for split in splits]
        
        axes[0, 1].bar(x - width/2, infected_counts, width, label='Infected (PCOS)', 
                      color='#e74c3c', alpha=0.8)
        axes[0, 1].bar(x + width/2, noninfected_counts, width, label='Non-infected', 
                      color='#2ecc71', alpha=0.8)
        
        axes[0, 1].set_title('Class Distribution per Split')
        axes[0, 1].set_xlabel('Split')
        axes[0, 1].set_ylabel('Number of Images')
        axes[0, 1].set_xticks(x)
        axes[0, 1].set_xticklabels([s.title() for s in splits])
        axes[0, 1].legend()
        
        # 3. Overall class balance pie chart
        total_infected = sum(infected_counts)
        total_noninfected = sum(noninfected_counts)
        
        labels = ['Infected (PCOS)', 'Non-infected']
        sizes = [total_infected, total_noninfected]
        colors = ['#e74c3c', '#2ecc71']
        
        axes[1, 0].pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%',
                      startangle=90, textprops={'fontsize': 12})
        axes[1, 0].set_title('Overall Class Balance')
        
        # 4. Split percentage distribution
        total_images = sum(split_totals)
        split_percentages = [(count/total_images)*100 for count in split_totals]
        
        axes[1, 1].pie(split_percentages, labels=[s.title() for s in splits], 
                      autopct='%1.1f%%', startangle=90,
                      colors=['#3498db', '#e74c3c', '#2ecc71'],
                      textprops={'fontsize': 12})
        axes[1, 1].set_title('Split Distribution')
        
        plt.tight_layout()
        
        # Save plot
        plot_path = self.config.PLOTS_DIR / 'dataset_analysis.png'
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        print(f"   📁 Saved: {plot_path}")
        
        plt.close()
        
    def generate_report(self):
        """Generate comprehensive dataset report"""
        print("\n📋 Generating dataset report...")
        
        # Ensure reports directory exists
        self.config.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Create DataFrame for easy analysis
        data = []
        for split in ['train', 'val', 'test']:
            for class_name in self.config.CLASS_NAMES:
                count = self.stats[split].get(class_name, 0)
                data.append({
                    'Split': split.title(),
                    'Class': class_name.replace('noninfected', 'Non-infected').title(),
                    'Count': count
                })
        
        df = pd.DataFrame(data)
        
        # Pivot table
        pivot_df = df.pivot(index='Split', columns='Class', values='Count').fillna(0)
        pivot_df['Total'] = pivot_df.sum(axis=1)
        
        # Add percentage columns
        total_images = pivot_df['Total'].sum()
        for col in pivot_df.columns:
            if col != 'Total':
                pivot_df[f'{col} %'] = (pivot_df[col] / pivot_df['Total'] * 100).round(1)
        
        pivot_df['Split %'] = (pivot_df['Total'] / total_images * 100).round(1)
        
        # Save detailed report
        report_path = self.config.REPORTS_DIR / 'dataset_report.csv'
        pivot_df.to_csv(report_path)
        
        # Print summary
        print(f"   📊 Dataset Summary:")
        print(pivot_df)
        print(f"\n   📁 Detailed report saved: {report_path}")
        
        return pivot_df
    
    def run_full_analysis(self):
        """Run complete dataset analysis"""
        print("🎯 Running complete dataset analysis...")
        print("="*60)
        
        # Create output directories
        self.config.create_directories()
        
        # Verify structure
        if not self.verify_structure():
            print("❌ Dataset structure verification failed!")
            return False
        
        # Count and analyze
        self.count_images()
        balance_info = self.analyze_class_balance()
        
        # Sample analysis
        image_info = self.sample_image_analysis()
        
        # Create visualization
        self.create_visualization()
        
        # Generate report
        self.generate_report()
        
        print("\n" + "="*60)
        print("✅ Dataset analysis complete!")
        
        # Final recommendations
        print("\n🎯 RECOMMENDATIONS:")
        
        if balance_info['balance_ratio'] < 0.7:
            print("   ⚠️ Consider using class weights or focal loss for training")
        
        if self.total_images < 10000:
            print("   📈 Consider extensive data augmentation")
        
        if self.total_images > 50000:
            print("   💾 Consider using data generators to manage memory")
        
        print("   ✅ Dataset ready for training!")
        
        return True

def main():
    """Main function to run dataset organization verification"""
    organizer = DatasetOrganizer()
    success = organizer.run_full_analysis()
    
    if success:
        print("\n🚀 Ready to proceed with model training!")
    else:
        print("\n❌ Please fix dataset issues before training!")
        
    return success

if __name__ == "__main__":
    main()