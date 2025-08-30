// --- Global Dark/Light Mode Toggle ---
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  // Set initial state from localStorage
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });
}

// Auto-initialize theme toggle on DOMContentLoaded
document.addEventListener('DOMContentLoaded', setupThemeToggle);
// DOM Element References
    const offlineBanner = document.getElementById('offlineBanner');
    const diagnosisSection = document.getElementById('diagnosisSection');
    const loadingState = document.getElementById('loadingState');
    const resultsState = document.getElementById('resultsState');
    const historyTab = document.getElementById('historyTab');
    const communityTab = document.getElementById('communityTab');
    const historySection = document.getElementById('historySection');
    const communitySection = document.getElementById('communitySection');
    const photoInput = document.getElementById('photoInput');
    const cameraBtn = document.getElementById('cameraBtn');
    const cameraModal = document.getElementById('cameraModal');
    const closeCamera = document.getElementById('closeCamera');
    const takePictureBtn = document.getElementById('takePictureBtn');
    const cameraFeed = document.getElementById('cameraFeed');
    const captureCanvas = document.getElementById('captureCanvas');
    const noHistory = document.getElementById('noHistory');
    const historyItems = document.getElementById('historyItems');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    // Check for online/offline status
    const updateOnlineStatus = () => {
      if (navigator.onLine) {
        offlineBanner.classList.add('hidden');
      } else {
        offlineBanner.classList.remove('hidden');
      }
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
    
    // Tab Switching
    historyTab.addEventListener('click', () => {
      historyTab.classList.add('tab-active');
      communityTab.classList.remove('tab-active');
      communityTab.classList.add('text-gray-500');
      historySection.classList.remove('hidden');
      communitySection.classList.add('hidden');
    });
    
    communityTab.addEventListener('click', () => {
      communityTab.classList.add('tab-active');
      communityTab.classList.remove('text-gray-500');
      historyTab.classList.remove('tab-active');
      communitySection.classList.remove('hidden');
      historySection.classList.add('hidden');
    });
    
    // Photo Upload
    photoInput.addEventListener('change', function(event) {
      if (event.target.files && event.target.files[0]) {
        // Show diagnosis section with loading state
        diagnosisSection.classList.remove('hidden');
        loadingState.classList.remove('hidden');
        resultsState.classList.add('hidden');
        
        // Simulate API call with delay
        setTimeout(() => {
          loadingState.classList.add('hidden');
          resultsState.classList.remove('hidden');
          
          // Display the uploaded image
          const fileReader = new FileReader();
          fileReader.onload = function(e) {
            document.getElementById('diagnosisImage').src = e.target.result;
          }
          fileReader.readAsDataURL(event.target.files[0]);
          
          // Show fake diagnosis data
          document.getElementById('diseaseName').textContent = "Late Blight";
          
          // Clear and populate treatment list
          const treatmentList = document.getElementById('treatmentList');
          treatmentList.innerHTML = '';
          
          const treatments = [
            "Apply copper-based fungicide as directed on the label",
            "Remove and destroy infected plant material",
            "Improve air circulation around plants",
            "Avoid overhead watering"
          ];
          
          treatments.forEach(treatment => {
            const li = document.createElement('li');
            li.className = 'treatment-step';
            li.textContent = treatment;
            treatmentList.appendChild(li);
          });
          
          // Clear and populate tips list
          const tipsList = document.getElementById('tipsList');
          tipsList.innerHTML = '';
          
          const tips = [
            "Plant resistant varieties next season",
            "Practice crop rotation",
            "Maintain plant spacing for better airflow",
            "Consider drip irrigation to avoid wet foliage"
          ];
          
          tips.forEach(tip => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-check-circle text-green-600 mr-2"></i>${tip}`;
            tipsList.appendChild(li);
          });
          
          // Save to history (in real app would be using LocalStorage)
          saveToHistory({
            image: document.getElementById('diagnosisImage').src,
            disease: "Late Blight",
            confidence: "95%",
            date: new Date().toISOString()
          });
          
        }, 2000);
      }
    });
    
    // Camera Functionality
    cameraBtn.addEventListener('click', () => {
      cameraModal.classList.remove('hidden');
      
      // In a real application, this would initiate the device camera
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            cameraFeed.srcObject = stream;
          })
          .catch(error => {
            console.error("Camera error:", error);
            // Would show error message to user
          });
      }
    });
    
    closeCamera.addEventListener('click', () => {
      cameraModal.classList.add('hidden');
      
      // Stop the camera stream
      if (cameraFeed.srcObject) {
        cameraFeed.srcObject.getTracks().forEach(track => track.stop());
      }
    });
    
    takePictureBtn.addEventListener('click', () => {
      // Capture image from video
      const context = captureCanvas.getContext('2d');
      captureCanvas.width = cameraFeed.videoWidth;
      captureCanvas.height = cameraFeed.videoHeight;
      context.drawImage(cameraFeed, 0, 0, captureCanvas.width, captureCanvas.height);
      
      // Get image as data URL
      const imageDataURL = captureCanvas.toDataURL('image/png');
      
      // Close camera modal
      cameraModal.classList.add('hidden');
      
      // Stop the camera stream
      if (cameraFeed.srcObject) {
        cameraFeed.srcObject.getTracks().forEach(track => track.stop());
      }
      
      // Show diagnosis section with loading state
      diagnosisSection.classList.remove('hidden');
      loadingState.classList.remove('hidden');
      resultsState.classList.add('hidden');
      
      // Simulate API call with delay (similar to photo upload)
      setTimeout(() => {
        loadingState.classList.add('hidden');
        resultsState.classList.remove('hidden');
        
        // Display the captured image
        document.getElementById('diagnosisImage').src = imageDataURL;
        
        // Show fake diagnosis data (same as in photo upload)
        document.getElementById('diseaseName').textContent = "Powdery Mildew";
        
        // Clear and populate treatment list
        const treatmentList = document.getElementById('treatmentList');
        treatmentList.innerHTML = '';
        
        const treatments = [
          "Apply sulfur-based fungicide",
          "Remove severely infected leaves",
          "Space plants for better air circulation",
          "Avoid excessive nitrogen fertilization"
        ];
        
        treatments.forEach(treatment => {
          const li = document.createElement('li');
          li.className = 'treatment-step';
          li.textContent = treatment;
          treatmentList.appendChild(li);
        });
        
        // Clear and populate tips list
        const tipsList = document.getElementById('tipsList');
        tipsList.innerHTML = '';
        
        const tips = [
          "Water at the base of plants, not on leaves",
          "Morning watering is best to allow leaves to dry",
          "Clean tools between plants to prevent spread",
          "Monitor plants regularly for early detection"
        ];
        
        tips.forEach(tip => {
          const li = document.createElement('li');
          li.innerHTML = `<i class="fas fa-check-circle text-green-600 mr-2"></i>${tip}`;
          tipsList.appendChild(li);
        });
        
        // Save to history
        saveToHistory({
          image: imageDataURL,
          disease: "Powdery Mildew",
          confidence: "92%",
          date: new Date().toISOString()
        });
        
      }, 2000);
    });
    
    // Settings Modal
    settingsBtn.addEventListener('click', () => {
      settingsModal.classList.remove('hidden');
    });
    
    closeSettings.addEventListener('click', () => {
      settingsModal.classList.add('hidden');
    });
    
    saveSettingsBtn.addEventListener('click', () => {
      // In a real app, would save settings to localStorage
      settingsModal.classList.add('hidden');
      
      // Show a temporary success message
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
      notification.textContent = 'Settings saved successfully';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    });
    
    // Weather data - Real API implementation with location detection
    const loadWeatherData = async () => {
      try {
        // Show loading state
        document.getElementById('weatherLocation').textContent = 'Detecting location...';
        document.getElementById('weatherTemp').textContent = '--°C';
        document.getElementById('weatherCondition').textContent = '--';
        document.getElementById('weatherHumidity').textContent = 'Humidity: --%';
        document.getElementById('weatherWind').textContent = 'Wind: -- km/h';
        
        // Get user's location
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // Get location name from coordinates
        const locationName = await getLocationName(latitude, longitude);
        document.getElementById('weatherLocation').textContent = locationName;
        
        // Fetch weather data
        const weatherData = await fetchWeatherData(latitude, longitude);
        
        // Update weather display
        updateWeatherDisplay(weatherData);
        
        // Check for weather alerts
        checkWeatherAlerts(weatherData);
        
      } catch (error) {
        console.error('Weather data error:', error);
        // Fallback to default values
        document.getElementById('weatherLocation').textContent = 'Location unavailable';
        document.getElementById('weatherTemp').textContent = '--°C';
        document.getElementById('weatherCondition').textContent = '--';
        document.getElementById('weatherHumidity').textContent = 'Humidity: --%';
        document.getElementById('weatherWind').textContent = 'Wind: -- km/h';
      }
    };

    // Get current position using Geolocation API
    const getCurrentPosition = () => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser'));
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => {
            console.error('Geolocation error:', error);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });
    };

    // Get location name from coordinates using reverse geocoding
    const getLocationName = async (latitude, longitude) => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=YOUR_OPENWEATHER_API_KEY`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch location name');
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const location = data[0];
          // Return city name, or locality, or country as fallback
          return location.name || location.locality || location.country || 'Unknown Location';
        }
        
        return 'Unknown Location';
      } catch (error) {
        console.error('Location name error:', error);
        return 'Your Location';
      }
    };

    // Fetch weather data from OpenWeatherMap API
    const fetchWeatherData = async (latitude, longitude) => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=YOUR_OPENWEATHER_API_KEY`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Weather API error:', error);
        throw error;
      }
    };

    // Update weather display with real data
    const updateWeatherDisplay = (weatherData) => {
      const temp = Math.round(weatherData.main.temp);
      const condition = weatherData.weather[0].main;
      const humidity = weatherData.main.humidity;
      const windSpeed = Math.round(weatherData.wind.speed * 3.6); // Convert m/s to km/h
      
      // Update temperature and condition
      document.getElementById('weatherTemp').textContent = `${temp}°C`;
      document.getElementById('weatherCondition').textContent = condition;
      
      // Update humidity
      document.getElementById('weatherHumidity').textContent = `Humidity: ${humidity}%`;
      
      // Update wind speed
      document.getElementById('weatherWind').textContent = `Wind: ${windSpeed} km/h`;
      
      // Update weather icon based on condition
      updateWeatherIcon(weatherData.weather[0].icon);
    };

    // Update weather icon based on weather condition
    const updateWeatherIcon = (iconCode) => {
      const weatherIcon = document.querySelector('.weather-widget i.fas.fa-cloud-sun');
      if (!weatherIcon) return;
      
      // Map OpenWeatherMap icon codes to Font Awesome icons
      const iconMap = {
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
      
      const newIcon = iconMap[iconCode] || 'fa-cloud-sun';
      weatherIcon.className = `fas ${newIcon} text-3xl text-yellow-500 mr-3`;
    };

    // Check weather conditions for disease risk alerts
    const checkWeatherAlerts = (weatherData) => {
      const humidity = weatherData.main.humidity;
      const temp = weatherData.main.temp;
      const weatherAlert = document.getElementById('weatherAlert');
      const alertText = document.getElementById('alertText');
      
      // Hide alert by default
      weatherAlert.classList.add('hidden');
      
      // Check for high humidity (favorable for disease development)
      if (humidity > 75) {
        weatherAlert.classList.remove('hidden');
        alertText.textContent = 'High humidity detected. Conditions favor disease development. Monitor crops closely and consider preventive measures.';
        return;
      }
      
      // Check for moderate humidity with warm temperature
      if (humidity > 60 && temp > 20) {
        weatherAlert.classList.remove('hidden');
        alertText.textContent = 'Moderate humidity and warm temperature detected. Consider preventive spraying for disease control.';
        return;
      }
      
      // Check for very high temperature
      if (temp > 30) {
        weatherAlert.classList.remove('hidden');
        alertText.textContent = 'High temperature detected. Ensure adequate irrigation and monitor for heat stress in crops.';
        return;
      }
    };

    // Refresh weather data (can be called periodically)
    const refreshWeather = () => {
      loadWeatherData();
    };

    // Auto-refresh weather every 30 minutes
    setInterval(refreshWeather, 30 * 60 * 1000);
    
    // History functionality
    const saveToHistory = (item) => {
      // In a real app, this would save to localStorage
      // For prototype, just update UI
      noHistory.classList.add('hidden');
      
      const historyCard = document.createElement('div');
      historyCard.className = 'card p-4';
      historyCard.innerHTML = `
        <div class="flex items-center">
          <div class="w-16 h-16 bg-gray-100 rounded overflow-hidden mr-3 flex-shrink-0">
            <img src="${item.image}" class="w-full h-full object-cover" alt="Scan history">
          </div>
          <div>
            <h4 class="font-semibold">${item.disease}</h4>
            <div class="flex items-center text-xs text-gray-500">
              <span class="mr-2">${formatDate(item.date)}</span>
              <span class="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">${item.confidence}</span>
            </div>
          </div>
        </div>
      `;
      
      historyItems.prepend(historyCard);
    };
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    // Language selector functionality
    document.getElementById('languageSelector').addEventListener('change', function(event) {
      const lang = event.target.value;
      // In a real app, this would update all text content based on selected language
      // For the prototype, we'll just show a notification
      
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg';
      
      const languages = {
        en: 'English',
        sw: 'Swahili',
        fr: 'French',
        hi: 'Hindi',
        es: 'Spanish'
      };
      
      notification.textContent = `Language changed to ${languages[lang]}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    });
    
    // Initialize app
    const initApp = () => {
      loadWeatherData();
      
      // Add some fake history items for demonstration
      if (historyItems.children.length === 0) {
        // No history items to show, keep the "no history" message visible
      }
    };
    
    // Run initialization
    document.addEventListener('DOMContentLoaded', initApp);