#!/usr/bin/env python3
"""
Simple Batch Image Labeler for PCOS Dataset

Alternative command-line tool for labeling images when the GUI version isn't suitable.
Shows image filenames and allows you to type classifications.
"""

import os
import shutil
import json
from pathlib import Path
from datetime import datetime

class SimpleBatchLabeler:
    def __init__(self, assets_dir):
        self.assets_dir = Path(assets_dir)
        self.progress_file = self.assets_dir / "labeling_progress.json"
        self.progress = self.load_progress()
        
    def load_progress(self):
        """Load existing progress or create new"""
        if self.progress_file.exists():
            with open(self.progress_file, 'r') as f:
                return json.load(f)
        return {"labeled": {}, "total_labeled": 0}
    
    def save_progress(self):
        """Save current progress"""
        self.progress["last_session"] = datetime.now().isoformat()
        self.progress["total_labeled"] = len(self.progress["labeled"])
        with open(self.progress_file, 'w') as f:
            json.dump(self.progress, f, indent=2)
    
    def get_image_info(self, image_path):
        """Get basic info about an image"""
        try:
            stat = os.stat(image_path)
            size_mb = stat.st_size / (1024 * 1024)
            return f"Size: {size_mb:.2f}MB"
        except:
            return "Size: Unknown"
    
    def move_image(self, image_path, split_name, class_name):
        """Move image to appropriate class directory"""
        dest_dir = self.assets_dir / split_name / class_name
        dest_path = dest_dir / image_path.name
        
        try:
            shutil.move(str(image_path), str(dest_path))
            self.progress["labeled"][image_path.name] = {
                "split": split_name,
                "class": class_name,
                "timestamp": datetime.now().isoformat()
            }
            return True
        except Exception as e:
            print(f"❌ Error moving file: {e}")
            return False
    
    def label_split(self, split_name):
        """Label images in a specific split"""
        split_dir = self.assets_dir / split_name
        if not split_dir.exists():
            print(f"❌ {split_name} directory not found")
            return
        
        # Get unlabeled images
        images = [f for f in os.listdir(split_dir) 
                 if f.lower().endswith(('.jpg', '.jpeg', '.png')) 
                 and f not in self.progress["labeled"]]
        
        if not images:
            print(f"✅ All images in {split_name} are already labeled!")
            return
        
        print(f"\n🎯 Labeling {split_name} split")
        print(f"📊 {len(images)} images to process")
        print(f"💡 Commands: 'i' or '1' = infected, 'n' or '2' = non-infected, 's' = skip, 'q' = quit")
        print("-" * 60)
        
        processed = 0
        for i, image_name in enumerate(sorted(images)):
            image_path = split_dir / image_name
            info = self.get_image_info(image_path)
            
            print(f"\n[{i+1}/{len(images)}] {image_name}")
            print(f"          {info}")
            
            while True:
                choice = input("Classify (i/n/s/q): ").strip().lower()
                
                if choice in ['i', '1', 'infected']:
                    if self.move_image(image_path, split_name, "infected"):
                        print("✅ Labeled as INFECTED")
                        processed += 1
                    break
                    
                elif choice in ['n', '2', 'noninfected', 'non-infected']:
                    if self.move_image(image_path, split_name, "noninfected"):
                        print("✅ Labeled as NON-INFECTED")
                        processed += 1
                    break
                    
                elif choice in ['s', 'skip']:
                    print("⏭️ Skipped")
                    break
                    
                elif choice in ['q', 'quit']:
                    print(f"🛑 Quitting after processing {processed} images")
                    return
                    
                else:
                    print("❓ Invalid choice. Use: i=infected, n=non-infected, s=skip, q=quit")
        
        print(f"🎉 Completed {split_name}! Processed {processed} images")
    
    def quick_stats(self):
        """Show quick statistics"""
        splits = ["train", "val", "test"]
        
        print("\n📊 QUICK STATS:")
        for split in splits:
            split_dir = self.assets_dir / split
            if split_dir.exists():
                unlabeled = len([f for f in os.listdir(split_dir) 
                               if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
                
                infected_dir = split_dir / "infected"
                noninfected_dir = split_dir / "noninfected"
                
                infected = len(os.listdir(infected_dir)) if infected_dir.exists() else 0
                noninfected = len(os.listdir(noninfected_dir)) if noninfected_dir.exists() else 0
                
                print(f"  {split}: {unlabeled} unlabeled, {infected} infected, {noninfected} non-infected")
    
    def run(self):
        """Main execution loop"""
        print("🎯 Simple Batch Labeler for PCOS Dataset")
        print("=" * 50)
        
        while True:
            self.quick_stats()
            
            print(f"\nWhat would you like to do?")
            print("1. Label train images")
            print("2. Label validation images") 
            print("3. Label test images")
            print("4. Show detailed progress")
            print("5. Quit")
            
            choice = input("\nChoice (1-5): ").strip()
            
            if choice == "1":
                self.label_split("train")
            elif choice == "2":
                self.label_split("val")
            elif choice == "3":
                self.label_split("test")
            elif choice == "4":
                # Run the progress checker
                from check_labeling_progress import check_dataset_progress
                check_dataset_progress()
            elif choice == "5":
                print("👋 Goodbye!")
                break
            else:
                print("❌ Invalid choice")
            
            self.save_progress()

def main():
    assets_dir = "C:/Users/heyri/OneDrive/Desktop/ovacare/frontend/public/assets"
    
    if not os.path.exists(assets_dir):
        print(f"❌ Assets directory not found: {assets_dir}")
        return
    
    labeler = SimpleBatchLabeler(assets_dir)
    
    try:
        labeler.run()
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    finally:
        labeler.save_progress()

if __name__ == "__main__":
    main()