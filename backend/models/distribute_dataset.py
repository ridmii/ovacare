#!/usr/bin/env python3
"""
PCOS Dataset Distribution Script

Distributes pre-organized PCOS images from root directories into 
train/val/test splits with proper class structure for TensorFlow.

Source: PCOS/infected/ and PCOS/noninfected/
Target: frontend/public/assets/train|val|test/infected|noninfected/
"""

import os
import shutil
import random
import math
from pathlib import Path
from datetime import datetime

def distribute_dataset():
    """
    Distribute pre-organized PCOS images into train/val/test splits
    """
    print("🎯 PCOS Dataset Distribution Tool")
    print("="*50)
    
    # Define paths
    base_dir = Path("C:/Users/heyri/OneDrive/Desktop/ovacare")
    source_dir = base_dir / "PCOS"
    target_dir = base_dir / "frontend/public/assets"
    
    # Source directories (pre-organized)
    infected_source = source_dir / "infected"
    noninfected_source = source_dir / "noninfected"
    
    # Target directories
    train_infected = target_dir / "train/infected"
    train_noninfected = target_dir / "train/noninfected"
    val_infected = target_dir / "val/infected"
    val_noninfected = target_dir / "val/noninfected"
    test_infected = target_dir / "test/infected"
    test_noninfected = target_dir / "test/noninfected"
    
    print(f"📁 Source: {source_dir}")
    print(f"📁 Target: {target_dir}")
    
    # Check source directories exist
    if not infected_source.exists() or not noninfected_source.exists():
        print(f"❌ Source directories not found!")
        print(f"   Expected: {infected_source}")
        print(f"   Expected: {noninfected_source}")
        return False
    
    # Get image lists
    infected_images = [f for f in os.listdir(infected_source) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    noninfected_images = [f for f in os.listdir(noninfected_source) 
                         if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    
    print(f"\n📊 SOURCE ANALYSIS:")
    print(f"   🔴 Infected: {len(infected_images)} images")
    print(f"   🟢 Non-infected: {len(noninfected_images)} images")
    print(f"   📈 Total: {len(infected_images) + len(noninfected_images)} images")
    
    # Split ratios (70% train, 15% val, 15% test)
    train_ratio = 0.70
    val_ratio = 0.15
    test_ratio = 0.15
    
    def split_images(images, class_name):
        """Split images into train/val/test"""
        random.seed(42)  # For reproducible splits
        random.shuffle(images)
        
        total = len(images)
        train_count = int(total * train_ratio)
        val_count = int(total * val_ratio)
        test_count = total - train_count - val_count  # Remainder goes to test
        
        train_images = images[:train_count]
        val_images = images[train_count:train_count + val_count]
        test_images = images[train_count + val_count:]
        
        print(f"\n📊 {class_name.upper()} SPLIT:")
        print(f"   📚 Train: {len(train_images)} images ({len(train_images)/total*100:.1f}%)")
        print(f"   🔬 Validation: {len(val_images)} images ({len(val_images)/total*100:.1f}%)")
        print(f"   🧪 Test: {len(test_images)} images ({len(test_images)/total*100:.1f}%)")
        
        return train_images, val_images, test_images
    
    # Split each class
    infected_train, infected_val, infected_test = split_images(infected_images, "infected")
    noninfected_train, noninfected_val, noninfected_test = split_images(noninfected_images, "non-infected")
    
    print(f"\n🎯 TARGET DISTRIBUTION:")
    print(f"   📚 TRAIN: {len(infected_train)} infected + {len(noninfected_train)} non-infected = {len(infected_train) + len(noninfected_train)}")
    print(f"   🔬 VAL: {len(infected_val)} infected + {len(noninfected_val)} non-infected = {len(infected_val) + len(noninfected_val)}")
    print(f"   🧪 TEST: {len(infected_test)} infected + {len(noninfected_test)} non-infected = {len(infected_test) + len(noninfected_test)}")
    
    # Confirm before proceeding
    response = input(f"\n❓ Proceed with distribution? (y/N): ").strip().lower()
    if response != 'y':
        print("❌ Distribution cancelled")
        return False
    
    print("\n🚀 Starting distribution...")
    
    def move_images(source_dir, image_list, target_dir, class_name, split_name):
        """Move images from source to target directory"""
        print(f"📦 Moving {len(image_list)} {class_name} images to {split_name}...")
        
        # Ensure target directory exists
        target_dir.mkdir(parents=True, exist_ok=True)
        
        moved_count = 0
        for image_name in image_list:
            source_path = source_dir / image_name
            target_path = target_dir / image_name
            
            try:
                shutil.copy2(str(source_path), str(target_path))
                moved_count += 1
                if moved_count % 500 == 0:
                    print(f"   ✅ Moved {moved_count}/{len(image_list)} images...")
            except Exception as e:
                print(f"   ❌ Failed to move {image_name}: {e}")
        
        print(f"   ✅ Completed: {moved_count}/{len(image_list)} images moved")
        return moved_count
    
    # Move all splits
    total_moved = 0
    
    # Train split
    total_moved += move_images(infected_source, infected_train, train_infected, "infected", "train")
    total_moved += move_images(noninfected_source, noninfected_train, train_noninfected, "non-infected", "train")
    
    # Validation split
    total_moved += move_images(infected_source, infected_val, val_infected, "infected", "validation")
    total_moved += move_images(noninfected_source, noninfected_val, val_noninfected, "non-infected", "validation")
    
    # Test split
    total_moved += move_images(infected_source, infected_test, test_infected, "infected", "test")
    total_moved += move_images(noninfected_source, noninfected_test, test_noninfected, "non-infected", "test")
    
    print(f"\n🎉 DISTRIBUTION COMPLETE!")
    print(f"   📁 Total images distributed: {total_moved}")
    print(f"   📈 Success rate: {(total_moved / (len(infected_images) + len(noninfected_images))) * 100:.1f}%")
    
    # Final verification
    print(f"\n🔍 FINAL VERIFICATION:")
    for split in ["train", "val", "test"]:
        split_dir = target_dir / split
        if split_dir.exists():
            infected_count = len(list((split_dir / "infected").glob("*.jpg"))) if (split_dir / "infected").exists() else 0
            noninfected_count = len(list((split_dir / "noninfected").glob("*.jpg"))) if (split_dir / "noninfected").exists() else 0
            print(f"   📊 {split.upper()}: {infected_count} infected + {noninfected_count} non-infected = {infected_count + noninfected_count}")
    
    print(f"\n✅ Dataset is now ready for TensorFlow training!")
    print(f"📁 Location: {target_dir}")
    print(f"🚀 You can now run your ML training pipeline!")
    
    return True

if __name__ == "__main__":
    try:
        distribute_dataset()
    except KeyboardInterrupt:
        print("\n🛑 Distribution interrupted by user")
    except Exception as e:
        print(f"\n❌ Error during distribution: {e}")
        import traceback
        traceback.print_exc()