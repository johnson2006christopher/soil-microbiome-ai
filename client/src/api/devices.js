import axiosClient from './axiosClient';

export const getDevices = (farmId) =>
  axiosClient.get('/api/devices', { params: { farmId } }).then(r => r.data);

export const createDevice = (data) =>
  axiosClient.post('/api/devices', data).then(r => r.data);

export const updateDevice = (id, data) =>
  axiosClient.put(`/api/devices/${id}`, data).then(r => r.data);

export const deleteDevice = (id) =>
  axiosClient.delete(`/api/devices/${id}`).then(r => r.data);

export const simulateReading = (id) =>
  axiosClient.get(`/api/devices/${id}/simulate`).then(r => r.data);

export const sendSimulatedReading = (id) =>
  axiosClient.post(`/api/devices/${id}/simulate-reading`).then(r => r.data);
