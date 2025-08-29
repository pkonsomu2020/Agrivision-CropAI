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
    
    // Weather data - simulated API call
    const loadWeatherData = () => {
      // In a real app, this would fetch from a weather API
      setTimeout(() => {
        document.getElementById('weatherLocation').textContent = 'Your Location';
        document.getElementById('weatherTemp').textContent = '24°C';
        document.getElementById('weatherCondition').textContent = 'Partly Cloudy';
        document.getElementById('weatherHumidity').textContent = 'Humidity: 78%';
        document.getElementById('weatherWind').textContent = 'Wind: 5 km/h';
        
        // Show weather alert based on conditions
        const humidity = 78;
        if (humidity > 75) {
          document.getElementById('weatherAlert').classList.remove('hidden');
        }
      }, 1000);
    };
    
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