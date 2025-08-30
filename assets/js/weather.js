// weather.js - Weather functionality for CropGuard AI
// Handles location detection, weather API calls, and weather display updates

class WeatherService {
  constructor() {
    // Use configuration if available, otherwise use defaults
    const config = window.CONFIG || {};
    this.apiKey = config.WEATHER?.API_KEY || 'YOUR_OPENWEATHER_API_KEY';
    this.baseUrl = config.WEATHER?.BASE_URL || 'https://api.openweathermap.org';
    this.units = config.WEATHER?.UNITS || 'metric';
    this.language = config.WEATHER?.LANGUAGE || 'en';
    this.autoRefreshInterval = config.APP?.AUTO_REFRESH_INTERVAL || 30 * 60 * 1000;
    this.geolocationTimeout = config.APP?.GEOLOCATION_TIMEOUT || 10000;
    this.geolocationMaxAge = config.APP?.GEOLOCATION_MAX_AGE || 300000;
    
    // Debug mode
    this.debug = localStorage.getItem('weatherDebug') === 'true';
    
    // Alert thresholds
    this.alertThresholds = config.ALERTS || {
      HIGH_HUMIDITY_THRESHOLD: 75,
      MODERATE_HUMIDITY_THRESHOLD: 60,
      WARM_TEMPERATURE_THRESHOLD: 20,
      HIGH_TEMPERATURE_THRESHOLD: 30
    };
    
    this.weatherElements = {
      location: document.getElementById('weatherLocation'),
      temp: document.getElementById('weatherTemp'),
      condition: document.getElementById('weatherCondition'),
      humidity: document.getElementById('weatherHumidity'),
      wind: document.getElementById('weatherWind'),
      alert: document.getElementById('weatherAlert'),
      alertText: document.getElementById('alertText')
    };
    
    this.iconMap = {
      '01d': 'fa-sun',           // Clear sky day
      '01n': 'fa-moon',          // Clear sky night
      '02d': 'fa-cloud-sun',     // Few clouds day
      '02n': 'fa-cloud-moon',    // Few clouds night
      '03d': 'fa-cloud',         // Scattered clouds
      '03n': 'fa-cloud',         // Scattered clouds
      '04d': 'fa-clouds',        // Broken clouds
      '04n': 'fa-clouds',        // Broken clouds
      '09d': 'fa-cloud-rain',    // Shower rain
      '09n': 'fa-cloud-rain',    // Shower rain
      '10d': 'fa-cloud-sun-rain', // Rain day
      '10n': 'fa-cloud-moon-rain', // Rain night
      '11d': 'fa-bolt',          // Thunderstorm
      '11n': 'fa-bolt',          // Thunderstorm
      '13d': 'fa-snowflake',     // Snow
      '13n': 'fa-snowflake',     // Snow
      '50d': 'fa-smog',          // Mist
      '50n': 'fa-smog'           // Mist
    };
    
    // Log configuration for debugging
    if (this.debug) {
      console.log('WeatherService initialized with config:', {
        apiKey: this.apiKey ? '***' + this.apiKey.slice(-4) : 'NOT SET',
        baseUrl: this.baseUrl,
        units: this.units,
        language: this.language
      });
    }
  }

  // Initialize weather service
  async init() {
    try {
      if (this.debug) console.log('Initializing weather service...');
      
      await this.loadWeatherData();
      
      // Auto-refresh weather based on configuration
      setInterval(() => this.loadWeatherData(), this.autoRefreshInterval);
      
      // Add refresh button event listener
      this.setupRefreshButton();
      
      if (this.debug) console.log('Weather service initialized successfully');
    } catch (error) {
      console.error('Weather service initialization failed:', error);
      this.showFallbackData();
    }
  }

  // Main method to load weather data
  async loadWeatherData() {
    try {
      this.showLoadingState();
      
      if (this.debug) console.log('Loading weather data...');
      
      // Get user's location
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      if (this.debug) console.log('Location obtained:', { latitude, longitude });
      
      // Get location name from coordinates
      const locationName = await this.getLocationName(latitude, longitude);
      this.updateLocation(locationName);
      
      if (this.debug) console.log('Location name:', locationName);
      
      // Fetch weather data
      const weatherData = await this.fetchWeatherData(latitude, longitude);
      
      if (this.debug) console.log('Weather data received:', weatherData);
      
      // Update weather display
      this.updateWeatherDisplay(weatherData);
      
      // Check for weather alerts
      this.checkWeatherAlerts(weatherData);
      
    } catch (error) {
      console.error('Weather data error:', error);
      
      // Try fallback location if geolocation fails
      if (error.message.includes('Geolocation') || error.message.includes('location')) {
        await this.tryFallbackLocation();
      } else {
        this.showFallbackData();
      }
    }
  }

  // Try fallback location (Nairobi, Kenya as default)
  async tryFallbackLocation() {
    try {
      if (this.debug) console.log('Trying fallback location...');
      
      // Default to Nairobi, Kenya coordinates
      const fallbackCoords = { latitude: -1.2921, longitude: 36.8219 };
      
      const locationName = await this.getLocationName(fallbackCoords.latitude, fallbackCoords.longitude);
      this.updateLocation(locationName + ' (Default)');
      
      const weatherData = await this.fetchWeatherData(fallbackCoords.latitude, fallbackCoords.longitude);
      this.updateWeatherDisplay(weatherData);
      this.checkWeatherAlerts(weatherData);
      
      if (this.debug) console.log('Fallback location successful');
    } catch (error) {
      console.error('Fallback location failed:', error);
      this.showFallbackData();
    }
  }

  // Show loading state
  showLoadingState() {
    if (this.weatherElements.location) {
      this.weatherElements.location.textContent = 'Detecting location...';
    }
    if (this.weatherElements.temp) {
      this.weatherElements.temp.textContent = '--°C';
    }
    if (this.weatherElements.condition) {
      this.weatherElements.condition.textContent = '--';
    }
    if (this.weatherElements.humidity) {
      this.weatherElements.humidity.textContent = 'Humidity: --%';
    }
    if (this.weatherElements.wind) {
      this.weatherElements.wind.textContent = 'Wind: -- km/h';
    }
  }

  // Show fallback data when API fails
  showFallbackData() {
    if (this.weatherElements.location) {
      this.weatherElements.location.textContent = 'Location unavailable';
    }
    if (this.weatherElements.temp) {
      this.weatherElements.temp.textContent = '--°C';
    }
    if (this.weatherElements.condition) {
      this.weatherElements.condition.textContent = '--';
    }
    if (this.weatherElements.humidity) {
      this.weatherElements.humidity.textContent = 'Humidity: --%';
    }
    if (this.weatherElements.wind) {
      this.weatherElements.wind.textContent = 'Wind: -- km/h';
    }
  }

  // Get current position using Geolocation API
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = new Error('Geolocation is not supported by this browser');
        if (this.debug) console.error('Geolocation not supported');
        reject(error);
        return;
      }
      
      if (this.debug) console.log('Requesting geolocation...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (this.debug) console.log('Geolocation successful:', position.coords);
          resolve(position);
        },
        (error) => {
          let errorMessage = 'Geolocation failed';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please allow location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'Unknown geolocation error.';
          }
          
          if (this.debug) console.error('Geolocation error:', errorMessage, error);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: this.geolocationTimeout,
          maximumAge: this.geolocationMaxAge
        }
      );
    });
  }

  // Get location name from coordinates using reverse geocoding
  async getLocationName(latitude, longitude) {
    try {
      if (this.debug) console.log('Fetching location name for:', latitude, longitude);
      
      const url = `${this.baseUrl}/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${this.apiKey}`;
      
      if (this.debug) console.log('Reverse geocoding URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        if (this.debug) console.error('Reverse geocoding failed:', response.status, errorText);
        throw new Error(`Failed to fetch location name: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (this.debug) console.log('Reverse geocoding response:', data);
      
      if (data && data.length > 0) {
        const location = data[0];
        // Return city name, or locality, or country as fallback
        const locationName = location.name || location.locality || location.country || 'Unknown Location';
        if (this.debug) console.log('Location name resolved:', locationName);
        return locationName;
      }
      
      if (this.debug) console.log('No location data found');
      return 'Unknown Location';
    } catch (error) {
      console.error('Location name error:', error);
      return 'Your Location';
    }
  }

  // Fetch weather data from OpenWeatherMap API
  async fetchWeatherData(latitude, longitude) {
    try {
      if (this.debug) console.log('Fetching weather data for:', latitude, longitude);
      
      const url = `${this.baseUrl}/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${this.units}&lang=${this.language}&appid=${this.apiKey}`;
      
      if (this.debug) console.log('Weather API URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        if (this.debug) console.error('Weather API failed:', response.status, errorText);
        throw new Error(`Failed to fetch weather data: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (this.debug) console.log('Weather API response:', data);
      
      return data;
    } catch (error) {
      console.error('Weather API error:', error);
      throw error;
    }
  }

  // Update location display
  updateLocation(locationName) {
    if (this.weatherElements.location) {
      this.weatherElements.location.textContent = locationName;
    }
  }

  // Update weather display with real data
  updateWeatherDisplay(weatherData) {
    const temp = Math.round(weatherData.main.temp);
    const condition = weatherData.weather[0].main;
    const humidity = weatherData.main.humidity;
    const windSpeed = Math.round(weatherData.wind.speed * 3.6); // Convert m/s to km/h
    
    if (this.debug) console.log('Updating weather display:', { temp, condition, humidity, windSpeed });
    
    // Update temperature and condition
    if (this.weatherElements.temp) {
      this.weatherElements.temp.textContent = `${temp}°C`;
    }
    if (this.weatherElements.condition) {
      this.weatherElements.condition.textContent = condition;
    }
    
    // Update humidity
    if (this.weatherElements.humidity) {
      this.weatherElements.humidity.textContent = `Humidity: ${humidity}%`;
    }
    
    // Update wind speed
    if (this.weatherElements.wind) {
      this.weatherElements.wind.textContent = `Wind: ${windSpeed} km/h`;
    }
    
    // Update weather icon based on condition
    this.updateWeatherIcon(weatherData.weather[0].icon);
  }

  // Update weather icon based on weather condition
  updateWeatherIcon(iconCode) {
    const weatherIcon = document.querySelector('.weather-widget i.fas.fa-cloud-sun');
    if (!weatherIcon) return;
    
    const newIcon = this.iconMap[iconCode] || 'fa-cloud-sun';
    weatherIcon.className = `fas ${newIcon} text-3xl text-yellow-500 mr-3`;
    
    if (this.debug) console.log('Updated weather icon:', iconCode, '->', newIcon);
  }

  // Check weather conditions for disease risk alerts
  checkWeatherAlerts(weatherData) {
    const humidity = weatherData.main.humidity;
    const temp = weatherData.main.temp;
    
    if (this.debug) console.log('Checking weather alerts:', { humidity, temp });
    
    // Hide alert by default
    if (this.weatherElements.alert) {
      this.weatherElements.alert.classList.add('hidden');
    }
    
    // Check for high humidity (favorable for disease development)
    if (humidity > this.alertThresholds.HIGH_HUMIDITY_THRESHOLD) {
      this.showWeatherAlert('High humidity detected. Conditions favor disease development. Monitor crops closely and consider preventive measures.');
      return;
    }
    
    // Check for moderate humidity with warm temperature
    if (humidity > this.alertThresholds.MODERATE_HUMIDITY_THRESHOLD && temp > this.alertThresholds.WARM_TEMPERATURE_THRESHOLD) {
      this.showWeatherAlert('Moderate humidity and warm temperature detected. Consider preventive spraying for disease control.');
      return;
    }
    
    // Check for very high temperature
    if (temp > this.alertThresholds.HIGH_TEMPERATURE_THRESHOLD) {
      this.showWeatherAlert('High temperature detected. Ensure adequate irrigation and monitor for heat stress in crops.');
      return;
    }
  }

  // Show weather alert
  showWeatherAlert(message) {
    if (this.weatherElements.alert) {
      this.weatherElements.alert.classList.remove('hidden');
    }
    if (this.weatherElements.alertText) {
      this.weatherElements.alertText.textContent = message;
    }
    
    if (this.debug) console.log('Weather alert shown:', message);
  }

  // Setup refresh button functionality
  setupRefreshButton() {
    const refreshBtn = document.getElementById('refreshWeather');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        if (this.debug) console.log('Manual refresh requested');
        
        // Add spinning animation
        const icon = refreshBtn.querySelector('i');
        icon.classList.add('fa-spin');
        
        // Refresh weather data
        this.loadWeatherData().finally(() => {
          // Stop spinning after 1 second
          setTimeout(() => {
            icon.classList.remove('fa-spin');
          }, 1000);
        });
      });
    }
  }

  // Manual refresh weather data
  refresh() {
    this.loadWeatherData();
  }

  // Get weather data for external use
  async getWeatherData() {
    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      return await this.fetchWeatherData(latitude, longitude);
    } catch (error) {
      console.error('Failed to get weather data:', error);
      return null;
    }
  }

  // Enable/disable debug mode
  setDebugMode(enabled) {
    this.debug = enabled;
    localStorage.setItem('weatherDebug', enabled ? 'true' : 'false');
    console.log('Weather debug mode:', enabled ? 'enabled' : 'disabled');
  }
}

// Initialize weather service when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if weather elements exist (main.html page)
  if (document.getElementById('weatherLocation')) {
    const weatherService = new WeatherService();
    weatherService.init();
    
    // Make weather service globally available
    window.weatherService = weatherService;
    
    // Add debug commands to console
    if (weatherService.debug) {
      console.log('Weather debug mode is enabled. Use these commands:');
      console.log('- window.weatherService.refresh() - Manual refresh');
      console.log('- window.weatherService.setDebugMode(true/false) - Toggle debug');
    }
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeatherService;
}
