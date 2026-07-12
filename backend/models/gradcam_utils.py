"""Grad-CAM utilities for ultrasound classification explainability."""

from __future__ import annotations

import base64
from dataclasses import dataclass
from typing import Optional

import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras import Model


@dataclass
class GradCAMResult:
    heatmap: np.ndarray
    overlay: np.ndarray
    heatmap_data_url: str
    overlay_data_url: str
    layer_name: str


class GradCAMExplainer:
    """Generate Grad-CAM overlays for a loaded Keras model."""

    binary_threshold = 0.7

    def __init__(self, model: tf.keras.Model, layer_name: Optional[str] = None):
        self.model = model
        self.layer_name = layer_name or self._find_target_layer_name()
        self.grad_model = self._build_grad_model()

    def _iter_layers(self, layer: tf.keras.layers.Layer):
        yield layer
        if hasattr(layer, "layers"):
            for nested_layer in layer.layers:
                yield from self._iter_layers(nested_layer)

    def _find_target_layer_name(self) -> str:
        preferred_patterns = (
            "top_conv",
            "block7a_expand_conv",
            "block7a_project_conv",
            "block6a_expand_conv",
            "conv5_block3_out",
            "mixed10",
            "block_16_project",
            "block_16_depthwise",
            "conv",
        )

        candidate_layers = []
        for layer in self._iter_layers(self.model):
            layer_output = getattr(layer, "output", None)
            layer_shape = getattr(layer_output, "shape", None)
            rank = getattr(layer_shape, "rank", None)
            if rank is None and layer_shape is not None:
                try:
                    rank = len(layer_shape)
                except TypeError:
                    rank = None
            if rank is not None and rank >= 4:
                candidate_layers.append(layer)

        for pattern in preferred_patterns:
            for layer in reversed(candidate_layers):
                if pattern in layer.name.lower():
                    return layer.name

        for layer in reversed(candidate_layers):
            if "conv" in layer.name.lower() or "activation" in layer.name.lower():
                return layer.name

        return candidate_layers[-1].name if candidate_layers else self.model.layers[-1].name

    def _get_layer_by_name(self, layer_name: str):
        for layer in self._iter_layers(self.model):
            if layer.name == layer_name:
                return layer
        raise ValueError(f"Grad-CAM layer not found: {layer_name}")

    def _build_grad_model(self) -> Model:
        target_layer = self._get_layer_by_name(self.layer_name)
        return Model(inputs=self.model.inputs, outputs=[target_layer.output, self.model.output])

    @staticmethod
    def _ensure_batch(image: np.ndarray) -> np.ndarray:
        return np.expand_dims(image, axis=0) if image.ndim == 3 else image

    @staticmethod
    def _load_original_image(original_image_path: Optional[str], fallback_image: np.ndarray) -> np.ndarray:
        if original_image_path:
            original_bgr = cv2.imread(original_image_path)
            if original_bgr is not None:
                return cv2.cvtColor(original_bgr, cv2.COLOR_BGR2RGB)

        image = fallback_image
        if image.ndim == 4:
            image = image[0]

        if image.dtype.kind in "fc" and (image.min() < -0.5 or image.max() > 1.5):
            mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
            std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
            image = (image * std) + mean

        image = np.clip(image, 0.0, 1.0)
        return (image * 255).astype(np.uint8)

    @staticmethod
    def _image_to_data_url(image: np.ndarray) -> str:
        success, buffer = cv2.imencode(".png", cv2.cvtColor(image, cv2.COLOR_RGB2BGR))
        if not success:
            raise ValueError("Failed to encode Grad-CAM image")
        encoded = base64.b64encode(buffer.tobytes()).decode("ascii")
        return f"data:image/png;base64,{encoded}"

    def generate(
        self,
        image: np.ndarray,
        original_image_path: Optional[str] = None,
        alpha: float = 0.42,
        class_idx: Optional[int] = None,
    ) -> GradCAMResult:
        image_batch = self._ensure_batch(image)

        with tf.GradientTape() as tape:
            conv_outputs, predictions = self.grad_model(image_batch)

            if predictions.shape[-1] == 1:
                if class_idx is None:
                    class_idx = int(predictions[0, 0] >= self.binary_threshold)
                loss = predictions[:, 0] if class_idx == 1 else 1.0 - predictions[:, 0]
            else:
                if class_idx is None:
                    class_idx = int(tf.argmax(predictions[0]).numpy())
                loss = predictions[:, class_idx]

        grads = tape.gradient(loss, conv_outputs)

        if grads.shape.rank is None or grads.shape.rank < 2:
            raise ValueError("Grad-CAM requires a spatial feature map tensor")

        reduce_axes = tuple(range(grads.shape.rank - 1))
        pooled_grads = tf.reduce_mean(grads, axis=reduce_axes)

        conv_outputs = conv_outputs[0]
        heatmap = tf.reduce_sum(tf.multiply(pooled_grads, conv_outputs), axis=-1)
        heatmap = tf.maximum(heatmap, 0)

        max_value = tf.reduce_max(heatmap)
        heatmap = heatmap / tf.maximum(max_value, tf.keras.backend.epsilon())
        heatmap = heatmap.numpy()

        original_image = self._load_original_image(original_image_path, image_batch)
        original_height, original_width = original_image.shape[:2]
        heatmap = cv2.resize(heatmap, (original_width, original_height))

        heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap), cv2.COLORMAP_JET)
        heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

        overlay = cv2.addWeighted(original_image, 1.0 - alpha, heatmap_colored, alpha, 0)

        return GradCAMResult(
            heatmap=heatmap,
            overlay=overlay,
            heatmap_data_url=self._image_to_data_url(heatmap_colored),
            overlay_data_url=self._image_to_data_url(overlay),
            layer_name=self.layer_name,
        )