# ========================================================
# SAITO Control — Free Fire Level Up Bot Dockerfile
# Optimized for Render Web Service (Python 3.11 with TCP/UDP & aiohttp)
# ========================================================
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=10000

# Install system build dependencies required for pycryptodome & sockets
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirement definitions
COPY requirements.txt ./requirements.txt

# Install python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy all project files into container
COPY . ./

# Expose HTTP API port for Render
EXPOSE 10000

# Health check to ensure aiohttp is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-10000}/api/stats || exit 1

# Start the bot automation engine and web server
CMD ["python", "lc.py"]
