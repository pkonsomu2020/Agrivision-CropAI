// config.js - Configuration file for CropGuard AI
// Store your API keys and configuration settings here

const CONFIG = {
  // OpenWeatherMap API Configuration
  WEATHER: {
    API_KEY: '9c26bc83e65098224aa1e7770e13de4b', // Replace with your new valid API key
    BASE_URL: 'https://api.openweathermap.org',
    UNITS: 'metric', // metric, imperial, or kelvin
    LANGUAGE: 'en' // Language for weather descriptions
  },
  
  // MapTiler Configuration (for geotagging)
  MAP: {
    API_KEY: 'nejBaczk5JFmHmXR9bjG', // Already configured in the project
    BASE_URL: 'https://api.maptiler.com'
  },
  
  // App Configuration
  APP: {
    NAME: 'CropGuard AI',
    VERSION: '1.0.0',
    DEFAULT_LANGUAGE: 'en',
    AUTO_REFRESH_INTERVAL: 30 * 60 * 1000, // 30 minutes
    GEOLOCATION_TIMEOUT: 10000, // 10 seconds
    GEOLOCATION_MAX_AGE: 300000 // 5 minutes
  },
  
  // Weather Alert Thresholds
  ALERTS: {
    HIGH_HUMIDITY_THRESHOLD: 75, // Percentage
    MODERATE_HUMIDITY_THRESHOLD: 60, // Percentage
    WARM_TEMPERATURE_THRESHOLD: 20, // Celsius
    HIGH_TEMPERATURE_THRESHOLD: 30 // Celsius
  }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else {
  // Make CONFIG globally available for browser
  window.CONFIG = CONFIG;
}
