import tensorflow as tf
import os

model_path = r"c:\ovacare\backend\models\pcod_training\outputs\checkpoints\best_model_phase3.h5"
tflite_path = r"c:\ovacare\backend\models\pcod_training\outputs\checkpoints\best_model_phase3.tflite"

print("Loading model...")
model = tf.keras.models.load_model(model_path, compile=False)

print("Converting to TFLite...")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
# Optional: Quantize to make it even smaller (drops size to ~50MB)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

print("Saving TFLite model...")
with open(tflite_path, 'wb') as f:
    f.write(tflite_model)

print(f"Success! TFLite model size: {os.path.getsize(tflite_path) / (1024*1024):.2f} MB")
