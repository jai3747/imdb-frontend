
// // src/config/api.config.js
// const API_CONFIG = {
//   BASE_URL: 'http://localhost:5000/api',
//   DIRECT_BASE_URL: 'http://localhost:5000',
//   TIMEOUT: 10000,
//   ENDPOINTS: {
//     HEALTH: '/health',
//     MOVIES: '/movies',
//     ACTORS: '/actors',
//     PRODUCERS: '/producers',
//     METRICS_REPORT: '/metrics-report',
//     // Fixed API_STATUS endpoints - these should be simple GET endpoints that return status
//     API_STATUS: {
//       ACTOR: '/actors',      // Just check if actors endpoint responds
//       MOVIE: '/movies',      // Just check if movies endpoint responds  
//       PRODUCER: '/producers' // Just check if producers endpoint responds
//     }
//   }
// };

// // Helper function to get direct base URL (without /api prefix)
// const getDirectBaseURL = () => {
//   return API_CONFIG.DIRECT_BASE_URL;
// };

// export { API_CONFIG, getDirectBaseURL };
// src/config/api.config.js
const isDevelopment = process.env.NODE_ENV !== 'production';
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Determine the correct backend URL based on environment
const getBackendURL = () => {
  if (isDevelopment || isLocal) {
    return 'http://localhost:5000';
  }
  // For production, use the same domain
  return window.location.origin;
};

const BACKEND_URL = getBackendURL();

const API_CONFIG = {
  BASE_URL: `${BACKEND_URL}/api`,
  DIRECT_BASE_URL: BACKEND_URL,
  TIMEOUT: 15000, // Increased timeout
  RETRY_ATTEMPTS: 2,
  ENDPOINTS: {
    HEALTH: '/health',
    MOVIES: '/movies',
    ACTORS: '/actors',
    PRODUCERS: '/producers',
    METRICS_REPORT: '/metrics-report'
  }
};

// Helper function to get direct base URL (without /api prefix)
const getDirectBaseURL = () => {
  return API_CONFIG.DIRECT_BASE_URL;
};

// Helper function to get API base URL (with /api prefix)
const getAPIBaseURL = () => {
  return API_CONFIG.BASE_URL;
};

// Debug function to log current configuration
const logAPIConfig = () => {
  console.log('🔧 API Configuration:', {
    isDevelopment,
    isLocal,
    hostname: window.location.hostname,
    backendURL: BACKEND_URL,
    apiBaseURL: API_CONFIG.BASE_URL,
    directBaseURL: API_CONFIG.DIRECT_BASE_URL
  });
};

export { API_CONFIG, getDirectBaseURL, getAPIBaseURL, logAPIConfig };