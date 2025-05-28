FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

WORKDIR /app

# Set environment variables to avoid interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Update package lists and install dependencies
RUN apt-get update \
    && apt-get install -y --fix-missing \
        software-properties-common \
        python3.10 \
        python3.10-dev \
        python3.10-distutils \
        python3-pip \
        libgl1-mesa-glx \
        libglib2.0-0 \
        git \
        curl \
        wget \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /usr/bin/python3.10 /usr/bin/python3 \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && ln -sf /usr/bin/pip3 /usr/bin/pip

# Install Rust and cargo (required for building tokenizers)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Upgrade pip to the latest version
RUN pip install --upgrade pip

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download DWPose models for easy_dwpose
RUN mkdir -p /app/models/controlnet && \
    wget -P /app/models/controlnet https://huggingface.co/yzd-v/DWPose/resolve/main/dw-ll_ucoco_384.onnx && \
    wget -P /app/models/controlnet https://huggingface.co/yzd-v/DWPose/resolve/main/yolox_l.onnx

# Copy the application code
COPY . .

# Command to run the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]