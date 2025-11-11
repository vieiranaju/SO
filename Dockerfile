FROM python:3.11-slim

# Prevents Python from writing .pyc files and enables stdout/stderr flushing
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

WORKDIR /app

# system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# copy and install requirements
COPY requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip && pip install --no-cache-dir -r /app/requirements.txt

# copy app
COPY . /app

EXPOSE 8000

ENV DATABASE_URL="postgresql://postgres:postgres@db:5432/postgres"

# Run uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
