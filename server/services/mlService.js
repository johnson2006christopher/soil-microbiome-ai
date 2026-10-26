const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const mlPredict = axios.create({
  baseURL: process.env.ML_ENGINE_URL || 'http://localhost:8000',
  timeout: 30000,
});

const mlTrain = axios.create({
  baseURL: process.env.ML_ENGINE_URL || 'http://localhost:8000',
  timeout: 600000,
});

if (process.env.ML_ENGINE_API_KEY) {
  mlPredict.defaults.headers.common['X-Internal-Key'] = process.env.ML_ENGINE_API_KEY;
  mlTrain.defaults.headers.common['X-Internal-Key'] = process.env.ML_ENGINE_API_KEY;
}

// Turn an ML engine failure into an error that is safe to show to users.
// 4xx from the engine carries a user-facing detail (e.g. model not available).
function userFacingError(err, fallback) {
  const status = err.response?.status;
  const detail = err.response?.data?.detail;
  const error = new Error(
    status && status < 500 && typeof detail === 'string'
      ? detail
      : 'The AI service is temporarily unavailable. Please try again in a moment.'
  );
  error.status = status && status < 500 ? 422 : 503;
  error.expose = true;
  error.cause = `${fallback}: ${detail || err.message}`;
  return error;
}

const mlService = {
  async predictYield(sensorData) {
    try {
      const { data } = await mlPredict.post('/tabular/predict', sensorData);
      return data;
    } catch (err) {
      throw userFacingError(err, 'Yield prediction failed');
    }
  },

  async analyzeImage(imageBuffer, filename, datasetType) {
    try {
      const form = new FormData();
      form.append('file', imageBuffer, { filename, contentType: 'image/jpeg' });
      const { data } = await mlPredict.post(
        `/image/predict?dataset_type=${datasetType}`,
        form,
        { headers: form.getHeaders() }
      );
      return data;
    } catch (err) {
      throw userFacingError(err, 'Image analysis failed');
    }
  },

  async getTabularMetrics() {
    try {
      const { data } = await mlPredict.get('/tabular/metrics');
      return data;
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw new Error(`Failed to get tabular metrics: ${err.message}`);
    }
  },

  async getCNNMetrics() {
    try {
      const { data } = await mlPredict.get('/image/metrics');
      return data;
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw new Error(`Failed to get CNN metrics: ${err.message}`);
    }
  },

  async getModelsStatus() {
    try {
      const { data } = await mlPredict.get('/models/status');
      return data;
    } catch (err) {
      throw new Error(`Failed to get models status: ${err.message}`);
    }
  },

  async getTrainingStatus() {
    try {
      const { data } = await mlPredict.get('/training/status');
      return data;
    } catch (err) {
      if (err.response?.status === 404) return { status: 'idle' };
      throw new Error(`Failed to get training status: ${err.message}`);
    }
  },

  async trainTabular() {
    try {
      const { data } = await mlTrain.post('/tabular/train');
      return data;
    } catch (err) {
      throw new Error(`Failed to start tabular training: ${err.message}`);
    }
  },

  async trainCNN() {
    try {
      const { data } = await mlTrain.post('/image/train');
      return data;
    } catch (err) {
      throw new Error(`Failed to start CNN training: ${err.message}`);
    }
  },

  async trainAll() {
    try {
      const { data } = await mlTrain.post('/train/all');
      return data;
    } catch (err) {
      throw new Error(`Failed to start full training: ${err.message}`);
    }
  },

  async getFeatures() {
    try {
      const { data } = await mlPredict.get('/tabular/features');
      return data;
    } catch (err) {
      throw new Error(`Failed to get features: ${err.message}`);
    }
  },
};

module.exports = mlService;
