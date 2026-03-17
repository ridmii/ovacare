#!/usr/bin/env python3
"""
Quick Progress Checker for PCOS Dataset Labeling

Check the current status of your dataset labeling progress.
"""

import os
import json
from pathlib import Path

def check_dataset_progress():
    """Check and display current progress"""
    assets_dir = Path("C:/Users/heyri/OneDrive/Desktop/ovacare/frontend/public/assets")
    progress_file = assets_dir / "labeling_progress.json"
    
    print("🎯 PCOS Dataset Labeling Progress Check")
    print("="*50)
    
    # Check if progress file exists
    progress = {}
    if progress_file.exists():
        with open(progress_file, 'r') as f:
            progress = json.load(f)
        labeled_images = progress.get("labeled", {})
        print(f"📊 Progress file found: {len(labeled_images)} images labeled")
    else:
        print("📊 No progress file found - starting fresh")
        labeled_images = {}
    
    # Check each split
    splits = ["train", "val", "test"]
    total_images = 0
    total_labeled = 0
    
    for split in splits:
        split_dir = assets_dir / split
        if not split_dir.exists():
            print(f"❌ {split} directory not found")
            continue
            
        # Count original images (not in subdirectories)
        original_images = [f for f in os.listdir(split_dir) 
                         if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        # Count organized images
        infected_dir = split_dir / "infected"
        noninfected_dir = split_dir / "noninfected"
        
        infected_count = len(os.listdir(infected_dir)) if infected_dir.exists() else 0
        noninfected_count = len(os.listdir(noninfected_dir)) if noninfected_dir.exists() else 0
        organized_count = infected_count + noninfected_count
        
        total_split = len(original_images) + organized_count
        
        print(f"\n{split.upper()} Split:")
        print(f"  📁 Unlabeled (in root): {len(original_images)}")
        print(f"  ✅ Infected: {infected_count}")
        print(f"  ✅ Non-infected: {noninfected_count}")
        print(f"  📊 Total in split: {total_split}")
        if total_split > 0:
            progress_pct = ((infected_count + noninfected_count) / total_split) * 100
            print(f"  📈 Progress: {progress_pct:.1f}%")
        
        total_images += total_split
        total_labeled += organized_count
    
    print(f"\n🎯 OVERALL SUMMARY:")
    print(f"  📁 Total images: {total_images}")
    print(f"  ✅ Labeled: {total_labeled}")
    print(f"  📋 Remaining: {total_images - total_labeled}")
    if total_images > 0:
        overall_progress = (total_labeled / total_images) * 100
        print(f"  📈 Overall progress: {overall_progress:.1f}%")
    
    # Class balance check
    if total_labeled > 0:
        infected_total = 0
        noninfected_total = 0
        
        for split in splits:
            split_dir = assets_dir / split
            if split_dir.exists():
                infected_dir = split_dir / "infected"
                noninfected_dir = split_dir / "noninfected"
                
                if infected_dir.exists():
                    infected_total += len(os.listdir(infected_dir))
                if noninfected_dir.exists():
                    noninfected_total += len(os.listdir(noninfected_dir))
        
        print(f"\n🏷️ CLASS DISTRIBUTION:")
        print(f"  🔴 Infected (PCOS+): {infected_total} ({(infected_total/total_labeled*100):.1f}%)")
        print(f"  🟢 Non-infected (PCOS-): {noninfected_total} ({(noninfected_total/total_labeled*100):.1f}%)")
        
        # Check balance
        if total_labeled >= 100:  # Only show balance warning if we have substantial data
            if abs(infected_total - noninfected_total) / total_labeled > 0.3:
                print(f"  ⚠️ IMBALANCED DATASET - Consider balancing your classes")
            else:
                print(f"  ✅ Dataset appears reasonably balanced")

def main():
    try:
        check_dataset_progress()
    except Exception as e:
        print(f"❌ Error checking progress: {e}")

if __name__ == "__main__":
    main()