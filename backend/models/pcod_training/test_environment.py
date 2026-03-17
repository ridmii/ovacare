#!/usr/bin/env python3
"""
Environment verification script for PCOS ML training pipeline.
"""

import sys

def test_environment():
    """Test all required packages and display versions."""
    print("🔧 Testing ML Training Environment...")
    print("=" * 50)
    
    # Core packages
    try:
        import tensorflow as tf
        print(f"✅ TensorFlow: {tf.__version__}")
    except ImportError:
        print("❌ TensorFlow not available")
        return False
    
    try:
        import cv2
        print(f"✅ OpenCV: {cv2.__version__}")
    except ImportError:
        print("❌ OpenCV not available")
        return False
    
    try:
        import numpy as np
        print(f"✅ NumPy: {np.__version__}")
    except ImportError:
        print("❌ NumPy not available")
        return False
    
    try:
        from PIL import Image
        import PIL
        print(f"✅ Pillow: {PIL.__version__}")
    except ImportError:
        print("❌ Pillow not available")
        return False
    
    try:
        import matplotlib
        print(f"✅ Matplotlib: {matplotlib.__version__}")
    except ImportError:
        print("❌ Matplotlib not available")
        return False
    
    try:
        import pandas as pd
        print(f"✅ Pandas: {pd.__version__}")
    except ImportError:
        print("❌ Pandas not available")
        return False
    
    try:
        import sklearn
        print(f"✅ Scikit-learn: {sklearn.__version__}")
    except ImportError:
        print("❌ Scikit-learn not available")
        return False
    
    # Additional ML packages
    try:
        import albumentations as A
        print(f"✅ Albumentations: {A.__version__}")
    except ImportError:
        print("❌ Albumentations not available")
        return False
    
    try:
        import seaborn as sns
        print(f"✅ Seaborn: {sns.__version__}")
    except ImportError:
        print("❌ Seaborn not available")
        return False
    
    try:
        import plotly
        print(f"✅ Plotly: {plotly.__version__}")
    except ImportError:
        print("❌ Plotly not available")
        return False
    
    try:
        import tqdm
        print(f"✅ TQDM: {tqdm.__version__}")
    except ImportError:
        print("❌ TQDM not available")
        return False
    
    try:
        import colorama
        print(f"✅ Colorama: {colorama.__version__}")
    except ImportError:
        print("❌ Colorama not available")
        return False
    
    print("=" * 50)
    
    # System information
    print(f"🐍 Python: {sys.version}")
    
    # GPU check
    try:
        gpus = tf.config.list_physical_devices('GPU')
        if gpus:
            print(f"🚀 GPU Available: {len(gpus)} GPU(s) detected")
            for i, gpu in enumerate(gpus):
                print(f"   GPU {i}: {gpu.name}")
        else:
            print("⚡ CPU Only: No GPU detected (will use CPU for training)")
    except Exception as e:
        print(f"⚠️  GPU Check Error: {e}")
    
    print("=" * 50)
    print("🎯 Environment Status: ALL PACKAGES READY!")
    print("📧 Ready to start ML training pipeline")
    
    return True

if __name__ == "__main__":
    test_environment()