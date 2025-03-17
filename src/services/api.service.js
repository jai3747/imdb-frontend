
// src/services/api.service.js
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

// Create axios instance with interceptors for better error handling
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
apiClient.interceptors.response.use(
  response => {
    console.log(`API Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  error => {
    // Handle 304 Not Modified as a successful response
    if (error.response && error.response.status === 304) {
      console.log(`API Response from ${error.config.url}: Status 304 (Not Modified) - treating as success`);
      return Promise.resolve({ data: { status: "success" }, status: 304 });
    }
    
    if (error.response) {
      console.error(`API Error from ${error.config.url}: Status ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('API Error: No response received', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

const apiService = {
  // Health check methods
  checkHealth: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.HEALTH);
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw new Error(error.response?.data?.message || 'Health check failed');
    }
  },

  checkApiStatus: async (endpoint) => {
    console.log(`Checking API status for endpoint: ${endpoint}`);
    try {
      const response = await apiClient.get(endpoint);
      console.log(`Status response for ${endpoint}:`, response.data);
      
      // Consider any successful response (including 304) as success
      if (response.status === 200 || response.status === 304) {
        return { status: "success" };
      }
      
      // If the response has a status field, use that
      if (response.data && response.data.status) {
        return { status: response.data.status === "ok" ? "success" : "error" };
      }
      
      return { status: "success" };
    } catch (error) {
      // If it's a 304, consider it a success
      if (error.response && error.response.status === 304) {
        return { status: "success" };
      }
      console.error(`API status check failed for ${endpoint}:`, error);
      return { status: "error" };
    }
  },

  // Movie methods
  getMovies: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.MOVIES);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      throw new Error(error.response?.data?.message || 'Failed to fetch movies');
    }
  },

  getMovie: async (id) => {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.MOVIES}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch movie ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to fetch movie');
    }
  },

  addMovie: async (movieData) => {
    try {
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.MOVIES}/add-movie`, movieData);
      return response.data;
    } catch (error) {
      console.error("Failed to add movie:", error);
      throw new Error(error.response?.data?.message || 'Failed to add movie');
    }
  },

  updateMovie: async (id, movieData) => {
    try {
      const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.MOVIES}/edit-movie/${id}`, movieData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update movie ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to update movie');
    }
  },

  deleteMovie: async (id) => {
    try {
      const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.MOVIES}/delete-movie/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete movie ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to delete movie');
    }
  },

  // Actor methods
  getActors: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.ACTORS);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch actors:", error);
      throw new Error(error.response?.data?.message || 'Failed to fetch actors');
    }
  },

  getActor: async (id) => {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.ACTORS}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch actor ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to fetch actor');
    }
  },

  addActor: async (actorData) => {
    try {
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.ACTORS}/add-actor`, actorData);
      return response.data;
    } catch (error) {
      console.error("Failed to add actor:", error);
      throw new Error(error.response?.data?.message || 'Failed to add actor');
    }
  },

  updateActor: async (id, actorData) => {
    try {
      const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.ACTORS}/edit-actor/${id}`, actorData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update actor ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to update actor');
    }
  },

  deleteActor: async (id) => {
    try {
      const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.ACTORS}/delete-actor/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete actor ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to delete actor');
    }
  },

  // Producer methods
  getProducers: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.PRODUCERS);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch producers:", error);
      throw new Error(error.response?.data?.message || 'Failed to fetch producers');
    }
  },

  getProducer: async (id) => {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.PRODUCERS}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch producer ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to fetch producer');
    }
  },

  addProducer: async (producerData) => {
    try {
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.PRODUCERS}/add-producer`, producerData);
      return response.data;
    } catch (error) {
      console.error("Failed to add producer:", error);
      throw new Error(error.response?.data?.message || 'Failed to add producer');
    }
  },

  updateProducer: async (id, producerData) => {
    try {
      const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.PRODUCERS}/edit-producer/${id}`, producerData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update producer ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to update producer');
    }
  },

  deleteProducer: async (id) => {
    try {
      const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.PRODUCERS}/delete-producer/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete producer ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to delete producer');
    }
  },

  // Generic methods
  get: async (endpoint) => {
    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`GET request failed for ${endpoint}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to fetch data');
    }
  },

  post: async (endpoint, data) => {
    try {
      const response = await apiClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`POST request failed for ${endpoint}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to post data');
    }
  },

  put: async (endpoint, data) => {
    try {
      const response = await apiClient.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`PUT request failed for ${endpoint}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to update data');
    }
  },

  delete: async (endpoint) => {
    try {
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error(`DELETE request failed for ${endpoint}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to delete data');
    }
  }
};

export default apiService;
