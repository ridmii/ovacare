import numpy as np
from PIL import Image
import os
from typing import Optional, Tuple

# ── MobileNetV2 object-detection cache ──────────────────────────────────────
# Loaded once and reused for every upload request.
_imagenet_model = None

def _load_imagenet_model():
    """Lazy-load MobileNetV2 (ImageNet) once per process."""
    global _imagenet_model
    if _imagenet_model is None:
        try:
            from tensorflow.keras.applications import MobileNetV2  # type: ignore
            _imagenet_model = MobileNetV2(
                weights='imagenet',
                include_top=True,
                input_shape=(224, 224, 3),
            )
            print('[ObjectCheck] MobileNetV2 loaded for object detection.')
        except Exception as exc:
            print(f'[ObjectCheck] Could not load MobileNetV2: {exc}')
    return _imagenet_model


def _is_everyday_object(filepath: str) -> bool:
    """
    Run MobileNetV2 (ImageNet-trained) on the image and return True if it
    confidently recognises an everyday object or scene.

    Ultrasound images are NOT in ImageNet — the model will spread probability
    across random irrelevant classes (top confidence < ~25 %).
    Real photos of objects (mouse, building, food, …) produce a clearly
    dominant class with high confidence (often > 35 %).

    Returns True  → image looks like an everyday object  → REJECT.
    Returns False → model is uncertain → likely a medical image → allow.
    """
    try:
        from tensorflow.keras.applications.mobilenet_v2 import (  # type: ignore
            preprocess_input,
            decode_predictions,
        )

        model = _load_imagenet_model()
        if model is None:
            return False  # Can't check — don't block

        img = Image.open(filepath).convert('RGB').resize((224, 224))
        arr = np.array(img, dtype=np.float32)
        arr = np.expand_dims(arr, axis=0)
        arr = preprocess_input(arr)  # scales to [-1, 1] as MobileNetV2 expects

        preds = model.predict(arr, verbose=0)
        top_confidence = float(np.max(preds))
        decoded = decode_predictions(preds, top=3)[0]

        print(
            f'[ObjectCheck] top-3: '
            + ', '.join(f'{lbl}({conf:.0%})' for _, lbl, conf in decoded)
        )

        # If any single ImageNet class gets > 30 % confidence it is almost
        # certainly a real-world photograph, not a medical ultrasound scan.
        if top_confidence > 0.30:
            print(f'[ObjectCheck] OBJECT DETECTED — top conf {top_confidence:.0%}')
            return True

        return False

    except Exception as exc:
        print(f'[ObjectCheck] Error during object check: {exc}')
        return False  # Fail-open: don't block if the check itself crashes
# ────────────────────────────────────────────────────────────────────────────

def validate_image(filepath: str) -> bool:
    """Validate if the file is a proper image."""
    try:
        with Image.open(filepath) as img:
            img.verify()  # This will raise an exception if the image is corrupted
        return True
    except Exception:
        return False

def is_ultrasound_image(filepath: str) -> bool:
    """
    Strictly determine whether an image is a medical ultrasound scan.

    Uses a scoring system across 7 independent signals.
    Some signals are hard-fail (immediately reject the image).
    A minimum score of 4 out of 7 is required.

    Key insight: ultrasounds always contain a LARGE textured grayscale scan
    region (the tissue) alongside a dark border. Photos of dark objects
    (e.g. a black mouse) are almost entirely dark — they lack the substantial
    mid-tone scan area that medical scans require.
    """
    try:
        import cv2
        img_bgr = cv2.imread(filepath)
        if img_bgr is None:
            return False

        h, w = img_bgr.shape[:2]
        total_pixels = h * w
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        hsv  = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)

        score = 0

        # ── HARD FAIL 0: ImageNet object detection ───────────────────────────
        # Run before any pixel heuristics. If MobileNetV2 confidently
        # recognises any ImageNet class the image is a real-world photo.
        if _is_everyday_object(filepath):
            print('[UltrasoundCheck] HARD FAIL — ImageNet recognised a real-world object.')
            return False

        # ── HARD FAIL: Colour check ──────────────────────────────────────────
        # Ultrasounds are essentially grayscale. If the image is clearly
        # coloured in any significant way, reject immediately.
        mean_sat = float(np.mean(hsv[:, :, 1]))
        sat_frac = float(np.sum(hsv[:, :, 1] > 60)) / total_pixels
        if mean_sat > 45 or sat_frac > 0.20:
            print(f"[UltrasoundCheck] HARD FAIL — colour: sat={mean_sat:.1f} frac={sat_frac:.2f}")
            return False

        b, g, r = cv2.split(img_bgr)
        max_ch_diff = max(
            float(np.mean(np.abs(b.astype(np.int16) - g.astype(np.int16)))),
            float(np.mean(np.abs(b.astype(np.int16) - r.astype(np.int16)))),
            float(np.mean(np.abs(g.astype(np.int16) - r.astype(np.int16)))),
        )
        if max_ch_diff > 25:
            print(f"[UltrasoundCheck] HARD FAIL — channel diff: {max_ch_diff:.1f}")
            return False

        # ── HARD FAIL: Scan-region size ──────────────────────────────────────
        # A real ultrasound has a substantial visible scan area (typically
        # 30-75 % of the image) consisting of mid-tone tissue pixels.
        # Dark-object photos (black mouse, dark room, etc.) are mostly black
        # with very few mid-tone pixels — they fail this check decisively.
        mid_tone_mask = (gray >= 25) & (gray <= 235)
        mid_tone_ratio = float(np.sum(mid_tone_mask)) / total_pixels
        if mid_tone_ratio < 0.18:
            # Less than 18 % non-dark pixels → almost entirely black image
            print(f"[UltrasoundCheck] HARD FAIL — too dark: mid_tone_ratio={mid_tone_ratio:.3f}")
            return False

        # ── Signal 1: Reasonable near-black background ───────────────────────
        # Ultrasound frames do have a dark border, but not 90 %+ of the image.
        dark_ratio = float(np.sum(gray < 20)) / total_pixels
        if 0.05 <= dark_ratio <= 0.80:
            score += 1

        # ── Signal 2: Near-grayscale channels ───────────────────────────────
        if max_ch_diff < 12:
            score += 1
        # (else: it didn't hard-fail but channels are noticeably different)

        # ── Signal 3: Speckle texture in scan region ─────────────────────────
        # Ultrasound tissue has characteristic high-frequency speckle noise.
        # Extract only the mid-tone (scan) region and check its texture.
        scan_pixels = gray[mid_tone_mask]
        if scan_pixels.size > 0:
            scan_std = float(np.std(scan_pixels))
            # Real tissue typically spans a wide range of grey values (std > 25)
            # A uniform dark object (mouse fur) will have very low std
            if scan_std >= 25:
                score += 1

        # ── Signal 4: Spatial spread of scan region ──────────────────────────
        # Ultrasound scan areas are large blobs covering much of the frame.
        # A photo of a small dark object (mouse) has the scan pixels clustered
        # only around the object edges/highlights, not spread across the image.
        if np.sum(mid_tone_mask) > 0:
            rows_with_mid = np.any(mid_tone_mask, axis=1)
            cols_with_mid = np.any(mid_tone_mask, axis=0)
            row_span = float(np.sum(rows_with_mid)) / h
            col_span = float(np.sum(cols_with_mid)) / w
            # The scan region should span at least 40 % of both dimensions
            if row_span >= 0.40 and col_span >= 0.40:
                score += 1

        # ── Signal 5: Local texture variability (speckle) ───────────────────
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        diff    = cv2.absdiff(gray, blurred).astype(np.float32)
        tex_std = float(np.std(diff))
        if 7 <= tex_std <= 65:
            score += 1

        # ── Signal 6: Edge density (moderate edges expected) ─────────────────
        edges = cv2.Canny(gray, 30, 100)
        edge_density = float(np.sum(edges > 0)) / total_pixels
        if 0.02 <= edge_density <= 0.40:
            score += 1

        # ── Signal 7: Mid-tone ratio quality gate ────────────────────────────
        # Reward images that have a healthy scan area (25-70 % mid-tone).
        if 0.25 <= mid_tone_ratio <= 0.85:
            score += 1

        print(
            f"[UltrasoundCheck] score={score}/7 | "
            f"sat={mean_sat:.1f} ch_diff={max_ch_diff:.1f} "
            f"mid={mid_tone_ratio:.2f} dark={dark_ratio:.2f} "
            f"tex={tex_std:.1f} edge={edge_density:.3f}"
        )
        return score >= 4

    except Exception as exc:
        print(f"[UltrasoundCheck] Error: {exc} — defaulting to reject")
        return False  # Fail-safe: reject rather than allow through




def preprocess_image(filepath: str, target_size: Tuple[int, int] = (380, 380)) -> np.ndarray:
    """Preprocess image for PCOS classification model (EfficientNetB4)."""
    try:
        # Load image using PIL
        image = Image.open(filepath)
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image to EfficientNetB4 input size
        image = image.resize(target_size, Image.Resampling.LANCZOS)
        
        # Convert to numpy array
        image = np.array(image, dtype=np.float32)
        
        # Normalize pixel values to [0, 1]
        image = image / 255.0
        
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
        # Simple enhancement - increase contrast using numpy
        if len(image.shape) == 4:
            image = image.squeeze(0)
        
        # Simple contrast stretching
        img_min = image.min()
        img_max = image.max()
        if img_max > img_min:
            image = (image - img_min) / (img_max - img_min)
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
