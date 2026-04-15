import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Menu Items
export const getMenuItems = () => api.get('/api/menu-items').then(r => r.data);
export const getCategories = () => api.get('/api/menu-items/categories').then(r => r.data);
export const createMenuItem = (data) => api.post('/api/menu-items', data).then(r => r.data);
export const updateMenuItem = (id, data) => api.put(`/api/menu-items/${id}`, data).then(r => r.data);
export const deleteMenuItem = (id) => api.delete(`/api/menu-items/${id}`).then(r => r.data);

// Bills
export const createBill = (data) => api.post('/api/bills', data).then(r => r.data);
export const getBills = () => api.get('/api/bills').then(r => r.data);
export const getBill = (id) => api.get(`/api/bills/${id}`).then(r => r.data);
export const downloadBillPdf = (id) => {
  const url = `${API_URL}/api/bills/${id}/pdf`;
  window.open(url, '_blank');
};

export default api;
