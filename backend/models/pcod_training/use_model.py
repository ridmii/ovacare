"""
PCOS Model - Simple Usage Script
Use this to make predictions with a trained model.

Root-friendly version:
- No hard-coded absolute paths
- Defaults to: model_outputs/best_pcos_model.h5
- Falls back to common checkpoint locations if needed
"""

import json
from pathlib import Path

import cv2
import numpy as np
import tensorflow as tf


def _candidate_model_paths(repo_root: Path) -> list[Path]:
    return [
        # Primary expected location (what you created in the cloned repo)
        repo_root / "model_outputs" / "best_pcos_model.h5",
        # Common alternative locations
        repo_root / "outputs" / "checkpoints" / "best_model_phase3.h5",
        repo_root / "outputs" / "checkpoints" / "best_model_phase2.h5",
        repo_root / "outputs" / "checkpoints" / "best_model_phase1.h5",
        # If you kept the older nested structure somewhere
        repo_root / "backend" / "models" / "pcod_training" / "outputs" / "checkpoints" / "best_model_phase3.h5",
    ]


def _default_model_path() -> Path:
    repo_root = Path(__file__).resolve().parent
    for path in _candidate_model_paths(repo_root):
        if path.exists():
            return path
    return repo_root / "model_outputs" / "best_pcos_model.h5"


def get_medical_interpretation(probability: float) -> str:
    if probability > 0.8:
        return "High confidence PCOS detection - recommend medical consultation"
    if probability > 0.6:
        return "Moderate PCOS indicators - consider medical follow-up"
    if probability > 0.4:
        return "Some PCOS indicators - regular monitoring recommended"
    return "Low PCOS probability - continue routine screening"


def predict_pcos_simple(image_path: str, model_path: str | None = None) -> dict:
    """
    Args:
        image_path: path to ultrasound image
        model_path: optional path to model .h5

    Returns:
        dict: result or {"error": "..."}
    """
    repo_root = Path(__file__).resolve().parent
    image_path_obj = Path(image_path)

    model_path_obj = Path(model_path) if model_path else _default_model_path()

    try:
        if not model_path_obj.exists():
            return {
                "error": (
                    f"Model not found: {model_path_obj}\n"
                    f"Tried:\n- " + "\n- ".join(str(p) for p in _candidate_model_paths(repo_root))
                )
            }

        if not image_path_obj.exists():
            return {"error": f"Image not found: {image_path_obj}"}

        print(f"Loading model from: {model_path_obj}")
        model = tf.keras.models.load_model(str(model_path_obj), compile=False)
        print(f"Loaded: {model.name} | input: {getattr(model, 'input_shape', 'unknown')}")

        image = cv2.imread(str(image_path_obj))
        if image is None:
            return {"error": f"Cannot load image (cv2.imread returned None): {image_path_obj}"}

        # EfficientNetB4 preprocessing (matches your loaded model: input 380x380)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = cv2.resize(image, (380, 380))
        image = image.astype(np.float32) / 255.0

        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        image = (image - mean) / std

        image = np.expand_dims(image, axis=0)

        pred = model.predict(image, verbose=0)
        probability = float(pred[0, 0])

        is_pcos = probability > 0.5
        confidence = probability if is_pcos else (1.0 - probability)

        return {
            "image_file": str(image_path_obj),
            "model_file": str(model_path_obj),
            "prediction": "PCOS Detected" if is_pcos else "Normal",
            "probability": probability,
            "confidence": float(confidence),
            "interpretation": get_medical_interpretation(probability),
            "model_info": f"{model.name} (.h5 loaded)",
        }

    except Exception as e:
        return {"error": f"Prediction failed: {e}"}


def print_model_info() -> None:
    repo_root = Path(__file__).resolve().parent
    print("Available model paths:")
    for path in _candidate_model_paths(repo_root):
        if path.exists():
            size_mb = path.stat().st_size / (1024 * 1024)
            print(f"  OK  {path} ({size_mb:.1f} MB)")
        else:
            print(f"  NO  {path}")
    print(f"\nDefault model path: {_default_model_path()}")


if __name__ == "__main__":
    print_model_info()

    # Example usage:
    # image_path = r"C:\path\to\your\ultrasound.jpg"
    # result = predict_pcos_simple(image_path)
    # print(json.dumps(result, indent=2))