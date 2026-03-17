#!/usr/bin/env python3
"""
PCOS Image Labeling Tool

This tool helps efficiently label and organize ultrasound images for PCOS detection.
- Shows images one by one
- Press '1' for INFECTED (PCOS-positive)
- Press '2' for NON-INFECTED (PCOS-negative)  
- Press 's' to skip
- Press 'q' to quit and save progress
- Press 'b' to go back to previous image
"""

import os
import shutil
import json
from pathlib import Path
import cv2
import numpy as np
from datetime import datetime

class PCOSImageLabeler:
    def __init__(self, source_dir):
        self.source_dir = Path(source_dir)
        self.assets_dir = self.source_dir.parent
        self.progress_file = self.assets_dir / "labeling_progress.json"
        
        # Initialize progress tracking
        self.progress = self.load_progress()
        self.current_split = None
        self.current_images = []
        self.current_index = 0
        self.labeled_in_session = 0
        
        print(f"🎯 PCOS Image Labeling Tool")
        print(f"📁 Source directory: {source_dir}")
        print(f"💾 Progress will be saved to: {self.progress_file}")
        
    def load_progress(self):
        """Load labeling progress from file"""
        if self.progress_file.exists():
            with open(self.progress_file, 'r') as f:
                progress = json.load(f)
            print(f"📊 Loaded existing progress: {len(progress.get('labeled', {}))} images labeled")
            return progress
        else:
            return {
                "labeled": {},  # filename -> {"split": "train", "class": "infected"}
                "last_session": None,
                "total_labeled": 0
            }
    
    def save_progress(self):
        """Save current progress"""
        self.progress["last_session"] = datetime.now().isoformat()
        self.progress["total_labeled"] = len(self.progress["labeled"])
        
        with open(self.progress_file, 'w') as f:
            json.dump(self.progress, f, indent=2)
        print(f"💾 Progress saved: {self.progress['total_labeled']} images labeled")
    
    def get_unlabeled_images(self, split_dir):
        """Get list of unlabeled images in a split directory"""
        split_name = split_dir.name
        all_images = [f for f in os.listdir(split_dir) 
                     if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        unlabeled = []
        for img in all_images:
            if img not in self.progress["labeled"]:
                unlabeled.append(img)
        
        print(f"📊 {split_name}: {len(all_images)} total, {len(unlabeled)} unlabeled")
        return sorted(unlabeled)
    
    def display_image(self, image_path, title_extra=""):
        """Display image with labeling instructions"""
        img = cv2.imread(str(image_path))
        if img is None:
            print(f"❌ Could not load image: {image_path}")
            return False
            
        # Resize for display (max 800px height)
        height, width = img.shape[:2]
        if height > 800:
            ratio = 800 / height
            new_height = 800
            new_width = int(width * ratio)
            img = cv2.resize(img, (new_width, new_height))
        
        # Add info overlay
        split_name = self.current_split.name
        progress_text = f"{split_name} | {self.current_index + 1}/{len(self.current_images)} | Session: {self.labeled_in_session}"
        filename_text = f"File: {image_path.name}"
        
        # Add text to image
        font = cv2.FONT_HERSHEY_SIMPLEX
        cv2.putText(img, progress_text, (10, 30), font, 0.7, (0, 255, 0), 2)
        cv2.putText(img, filename_text, (10, 60), font, 0.5, (255, 255, 255), 1)
        cv2.putText(img, "1=INFECTED | 2=NON-INFECTED | s=SKIP | b=BACK | q=QUIT", 
                   (10, img.shape[0] - 20), font, 0.6, (0, 255, 255), 2)
        
        window_title = f"PCOS Labeler - {title_extra}"
        cv2.imshow(window_title, img)
        return True
    
    def move_image_to_class(self, image_path, class_name):
        """Move image to the appropriate class directory"""
        split_name = self.current_split.name
        dest_dir = self.assets_dir / split_name / class_name
        dest_path = dest_dir / image_path.name
        
        try:
            shutil.move(str(image_path), str(dest_path))
            print(f"✅ Moved {image_path.name} → {split_name}/{class_name}/")
            
            # Update progress
            self.progress["labeled"][image_path.name] = {
                "split": split_name,
                "class": class_name,
                "timestamp": datetime.now().isoformat()
            }
            self.labeled_in_session += 1
            return True
            
        except Exception as e:
            print(f"❌ Error moving {image_path.name}: {e}")
            return False
    
    def label_split(self, split_dir):
        """Label all images in a specific split directory"""
        self.current_split = split_dir
        self.current_images = self.get_unlabeled_images(split_dir)
        self.current_index = 0
        
        if not self.current_images:
            print(f"✅ All images in {split_dir.name} are already labeled!")
            return
        
        print(f"\n🎯 Starting labeling for {split_dir.name}")
        print(f"📊 {len(self.current_images)} images to label")
        print(f"🎮 Controls: 1=INFECTED | 2=NON-INFECTED | s=SKIP | b=BACK | q=QUIT")
        print("Press any key to start...")
        cv2.waitKey(0)
        
        while self.current_index < len(self.current_images):
            image_name = self.current_images[self.current_index]
            image_path = split_dir / image_name
            
            if not self.display_image(image_path, f"{split_dir.name} | {self.current_index + 1}/{len(self.current_images)}"):
                self.current_index += 1
                continue
            
            key = cv2.waitKey(0) & 0xFF
            
            if key == ord('1'):
                # Label as INFECTED
                if self.move_image_to_class(image_path, "infected"):
                    self.current_index += 1
                    
            elif key == ord('2'):
                # Label as NON-INFECTED
                if self.move_image_to_class(image_path, "noninfected"):
                    self.current_index += 1
                    
            elif key == ord('s'):
                # Skip
                print(f"⏭️ Skipped {image_name}")
                self.current_index += 1
                
            elif key == ord('b'):
                # Go back
                if self.current_index > 0:
                    self.current_index -= 1
                    print(f"⏪ Going back to image {self.current_index + 1}")
                else:
                    print("⏪ Already at first image")
                    
            elif key == ord('q'):
                # Quit
                print(f"🛑 Quitting... Labeled {self.labeled_in_session} images this session")
                break
                
            else:
                print(f"❓ Unknown key. Use: 1=INFECTED | 2=NON-INFECTED | s=SKIP | b=BACK | q=QUIT")
        
        cv2.destroyAllWindows()
        
        if self.current_index >= len(self.current_images):
            print(f"🎉 Completed labeling all images in {split_dir.name}!")
    
    def run(self):
        """Main labeling workflow"""
        print("\n" + "="*60)
        print("🎯 PCOS DATASET LABELING WORKFLOW")
        print("="*60)
        
        splits = ["train", "val", "test"]
        
        while True:
            print(f"\n📊 Current Progress: {len(self.progress['labeled'])} images labeled")
            print("\nWhich split would you like to label?")
            print("1. Train")
            print("2. Validation") 
            print("3. Test")
            print("4. Show detailed progress")
            print("5. Save and quit")
            
            choice = input("\nChoice (1-5): ").strip()
            
            if choice == "1":
                self.label_split(self.source_dir / "train")
            elif choice == "2":
                self.label_split(self.source_dir / "val")
            elif choice == "3":
                self.label_split(self.source_dir / "test")
            elif choice == "4":
                self.show_progress()
            elif choice == "5":
                print("💾 Saving progress and exiting...")
                break
            else:
                print("❌ Invalid choice. Please enter 1-5.")
            
            self.save_progress()
    
    def show_progress(self):
        """Show detailed progress statistics"""
        print("\n" + "="*50)
        print("📊 DETAILED PROGRESS REPORT")
        print("="*50)
        
        splits = ["train", "val", "test"]
        total_labeled = 0
        total_unlabeled = 0
        
        for split in splits:
            split_dir = self.source_dir / split
            if split_dir.exists():
                all_images = [f for f in os.listdir(split_dir) 
                             if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
                
                labeled = sum(1 for img in all_images if img in self.progress["labeled"])
                unlabeled = len(all_images) - labeled
                
                print(f"\n{split.upper()}:")
                print(f"  Total: {len(all_images)}")
                print(f"  Labeled: {labeled}")
                print(f"  Remaining: {unlabeled}")
                if len(all_images) > 0:
                    print(f"  Progress: {(labeled/len(all_images)*100):.1f}%")
                
                total_labeled += labeled
                total_unlabeled += unlabeled
        
        print(f"\n🎯 OVERALL PROGRESS:")
        print(f"  Total images: {total_labeled + total_unlabeled}")
        print(f"  Labeled: {total_labeled}")
        print(f"  Remaining: {total_unlabeled}")
        if (total_labeled + total_unlabeled) > 0:
            print(f"  Overall progress: {(total_labeled/(total_labeled + total_unlabeled)*100):.1f}%")
        
        # Class distribution
        infected_count = sum(1 for label in self.progress["labeled"].values() 
                           if label["class"] == "infected")
        noninfected_count = sum(1 for label in self.progress["labeled"].values() 
                              if label["class"] == "noninfected")
        
        if total_labeled > 0:
            print(f"\n🏷️ CLASS DISTRIBUTION:")
            print(f"  Infected: {infected_count} ({(infected_count/total_labeled*100):.1f}%)")
            print(f"  Non-infected: {noninfected_count} ({(noninfected_count/total_labeled*100):.1f}%)")

def main():
    """Main execution function"""
    assets_dir = Path("C:/Users/heyri/OneDrive/Desktop/ovacare/frontend/public/assets")
    
    if not assets_dir.exists():
        print(f"❌ Assets directory not found: {assets_dir}")
        return
    
    labeler = PCOSImageLabeler(assets_dir)
    
    try:
        labeler.run()
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    finally:
        labeler.save_progress()
        cv2.destroyAllWindows()
        print("👋 Labeling session ended")

if __name__ == "__main__":
    main()