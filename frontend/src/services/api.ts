import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }
    
    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// API utility functions
export const api = {
  // GET request
  get: <T>(url: string, config?: any): Promise<any> => {
    return apiClient.get<T>(url, config);
  },
  
  // POST request
  post: <T>(url: string, data?: any, config?: any): Promise<any> => {
    return apiClient.post<T>(url, data, config);
  },
  
  // PUT request
  put: <T>(url: string, data?: any, config?: any): Promise<any> => {
    return apiClient.put<T>(url, data, config);
  },
  
  // DELETE request
  delete: <T>(url: string, config?: any): Promise<any> => {
    return apiClient.delete<T>(url, config);
  },
  
  // PATCH request
  patch: <T>(url: string, data?: any, config?: any): Promise<any> => {
    return apiClient.patch<T>(url, data, config);
  },
};

// Health check function
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

export default apiClient; 