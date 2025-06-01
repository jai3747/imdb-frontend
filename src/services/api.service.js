// // src/services/api.service.js
// import axios from 'axios';
// import { API_CONFIG, getDirectBaseURL } from '../config/api.config';

// // Create axios instance with proper configuration for CORS
// const apiClient = axios.create({
//   baseURL: API_CONFIG.BASE_URL,
//   timeout: API_CONFIG.TIMEOUT,
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json'
//   },
//   withCredentials: false // Keep false to avoid CORS preflight issues
// });

// // Create a separate client for direct API calls (non /api routes)
// const directApiClient = axios.create({
//   baseURL: getDirectBaseURL(),
//   timeout: API_CONFIG.TIMEOUT,
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json'
//   },
//   withCredentials: false
// });

// // Add request interceptor for logging and debugging
// const setupInterceptors = (client, clientName = 'API') => {
//   client.interceptors.request.use(
//     config => {
//       const url = config.baseURL + config.url;
//       console.log(`🚀 ${clientName} Request: ${config.method?.toUpperCase()} ${url}`);
      
//       // Add timestamp to help with debugging
//       config.metadata = { startTime: new Date() };
      
//       return config;
//     },
//     error => {
//       console.error(`❌ ${clientName} Request Error:`, error);
//       return Promise.reject(error);
//     }
//   );

//   client.interceptors.response.use(
//     response => {
//       const duration = new Date() - response.config.metadata.startTime;
//       const url = response.config.baseURL + response.config.url;
      
//       console.log(`✅ ${clientName} Response: ${response.config.method?.toUpperCase()} ${url} - Status: ${response.status} (${duration}ms)`);
      
//       return response;
//     },
//     error => {
//       const duration = error.config?.metadata ? new Date() - error.config.metadata.startTime : 0;
//       const url = error.config ? error.config.baseURL + error.config.url : 'unknown';
      
//       // Handle different types of errors
//       if (error.response) {
//         // Server responded with error status
//         console.error(`❌ ${clientName} Error: ${error.config?.method?.toUpperCase()} ${url} - Status: ${error.response.status} (${duration}ms)`, error.response.data);
//       } else if (error.request) {
//         // Request was made but no response received (likely CORS)
//         console.error(`🔌 ${clientName} Network/CORS Error: ${error.config?.method?.toUpperCase()} ${url} - No response received (${duration}ms)`);
//         console.error('This is likely a CORS issue or server is not running. Request details:', {
//           url: url,
//           method: error.config?.method,
//           timeout: error.config?.timeout,
//           headers: error.config?.headers
//         });
//       } else {
//         // Something happened in setting up the request
//         console.error(`⚙️ ${clientName} Setup Error: ${error.message}`);
//       }
      
//       return Promise.reject(error);
//     }
//   );
// };

// // Setup interceptors for both clients
// setupInterceptors(apiClient, 'API');
// setupInterceptors(directApiClient, 'Direct');

// const apiService = {
//   // Health check methods - Try both direct and API routes
//   checkHealth: async () => {
//     try {
//       console.log('🏥 Checking API health...');
      
//       // Try the /api/health endpoint first
//       try {
//         const response = await apiClient.get(API_CONFIG.ENDPOINTS.HEALTH);
//         console.log('✅ Health check successful (API route):', response.data);
//         return response.data;
//       } catch (apiError) {
//         console.log('⚠️ API route failed, trying direct route...');
        
//         // Fallback to direct /health endpoint
//         const response = await directApiClient.get('/health');
//         console.log('✅ Health check successful (Direct route):', response.data);
//         return response.data;
//       }
//     } catch (error) {
//       console.error("❌ Health check failed:", error);
      
//       // Provide more specific error handling for CORS issues
//       if (error.code === 'ERR_NETWORK' || !error.response) {
//         throw new Error('Network error - Backend server might not be running or CORS issue. Check if backend server is running on http://localhost:5000');
//       }
      
//       throw new Error(error.response?.data?.message || 'Health check failed');
//     }
//   },

//   // Movie methods
//   getMovies: async () => {
//     try {
//       console.log('🎬 Fetching movies...');
//       let response;
//       try {
//         response = await apiClient.get(API_CONFIG.ENDPOINTS.MOVIES);
//       } catch (apiError) {
//         console.log('⚠️ API route failed, trying direct route...');
//         response = await directApiClient.get('/movies');
//       }
//       console.log('✅ Movies fetched successfully:', response.data?.length || 'unknown count');
//       return response.data;
//     } catch (error) {
//       console.error("❌ Failed to fetch movies:", error);
//       throw new Error(error.response?.data?.message || 'Failed to fetch movies');
//     }
//   },

//   getMovie: async (id) => {
//     try {
//       console.log(`🎬 Fetching movie with ID: ${id}`);
//       let response;
//       try {
//         response = await apiClient.get(`${API_CONFIG.ENDPOINTS.MOVIES}/${id}`);
//       } catch (apiError) {
//         response = await directApiClient.get(`/movies/${id}`);
//       }
//       console.log(`✅ Movie ${id} fetched successfully`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Failed to fetch movie ${id}:`, error);
//       throw new Error(error.response?.data?.message || `Failed to fetch movie ${id}`);
//     }
//   },

//   addMovie: async (movieData) => {
//     try {
//       console.log('🎬 Adding new movie:', movieData?.title || 'unknown title');
//       let response;
//       try {
//         response = await apiClient.post(`${API_CONFIG.ENDPOINTS.MOVIES}/add-movie`, movieData);
//       } catch (apiError) {
//         response = await directApiClient.post('/movies/add-movie', movieData);
//       }
//       console.log('✅ Movie added successfully');
//       return response.data;
//     } catch (error) {
//       console.error("❌ Failed to add movie:", error);
//       throw new Error(error.response?.data?.message || 'Failed to add movie');
//     }
//   },

//   updateMovie: async (id, movieData) => {
//     try {
//       console.log(`🎬 Updating movie ${id}:`, movieData?.title || 'unknown title');
//       let response;
//       try {
//         response = await apiClient.put(`${API_CONFIG.ENDPOINTS.MOVIES}/edit-movie/${id}`, movieData);
//       } catch (apiError) {
//         response = await directApiClient.put(`/movies/edit-movie/${id}`, movieData);
//       }
//       console.log(`✅ Movie ${id} updated successfully`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Failed to update movie ${id}:`, error);
//       throw new Error(error.response?.data?.message || `Failed to update movie ${id}`);
//     }
//   },

//   deleteMovie: async (id) => {
//     try {
//       console.log(`🎬 Deleting movie ${id}`);
//       let response;
//       try {
//         response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.MOVIES}/delete-movie/${id}`);
//       } catch (apiError) {
//         response = await directApiClient.delete(`/movies/delete-movie/${id}`);
//       }
//       console.log(`✅ Movie ${id} deleted successfully`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Failed to delete movie ${id}:`, error);
//       throw new Error(error.response?.data?.message || `Failed to delete movie ${id}`);
//     }
//   },

//   // Actor methods
//   getActors: async () => {
//     try {
//       console.log('🎭 Fetching actors...');
//       let response;
//       try {
//         response = await apiClient.get(API_CONFIG.ENDPOINTS.ACTORS);
//       } catch (apiError) {
//         response = await directApiClient.get('/actors');
//       }
//       console.log('✅ Actors fetched successfully:', response.data?.length || 'unknown count');
//       return response.data;
//     } catch (error) {
//       console.error("❌ Failed to fetch actors:", error);
//       throw new Error(error.response?.data?.message || 'Failed to fetch actors');
//     }
//   },

//   getActor: async (id) => {
//     try {
//       console.log(`🎭 Fetching actor with ID: ${id}`);
//       let response;
//       try {
//         response = await apiClient.get(`${API_CONFIG.ENDPOINTS.ACTORS}/${id}`);
//       } catch (apiError) {
//         response = await directApiClient.get(`/actors/${id}`);
//       }
//       console.log(`✅ Actor ${id} fetched successfully`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Failed to fetch actor ${id}:`, error);
//       throw new Error(error.response?.data?.message || `Failed to fetch actor ${id}`);
//     }
//   },

//   addActor: async (actorData) => {
//     try {
//       console.log('🎭 Adding new actor:', actorData?.name || 'unknown name');
//       let response;
//       try {
//         response = await apiClient.post(`${API_CONFIG.ENDPOINTS.ACTORS}/add-actor`, actorData);
//       } catch (apiError) {
//         response = await directApiClient.post('/actors/add-actor', actorData);
//       }
//       console.log('✅ Actor added successfully');
//       return response.data;
//     } catch (error) {
//       console.error("❌ Failed to add actor:", error);
//       throw new Error(error.response?.data?.message || 'Failed to add actor');
//     }
//   },

//   updateActor: async (id, actorData) => {
//     try {
//       console.log(`🎭 Updating actor ${id}:`, actorData?.name || 'unknown name');
//       let response;
//       try {
//         response = await apiClient.put(`${API_CONFIG.ENDPOINTS.ACTORS}/edit-actor/${id}`, actorData);
//       } catch (apiError) {
//         response = await directApiClient.put(`/actors/edit-actor/${id}`, actorData);
//       }
//       console.log(`✅ Actor ${id} updated successfully`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Failed to update actor ${id}:`, error);
//       throw new Error(error.response?.data?.message || `Failed to update actor ${id}`);
//     }
//   },

//   deleteActor: async (id) => {
//     try {
//       console.log(`🎭 Deleting actor ${id}`);
//       let response;
//       try {
//         response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.ACTORS}/delete-actor/${id}`);
//       } catch (apiError) {
//         response = await directApiClient.delete(`/actors/delete-actor/${id}`);
//       }
//       console.log(`✅ Actor ${id} deleted successfully`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Failed to delete actor ${id}:`, error);
//       throw new Error(error.response?.data?.message || `Failed to delete actor ${id}`);
//     }
//   },

//   // Producer methods
//   getProducers: async () => {
//     try {
//       console.log('🎯 Fetching producers...');
//       let response;
//       try {
//         response = await apiClient.get(API_CONFIG.ENDPOINTS.PRODUCERS);
//       } catch (apiError) {
//         response = await directApiClient.get('/producers');
//       }
//       console.log('✅ Producers fetched successfully:', response.data?.length || 'unknown count');
//       return response.data;
//     } catch (error) {
//       console.error("❌ Failed to fetch producers:", error);
//       throw new Error(error.response?.data?.message || 'Failed to fetch producers');
//     }
//   },

//   getProducer: async (id) => {
//     try {
//       console.log(`🎯 Fetching producer with ID: ${id}`);
//       let response;
//       try {
//         response = await apiClient.get(`${API_CONFIG.ENDPOINTS.PRODUCERS}/${id}`);
//       } catch (apiError) {
//         response = await directApiClient.get(`/producers/${id}`);
//       }
//       console.log(`✅ Producer ${id} fetched successfully`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Failed to fetch producer ${id}:`, error);
//       throw new Error(error.response?.data?.message || `Failed to fetch producer ${id}`);
//     }
//   },

//   addProducer: async (producerData) => {
//     try {
//       console.log('🎯 Adding new producer:', producerData?.name || 'unknown name');
//       let response;
//       try {
//         response = await apiClient.post(`${API_CONFIG.ENDPOINTS.PRODUCERS}/add-producer`, producerData);
//       } catch (apiError) {
//         response = await directApiClient.post('/producers/add-producer', producerData);
//       }
//       console.log('✅ Producer added successfully');
//       return response.data;
//     } catch (error) {
//       console.error("❌ Failed to add producer:", error);
//       throw new Error(error.response?.data?.message || 'Failed to add producer');
//     }
//   },

//   updateProducer: async (id, producerData) => {
//     try {
//       console.log(`🎯 Updating producer ${id}:`, producerData?.name || 'unknown name');
//       let response;
//       try {
//         response = await apiClient.put(`${API_CONFIG.ENDPOINTS.PRODUCERS}/edit-producer/${id}`, producerData);
//       } catch (apiError) {
//         response = await directApiClient.put(`/producers/edit-producer/${id}`, producerData);
//       }
//       console.log(`✅ Producer ${id} updated successfully`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Failed to update producer ${id}:`, error);
//       throw new Error(error.response?.data?.message || `Failed to update producer ${id}`);
//     }
//   },

//   deleteProducer: async (id) => {
//     try {
//       console.log(`🎯 Deleting producer ${id}`);
//       let response;
//       try {
//         response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.PRODUCERS}/delete-producer/${id}`);
//       } catch (apiError) {
//         response = await directApiClient.delete(`/producers/delete-producer/${id}`);
//       }
//       console.log(`✅ Producer ${id} deleted successfully`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ Failed to delete producer ${id}:`, error);
//       throw new Error(error.response?.data?.message || `Failed to delete producer ${id}`);
//     }
//   },

//   // Generic HTTP methods with fallback
//   get: async (endpoint) => {
//     try {
//       console.log(`📡 GET request to: ${endpoint}`);
//       let response;
//       try {
//         response = await apiClient.get(endpoint);
//       } catch (apiError) {
//         response = await directApiClient.get(endpoint);
//       }
//       console.log(`✅ GET request successful for ${endpoint}`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ GET request failed for ${endpoint}:`, error);
//       throw new Error(error.response?.data?.message || 'Failed to fetch data');
//     }
//   },

//   post: async (endpoint, data) => {
//     try {
//       console.log(`📡 POST request to: ${endpoint}`);
//       let response;
//       try {
//         response = await apiClient.post(endpoint, data);
//       } catch (apiError) {
//         response = await directApiClient.post(endpoint, data);
//       }
//       console.log(`✅ POST request successful for ${endpoint}`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ POST request failed for ${endpoint}:`, error);
//       throw new Error(error.response?.data?.message || 'Failed to post data');
//     }
//   },

//   put: async (endpoint, data) => {
//     try {
//       console.log(`📡 PUT request to: ${endpoint}`);
//       let response;
//       try {
//         response = await apiClient.put(endpoint, data);
//       } catch (apiError) {
//         response = await directApiClient.put(endpoint, data);
//       }
//       console.log(`✅ PUT request successful for ${endpoint}`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ PUT request failed for ${endpoint}:`, error);
//       throw new Error(error.response?.data?.message || 'Failed to update data');
//     }
//   },

//   delete: async (endpoint) => {
//     try {
//       console.log(`📡 DELETE request to: ${endpoint}`);
//       let response;
//       try {
//         response = await apiClient.delete(endpoint);
//       } catch (apiError) {
//         response = await directApiClient.delete(endpoint);
//       }
//       console.log(`✅ DELETE request successful for ${endpoint}`);
//       return response.data;
//     } catch (error) {
//       console.error(`❌ DELETE request failed for ${endpoint}:`, error);
//       throw new Error(error.response?.data?.message || 'Failed to delete data');
//     }
//   }
// };

// export default apiService;
// src/services/api.service.js
import axios from 'axios';
import { API_CONFIG, getDirectBaseURL, getAPIBaseURL, logAPIConfig } from '../config/api.config';

// Log configuration on startup
logAPIConfig();

// Create axios instance with proper configuration for CORS
const apiClient = axios.create({
  baseURL: getAPIBaseURL(),
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
});

// Create a separate client for direct API calls (non /api routes)
const directApiClient = axios.create({
  baseURL: getDirectBaseURL(),
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
});

// Enhanced request interceptor with retry logic
const setupInterceptors = (client, clientName = 'API') => {
  client.interceptors.request.use(
    config => {
      const fullUrl = config.baseURL + config.url;
      console.log(`🚀 ${clientName} Request: ${config.method?.toUpperCase()} ${fullUrl}`);
      
      config.metadata = { startTime: new Date() };
      return config;
    },
    error => {
      console.error(`❌ ${clientName} Request Error:`, error);
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    response => {
      const duration = new Date() - response.config.metadata.startTime;
      const fullUrl = response.config.baseURL + response.config.url;
      
      console.log(`✅ ${clientName} Response: ${response.config.method?.toUpperCase()} ${fullUrl} - Status: ${response.status} (${duration}ms)`);
      return response;
    },
    error => {
      const duration = error.config?.metadata ? new Date() - error.config.metadata.startTime : 0;
      const fullUrl = error.config ? error.config.baseURL + error.config.url : 'unknown';
      
      if (error.response) {
        console.error(`❌ ${clientName} Error: ${error.config?.method?.toUpperCase()} ${fullUrl} - Status: ${error.response.status} (${duration}ms)`);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error(`🔌 ${clientName} Network Error: ${error.config?.method?.toUpperCase()} ${fullUrl} - No response (${duration}ms)`);
        console.error('Possible CORS issue or server not running. Request details:', {
          url: fullUrl,
          method: error.config?.method,
          timeout: error.config?.timeout
        });
      } else {
        console.error(`⚙️ ${clientName} Setup Error: ${error.message}`);
      }
      
      return Promise.reject(error);
    }
  );
};

// Setup interceptors for both clients
setupInterceptors(apiClient, 'API');
setupInterceptors(directApiClient, 'Direct');

// Enhanced request method with automatic fallback
const makeRequest = async (method, endpoint, data = null, options = {}) => {
  const { useDirectFirst = false, retries = API_CONFIG.RETRY_ATTEMPTS } = options;
  
  const clients = useDirectFirst ? [directApiClient, apiClient] : [apiClient, directApiClient];
  const clientNames = useDirectFirst ? ['Direct', 'API'] : ['API', 'Direct'];
  
  for (let clientIndex = 0; clientIndex < clients.length; clientIndex++) {
    const client = clients[clientIndex];
    const clientName = clientNames[clientIndex];
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 Attempting ${method.toUpperCase()} ${endpoint} via ${clientName} client (attempt ${attempt + 1})`);
        
        let response;
        switch (method.toLowerCase()) {
          case 'get':
            response = await client.get(endpoint);
            break;
          case 'post':
            response = await client.post(endpoint, data);
            break;
          case 'put':
            response = await client.put(endpoint, data);
            break;
          case 'delete':
            response = await client.delete(endpoint);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }
        
        console.log(`✅ ${method.toUpperCase()} ${endpoint} successful via ${clientName}`);
        return response.data;
        
      } catch (error) {
        console.warn(`⚠️ ${method.toUpperCase()} ${endpoint} failed via ${clientName} (attempt ${attempt + 1}):`, error.message);
        
        // If this is the last attempt with the last client, throw the error
        if (clientIndex === clients.length - 1 && attempt === retries) {
          throw error;
        }
        
        // If not the last attempt with current client, wait before retry
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
  }
};

const apiService = {
  // Health check - Enhanced with better error handling
  checkHealth: async () => {
    try {
      console.log('🏥 Checking API health...');
      
      // Try API route first, then direct route
      const healthData = await makeRequest('get', API_CONFIG.ENDPOINTS.HEALTH);
      console.log('✅ Health check successful:', healthData);
      return healthData;
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
      
      // Provide specific error messages based on error type
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const backendUrl = getDirectBaseURL();
        throw new Error(`Cannot connect to backend server at ${backendUrl}. Please ensure the backend is running on port 5000.`);
      }
      
      if (error.response?.status === 404) {
        throw new Error('Health check endpoint not found. Backend API may not be properly configured.');
      }
      
      throw new Error(error.response?.data?.message || `Health check failed: ${error.message}`);
    }
  },

  // Movie methods
  getMovies: async () => {
    try {
      console.log('🎬 Fetching movies...');
      const movies = await makeRequest('get', API_CONFIG.ENDPOINTS.MOVIES);
      console.log(`✅ Fetched ${movies?.length || 0} movies`);
      return movies;
    } catch (error) {
      console.error('❌ Failed to fetch movies:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch movies');
    }
  },

  getMovie: async (id) => {
    try {
      console.log(`🎬 Fetching movie with ID: ${id}`);
      const movie = await makeRequest('get', `${API_CONFIG.ENDPOINTS.MOVIES}/${id}`);
      console.log(`✅ Movie ${id} fetched successfully`);
      return movie;
    } catch (error) {
      console.error(`❌ Failed to fetch movie ${id}:`, error);
      throw new Error(error.response?.data?.message || `Failed to fetch movie ${id}`);
    }
  },

  addMovie: async (movieData) => {
    try {
      console.log('🎬 Adding new movie:', movieData?.title || 'unknown title');
      const result = await makeRequest('post', `${API_CONFIG.ENDPOINTS.MOVIES}/add-movie`, movieData);
      console.log('✅ Movie added successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to add movie:', error);
      throw new Error(error.response?.data?.message || 'Failed to add movie');
    }
  },

  updateMovie: async (id, movieData) => {
    try {
      console.log(`🎬 Updating movie ${id}:`, movieData?.title || 'unknown title');
      const result = await makeRequest('put', `${API_CONFIG.ENDPOINTS.MOVIES}/edit-movie/${id}`, movieData);
      console.log(`✅ Movie ${id} updated successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to update movie ${id}:`, error);
      throw new Error(error.response?.data?.message || `Failed to update movie ${id}`);
    }
  },

  deleteMovie: async (id) => {
    try {
      console.log(`🎬 Deleting movie ${id}`);
      const result = await makeRequest('delete', `${API_CONFIG.ENDPOINTS.MOVIES}/delete-movie/${id}`);
      console.log(`✅ Movie ${id} deleted successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to delete movie ${id}:`, error);
      throw new Error(error.response?.data?.message || `Failed to delete movie ${id}`);
    }
  },

  // Actor methods
  getActors: async () => {
    try {
      console.log('🎭 Fetching actors...');
      const actors = await makeRequest('get', API_CONFIG.ENDPOINTS.ACTORS);
      console.log(`✅ Fetched ${actors?.length || 0} actors`);
      return actors;
    } catch (error) {
      console.error('❌ Failed to fetch actors:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch actors');
    }
  },

  getActor: async (id) => {
    try {
      console.log(`🎭 Fetching actor with ID: ${id}`);
      const actor = await makeRequest('get', `${API_CONFIG.ENDPOINTS.ACTORS}/${id}`);
      console.log(`✅ Actor ${id} fetched successfully`);
      return actor;
    } catch (error) {
      console.error(`❌ Failed to fetch actor ${id}:`, error);
      throw new Error(error.response?.data?.message || `Failed to fetch actor ${id}`);
    }
  },

  addActor: async (actorData) => {
    try {
      console.log('🎭 Adding new actor:', actorData?.name || 'unknown name');
      const result = await makeRequest('post', `${API_CONFIG.ENDPOINTS.ACTORS}/add-actor`, actorData);
      console.log('✅ Actor added successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to add actor:', error);
      throw new Error(error.response?.data?.message || 'Failed to add actor');
    }
  },

  updateActor: async (id, actorData) => {
    try {
      console.log(`🎭 Updating actor ${id}:`, actorData?.name || 'unknown name');
      const result = await makeRequest('put', `${API_CONFIG.ENDPOINTS.ACTORS}/edit-actor/${id}`, actorData);
      console.log(`✅ Actor ${id} updated successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to update actor ${id}:`, error);
      throw new Error(error.response?.data?.message || `Failed to update actor ${id}`);
    }
  },

  deleteActor: async (id) => {
    try {
      console.log(`🎭 Deleting actor ${id}`);
      const result = await makeRequest('delete', `${API_CONFIG.ENDPOINTS.ACTORS}/delete-actor/${id}`);
      console.log(`✅ Actor ${id} deleted successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to delete actor ${id}:`, error);
      throw new Error(error.response?.data?.message || `Failed to delete actor ${id}`);
    }
  },

  // Producer methods
  getProducers: async () => {
    try {
      console.log('🎯 Fetching producers...');
      const producers = await makeRequest('get', API_CONFIG.ENDPOINTS.PRODUCERS);
      console.log(`✅ Fetched ${producers?.length || 0} producers`);
      return producers;
    } catch (error) {
      console.error('❌ Failed to fetch producers:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch producers');
    }
  },

  getProducer: async (id) => {
    try {
      console.log(`🎯 Fetching producer with ID: ${id}`);
      const producer = await makeRequest('get', `${API_CONFIG.ENDPOINTS.PRODUCERS}/${id}`);
      console.log(`✅ Producer ${id} fetched successfully`);
      return producer;
    } catch (error) {
      console.error(`❌ Failed to fetch producer ${id}:`, error);
      throw new Error(error.response?.data?.message || `Failed to fetch producer ${id}`);
    }
  },

  addProducer: async (producerData) => {
    try {
      console.log('🎯 Adding new producer:', producerData?.name || 'unknown name');
      const result = await makeRequest('post', `${API_CONFIG.ENDPOINTS.PRODUCERS}/add-producer`, producerData);
      console.log('✅ Producer added successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to add producer:', error);
      throw new Error(error.response?.data?.message || 'Failed to add producer');
    }
  },

  updateProducer: async (id, producerData) => {
    try {
      console.log(`🎯 Updating producer ${id}:`, producerData?.name || 'unknown name');
      const result = await makeRequest('put', `${API_CONFIG.ENDPOINTS.PRODUCERS}/edit-producer/${id}`, producerData);
      console.log(`✅ Producer ${id} updated successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to update producer ${id}:`, error);
      throw new Error(error.response?.data?.message || `Failed to update producer ${id}`);
    }
  },

  deleteProducer: async (id) => {
    try {
      console.log(`🎯 Deleting producer ${id}`);
      const result = await makeRequest('delete', `${API_CONFIG.ENDPOINTS.PRODUCERS}/delete-producer/${id}`);
      console.log(`✅ Producer ${id} deleted successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to delete producer ${id}:`, error);
      throw new Error(error.response?.data?.message || `Failed to delete producer ${id}`);
    }
  },

  // Generic HTTP methods with enhanced error handling
  get: async (endpoint, options = {}) => {
    return await makeRequest('get', endpoint, null, options);
  },

  post: async (endpoint, data, options = {}) => {
    return await makeRequest('post', endpoint, data, options);
  },

  put: async (endpoint, data, options = {}) => {
    return await makeRequest('put', endpoint, data, options);
  },

  delete: async (endpoint, options = {}) => {
    return await makeRequest('delete', endpoint, null, options);
  },

  // Utility method to test connectivity
  testConnectivity: async () => {
    try {
      console.log('🔍 Testing API connectivity...');
      
      const tests = [
        { name: 'Direct Health Check', url: `${getDirectBaseURL()}/health` },
        { name: 'API Health Check', url: `${getAPIBaseURL()}/health` },
        { name: 'Root Endpoint', url: `${getDirectBaseURL()}/` },
        { name: 'API Root', url: `${getAPIBaseURL()}/` }
      ];
      
      const results = [];
      
      for (const test of tests) {
        try {
          const response = await fetch(test.url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          
          results.push({
            name: test.name,
            url: test.url,
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
          });
          
          console.log(`✅ ${test.name}: ${response.status} ${response.statusText}`);
        } catch (error) {
          results.push({
            name: test.name,
            url: test.url,
            error: error.message,
            ok: false
          });
          
          console.error(`❌ ${test.name}: ${error.message}`);
        }
      }
      
      return results;
    } catch (error) {
      console.error('❌ Connectivity test failed:', error);
      throw error;
    }
  }
};

export default apiService;