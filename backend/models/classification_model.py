import numpy as np
from typing import Dict, Any, Optional
from pathlib import Path
import os
import random

from .gradcam_utils import GradCAMExplainer

# Path to the trained PCOS model (TFLite version for lower memory footprint)
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'pcod_training', 'outputs', 'checkpoints', 'best_model_phase3.tflite')

# Global variable to store loaded model
_loaded_model = None
_loaded_explainer = None
CLASSIFICATION_THRESHOLD = 0.7

def _download_model_from_hf(model_path: Path) -> bool:
    """
    Try to download the PCOS model from Hugging Face Hub.
    Requires the HF_MODEL_REPO env var to be set, e.g. 'ridmii/ovacare-model'.
    Returns True if the download succeeded, False otherwise.
    """
    hf_repo = os.getenv('HF_MODEL_REPO', '').strip()
    if not hf_repo:
        return False
    try:
        from huggingface_hub import hf_hub_download  # type: ignore
        print(f"[ModelLoader] Downloading model from HF Hub: {hf_repo} ...")
        model_path.parent.mkdir(parents=True, exist_ok=True)
        downloaded = hf_hub_download(
            repo_id=hf_repo,
            filename='best_model_phase3.tflite',
            local_dir=str(model_path.parent),
        )
        # hf_hub_download may place the file in a cache subdir — copy if needed
        downloaded_path = Path(downloaded)
        if downloaded_path != model_path:
            import shutil
            shutil.copy(downloaded_path, model_path)
        print(f"[ModelLoader] Model downloaded to: {model_path}")
        return True
    except Exception as exc:
        print(f"[ModelLoader] HF Hub download failed: {exc}")
        return False


def load_classification_model():
    """Load or mock the trained PCOS classification model."""
    global _loaded_model
    
    if _loaded_model is None:
        try:
            model_path = Path(MODEL_PATH)

            # If the model file is missing, attempt to fetch it from HF Hub
            # (used in cloud deployments where .h5 files are not in git).
            if not model_path.exists():
                _download_model_from_hf(model_path)

            if not model_path.exists():
                # Use a mock model for development
                print(f"Model not found at: {model_path}")
                print("Using mock classification model for development")
                _loaded_model = "mock_model"
                return _loaded_model
            else:
                # Will load tflite model if available
                try:
                    import tensorflow as tf
                    print(f"Loading PCOS TFLite model from: {model_path}")
                    # Load the TFLite model and allocate tensors
                    _loaded_model = tf.lite.Interpreter(model_path=str(model_path))
                    _loaded_model.allocate_tensors()
                    print("PCOS TFLite model loaded successfully!")
                    return _loaded_model
                except ImportError:
                    print("TensorFlow not available - using mock model")
                    _loaded_model = "mock_model"
                    return _loaded_model
            
        except Exception as e:
            print(f"Error loading PCOS model: {e}")
            print("Falling back to mock predictions")
            _loaded_model = "mock_model"
            return _loaded_model
    
    return _loaded_model



def load_gradcam_explainer() -> Optional[GradCAMExplainer]:
    """Load a Grad-CAM explainer (Disabled for TFLite since it lacks gradients)."""
    return None

def classify_ultrasound(image: np.ndarray, original_image_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Classify ultrasound image for PCOS detection.
    
    Args:
        image: Preprocessed ultrasound image
        
    Returns:
        Dictionary containing classification results
    """
    try:
        # Load model
        model = load_classification_model()
        
        if model == "mock_model" or model is None:
            # Return mock classification
            return _mock_classification()
        
        print(f"Input image shape: {image.shape}")
        
        # Make prediction using TFLite
        input_details = model.get_input_details()
        output_details = model.get_output_details()
        
        # Ensure image is float32
        input_data = image.astype(np.float32)
        model.set_tensor(input_details[0]['index'], input_data)
        
        # Run inference
        model.invoke()
        
        prediction = model.get_tensor(output_details[0]['index'])
        pred_value = float(prediction[0][0])
        
        # Convert to classification result
        predicted_class = 1 if pred_value >= CLASSIFICATION_THRESHOLD else 0
        confidence = pred_value if predicted_class == 1 else (1 - pred_value)
        
        # Determine diagnosis and severity
        if predicted_class == 1:  # PCOS detected
            diagnosis = "PCOS Detected"
            
            if confidence > 0.8:
                severity = "Severe"
            elif confidence > 0.6:
                severity = "Moderate"
            else:
                severity = "Mild"
        else:  # Normal
            diagnosis = "Normal Ovarian Structure"
            severity = "Mild"
        
        result = {
            'diagnosis': diagnosis,
            'confidence': round(float(confidence * 100), 1),
            'severity': severity,
            'predicted_class': predicted_class,
            'model_used': 'EfficientNetB4_Phase3_Trained'
        }

        explainer = load_gradcam_explainer()
        if explainer is not None:
            try:
                gradcam = explainer.generate(
                    image,
                    original_image_path=original_image_path,
                    class_idx=predicted_class,
                )
                result['visualization'] = {
                    'layerName': gradcam.layer_name,
                    'heatmapImageDataUrl': gradcam.heatmap_data_url,
                    'overlayImageDataUrl': gradcam.overlay_data_url,
                }
            except Exception as gradcam_error:
                print(f"Grad-CAM generation failed: {gradcam_error}")
                result['visualization'] = None

        return result
        
    except Exception as e:
        print(f"Classification error: {e}")
        return {
            'diagnosis': 'Analysis Failed',
            'confidence': 0.0,
            'severity': 'Mild',
            'error': str(e),
            'model_used': 'Error',
            'visualization': None,
        }

def _mock_classification() -> Dict[str, Any]:
    """Mock classification for when model is not available."""
    confidence = random.uniform(65, 85)
    diagnosis = "Normal Ovarian Structure" if random.random() > 0.4 else "PCOS Detected"
    
    return {
        'diagnosis': diagnosis,
        'confidence': round(confidence, 1),
        'severity': 'Mild' if diagnosis == "Normal Ovarian Structure" else 'Moderate',
        'model_used': 'Mock/Development',
        'visualization': None,
    }

# NOTE: Model is loaded lazily on first classify_ultrasound() call.
# Do NOT call load_classification_model() here — TensorFlow uses ~400 MB of
# RAM which exceeds Render's free-tier limit if loaded at startup.
