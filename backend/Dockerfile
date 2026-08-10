# ── Base image ────────────────────────────────────────────────────────────────
# Python 3.10 slim keeps the image small while still being compatible with TF.
FROM python:3.10-slim

# ── System dependencies for OpenCV & TensorFlow ───────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Python dependencies ───────────────────────────────────────────────────────
# Copy requirements first so Docker can cache this layer.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Application code ──────────────────────────────────────────────────────────
COPY . .

# ── Download the PCOS model from Hugging Face Hub at build time ───────────────
# The model is stored as a private/public HF model repo because .h5 files
# are excluded from the main GitHub repo (.gitignore: **/*.h5).
# Set HF_MODEL_REPO to your HF model repo ID, e.g. "ridmii/ovacare-model"
ARG HF_MODEL_REPO
RUN if [ -n "$HF_MODEL_REPO" ]; then \
    pip install --no-cache-dir huggingface_hub && \
    python -c "from huggingface_hub import hf_hub_download; \
               import os; \
               path = hf_hub_download(repo_id='${HF_MODEL_REPO}', filename='best_model_phase3.h5'); \
               os.makedirs('models/pcod_training/outputs/checkpoints', exist_ok=True); \
               import shutil; shutil.copy(path, 'models/pcod_training/outputs/checkpoints/best_model_phase3.h5')"; \
    fi

# ── Runtime setup ─────────────────────────────────────────────────────────────
RUN mkdir -p uploads

# Hugging Face Spaces requires the app to listen on port 7860.
EXPOSE 7860

ENV FLASK_ENV=production
ENV FLASK_DEBUG=False
ENV FLASK_PORT=7860

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:7860", "--timeout", "180", "--workers", "1", "--preload"]
