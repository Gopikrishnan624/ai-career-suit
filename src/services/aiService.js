import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AUTH_EXPIRED_EVENT = 'auth-expired';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to ALL requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Request interceptor - Token present:', !!token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No token found in localStorage');
  }

  // For FormData, don't set Content-Type - axios will add multipart/form-data with boundary
  // For other requests, default to JSON
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error || '';

    if (status === 401 && /jwt expired|invalid token/i.test(message)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.setItem('authMessage', 'Your session expired. Please log in again.');
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }

    return Promise.reject(error);
  }
);

export const analyzeResume = (file) => {
  const formData = new FormData();
  formData.append('resume', file); // match multer field name in backend
  // The interceptor will handle Content-Type properly for FormData
  return apiClient.post('/ai/resume', formData);
};

export const chatWithResume = (data) => {
  return apiClient.post('/ai/resume/chat', data);
};

export const recommendJobsFromResume = (data) => {
  return apiClient.post('/ai/resume/recommend-jobs', data);
};

export const createResumeWithAI = (data) => {
  return apiClient.post('/ai/resume/create', data);
};

export const simulateCareer = (data) => {
  return apiClient.post('/ai/simulator', data);
};

export const generateInterviewQuestions = (data) => {
  return apiClient.post('/ai/interview/generate', data);
};

export const scoreInterviewAnswer = (data) => {
  return apiClient.post('/ai/interview/score', data);
};

export const register = (userData) => {
  return apiClient.post('/auth/register', userData);
};

export const login = (credentials) => {
  return apiClient.post('/auth/login', credentials);
};

export const getAnalyses = () => {
  return apiClient.get('/ai/analyses');
};

export default apiClient;
