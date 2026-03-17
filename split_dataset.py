import os
import zipfile
import shutil
import random
from pathlib import Path

def split_ultrasound_dataset(zip_file_path, output_dir, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15):
    """
    Split ultrasound images from a zip file into train, test, and validation sets.
    
    Args:
        zip_file_path (str): Path to the zip file containing images
        output_dir (str): Base directory where train/test/val folders will be created
        train_ratio (float): Proportion of data for training (default: 0.7)
        val_ratio (float): Proportion of data for validation (default: 0.15)
        test_ratio (float): Proportion of data for testing (default: 0.15)
    """
    
    # Validate ratios
    if abs(train_ratio + val_ratio + test_ratio - 1.0) > 1e-6:
        raise ValueError("Train, validation, and test ratios must sum to 1.0")
    
    # Create output directories
    train_dir = os.path.join(output_dir, 'train')
    val_dir = os.path.join(output_dir, 'val')
    test_dir = os.path.join(output_dir, 'test')
    
    # Create directories if they don't exist
    for directory in [train_dir, val_dir, test_dir]:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"Created directory: {directory}")
    
    # Create temporary extraction directory
    temp_extract_dir = os.path.join(output_dir, 'temp_extracted')
    Path(temp_extract_dir).mkdir(parents=True, exist_ok=True)
    
    try:
        # Extract zip file
        print(f"Extracting {zip_file_path}...")
        with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
            zip_ref.extractall(temp_extract_dir)
        
        # Find all image files in extracted directory
        image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.gif'}
        image_files = []
        
        # Walk through all subdirectories to find images
        for root, dirs, files in os.walk(temp_extract_dir):
            for file in files:
                if any(file.lower().endswith(ext) for ext in image_extensions):
                    image_files.append(os.path.join(root, file))
        
        if not image_files:
            print("No image files found in the zip archive!")
            return
        
        print(f"Found {len(image_files)} image files")
        
        # Shuffle the list of image files for random distribution
        random.shuffle(image_files)
        
        # Calculate split indices
        total_images = len(image_files)
        train_count = int(total_images * train_ratio)
        val_count = int(total_images * val_ratio)
        test_count = total_images - train_count - val_count  # Remaining images go to test
        
        print(f"Splitting images:")
        print(f"  Train: {train_count} images ({train_ratio*100:.1f}%)")
        print(f"  Validation: {val_count} images ({val_ratio*100:.1f}%)")
        print(f"  Test: {test_count} images ({test_ratio*100:.1f}%)")
        
        # Split and copy files
        train_images = image_files[:train_count]
        val_images = image_files[train_count:train_count + val_count]
        test_images = image_files[train_count + val_count:]
        
        # Copy files to respective directories
        def copy_images(image_list, dest_dir, split_name):
            print(f"\nCopying {len(image_list)} images to {split_name} directory...")
            for i, image_path in enumerate(image_list):
                # Get original filename
                filename = os.path.basename(image_path)
                # Create destination path
                dest_path = os.path.join(dest_dir, filename)
                
                # Handle duplicate filenames by adding a counter
                counter = 1
                original_dest_path = dest_path
                while os.path.exists(dest_path):
                    name, ext = os.path.splitext(original_dest_path)
                    dest_path = f"{name}_{counter}{ext}"
                    counter += 1
                
                # Copy the file
                shutil.copy2(image_path, dest_path)
                
                if (i + 1) % 50 == 0 or i + 1 == len(image_list):
                    print(f"  Copied {i + 1}/{len(image_list)} images to {split_name}")
        
        # Copy images to their respective directories
        copy_images(train_images, train_dir, "train")
        copy_images(val_images, val_dir, "validation")
        copy_images(test_images, test_dir, "test")
        
        print(f"\nDataset split completed successfully!")
        print(f"Images are now organized in:")
        print(f"  Train: {train_dir}")
        print(f"  Validation: {val_dir}")
        print(f"  Test: {test_dir}")
        
    except Exception as e:
        print(f"Error during processing: {str(e)}")
        raise
    
    finally:
        # Clean up temporary directory
        if os.path.exists(temp_extract_dir):
            print(f"\nCleaning up temporary files...")
            shutil.rmtree(temp_extract_dir)

def main():
    """Main function to run the dataset splitting process."""
    
    # Set up paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    zip_file_path = os.path.join(current_dir, 'PCOS.zip')
    output_dir = os.path.join(current_dir, 'public', 'assets')
    
    # Check if zip file exists
    if not os.path.exists(zip_file_path):
        print(f"Error: Zip file not found at {zip_file_path}")
        print("Please make sure the PCOS.zip file is in the same directory as this script.")
        return
    
    print("PCOS Ultrasound Dataset Splitter")
    print("=" * 40)
    print(f"Source zip file: {zip_file_path}")
    print(f"Output directory: {output_dir}")
    print()
    
    # Set random seed for reproducibility
    random.seed(42)
    
    try:
        # Run the dataset splitting
        split_ultrasound_dataset(
            zip_file_path=zip_file_path,
            output_dir=output_dir,
            train_ratio=0.7,   # 70% for training
            val_ratio=0.15,    # 15% for validation
            test_ratio=0.15    # 15% for testing
        )
        
    except Exception as e:
        print(f"Error: {str(e)}")
        print("Please check the error message above and try again.")

if __name__ == "__main__":
    main()