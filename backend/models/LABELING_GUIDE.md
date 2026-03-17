# PCOS Dataset Labeling Guide

This guide will help you efficiently label your 12,680 ultrasound images for PCOS detection model training.

## 📁 Current Dataset Structure

```
assets/
├── train/ (8,876 unlabeled images)
│   ├── infected/ (empty - you'll move PCOS+ images here)
│   └── noninfected/ (empty - you'll move PCOS- images here)
├── val/ (1,902 unlabeled images)  
│   ├── infected/ (empty)
│   └── noninfected/ (empty)
└── test/ (1,902 unlabeled images)
    ├── infected/ (empty)
    └── noninfected/ (empty)
```

## 🎯 Labeling Strategy

**Recommendation**: Start with the **validation** and **test** sets first (smaller), then tackle the training set.

1. **Start with VAL set** (1,902 images) - manageable first task
2. **Then TEST set** (1,902 images) - complete evaluation data
3. **Finally TRAIN set** (8,876 images) - largest but most important

## 🛠️ Available Labeling Tools

### Option 1: Visual GUI Labeler (Recommended)
**File**: `image_labeling_tool.py`

**Features**:
- Shows images visually with OpenCV
- Fast keyboard shortcuts (1=infected, 2=non-infected)
- Progress tracking and resume capability
- Can go back to previous images
- Automatic file organization

**Usage**:
```bash
cd "C:\Users\heyri\OneDrive\Desktop\ovacare\backend\models"
python image_labeling_tool.py
```

**Controls**:
- `1` = INFECTED (PCOS-positive)
- `2` = NON-INFECTED (PCOS-negative)  
- `s` = Skip this image
- `b` = Go back to previous image
- `q` = Quit and save progress

### Option 2: Simple Text-Based Labeler
**File**: `simple_labeling_tool.py`

**Features**:
- Command-line interface (no GUI required)
- Shows filename and basic info
- Type commands to classify
- Progress tracking

**Usage**:
```bash
cd "C:\Users\heyri\OneDrive\Desktop\ovacare\backend\models"
python simple_labeling_tool.py
```

### Option 3: Progress Checker
**File**: `check_labeling_progress.py`

**Features**:
- Check current progress without labeling
- Shows class distribution and balance
- Quick overview of all splits

**Usage**:
```bash
cd "C:\Users\heyri\OneDrive\Desktop\ovacare\backend\models"
python check_labeling_progress.py
```

## 📊 Progress Tracking

All tools automatically save progress to `labeling_progress.json` in your assets folder. This means:
- ✅ You can stop and resume anytime
- ✅ No work is lost if you quit
- ✅ Multiple sessions are tracked
- ✅ Progress is shared between all tools

## 💡 Labeling Tips

### Medical Guidelines
- **INFECTED (PCOS-positive)**: Look for:
  - Multiple small cysts (polycystic appearance)
  - Enlarged ovaries
  - Increased ovarian volume
  - String of pearls appearance

- **NON-INFECTED (PCOS-negative)**: Look for:
  - Normal ovarian appearance
  - No multiple cysts
  - Normal ovarian size

### Efficiency Tips
1. **Use keyboard shortcuts** in GUI mode for speed
2. **Take breaks** - labeling fatigue affects accuracy
3. **Start with obvious cases** to build momentum
4. **Use skip for unclear images** and return later
5. **Check progress regularly** to stay motivated

## 🚀 Quick Start Workflow

1. **Check current status**:
   ```bash
   python check_labeling_progress.py
   ```

2. **Start labeling** (recommended GUI approach):
   ```bash
   python image_labeling_tool.py
   ```

3. **Select split to label**:
   - Start with "2" (Validation) for 1,902 images
   - Then "3" (Test) for 1,902 images  
   - Finally "1" (Train) for 8,876 images

4. **Label images**:
   - Press `1` for infected images
   - Press `2` for non-infected images
   - Press `s` to skip unclear ones

5. **Save and continue**:
   - Press `q` to quit anytime
   - Progress is automatically saved
   - Resume anytime by running the tool again

## 🎯 Target: Balanced Dataset

**Goal**: Aim for roughly 50-50 split between infected and non-infected in each dataset split for optimal model performance.

The progress checker will warn you if your dataset becomes too imbalanced.

## 🔧 Troubleshooting

### If GUI tool doesn't work:
- Use the simple text-based tool: `python simple_labeling_tool.py`
- Or install OpenCV: `pip install opencv-python`

### If files don't move correctly:
- Check folder permissions
- Make sure you're running from the correct directory
- The script will show error messages for failed moves

### Lost progress:
- Check for `labeling_progress.json` in your assets folder
- This file contains all your labeling work

## 📈 Estimated Time

**Conservative estimates**:
- **5 seconds per image** average (with experience)
- **Val set**: ~2.6 hours (1,902 images)
- **Test set**: ~2.6 hours (1,902 images)  
- **Train set**: ~12.3 hours (8,876 images)
- **Total**: ~17.5 hours

**Tips to go faster**:
- Use keyboard shortcuts
- Review in batches (all similar-looking images)
- Take regular breaks to maintain accuracy

## ✅ When Complete

Once all images are labeled, your directory will look like:

```
assets/
├── train/
│   ├── infected/ (PCOS+ training images)
│   └── noninfected/ (PCOS- training images)
├── val/
│   ├── infected/ (PCOS+ validation images)  
│   └── noninfected/ (PCOS- validation images)
└── test/
    ├── infected/ (PCOS+ test images)
    └── noninfected/ (PCOS- test images)
```

Then you can run your existing ML training pipeline:
```bash
python pcos_training_pipeline.py
```

## 🆘 Need Help?

If you encounter issues:
1. Run `python check_labeling_progress.py` to see current status
2. Check the `labeling_progress.json` file for your progress
3. Try the simple labeling tool if GUI has issues
4. Remember: you can always pause and resume later!

Good luck! 🍀