"""
Test Backend Integration with Trained PCOS Model
Run this to verify the backend is using the trained model correctly
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import numpy as np
from models.classification_model import classify_ultrasound, load_classification_model
from models.segmentation_model import segment_follicles

def test_model_loading():
    """Test if the trained model loads correctly"""
    print("🧪 TESTING MODEL LOADING")
    print("="*40)
    
    model = load_classification_model()
    if model is not None:
        print("✅ Trained PCOS model loaded successfully!")
        print(f"📊 Model parameters: {model.count_params():,}")
        return True
    else:
        print("❌ Failed to load trained model")
        return False

def test_classification():
    """Test classification with a dummy image"""
    print("\n🧪 TESTING CLASSIFICATION")
    print("="*40)
    
    # Create a dummy ultrasound-like image (380x380x3)
    dummy_image = np.random.randint(0, 255, (380, 380, 3), dtype=np.uint8)
    
    try:
        result = classify_ultrasound(dummy_image)
        print(f"✅ Classification successful!")
        print(f"   Diagnosis: {result['diagnosis']}")
        print(f"   Confidence: {result['confidence']}%")
        print(f"   Model Used: {result.get('model_used', 'Unknown')}")
        
        if 'Mock' in result.get('model_used', ''):
            print("   ⚠️ Using mock model - trained model not loaded")
            return False
        else:
            print("   ✅ Using trained EfficientNetB4 model")
            return True
            
    except Exception as e:
        print(f"❌ Classification failed: {e}")
        return False

def test_segmentation():
    """Test segmentation estimation"""
    print("\n🧪 TESTING SEGMENTATION")
    print("="*40)
    
    dummy_image = np.random.randint(0, 255, (380, 380, 3), dtype=np.uint8)
    
    # First get classification result
    classification_result = classify_ultrasound(dummy_image)
    
    try:
        result = segment_follicles(dummy_image, classification_result)
        print(f"✅ Segmentation successful!")
        print(f"   Follicle Count: {result['follicle_count']}")
        print(f"   PCOS Criteria Met: {result['pcos_criteria_met']}")
        print(f"   Method: {result.get('method', 'Unknown')}")
        return True
        
    except Exception as e:
        print(f"❌ Segmentation failed: {e}")
        return False

def test_end_to_end():
    """Test complete pipeline"""
    print("\n🧪 TESTING COMPLETE PIPELINE")
    print("="*40)
    
    # Simulate what happens when user uploads an image
    dummy_image = np.random.randint(0, 255, (380, 380, 3), dtype=np.uint8)
    
    try:
        # Step 1: Classification
        classification_result = classify_ultrasound(dummy_image)
        
        # Step 2: Segmentation 
        segmentation_result = segment_follicles(dummy_image, classification_result)
        
        # Step 3: Generate response (like in routes.py)
        analysis = {
            'diagnosis': classification_result['diagnosis'],
            'confidence': classification_result['confidence'],
            'follicleCount': segmentation_result['follicle_count'],
            'severity': classification_result['severity']
        }
        
        print("✅ End-to-end pipeline successful!")
        print(f"   Final Analysis: {analysis}")
        return True
        
    except Exception as e:
        print(f"❌ Pipeline failed: {e}")
        return False

def main():
    print("🧠 BACKEND INTEGRATION TEST")
    print("Testing if your Node.js backend uses the trained PCOS model")
    print("="*60)
    
    # Run tests
    tests = [
        ("Model Loading", test_model_loading),
        ("Classification", test_classification), 
        ("Segmentation", test_segmentation),
        ("End-to-End", test_end_to_end)
    ]
    
    results = []
    for test_name, test_func in tests:
        success = test_func()
        results.append((test_name, success))
    
    # Summary
    print("\n📋 TEST SUMMARY")
    print("="*40)
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"   {test_name}: {status}")
    
    print(f"\nResult: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        print("Your backend is now using the trained PCOS model!")
        print("\n🚀 NEXT STEPS:")
        print("1. Run: npm run dev")
        print("2. Upload a test image")
        print("3. Check if predictions are now accurate")
    else:
        print("\n⚠️ SOME TESTS FAILED!")
        print("Check the error messages above and:")
        print("1. Ensure TensorFlow is installed: pip install tensorflow")
        print("2. Verify the model file exists at the correct path")
        print("3. Check file permissions")

if __name__ == "__main__":
    main()