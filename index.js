// DOM Element References
const offlineBanner = document.getElementById('offlineBanner');
const diagnosisSection = document.getElementById('diagnosisSection');
const loadingState = document.getElementById('loadingState');
const resultsState = document.getElementById('resultsState');
const historyTab = document.getElementById('historyTab');
const communityTab = document.getElementById('communityTab');
const reportsTab = document.getElementById('reportsTab');
const historySection = document.getElementById('historySection');
const communitySection = document.getElementById('communitySection');
const reportsSection = document.getElementById('reportsSection');
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
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeToggleText = document.getElementById('themeToggleText');
const newPostForm = document.getElementById('newPostForm');
const clearFormBtn = document.getElementById('clearFormBtn');
const postFilter = document.getElementById('postFilter');
const generateReportBtn = document.getElementById('generateReportBtn');
const quickScanBtn = document.getElementById('quickScanBtn');
const quickScanTooltip = document.getElementById('quickScanTooltip');

// Check for online/offline status
const updateOnlineStatus = () => {
  if (offlineBanner) {
    if (navigator.onLine) {
      offlineBanner.classList.add('hidden');
    } else {
      offlineBanner.classList.remove('hidden');
    }
  }
};

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// Theme Toggle
const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  themeToggleText.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
  
  // Update icon
  const icon = themeToggleBtn.querySelector('i');
  icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  
  // Save theme preference
  localStorage.setItem('theme', newTheme);
};

// Load saved theme
const loadSavedTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  if (themeToggleText) {
    themeToggleText.textContent = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
  
  if (themeToggleBtn) {
    const icon = themeToggleBtn.querySelector('i');
    if (icon) {
      icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }
};

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', toggleTheme);
}

// Floating Action Button
if (quickScanBtn && quickScanTooltip) {
  quickScanBtn.addEventListener('mouseenter', () => {
    quickScanTooltip.style.opacity = '1';
    quickScanTooltip.style.pointerEvents = 'auto';
    quickScanTooltip.style.transform = 'translateY(0)';
  });
  
  quickScanBtn.addEventListener('mouseleave', () => {
    quickScanTooltip.style.opacity = '0';
    quickScanTooltip.style.pointerEvents = 'none';
    quickScanTooltip.style.transform = 'translateY(2px)';
  });
  
  quickScanBtn.addEventListener('click', () => {
    // Scroll to upload section
    const uploadTitle = document.querySelector('#uploadTitle');
    if (uploadTitle) {
      uploadTitle.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      
      // Add a highlight effect
      const uploadSection = uploadTitle.closest('section');
      if (uploadSection) {
        uploadSection.style.boxShadow = '0 0 30px rgba(25, 173, 80, 0.5)';
        uploadSection.style.transform = 'scale(1.02)';
        
        setTimeout(() => {
          uploadSection.style.boxShadow = '';
          uploadSection.style.transform = '';
        }, 2000);
      }
    }
  });
}

// Tab Switching
const switchTab = (tabName) => {
  // Remove active class from all tabs
  [historyTab, communityTab, reportsTab].forEach(tab => {
    tab.classList.remove('tab-active');
  });
  
  // Hide all sections
  [historySection, communitySection, reportsSection].forEach(section => {
    section.classList.add('hidden');
  });
  
  // Add active class to clicked tab
  document.getElementById(tabName + 'Tab').classList.add('tab-active');
  
  // Show corresponding section
  document.getElementById(tabName + 'Section').classList.remove('hidden');
  
  // Load content based on tab
  if (tabName === 'history') {
    loadHistory();
  } else if (tabName === 'community') {
    loadCommunityPosts();
  } else if (tabName === 'reports') {
    generateCommunityReports();
  }
};

// Event listeners for tabs
if (historyTab) historyTab.addEventListener('click', () => switchTab('history'));
if (communityTab) communityTab.addEventListener('click', () => switchTab('community'));
if (reportsTab) reportsTab.addEventListener('click', () => switchTab('reports'));

// Photo Upload and Camera Functionality
if (photoInput) {
  photoInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        analyzePhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });
}

if (cameraBtn) {
  cameraBtn.addEventListener('click', () => {
    if (cameraModal) {
      cameraModal.classList.remove('hidden');
      startCamera();
    }
  });
}

if (closeCamera) {
  closeCamera.addEventListener('click', () => {
    if (cameraModal) {
      cameraModal.classList.add('hidden');
      stopCamera();
    }
  });
}

if (takePictureBtn) {
  takePictureBtn.addEventListener('click', () => {
    if (captureCanvas && cameraFeed) {
      const context = captureCanvas.getContext('2d');
      captureCanvas.width = cameraFeed.videoWidth;
      captureCanvas.height = cameraFeed.videoHeight;
      context.drawImage(cameraFeed, 0, 0);
      
      const imageData = captureCanvas.toDataURL('image/jpeg');
      analyzePhoto(imageData);
      
      if (cameraModal) {
        cameraModal.classList.add('hidden');
        stopCamera();
      }
    }
  });
}

let stream = null;

const startCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraFeed.srcObject = stream;
  } catch (err) {
    console.error('Error accessing camera:', err);
    showNotification('Camera access denied. Please use file upload instead.', 'error');
  }
};

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
};

// Photo Analysis with Progress Bar
const analyzePhoto = (imageData) => {
  // Show diagnosis section and loading state
  diagnosisSection.classList.remove('hidden');
  loadingState.classList.remove('hidden');
  resultsState.classList.add('hidden');
  
  // Simulate analysis with progress bar
  const progressBar = document.getElementById('progressBar');
  let progress = 0;
  
  const progressInterval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      
      setTimeout(() => {
        showResults(imageData);
      }, 500);
    }
    progressBar.style.width = progress + '%';
    document.getElementById('progressText').textContent = Math.round(progress) + '% Complete';
  }, 200);
};

// Show Results
const showResults = (imageData) => {
  loadingState.classList.add('hidden');
  resultsState.classList.remove('hidden');
  
  // Display uploaded image
  const resultImage = document.getElementById('diagnosisImage');
  resultImage.src = imageData;
  
  // Simulate AI analysis results
  const diseaseName = document.getElementById('diseaseName');
  const confidenceText = document.getElementById('confidenceText');
  
  // Random disease detection (simulated)
  const diseases = [
    { name: 'Early Blight', confidence: '87%', severity: 'Moderate' },
    { name: 'Leaf Spot Disease', confidence: '92%', severity: 'Low' },
    { name: 'Powdery Mildew', confidence: '78%', severity: 'High' },
    { name: 'Rust Disease', confidence: '85%', severity: 'Moderate' }
  ];
  
  const detectedDisease = diseases[Math.floor(Math.random() * diseases.length)];
  diseaseName.textContent = detectedDisease.name;
  confidenceText.textContent = detectedDisease.confidence;
  
  // Generate treatment advice
  generateTreatmentAdvice(detectedDisease.name);
  
  // Save to history
  saveToHistory(imageData, detectedDisease);
  
  // Add entrance animation
  resultsState.classList.add('fade-in');
};

// Generate Treatment and Advice
const generateTreatmentAdvice = (diseaseName) => {
  const treatmentList = document.getElementById('treatmentList');
  const tipsList = document.getElementById('tipsList');
  const careScheduleList = document.getElementById('careScheduleList');
  
  const treatments = {
    'Early Blight': [
      'Remove and destroy infected leaves',
      'Apply copper-based fungicide',
      'Improve air circulation',
      'Avoid overhead watering'
    ],
    'Leaf Spot Disease': [
      'Prune affected areas',
      'Apply neem oil solution',
      'Maintain proper spacing',
      'Use disease-resistant varieties'
    ],
    'Powdery Mildew': [
      'Apply sulfur-based fungicide',
      'Increase sunlight exposure',
      'Reduce humidity levels',
      'Remove infected plant parts'
    ],
    'Rust Disease': [
      'Remove infected leaves immediately',
      'Apply fungicide treatment',
      'Improve plant spacing',
      'Avoid wetting foliage'
    ]
  };
  
  const tips = {
    'Early Blight': [
      'Water at soil level to avoid leaf wetness',
      'Apply mulch to prevent spores from splashing up',
      'Plant resistant varieties if available'
    ],
    'Leaf Spot Disease': [
      'Ensure good drainage in the field',
      'Rotate crops to break disease cycle',
      'Keep weeds under control'
    ],
    'Powdery Mildew': [
      'Plant in areas with good air circulation',
      'Avoid overhead watering',
      'Remove plant debris regularly'
    ],
    'Rust Disease': [
      'Monitor plants weekly for early detection',
      'Choose resistant varieties',
      'Maintain proper plant nutrition'
    ]
  };
  
  const schedule = {
    'Early Blight': [
      'Week 1: Apply initial treatment',
      'Week 2: Monitor progress and reapply if needed',
      'Week 3-4: Continue monitoring and prevention'
    ],
    'Leaf Spot Disease': [
      'Day 1-3: Remove affected parts immediately',
      'Week 1: Apply treatment and improve conditions',
      'Week 2-3: Monitor and maintain prevention'
    ],
    'Powdery Mildew': [
      'Immediate: Apply fungicide treatment',
      'Week 1: Improve air circulation',
      'Week 2-4: Regular monitoring and prevention'
    ],
    'Rust Disease': [
      'Immediate: Remove all infected leaves',
      'Day 3-7: Apply treatment and improve spacing',
      'Week 2-3: Monitor for new infections'
    ]
  };
  
  const treatment = treatments[diseaseName] || treatments['Early Blight'];
  const tipList = tips[diseaseName] || tips['Early Blight'];
  const scheduleList = schedule[diseaseName] || schedule['Early Blight'];
  
  if (treatmentList) {
    treatmentList.innerHTML = treatment.map(step => `
      <li class="treatment-item">
        <i class="fas fa-check-circle"></i>
        ${step}
      </li>
    `).join('');
  }
  
  if (tipsList) {
    tipsList.innerHTML = tipList.map(tip => `
      <li class="treatment-item">
        <i class="fas fa-lightbulb"></i>
        ${tip}
      </li>
    `).join('');
  }
  
  if (careScheduleList) {
    careScheduleList.innerHTML = scheduleList.map(item => `
      <li class="treatment-item">
        <i class="fas fa-calendar-check"></i>
        ${item}
      </li>
    `).join('');
  }
};

// Settings Modal
if (settingsBtn) {
  settingsBtn.addEventListener('click', () => {
    if (settingsModal) {
      settingsModal.classList.remove('hidden');
    }
  });
}

if (closeSettings) {
  closeSettings.addEventListener('click', () => {
    if (settingsModal) {
      settingsModal.classList.add('hidden');
    }
  });
}

if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener('click', () => {
    // Save settings logic here
    showNotification('Settings saved successfully!', 'success');
    if (settingsModal) {
      settingsModal.classList.add('hidden');
    }
  });
}

// Weather Data Loading
const loadWeatherData = () => {
  // Simulate weather API call
  setTimeout(() => {
    const weatherInfo = document.getElementById('weatherInfo');
    if (weatherInfo) {
      weatherInfo.innerHTML = `
        <div class="weather-alert">
          <i class="fas fa-exclamation-triangle text-yellow-600"></i>
          <span class="ml-2">Weather Alert: Light rain expected in 2 hours</span>
        </div>
      `;
    }
  }, 1000);
};

// History Management
const saveToHistory = (imageData, diseaseInfo) => {
  // Generate complete treatment data
  const treatmentData = getCompleteTreatmentData(diseaseInfo.name);
  
  const historyItem = {
    id: Date.now(),
    image: imageData,
    disease: diseaseInfo.name,
    confidence: diseaseInfo.confidence,
    severity: diseaseInfo.severity,
    timestamp: new Date().toLocaleString(),
    treatmentData: treatmentData // Store complete treatment data
  };
  
  let history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
  history.unshift(historyItem);
  
  // Keep only last 20 scans
  if (history.length > 20) {
    history = history.slice(0, 20);
  }
  
  localStorage.setItem('scanHistory', JSON.stringify(history));
};

// Function to get complete treatment data for storage
const getCompleteTreatmentData = (diseaseName) => {
  const treatments = {
    'Early Blight': [
      'Remove and destroy infected leaves',
      'Apply copper-based fungicide',
      'Improve air circulation',
      'Avoid overhead watering'
    ],
    'Leaf Spot Disease': [
      'Prune affected areas',
      'Apply neem oil solution',
      'Maintain proper spacing',
      'Use disease-resistant varieties'
    ],
    'Powdery Mildew': [
      'Apply sulfur-based fungicide',
      'Increase sunlight exposure',
      'Reduce humidity levels',
      'Remove infected plant parts'
    ],
    'Rust Disease': [
      'Remove infected leaves immediately',
      'Apply fungicide treatment',
      'Improve plant spacing',
      'Avoid wetting foliage'
    ]
  };
  
  const tips = {
    'Early Blight': [
      'Water at soil level to avoid leaf wetness',
      'Apply mulch to prevent spores from splashing up',
      'Plant resistant varieties if available'
    ],
    'Leaf Spot Disease': [
      'Ensure good drainage in the field',
      'Rotate crops to break disease cycle',
      'Keep weeds under control'
    ],
    'Powdery Mildew': [
      'Plant in areas with good air circulation',
      'Avoid overhead watering',
      'Remove plant debris regularly'
    ],
    'Rust Disease': [
      'Monitor plants weekly for early detection',
      'Choose resistant varieties',
      'Maintain proper plant nutrition'
    ]
  };
  
  const schedule = {
    'Early Blight': [
      'Week 1: Apply initial treatment',
      'Week 2: Monitor progress and reapply if needed',
      'Week 3-4: Continue monitoring and prevention'
    ],
    'Leaf Spot Disease': [
      'Day 1-3: Remove affected parts immediately',
      'Week 1: Apply treatment and improve conditions',
      'Week 2-3: Monitor and maintain prevention'
    ],
    'Powdery Mildew': [
      'Immediate: Apply fungicide treatment',
      'Week 1: Improve air circulation',
      'Week 2-4: Regular monitoring and prevention'
    ],
    'Rust Disease': [
      'Immediate: Remove all infected leaves',
      'Day 3-7: Apply treatment and improve spacing',
      'Week 2-3: Monitor for new infections'
    ]
  };
  
  return {
    treatments: treatments[diseaseName] || treatments['Early Blight'],
    tips: tips[diseaseName] || tips['Early Blight'],
    schedule: schedule[diseaseName] || schedule['Early Blight']
  };
};

const loadHistory = () => {
  const history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
  
  if (history.length === 0) {
    if (noHistory) {
      noHistory.classList.remove('hidden');
    }
    if (historyItems) {
      historyItems.classList.add('hidden');
    }
    return;
  }
  
  if (noHistory) {
    noHistory.classList.add('hidden');
  }
  if (historyItems) {
    historyItems.classList.remove('hidden');
    
    historyItems.innerHTML = history.map(item => `
      <div class="history-card card p-4 mb-4 fade-in">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-lg">${item.disease}</h3>
          <span class="text-sm text-gray-500">${item.timestamp}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <img src="${item.image}" alt="Scanned crop" class="w-full h-32 object-cover rounded-lg">
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-2">Confidence: ${item.confidence}</p>
            <p class="text-sm text-gray-600 mb-2">Severity: ${item.severity}</p>
            <div class="flex gap-2">
              <button onclick="deleteHistoryItem(${item.id})" class="text-red-500 hover:text-red-700 text-sm">
                <i class="fas fa-trash"></i> Delete
              </button>
              <button onclick="viewTreatment(${item.id})" class="text-blue-500 hover:text-blue-700 text-sm">
                <i class="fas fa-eye"></i> View Treatment
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
};

const deleteHistoryItem = (id) => {
  let history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
  history = history.filter(item => item.id !== id);
  localStorage.setItem('scanHistory', JSON.stringify(history));
  loadHistory();
  showNotification('History item deleted successfully!', 'success');
};

const clearHistory = () => {
  if (confirm('Are you sure you want to clear all history?')) {
    localStorage.removeItem('scanHistory');
    loadHistory();
    showNotification('History cleared successfully!', 'success');
  }
};

// Alias for clearHistory to match HTML onclick reference
const clearAllHistory = clearHistory;

// Treatment Modal Elements
const treatmentModal = document.getElementById('treatmentModal');
const closeTreatment = document.getElementById('closeTreatment');
const closeTreatmentBtn = document.getElementById('closeTreatmentBtn');
const printTreatment = document.getElementById('printTreatment');
const shareTreatment = document.getElementById('shareTreatment');

// Treatment Modal Event Handlers
if (closeTreatment) {
  closeTreatment.addEventListener('click', () => {
    closeTreatmentModal();
  });
}

if (closeTreatmentBtn) {
  closeTreatmentBtn.addEventListener('click', () => {
    closeTreatmentModal();
  });
}

if (printTreatment) {
  printTreatment.addEventListener('click', () => {
    printTreatmentReport();
  });
}

if (shareTreatment) {
  shareTreatment.addEventListener('click', () => {
    shareTreatmentReport();
  });
}

// Close modal when clicking outside
if (treatmentModal) {
  treatmentModal.addEventListener('click', (e) => {
    if (e.target === treatmentModal) {
      closeTreatmentModal();
    }
  });
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && treatmentModal && !treatmentModal.classList.contains('hidden')) {
    closeTreatmentModal();
  }
});

const viewTreatment = (id) => {
  const history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
  const item = history.find(h => h.id === id);
  
  if (!item) {
    showNotification('Treatment information not found', 'error');
    return;
  }

  // Populate modal with treatment data
  populateTreatmentModal(item);
  
  // Show the modal
  showTreatmentModal();
};

const populateTreatmentModal = (item) => {
  // Set disease information
  const treatmentModalImage = document.getElementById('treatmentModalImage');
  const treatmentModalDisease = document.getElementById('treatmentModalDisease');
  const treatmentModalConfidence = document.getElementById('treatmentModalConfidence');
  const treatmentModalSeverity = document.getElementById('treatmentModalSeverity');
  const treatmentModalDate = document.getElementById('treatmentModalDate');
  
  if (treatmentModalImage) treatmentModalImage.src = item.image;
  if (treatmentModalDisease) treatmentModalDisease.textContent = item.disease;
  if (treatmentModalConfidence) treatmentModalConfidence.textContent = item.confidence + ' Confidence';
  if (treatmentModalSeverity) treatmentModalSeverity.textContent = item.severity;
  if (treatmentModalDate) treatmentModalDate.textContent = item.timestamp;
  
  // Populate treatment lists
  const treatmentData = item.treatmentData || getCompleteTreatmentData(item.disease);
  
  const treatmentModalTreatmentList = document.getElementById('treatmentModalTreatmentList');
  const treatmentModalTipsList = document.getElementById('treatmentModalTipsList');
  const treatmentModalScheduleList = document.getElementById('treatmentModalScheduleList');
  
  if (treatmentModalTreatmentList) {
    treatmentModalTreatmentList.innerHTML = treatmentData.treatments.map(step => `
      <li class="treatment-item">
        <i class="fas fa-check-circle"></i>
        ${step}
      </li>
    `).join('');
  }
  
  if (treatmentModalTipsList) {
    treatmentModalTipsList.innerHTML = treatmentData.tips.map(tip => `
      <li class="treatment-item">
        <i class="fas fa-lightbulb"></i>
        ${tip}
      </li>
    `).join('');
  }
  
  if (treatmentModalScheduleList) {
    treatmentModalScheduleList.innerHTML = treatmentData.schedule.map(item => `
      <li class="treatment-item">
        <i class="fas fa-calendar-check"></i>
        ${item}
      </li>
    `).join('');
  }
};

const showTreatmentModal = () => {
  if (treatmentModal) {
    treatmentModal.classList.remove('hidden');
    const modalContent = treatmentModal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.classList.add('modal-enter');
    }
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }
};

const closeTreatmentModal = () => {
  if (treatmentModal) {
    treatmentModal.classList.add('hidden');
    const modalContent = treatmentModal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.classList.remove('modal-enter');
    }
    // Restore body scroll
    document.body.style.overflow = '';
  }
};

const printTreatmentReport = () => {
  // Create a printable version of the treatment
  const printWindow = window.open('', '_blank');
  const treatmentModalDisease = document.getElementById('treatmentModalDisease');
  const treatmentModalConfidence = document.getElementById('treatmentModalConfidence');
  const treatmentModalSeverity = document.getElementById('treatmentModalSeverity');
  const treatmentModalDate = document.getElementById('treatmentModalDate');
  const treatmentModalTreatmentList = document.getElementById('treatmentModalTreatmentList');
  const treatmentModalTipsList = document.getElementById('treatmentModalTipsList');
  const treatmentModalScheduleList = document.getElementById('treatmentModalScheduleList');
  
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CropGuard AI - Treatment Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #19ad50; padding-bottom: 10px; }
        .disease-info { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .section-title { color: #19ad50; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        ul { list-style-type: none; padding: 0; }
        li { padding: 5px 0; border-bottom: 1px solid #eee; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🌱 CropGuard AI</h1>
        <h2>Plant Disease Treatment Report</h2>
      </div>
      
      <div class="disease-info">
        <h3>Disease: ${treatmentModalDisease?.textContent || 'N/A'}</h3>
        <p><strong>Confidence:</strong> ${treatmentModalConfidence?.textContent || 'N/A'}</p>
        <p><strong>Severity:</strong> ${treatmentModalSeverity?.textContent || 'N/A'}</p>
        <p><strong>Scanned on:</strong> ${treatmentModalDate?.textContent || 'N/A'}</p>
      </div>
      
      <div class="section">
        <h3 class="section-title">🏥 Treatment Recommendations</h3>
        <ul>
          ${treatmentModalTreatmentList?.innerHTML.replace(/<i[^>]*><\/i>\s*/g, '• ') || '<li>No treatment information available</li>'}
        </ul>
      </div>
      
      <div class="section">
        <h3 class="section-title">💡 Prevention & Care Tips</h3>
        <ul>
          ${treatmentModalTipsList?.innerHTML.replace(/<i[^>]*><\/i>\s*/g, '• ') || '<li>No tips available</li>'}
        </ul>
      </div>
      
      <div class="section">
        <h3 class="section-title">📅 Care Schedule</h3>
        <ul>
          ${treatmentModalScheduleList?.innerHTML.replace(/<i[^>]*><\/i>\s*/g, '• ') || '<li>No schedule available</li>'}
        </ul>
      </div>
      
      <div class="footer">
        <p>Generated by CropGuard AI - Empowering farmers with AI technology</p>
        <p>Report generated on: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
};

const shareTreatmentReport = () => {
  const treatmentModalDisease = document.getElementById('treatmentModalDisease');
  const diseaseName = treatmentModalDisease?.textContent || 'Plant Disease';
  
  const shareText = `🌱 CropGuard AI Treatment Report\n\nDisease: ${diseaseName}\n\nGet detailed treatment recommendations and care tips with CropGuard AI!`;
  
  if (navigator.share) {
    navigator.share({
      title: 'CropGuard AI Treatment Report',
      text: shareText,
      url: window.location.href
    }).then(() => {
      showNotification('Treatment report shared successfully!', 'success');
    }).catch((error) => {
      console.error('Error sharing:', error);
      fallbackShare(shareText);
    });
  } else {
    fallbackShare(shareText);
  }
};

const fallbackShare = (text) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Treatment details copied to clipboard!', 'success');
    }).catch(() => {
      showNotification('Unable to copy to clipboard', 'error');
    });
  } else {
    showNotification('Sharing not supported on this device', 'info');
  }
};

// Community Forum
const loadCommunityPosts = () => {
  // Simulate community posts
  const posts = [
    {
      id: 1,
      author: 'John Mwangi',
      content: 'Has anyone experienced yellow spots on maize leaves? Looking for advice.',
      date: '2 hours ago',
      likes: 5,
      comments: 3
    },
    {
      id: 2,
      author: 'Sarah Ochieng',
      content: 'Great app! Helped me identify tomato blight early. Saved my crop!',
      date: '1 day ago',
      likes: 12,
      comments: 7
    },
    {
      id: 3,
      author: 'David Kamau',
      content: 'Best practices for coffee rust prevention? Any organic solutions?',
      date: '3 days ago',
      likes: 8,
      comments: 11
    }
  ];
  
  const communityPosts = document.getElementById('communityPosts');
  if (communityPosts) {
    communityPosts.innerHTML = posts.map(post => `
      <div class="community-post slide-up">
        <div class="post-header">
          <span class="post-author">${post.author}</span>
          <span class="post-date">${post.date}</span>
        </div>
        <div class="post-content">${post.content}</div>
        <div class="post-actions">
          <button class="action-btn">
            <i class="fas fa-thumbs-up"></i> ${post.likes}
          </button>
          <button class="action-btn">
            <i class="fas fa-comment"></i> ${post.comments}
          </button>
          <button class="action-btn">
            <i class="fas fa-share"></i>
          </button>
        </div>
      </div>
    `).join('');
  }
};

// New Post Form
if (newPostForm) {
  newPostForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(newPostForm);
    const content = formData.get('postContent');
    
    if (content.trim()) {
      // Add new post to community
      const newPost = {
        id: Date.now(),
        author: 'You',
        content: content,
        date: 'Just now',
        likes: 0,
        comments: 0
      };
      
      // In a real app, this would be sent to a server
      showNotification('Post shared successfully!', 'success');
      newPostForm.reset();
      
      // Reload community posts
      loadCommunityPosts();
    }
  });
}

if (clearFormBtn) {
  clearFormBtn.addEventListener('click', () => {
    newPostForm.reset();
  });
}

// Community Reports
const generateCommunityReports = () => {
  const reportsContainer = document.getElementById('reportsContainer');
  if (!reportsContainer) return;
  
  const reports = [
    {
      title: 'Disease Outbreak Alert',
      description: 'Multiple reports of early blight in maize crops across the region',
      status: 'urgent',
      date: '2 hours ago',
      affected: '15 farmers'
    },
    {
      title: 'Weather Advisory',
      description: 'Heavy rainfall expected, risk of fungal diseases increasing',
      status: 'pending',
      date: '1 day ago',
      affected: 'All farmers'
    },
    {
      title: 'Treatment Success Report',
      description: 'Neem oil treatment effective against powdery mildew',
      status: 'resolved',
      date: '3 days ago',
      affected: '8 farmers'
    }
  ];
  
  reportsContainer.innerHTML = reports.map(report => `
    <div class="report-item slide-up">
      <div class="report-header">
        <h4 class="report-title">${report.title}</h4>
        <span class="report-status status-${report.status}">${report.status}</span>
      </div>
      <p class="text-sm text-gray-600 mb-2">${report.description}</p>
      <div class="flex justify-between text-xs text-gray-500">
        <span>${report.date}</span>
        <span>Affected: ${report.affected}</span>
      </div>
    </div>
  `).join('');
};

// Utility Functions
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    type === 'warning' ? 'bg-yellow-500 text-white' :
    'bg-blue-500 text-white'
  }`;
  
  notification.innerHTML = `
    <div class="flex items-center">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
  
  // Remove on click
  notification.addEventListener('click', () => {
    notification.remove();
  });
};

// Initialize App
const initApp = () => {
  loadSavedTheme();
  loadWeatherData();
  loadHistory();
  loadCommunityPosts();
  generateCommunityReports();
  
  // Add entrance animations
  document.querySelectorAll('.card').forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('fade-in');
    }, index * 100);
  });
};

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initApp();
  initLoginPage();
  initSignupPage();
});

// ==========================================================
// LOGIN PAGE FUNCTIONALITY
// ==========================================================

// Initialize login functionality
function initLoginPage() {
  console.log('Initializing login page...');
  
  // Check if we're on the login page
  const isLoginPage = window.location.pathname.includes('login.html') || document.getElementById('loginForm');
  if (!isLoginPage) return;
  
  console.log('Login page detected, setting up functionality...');
  // DOM Elements for Login
  const loginForm = document.getElementById('loginForm');
  const loginIdentifier = document.getElementById('loginIdentifier');
  const loginPassword = document.getElementById('loginPassword');
  const loginPasswordToggle = document.getElementById('loginPasswordToggle');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const loginBtnText = document.getElementById('loginBtnText');
  const loginBtnIcon = document.getElementById('loginBtnIcon');
  
  // Password Toggle for Login
  if (loginPasswordToggle) {
    loginPasswordToggle.addEventListener('click', function() {
      const type = loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
      loginPassword.setAttribute('type', type);
      
      const icon = this.querySelector('i');
      icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
  }
  
  // Login Form Validation
  function validateLoginField(field, errorElement, validationFn) {
    const value = field.value.trim();
    const isValid = validationFn(value);
    
    if (isValid) {
      field.classList.remove('form-error');
      field.classList.add('form-success');
      errorElement.classList.add('hidden');
      return true;
    } else {
      field.classList.remove('form-success');
      field.classList.add('form-error');
      errorElement.classList.remove('hidden');
      return false;
    }
  }
  
  function validatePhone(value) {
    return /^[\+]?[1-9][\d]{0,15}$/.test(value);
  }
  
  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  
  function validatePassword(value) {
    return value.length >= 6;
  }
  
  // Real-time validation for Login
  if (loginIdentifier) {
    loginIdentifier.addEventListener('input', function() {
      const value = this.value.trim();
      const isEmail = value.includes('@');
      const isValid = isEmail ? validateEmail(value) : validatePhone(value);
      
      if (isValid) {
        this.classList.remove('form-error');
        this.classList.add('form-success');
        document.getElementById('loginIdentifierError').classList.add('hidden');
      } else {
        this.classList.remove('form-success');
        this.classList.add('form-error');
        const errorElement = document.getElementById('loginIdentifierError');
        errorElement.classList.remove('hidden');
        errorElement.textContent = isEmail ? 'Please enter a valid email address' : 'Please enter a valid phone number';
      }
    });
  }
  
  if (loginPassword) {
    loginPassword.addEventListener('input', function() {
      validateLoginField(this, document.getElementById('loginPasswordError'), validatePassword);
    });
  }
  
  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validate all fields
      const identifierValid = loginIdentifier.classList.contains('form-success');
      const passwordValid = loginPassword.classList.contains('form-success');
      
      if (!identifierValid || !passwordValid) {
        showNotification('Please fix the errors before submitting', 'error');
        return;
      }
      
      // Show loading state
      loginSubmitBtn.classList.add('loading', 'btn-loading');
      loginBtnText.textContent = 'Logging in...';
      loginBtnIcon.className = 'fas fa-spinner fa-spin ml-2';
      
      // Simulate login process
      setTimeout(() => {
        // Success - redirect to main app
        showNotification('Login successful! Redirecting to main app...', 'success');
        
        setTimeout(() => {
          window.location.href = 'main.html';
        }, 1500);
        
      }, 2000);
    });
  }
  
  // Focus first field on page load for Login
  window.addEventListener('load', function() {
    if (loginIdentifier) {
      loginIdentifier.focus();
    }
  });
}

// ==========================================================
// SIGNUP PAGE FUNCTIONALITY
// ==========================================================

// Initialize signup functionality
function initSignupPage() {
  console.log('Initializing signup page...');
  
  // Check if we're on the signup page
  const isSignupPage = window.location.pathname.includes('signup.html') || document.getElementById('signupForm');
  if (!isSignupPage) return;
  
  console.log('Signup page detected, setting up functionality...');
  // DOM Elements for Signup
  const signupForm = document.getElementById('signupForm');
  const fullName = document.getElementById('fullName');
  const phoneNumber = document.getElementById('phoneNumber');
  const emailAddress = document.getElementById('emailAddress');
  const location = document.getElementById('location');
  const preferredLanguage = document.getElementById('preferredLanguage');
  const cropTypes = document.getElementById('cropTypes');
  const signupPassword = document.getElementById('signupPassword');
  const confirmPassword = document.getElementById('confirmPassword');
  const termsConsent = document.getElementById('termsConsent');
  const signupSubmitBtn = document.getElementById('signupSubmitBtn');
  const signupBtnText = document.getElementById('signupBtnText');
  const signupBtnIcon = document.getElementById('signupBtnIcon');
  
  // Password Toggle Functions for Signup
  function setupPasswordToggle(passwordField, toggleButton) {
    if (toggleButton) {
      toggleButton.addEventListener('click', function() {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
      });
    }
  }
  
  setupPasswordToggle(signupPassword, document.getElementById('signupPasswordToggle'));
  setupPasswordToggle(confirmPassword, document.getElementById('confirmPasswordToggle'));
  
  // Signup Form Validation Functions
  function validateSignupField(field, errorElement, validationFn, errorMessage) {
    const value = field.value.trim();
    const isValid = validationFn(value);
    
    if (isValid) {
      field.classList.remove('form-error');
      field.classList.add('form-success');
      errorElement.classList.add('hidden');
      return true;
    } else {
      field.classList.remove('form-success');
      field.classList.add('form-error');
      errorElement.classList.remove('hidden');
      errorElement.textContent = errorMessage;
      return false;
    }
  }
  
  function validateFullName(value) {
    return value.length >= 2 && /^[a-zA-Z\s]+$/.test(value);
  }
  
  function validateSignupEmail(value) {
    if (value === '') return true; // Optional field
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  
  function validateConfirmPassword(value) {
    return value === signupPassword.value && value !== '';
  }
  
  function validateSelect(field) {
    return field.value !== '';
  }
  
  function validateTermsConsent() {
    return termsConsent.checked;
  }
  
  // Real-time validation for Signup
  if (fullName) {
    fullName.addEventListener('input', function() {
      validateSignupField(this, document.getElementById('fullNameError'), validateFullName, 'Please enter a valid full name (minimum 2 characters, letters only)');
    });
  }
  
  if (phoneNumber) {
    phoneNumber.addEventListener('input', function() {
      validateSignupField(this, document.getElementById('phoneNumberError'), validatePhone, 'Please enter a valid phone number');
    });
  }
  
  // Shared validation functions
  function validatePhone(value) {
    return /^[\+]?[1-9][\d]{0,15}$/.test(value);
  }
  
  function validatePassword(value) {
    return value.length >= 6;
  }
  
  if (emailAddress) {
    emailAddress.addEventListener('input', function() {
      validateSignupField(this, document.getElementById('emailAddressError'), validateSignupEmail, 'Please enter a valid email address');
    });
  }
  
  if (location) {
    location.addEventListener('change', function() {
      validateSignupField(this, document.getElementById('locationError'), validateSelect, 'Please select your location');
    });
  }
  
  if (preferredLanguage) {
    preferredLanguage.addEventListener('change', function() {
      validateSignupField(this, document.getElementById('preferredLanguageError'), validateSelect, 'Please select your preferred language');
    });
  }
  
  if (cropTypes) {
    cropTypes.addEventListener('change', function() {
      validateSignupField(this, document.getElementById('cropTypesError'), validateSelect, 'Please select your crop types');
    });
  }
  
  if (signupPassword) {
    signupPassword.addEventListener('input', function() {
      validateSignupField(this, document.getElementById('signupPasswordError'), validatePassword, 'Password must be at least 6 characters long');
    });
  }
  
  if (confirmPassword) {
    confirmPassword.addEventListener('input', function() {
      validateSignupField(this, document.getElementById('confirmPasswordError'), validateConfirmPassword, 'Passwords do not match');
    });
  }
  
  if (termsConsent) {
    termsConsent.addEventListener('change', function() {
      const errorElement = document.getElementById('termsConsentError');
      if (this.checked) {
        errorElement.classList.add('hidden');
      } else {
        errorElement.classList.remove('hidden');
        errorElement.textContent = 'You must agree to the terms and privacy policy';
      }
    });
  }
  
  // Signup Form Submission
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validate all required fields
      const fullNameValid = validateSignupField(fullName, document.getElementById('fullNameError'), validateFullName, 'Please enter a valid full name');
      const phoneValid = validateSignupField(phoneNumber, document.getElementById('phoneNumberError'), validatePhone, 'Please enter a valid phone number');
      const emailValid = validateSignupField(emailAddress, document.getElementById('emailAddressError'), validateSignupEmail, 'Please enter a valid email address');
      const locationValid = validateSignupField(location, document.getElementById('locationError'), validateSelect, 'Please select your location');
      const languageValid = validateSignupField(preferredLanguage, document.getElementById('preferredLanguageError'), validateSelect, 'Please select your preferred language');
      const cropValid = validateSignupField(cropTypes, document.getElementById('cropTypesError'), validateSelect, 'Please select your crop types');
      const passwordValid = validateSignupField(signupPassword, document.getElementById('signupPasswordError'), validatePassword, 'Password must be at least 6 characters long');
      const confirmValid = validateSignupField(confirmPassword, document.getElementById('confirmPasswordError'), validateConfirmPassword, 'Passwords do not match');
      const termsValid = validateTermsConsent();
      
      if (!fullNameValid || !phoneValid || !emailValid || !locationValid || !languageValid || !cropValid || !passwordValid || !confirmValid || !termsValid) {
        showNotification('Please fix all errors before submitting', 'error');
        return;
      }
      
      // Show loading state
      signupSubmitBtn.classList.add('loading', 'btn-loading');
      signupBtnText.textContent = 'Creating Account...';
      signupBtnIcon.className = 'fas fa-spinner fa-spin ml-2';
      
      // Simulate account creation process
      setTimeout(() => {
        // Success - show notification and redirect to login
        showNotification('Account created successfully! Redirecting to login...', 'success');
        
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
        
      }, 3000);
    });
  }
  
  // Focus first field on page load for Signup
  window.addEventListener('load', function() {
    if (fullName) {
      fullName.focus();
    }
  });
}
