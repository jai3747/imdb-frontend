
// src/config/api.config.js
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  DIRECT_BASE_URL: 'http://localhost:5000',
  TIMEOUT: 10000,
  ENDPOINTS: {
    HEALTH: '/health',
    MOVIES: '/movies',
    ACTORS: '/actors',
    PRODUCERS: '/producers',
    METRICS_REPORT: '/metrics-report',
    // Fixed API_STATUS endpoints - these should be simple GET endpoints that return status
    API_STATUS: {
      ACTOR: '/actors',      // Just check if actors endpoint responds
      MOVIE: '/movies',      // Just check if movies endpoint responds  
      PRODUCER: '/producers' // Just check if producers endpoint responds
    }
  }
};

// Helper function to get direct base URL (without /api prefix)
const getDirectBaseURL = () => {
  return API_CONFIG.DIRECT_BASE_URL;
};

export { API_CONFIG, getDirectBaseURL };