FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN mkdir -p data/soil data/tomato data/corn model/artifacts/tabular model/artifacts/cnn
# Bind IPv6 too: Railway's private network is IPv6-only
CMD ["uvicorn", "main:app", "--host", "::", "--port", "8000"]
