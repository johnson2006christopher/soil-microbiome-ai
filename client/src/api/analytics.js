import axiosClient from './axiosClient';

export const getDashboardStats = (farmId) =>
  axiosClient.get('/api/analytics/dashboard', { params: { farmId } }).then(r => r.data);

export const getModelPerformance = () =>
  axiosClient.get('/api/analytics/model-performance').then(r => r.data);

export const getPredictionAccuracy = (farmId) =>
  axiosClient.get('/api/analytics/prediction-accuracy', { params: { farmId } }).then(r => r.data);
