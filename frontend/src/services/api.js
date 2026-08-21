import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Automatically attach the JWT bearer token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token has expired/is invalid, bounce back to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth endpoints ---
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// --- Task endpoints ---
export const getTasks = (params) => API.get('/tasks', { params });
export const getTaskById = (id) => API.get(`/tasks/${id}`);

export const createTask = (formData) =>
  API.post('/tasks', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateTask = (id, formData) =>
  API.put(`/tasks/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const deleteTask = (id) => API.delete(`/tasks/${id}`);

export const getWeather = (city) => API.get(`/tasks/weather/${encodeURIComponent(city)}`);

export default API;
