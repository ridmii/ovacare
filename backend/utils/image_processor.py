import cv2
import numpy as np
from PIL import Image
import os
from typing import Optional, Tuple

def validate_image(filepath: str) -> bool:
    """Validate if the file is a proper image."""
    try:
        with Image.open(filepath) as img:
            img.verify()  # This will raise an exception if the image is corrupted
        return True
    except Exception:
        return False

def preprocess_image(filepath: str, target_size: Tuple[int, int] = (380, 380)) -> np.ndarray:
    """Preprocess image for PCOS classification model (EfficientNetB4)."""
    try:
        # Load image
        image = cv2.imread(filepath)
        if image is None:
            raise ValueError("Could not load image")
        
        # Convert BGR to RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Resize image to EfficientNetB4 input size
        image = cv2.resize(image, target_size)
        
        # Normalize pixel values to [0, 1]
        image = image.astype(np.float32) / 255.0
        
        # Apply ImageNet normalization (CRITICAL for EfficientNet)
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        image = (image - mean) / std
        
        # Add batch dimension
        image = np.expand_dims(image, axis=0)
        
        return image
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {str(e)}")

def enhance_ultrasound_image(image: np.ndarray) -> np.ndarray:
    """Apply ultrasound-specific image enhancements."""
    try:
        # Convert to grayscale for ultrasound processing
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            gray = image.copy()
        
        # Apply histogram equalization
        enhanced = cv2.equalizeHist(gray)
        
        # Apply Gaussian blur to reduce noise
        enhanced = cv2.GaussianBlur(enhanced, (3, 3), 0)
        
        # Apply unsharp masking for edge enhancement
        gaussian = cv2.GaussianBlur(enhanced, (5, 5), 2)
        unsharp_mask = cv2.addWeighted(enhanced, 1.5, gaussian, -0.5, 0)
        
        return unsharp_mask
    except Exception as e:
        raise ValueError(f"Error enhancing ultrasound image: {str(e)}")

def extract_roi(image: np.ndarray, roi_coords: Optional[Tuple[int, int, int, int]] = None) -> np.ndarray:
    """Extract region of interest from ultrasound image."""
    try:
        if roi_coords is None:
            # Default to center region if no ROI specified
            h, w = image.shape[:2]
            x1, y1 = w // 4, h // 4
            x2, y2 = 3 * w // 4, 3 * h // 4
        else:
            x1, y1, x2, y2 = roi_coords
        
        roi = image[y1:y2, x1:x2]
        return roi
    except Exception as e:
        raise ValueError(f"Error extracting ROI: {str(e)}")

def detect_ovary_region(image: np.ndarray) -> Tuple[int, int, int, int]:
    """Detect ovary region in ultrasound image using basic image processing."""
    try:
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            gray = image.copy()
        
        # Apply threshold to find darker regions (typical for ovarian tissue)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            # Find the largest contour (likely the ovary)
            largest_contour = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(largest_contour)
            return x, y, x + w, y + h
        else:
            # Default to center region
            h, w = gray.shape
            return w // 4, h // 4, 3 * w // 4, 3 * h // 4
            
    except Exception as e:
        # Return default region if detection fails
        h, w = image.shape[:2]
        return w // 4, h // 4, 3 * w // 4, 3 * h // 4

def save_processed_image(image: np.ndarray, output_path: str) -> bool:
    """Save processed image to file."""
    try:
        # Ensure image is in proper format for saving
        if image.dtype == np.float32:
            image = (image * 255).astype(np.uint8)
        
        # Save image
        cv2.imwrite(output_path, image)
        return True
    except Exception:
        return False
