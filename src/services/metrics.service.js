// src/services/metrics.service.js
import axios from 'axios';

class MetricsService {
  constructor() {
    this.metrics = {
      pageViews: {},
      apiCalls: {},
      uiInteractions: {},
      loadTimes: [],
      errors: {}
    };
    
    this.metricsEndpoint = process.env.REACT_APP_METRICS_ENDPOINT || '/metrics';
    this.reportingInterval = null;
    
    // Initialize performance observer for page load metrics
    if (typeof PerformanceObserver !== 'undefined') {
      this.initPerformanceObserver();
    }
  }
  
  initPerformanceObserver() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          this.recordLoadTime(entry.duration);
        }
      }
    });
    
    observer.observe({ entryTypes: ['navigation'] });
  }
  
  startReporting(intervalMs = 30000) {
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
    }
    
    this.reportingInterval = setInterval(() => {
      this.reportMetrics();
    }, intervalMs);
    
    // Report initial metrics on page load
    this.reportMetrics();
    
    return this;
  }
  
  stopReporting() {
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = null;
    }
    return this;
  }
  
  recordPageView(page) {
    this.metrics.pageViews[page] = (this.metrics.pageViews[page] || 0) + 1;
    return this;
  }
  
  recordApiCall(endpoint, status, duration) {
    const key = `${endpoint}:${status}`;
    this.metrics.apiCalls[key] = this.metrics.apiCalls[key] || { count: 0, totalDuration: 0 };
    this.metrics.apiCalls[key].count += 1;
    this.metrics.apiCalls[key].totalDuration += duration;
    return this;
  }
  
  recordUiInteraction(component, action) {
    const key = `${component}:${action}`;
    this.metrics.uiInteractions[key] = (this.metrics.uiInteractions[key] || 0) + 1;
    return this;
  }
  
  recordLoadTime(duration) {
    this.metrics.loadTimes.push(duration);
    
    // Keep only the last 50 measurements
    if (this.metrics.loadTimes.length > 50) {
      this.metrics.loadTimes.shift();
    }
    return this;
  }
  
  recordError(category, message) {
    const key = `${category}:${message}`;
    this.metrics.errors[key] = (this.metrics.errors[key] || 0) + 1;
    return this;
  }
  
  getFormattedMetrics() {
    // Create prometheus-formatted metrics
    let output = '# HELP frontend_page_views Total number of page views\n';
    output += '# TYPE frontend_page_views counter\n';
    
    // Page views metrics
    Object.entries(this.metrics.pageViews).forEach(([page, count]) => {
      output += `frontend_page_views{page="${page}"} ${count}\n`;
    });
    
    // API calls metrics
    output += '# HELP frontend_api_calls Total number of API calls\n';
    output += '# TYPE frontend_api_calls counter\n';
    output += '# HELP frontend_api_call_duration_ms Average duration of API calls in ms\n';
    output += '# TYPE frontend_api_call_duration_ms gauge\n';
    
    Object.entries(this.metrics.apiCalls).forEach(([key, data]) => {
      const [endpoint, status] = key.split(':');
      output += `frontend_api_calls{endpoint="${endpoint}",status="${status}"} ${data.count}\n`;
      
      if (data.count > 0) {
        const avgDuration = data.totalDuration / data.count;
        output += `frontend_api_call_duration_ms{endpoint="${endpoint}",status="${status}"} ${avgDuration}\n`;
      }
    });
    
    // UI interaction metrics
    output += '# HELP frontend_ui_interactions Total number of UI interactions\n';
    output += '# TYPE frontend_ui_interactions counter\n';
    
    Object.entries(this.metrics.uiInteractions).forEach(([key, count]) => {
      const [component, action] = key.split(':');
      output += `frontend_ui_interactions{component="${component}",action="${action}"} ${count}\n`;
    });
    
    // Load time metrics
    if (this.metrics.loadTimes.length > 0) {
      const average = this.metrics.loadTimes.reduce((a, b) => a + b, 0) / this.metrics.loadTimes.length;
      output += '# HELP frontend_page_load_time_ms Average page load time in ms\n';
      output += '# TYPE frontend_page_load_time_ms gauge\n';
      output += `frontend_page_load_time_ms ${average}\n`;
    }
    
    // Error metrics
    output += '# HELP frontend_errors Total number of errors\n';
    output += '# TYPE frontend_errors counter\n';
    
    Object.entries(this.metrics.errors).forEach(([key, count]) => {
      const [category, message] = key.split(':');
      output += `frontend_errors{category="${category}",message="${message}"} ${count}\n`;
    });
    
    return output;
  }
  
  async reportMetrics() {
    try {
      const metricsData = this.getFormattedMetrics();
      
      // If the endpoint is an absolute URL, send metrics there
      if (this.metricsEndpoint.startsWith('http')) {
        await axios.post(this.metricsEndpoint, metricsData, {
          headers: {
            'Content-Type': 'text/plain'
          }
        });
      } else {
        // For development, just log metrics to console
        console.log("Frontend Metrics:");
        console.log(metricsData);
      }
    } catch (error) {
      console.error("Failed to report metrics:", error);
    }
  }
}

const metricsService = new MetricsService();
export default;
