# ── ForeignEdge Backend Dockerfile ──────────────────────────────────────────
# Python 3.12 slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend files
COPY . .

# Expose port 8080
EXPOSE 8080

# Environment variables
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Run with Gunicorn (production WSGI server)
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8080", "--workers", "2", "--timeout", "120"]
