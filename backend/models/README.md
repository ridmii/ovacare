# PCOS Dataset Organization & Training Guide

## 🎯 Overview
You have 12,680 PCOS ultrasound images split into train/val/test folders, but all images are mixed together without class separation. This guide will help you organize them for ML training.

## 📁 Your Current Structure
```
assets/
├── train/     (8,876 images - all mixed)
├── val/       (1,902 images - all mixed)  
└── test/      (1,902 images - all mixed)
```

## 🎯 Target Structure
```
assets/
├── train/
│   ├── infected/      (PCOS positive images)
│   └── noninfected/   (Normal/healthy images)
├── val/
│   ├── infected/
│   └── noninfected/
└── test/
    ├── infected/
    └── noninfected/
```

## 🚀 Quick Start

### Option 1: GUI Pipeline (Recommended)
```bash
cd backend/models
python dataset_pipeline.py
```

### Option 2: Command Line Tools

#### A) Quick Organization (Automatic)
```bash
cd backend/models
python quick_organize.py [path-to-your-assets-folder]

# Example:
python quick_organize.py "C:\Users\heyri\OneDrive\Desktop\ovacare\frontend\public\assets"
```

#### B) Advanced Organization (Manual Control)
```bash
cd backend/models
python dataset_organizer.py
```

#### C) Validate Results
```bash
python validate_dataset.py [path-to-organized-dataset]
```

## 🔧 Tools Created

### 1. `dataset_pipeline.py` - Main GUI Interface
- **Purpose**: Menu-driven interface for the entire pipeline
- **Features**: Organization, validation, training config generation
- **Best for**: User-friendly experience

### 2. `quick_organize.py` - Automatic Organization
- **Purpose**: Fast organization with pattern detection
- **Features**: Detects patterns like "PCOS_", "Normal_", "Infected_" in filenames
- **Best for**: Files with clear naming patterns

### 3. `dataset_organizer.py` - Advanced Organization
- **Purpose**: Full-featured organization with manual control
- **Features**: Manual labeling, custom patterns, detailed validation
- **Best for**: Complex datasets or unclear filenames

### 4. `validate_dataset.py` - Quality Assurance
- **Purpose**: Comprehensive validation and statistics
- **Features**: Structure validation, class balance analysis, file sampling
- **Best for**: Ensuring dataset quality before training

## 📊 Expected Output Files

After organization, you'll get:
- **Organized folders**: Proper train/val/test structure with class subfolders
- **dataset_labels.csv**: Complete list of all images with labels
- **[split]_labels.csv**: Separate CSV files for each split
- **organization_report.json**: Detailed process summary
- **validation_report.json**: Quality check results
- **tensorflow_config.py**: Ready-to-use TensorFlow configuration

## 🔍 Filename Pattern Detection

The tools will automatically detect these patterns in your filenames:

### PCOS/Infected Patterns:
- `pcos`, `PCOS`
- `infected`, `positive`, `abnormal`
- `cyst`, `ovarian`

### Normal/Healthy Patterns:
- `normal`, `healthy`
- `noninfected`, `negative`
- `control`

### Examples:
- `PCOS_001.jpg` → **infected**
- `Normal_123.png` → **noninfected**
- `infected_img_456.jpg` → **infected**
- `healthy_scan_789.png` → **noninfected**

## ⚡ Quick Workflow

1. **Open Command Prompt/Terminal**
2. **Navigate to models folder**:
   ```bash
   cd "C:\Users\heyri\OneDrive\Desktop\ovacare\backend\models"
   ```

3. **Run the pipeline**:
   ```bash
   python dataset_pipeline.py
   ```

4. **Follow the menu**:
   - Choose Option 1 (Quick Organization)
   - Enter your assets path: `C:\Users\heyri\OneDrive\Desktop\ovacare\frontend\public\assets`
   - Let it organize automatically
   - Run Option 3 (Validate) to check results

## 🎯 Integration with ML Training

After organization, use our existing training pipeline:

```bash
# Navigate to backend directory
cd ../

# Run training with organized dataset
python pcos_training_pipeline.py --dataset_path "frontend/public/assets"
```

The training pipeline will automatically detect the organized structure and use:
- `train/` folder for model training
- `val/` folder for validation during training  
- `test/` folder for final model evaluation

## ⚠️ Important Notes

1. **Backup First**: The tools create backups, but make your own copy first
2. **File Patterns**: If no patterns are detected, you'll get a manual labeling interface
3. **Class Balance**: The validation will warn about class imbalance
4. **Memory Usage**: Large datasets may take time to process

## 🔧 Troubleshooting

### Problem: "No patterns detected"
**Solution**: Use Advanced Organization (option 2) for manual labeling

### Problem: "Class imbalance detected"  
**Solution**: This is normal - the training pipeline handles imbalanced data

### Problem: "Validation errors"
**Solution**: Check the validation_report.json for specific issues

### Problem: "Files not moving"
**Solution**: Check file permissions and ensure no files are open

## 📈 Expected Results

Based on your 12,680 images:
- **Train split**: ~8,876 images (70%)
- **Validation split**: ~1,902 images (15%) 
- **Test split**: ~1,902 images (15%)

Each split will have **infected** and **noninfected** subfolders based on the filename patterns detected in your images.

## 🎉 Next Steps

After organization:
1. ✅ Validate the organized dataset
2. ✅ Check class distribution balance
3. ✅ Generate TensorFlow configuration
4. ✅ Start model training with your organized data

Your dataset will be ready for TensorFlow's `image_dataset_from_directory()` function and our complete PCOS training pipeline!

---

## 🧠 Original ML Training Pipeline

### Core Training Files
- `pcos_training_pipeline.py` - Main training script with complete ML pipeline
- `quick_start.py` - Simplified interface for quick model training
- `examples.py` - Usage examples and common training scenarios
- `config.py` - Configuration settings and hyperparameters

### Model Architecture
- `classification_model.py` - CNN model for PCOS classification
- `segmentation_model.py` - U-Net model for ovarian segmentation

### Training Features
- **Complete ML Pipeline**: Data loading, preprocessing, training, validation, testing
- **Memory Optimization**: Handles large datasets efficiently (optimized for 15GB RAM)
- **Data Augmentation**: Comprehensive augmentation strategies for medical images
- **Model Variants**: Multiple CNN architectures (ResNet50, EfficientNetB0, etc.)
- **Automatic Monitoring**: TensorBoard logging and model checkpointing
- **Performance Analytics**: Detailed evaluation metrics and visualizations