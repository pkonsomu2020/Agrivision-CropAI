
// --- Analytics Dashboard JS ---
// Handles sidebar tab switching, dashboard panel loading, and backend integration points
//
// BACKEND INTEGRATION NOTES:
// - All data update points are marked with 'TODO: BACKEND'.
// - Replace static values with API calls or backend data as needed.
// - Each panel loader is modular and can be called independently.
// - Use fetch() or your preferred AJAX method to update the UI.
// - All chart and card update points are clearly commented for backend devs.

document.addEventListener('DOMContentLoaded', function () {
  // Sidebar tab switching
  const tabs = document.querySelectorAll('.sidebar-tab');
  const dashboardPanels = document.getElementById('dashboard-panels');
  const emptyState = document.getElementById('emptyState');

  // Tab content loaders (modular, backend-ready)
  const tabLoaders = {
    overview: loadOverviewPanels,
    disease: loadDiseasePanels,
    // yield: loadYieldPanels,
    engagement: loadEngagementPanels,
    compare: loadComparePanels,
    export: loadExportPanels
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const tabKey = this.getAttribute('data-tab');
      loadTab(tabKey);
    });
  });

  // Initial load
  loadTab('overview');

  function loadTab(tabKey) {
    dashboardPanels.innerHTML = '';
    emptyState.classList.add('hidden');
    if (tabLoaders[tabKey]) {
      tabLoaders[tabKey]();
    } else {
      showEmptyState();
    }
  }

  function showEmptyState() {
    dashboardPanels.innerHTML = '';
    emptyState.classList.remove('hidden');
  }

  // --- Modular Panel Loaders ---
  /**
   * Load Overview Panels (backend-ready)
   * All data is loaded via fetchOverviewData().
   * Replace fetchOverviewData with your backend API call.
   */
  async function loadOverviewPanels() {
    dashboardPanels.innerHTML = `
      <div class="overview-cards-grid">
        <div class="dashboard-card overview-card animate-card" id="cardTotalReports">
          <div class="dashboard-card-title"><i class="fas fa-file-alt overview-icon"></i> Total Reports</div>
          <div class="dashboard-card-content">
            <span class="overview-metric" id="totalReports">--</span>
          </div>
        </div>
        <div class="dashboard-card overview-card animate-card" id="cardActiveOutbreaks">
          <div class="dashboard-card-title"><i class="fas fa-exclamation-triangle overview-icon" style="color:#d9534f;"></i> Active Outbreaks</div>
          <div class="dashboard-card-content">
            <span class="overview-metric" id="activeOutbreaks">--</span>
          </div>
        </div>
        <div class="dashboard-card overview-card animate-card" id="cardAvgYield">
          <div class="dashboard-card-title"><i class="fas fa-seedling overview-icon" style="color:#8BAA61;"></i> Avg. Yield (t/ha)</div>
          <div class="dashboard-card-content">
            <span class="overview-metric" id="avgYield">--</span>
          </div>
        </div>
      </div>
      <div class="dashboard-card ai-insights-card animate-card" style="grid-column: 1 / -1;">
        <div class="dashboard-card-title"><i class="fas fa-robot overview-icon" style="color:#5D7C3A;"></i> AI Insights</div>
        <div class="dashboard-card-content">
          <span id="aiInsights">AI-powered insights will appear here.</span>
        </div>
      </div>
    `;
    // --- BACKEND INTEGRATION: Fetch overview data from backend ---
    // Example: const data = await fetch('/api/overview').then(r => r.json());
    const data = await fetchOverviewData();
    // Animate numbers in
    function animateNumber(id, end, duration = 900) {
      const el = document.getElementById(id);
      let start = 0;
      const step = Math.ceil(end / (duration / 16));
      function tick() {
        start += step;
        if (start >= end) {
          el.textContent = end.toLocaleString();
        } else {
          el.textContent = start.toLocaleString();
          requestAnimationFrame(tick);
        }
      }
      tick();
    }
    animateNumber('totalReports', data.totalReports);
    animateNumber('activeOutbreaks', data.activeOutbreaks);
    animateNumber('avgYield', data.avgYield);
    document.getElementById('aiInsights').textContent = data.aiInsights;
    // Card hover/active effect
    document.querySelectorAll('.overview-card').forEach(card => {
      card.addEventListener('mouseenter', () => card.classList.add('active'));
      card.addEventListener('mouseleave', () => card.classList.remove('active'));
    });
  }

  /**
   * Fetch overview data from backend API.
   * Replace this with your backend integration (Supabase, REST, etc).
   * Should return a Promise that resolves to an object with totalReports, activeOutbreaks, avgYield, aiInsights.
   */
  async function fetchOverviewData() {
    // TODO: Replace this sample data with a real backend call
    // Example: return fetch('/api/overview').then(res => res.json());
    return {
      totalReports: 1245,
      activeOutbreaks: 7,
      avgYield: 3.2,
      aiInsights: 'No major outbreaks detected. Yields are above average.'
    };
  }

  /**
   * Load Disease Analytics Panels (backend-ready)
   * All data is loaded via fetchDiseaseAnalytics().
   * Replace fetchDiseaseAnalytics with your backend API call.
   */
  async function loadDiseasePanels() {
    dashboardPanels.innerHTML = `
      <div class="disease-analytics-pro-grid four-cards-grid">
        <div class="dashboard-card disease-trends-card animate-card">
          <div class="dashboard-card-title"><i class="fas fa-chart-line disease-icon" style="color:#8BAA61;"></i> Disease Trends</div>
          <div class="dashboard-card-content">
            <canvas id="diseaseTrendsChart" style="width:100%;max-width:340px;"></canvas>
          </div>
        </div>
        <div class="dashboard-card disease-pie-card animate-card">
          <div class="dashboard-card-title"><i class="fas fa-chart-pie disease-icon" style="color:#B7D77A;"></i> Disease Distribution</div>
          <div class="dashboard-card-content">
          <canvas id="diseasePieChart" style="width:100%;max-width:540px;"></canvas>
          </div>
        </div>
        <div class="dashboard-card disease-yield-card animate-card">
          <div class="dashboard-card-title"><i class="fas fa-seedling disease-icon" style="color:#5D7C3A;"></i> Yield Prediction</div>
          <div class="dashboard-card-content" style="height:100%;min-height:120px;display:flex;align-items:center;justify-content:center;">
            <canvas id="yieldPredictionChart" style="width:100%;max-width:340px;"></canvas>
          </div>
        </div>
        <div class="dashboard-card top-diseases-card animate-card">
          <div class="dashboard-card-title"><i class="fas fa-bug disease-icon" style="color:#d9534f;"></i> Top Diseases</div>
          <div class="dashboard-card-content">
            <ul id="topDiseasesList" style="width:100%"></ul>
          </div>
        </div>
      </div>
    `;
    // --- BACKEND INTEGRATION: Fetch disease analytics from backend ---
    // Example: const data = await fetch('/api/disease-analytics').then(r => r.json());
    const data = await fetchDiseaseAnalytics();
    // --- Yield Prediction Chart (Bar) ---
    const yieldCtx = document.getElementById('yieldPredictionChart').getContext('2d');
    new Chart(yieldCtx, {
      type: 'bar',
      data: {
        labels: data.yield.labels,
        datasets: [{
          label: 'Predicted Yield (t/ha)',
          data: data.yield.values,
          backgroundColor: ['#5D7C3A', '#8DB255', '#B7D77A']
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
    // --- Disease Trends Chart (Line) ---
    const ctx = document.getElementById('diseaseTrendsChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.trends.labels,
        datasets: [{
          label: 'Disease Reports',
          data: data.trends.values,
          borderColor: '#5D7C3A',
          backgroundColor: 'rgba(93,124,58,0.12)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
    // --- Top Diseases List ---
    document.getElementById('topDiseasesList').innerHTML = data.topDiseases.map(d => `<li>${d}</li>`).join('');
    // --- Disease Distribution Pie/Donut Chart ---
    const pieCtx = document.getElementById('diseasePieChart').getContext('2d');
    new Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels: data.distribution.labels,
        datasets: [{
          data: data.distribution.values,
          backgroundColor: ['#5D7C3A', '#8DB255', '#B7D77A', '#e2e8f0'],
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: { display: true, position: 'bottom' }
        },
        cutout: '65%'
      }
    });
  }

  /**
   * Fetch disease analytics from backend API.
   * Replace this with your backend integration (Supabase, REST, etc).
   * Should return a Promise that resolves to an object with trends, yield, topDiseases, distribution.
   */
  async function fetchDiseaseAnalytics() {
    // TODO: Replace this sample data with a real backend call
    // Example: return fetch('/api/disease-analytics').then(res => res.json());
    return {
      trends: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        values: [12, 19, 14, 22, 18, 25]
      },
      yield: {
        labels: ['Maize', 'Wheat', 'Rice'],
        values: [3.2, 2.7, 4.1]
      },
      topDiseases: [
        'Maize Lethal Necrosis (MLN) - 45%',
        'Wheat Rust - 30%',
        'Rice Blast - 15%',
        'Other - 10%'
      ],
      distribution: {
        labels: ['Maize Lethal Necrosis', 'Wheat Rust', 'Rice Blast', 'Other'],
        values: [45, 30, 15, 10]
      }
    };
  }

  // function loadYieldPanels() { /* Removed Crop Yield Prediction tab */ }

  function loadEngagementPanels() {
    // --- FARMER ENGAGEMENT PANELS ---
    // TODO: BACKEND - Replace static values with API data for engagement cards and chart
    dashboardPanels.innerHTML = `
      <div class="engagement-cards-grid">
        <div class="dashboard-card engagement-card animate-card" id="cardActiveFarmers">
          <div class="dashboard-card-title"><i class="fas fa-users engagement-icon" style="color:#5D7C3A;"></i> Active Farmers</div>
          <div class="dashboard-card-content engagement-metric-content">
            <span class="engagement-metric" id="activeFarmers">--</span>
          </div>
        </div>
        <div class="dashboard-card engagement-card animate-card" id="cardReportsSubmitted">
          <div class="dashboard-card-title"><i class="fas fa-file-alt engagement-icon" style="color:#8BAA61;"></i> Reports Submitted</div>
          <div class="dashboard-card-content engagement-metric-content">
            <span class="engagement-metric" id="reportsSubmitted">--</span>
          </div>
        </div>
        <div class="dashboard-card engagement-card animate-card" id="cardAvgResponse">
          <div class="dashboard-card-title"><i class="fas fa-clock engagement-icon" style="color:#B7D77A;"></i> Avg. Response Time</div>
          <div class="dashboard-card-content engagement-metric-content">
            <span class="engagement-metric" id="avgResponse">--</span>
          </div>
        </div>
      </div>
      <div class="dashboard-card engagement-trends-card animate-card" style="grid-column: 1 / -1;">
        <div class="dashboard-card-title"><i class="fas fa-chart-line engagement-icon" style="color:#5D7C3A;"></i> Engagement Trends</div>
        <div class="dashboard-card-content" style="justify-content:center;align-items:center;min-height:320px;">
          <canvas id="engagementTrendsChart" style="width:100%;max-width:540px;max-height:320px;min-height:220px;"></canvas>
        </div>
      </div>
    `;
    // Animate numbers in
    function animateNumber(id, end, duration = 900, suffix = '') {
      const el = document.getElementById(id);
      let start = 0;
      const step = Math.ceil(end / (duration / 16));
      function tick() {
        start += step;
        if (start >= end) {
          el.textContent = end.toLocaleString() + suffix;
        } else {
          el.textContent = start.toLocaleString() + suffix;
          requestAnimationFrame(tick);
        }
      }
      tick();
    }
  // TODO: BACKEND - Replace these with real values from backend
  animateNumber('activeFarmers', 312); // e.g. activeFarmers from API
  animateNumber('reportsSubmitted', 1245); // e.g. reportsSubmitted from API
  animateNumber('avgResponse', 2.1, 900, ' hrs'); // e.g. avgResponse from API

    // Card hover/active effect
    document.querySelectorAll('.engagement-card').forEach(card => {
      card.addEventListener('mouseenter', () => card.classList.add('active'));
      card.addEventListener('mouseleave', () => card.classList.remove('active'));
    });

    // Engagement Trends Chart
    // --- Engagement Trends Chart ---
    // TODO: BACKEND - Replace chart data with backend values
    // Example: fetch('/api/engagement-trends').then(...)
    const ctx = document.getElementById('engagementTrendsChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Reports',
          data: [22, 19, 25, 18, 24, 20, 21], // TODO: BACKEND - Replace with API data
          borderColor: '#5D7C3A',
          backgroundColor: 'rgba(93,124,58,0.12)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  function loadComparePanels() {
    dashboardPanels.innerHTML = `
      <div class="dashboard-card" style="grid-column: 1 / -1;">
        <div class="dashboard-card-title" style="font-size:1.25rem;margin-bottom:1.2rem;letter-spacing:0.5px;">Comparison Tool</div>
        <div class="dashboard-card-content" style="flex-direction: column; align-items: stretch; gap:2.2rem;">
          <div class="flex gap-4 mb-4" style="justify-content:center;align-items:center;">
            <select id="compareA" class="analytics-filter" style="min-width:150px;font-size:1.09rem;padding:0.55rem 1.3rem;border:2px solid #8BAA61;background:#f7faf7;border-radius:8px;font-weight:600;">
              <option value="Maize">🌽 Maize</option>
              <option value="Wheat">🌾 Wheat</option>
              <option value="Rice">🍚 Rice</option>
            </select>
            <span style="font-weight:700;font-size:1.18rem;color:#5D7C3A;letter-spacing:0.5px;">vs</span>
            <select id="compareB" class="analytics-filter" style="min-width:150px;font-size:1.09rem;padding:0.55rem 1.3rem;border:2px solid #8BAA61;background:#f7faf7;border-radius:8px;font-weight:600;">
              <option value="Wheat">🌾 Wheat</option>
              <option value="Maize">🌽 Maize</option>
              <option value="Rice">🍚 Rice</option>
            </select>
          </div>
          <div class="flex gap-0" style="justify-content:center;align-items:stretch;">
            <div class="card" style="flex:1; min-width:0; background:#f7faf7; box-shadow:0 2px 8px rgba(93,124,58,0.07); border-radius:14px 0 0 14px; padding:1.5rem 1.2rem 1.3rem 1.5rem; display:flex; flex-direction:column; align-items:center; border-right:2px solid #e2e8f0;">
              <div class="dashboard-card-title" id="compareA-title" style="font-size:1.15rem;margin-bottom:0.8rem;color:#46602a;letter-spacing:0.2px;display:flex;align-items:center;gap:0.5rem;"></div>
              <ul id="compareA-data" style="width:100%;list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.6rem;">
                <li style="background:#fff;border-radius:8px;padding:0.6rem 1.1rem;font-weight:500;color:#5D7C3A;box-shadow:0 1px 4px rgba(93,124,58,0.04);display:flex;align-items:center;gap:0.6rem;"><i class='fas fa-bug' style='color:#8BAA61;'></i> <span>Disease: 45 cases</span></li>
                <li style="background:#fff;border-radius:8px;padding:0.6rem 1.1rem;font-weight:500;color:#5D7C3A;box-shadow:0 1px 4px rgba(93,124,58,0.04);display:flex;align-items:center;gap:0.6rem;"><i class='fas fa-seedling' style='color:#B7D77A;'></i> <span>Yield: 3.2 t/ha</span></li>
                <li style="background:#fff;border-radius:8px;padding:0.6rem 1.1rem;font-weight:500;color:#5D7C3A;box-shadow:0 1px 4px rgba(93,124,58,0.04);display:flex;align-items:center;gap:0.6rem;"><i class='fas fa-users' style='color:#5D7C3A;'></i> <span>Engagement: 120 farmers</span></li>
              </ul>
            </div>
            <div style="width:2.5rem;display:flex;align-items:center;justify-content:center;">
              <div style="width:2px;height:90%;background:#e2e8f0;border-radius:2px;"></div>
            </div>
            <div class="card" style="flex:1; min-width:0; background:#f7faf7; box-shadow:0 2px 8px rgba(93,124,58,0.07); border-radius:0 14px 14px 0; padding:1.5rem 1.5rem 1.3rem 1.2rem; display:flex; flex-direction:column; align-items:center;">
              <div class="dashboard-card-title" id="compareB-title" style="font-size:1.15rem;margin-bottom:0.8rem;color:#46602a;letter-spacing:0.2px;display:flex;align-items:center;gap:0.5rem;"></div>
              <ul id="compareB-data" style="width:100%;list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.6rem;">
                <li style="background:#fff;border-radius:8px;padding:0.6rem 1.1rem;font-weight:500;color:#5D7C3A;box-shadow:0 1px 4px rgba(93,124,58,0.04);display:flex;align-items:center;gap:0.6rem;"><i class='fas fa-bug' style='color:#8BAA61;'></i> <span>Disease: 30 cases</span></li>
                <li style="background:#fff;border-radius:8px;padding:0.6rem 1.1rem;font-weight:500;color:#5D7C3A;box-shadow:0 1px 4px rgba(93,124,58,0.04);display:flex;align-items:center;gap:0.6rem;"><i class='fas fa-seedling' style='color:#B7D77A;'></i> <span>Yield: 2.7 t/ha</span></li>
                <li style="background:#fff;border-radius:8px;padding:0.6rem 1.1rem;font-weight:500;color:#5D7C3A;box-shadow:0 1px 4px rgba(93,124,58,0.04);display:flex;align-items:center;gap:0.6rem;"><i class='fas fa-users' style='color:#5D7C3A;'></i> <span>Engagement: 90 farmers</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
    // TODO: Replace with backend data
    const cropData = {
      Maize: { disease: '45 cases', yield: '3.2 t/ha', engagement: '120 farmers' },
      Wheat: { disease: '30 cases', yield: '2.7 t/ha', engagement: '90 farmers' },
      Rice: { disease: '15 cases', yield: '4.1 t/ha', engagement: '60 farmers' }
    };
    function getCropIcon(crop) {
      if (crop === 'Maize') return '🌽';
      if (crop === 'Wheat') return '🌾';
      if (crop === 'Rice') return '🍚';
      return '';
    }
    function updateCompare() {
      const a = document.getElementById('compareA').value;
      const b = document.getElementById('compareB').value;
      // Update titles with icon
      document.getElementById('compareA-title').innerHTML = `${getCropIcon(a)} <span>${a}</span>`;
      document.getElementById('compareB-title').innerHTML = `${getCropIcon(b)} <span>${b}</span>`;
      // Update data with styled HTML
      document.getElementById('compareA-data').innerHTML = `
        <li style="background:#fff;border-radius:8px;padding:0.6rem 1.1rem;font-weight:500;color:#5D7C3A;box-shadow:0 1px 4px rgba(93,124,58,0.04);display:flex;align-items:center;gap:0.6rem;"><i class='fas fa-bug' style='color:#8BAA61;'></i> <span>Disease: ${cropData[a].disease}</span></li>
        <li style="background:#fff;border-radius:8px;padding:0.6rem 1.1rem;font-weight:500;color:#5D7C3A;box-shadow:0 1px 4px rgba(93,124,58,0.04);display:flex;align-items:center;gap:0.6rem;"><i class='fas fa-seedling' style='color:#B7D77A;'></i> <span>Yield: ${cropData[a].yield}</span></li>
        <li style="background:#fff;border-radius:8px;padding:0.6rem 1.1rem;font-weight:500;color:#5D7C3A;box-shadow:0 1px 4px rgba(93,124,58,0.04);display:flex;align-items:center;gap:0.6rem;"><i class='fas fa-users' style='color:#5D7C3A;'></i> <span>Engagement: ${cropData[a].engagement}</span></li>
      `;
      document.getElementById('compareB-data').innerHTML = `
        <li style="background:#fff;border-radius:8px;padding:0.6rem 1.1rem;font-weight:500;color:#5D7C3A;box-shadow:0 1px 4px rgba(93,124,58,0.04);display:flex;align-items:center;gap:0.6rem;"><i class='fas fa-bug' style='color:#8BAA61;'></i> <span>Disease: ${cropData[b].disease}</span></li>
        <li style="background:#fff;border-radius:8px;padding:0.6rem 1.1rem;font-weight:500;color:#5D7C3A;box-shadow:0 1px 4px rgba(93,124,58,0.04);display:flex;align-items:center;gap:0.6rem;"><i class='fas fa-seedling' style='color:#B7D77A;'></i> <span>Yield: ${cropData[b].yield}</span></li>
        <li style="background:#fff;border-radius:8px;padding:0.6rem 1.1rem;font-weight:500;color:#5D7C3A;box-shadow:0 1px 4px rgba(93,124,58,0.04);display:flex;align-items:center;gap:0.6rem;"><i class='fas fa-users' style='color:#5D7C3A;'></i> <span>Engagement: ${cropData[b].engagement}</span></li>
      `;
    }
    document.getElementById('compareA').addEventListener('change', updateCompare);
    document.getElementById('compareB').addEventListener('change', updateCompare);
  }

  function loadExportPanels() {
    dashboardPanels.innerHTML = `
      <div class="dashboard-card export-card" style="grid-column: 1 / -1; max-width: 700px; margin: 0 auto;">
        <div class="dashboard-card-title" style="font-size:1.3rem;letter-spacing:0.5px;margin-bottom:1.2rem;display:flex;align-items:center;gap:0.7rem;">
          <i class="fas fa-file-alt" style="color:#8BAA61;font-size:1.3rem;"></i> Reports & Export
        </div>
        <div class="dashboard-card-content" style="flex-direction:column;align-items:flex-start;gap:1.5rem;">
          <div style="display:flex;gap:1.2rem;flex-wrap:wrap;">
            <button class="btn-secondary export-btn" id="exportPDF2"><i class="fas fa-file-pdf mr-2" style="color:#d9534f;"></i>Export as PDF</button>
            <button class="btn-secondary export-btn" id="exportCSV2"><i class="fas fa-file-csv mr-2" style="color:#5D7C3A;"></i>Export as CSV</button>
            <button class="btn-secondary export-btn" id="shareDashboard"><i class="fas fa-share-alt mr-2" style="color:#8BAA61;"></i>Share Dashboard</button>
          </div>
          <div class="export-description" style="font-size:1.04rem;color:#46602a;background:#f7faf7;padding:1rem 1.2rem;border-radius:8px;margin-top:0.5rem;box-shadow:0 1px 4px rgba(93,124,58,0.04);">
            Export analytics for reporting or share with stakeholders. Download as PDF, CSV, or copy a shareable dashboard link.
          </div>
        </div>
      </div>
      <div id="exportStatus" style="margin-top:1.2rem;text-align:center;font-size:1.08rem;color:#5D7C3A;font-weight:500;"></div>
      <!-- Hidden export report for PDF generation -->
      <div id="export-report" style="display:none;padding:0;margin:0;"></div>
    `;
    // --- Render export report (hidden, styled, backend-ready) ---
    function renderExportReport() {
      // You can move this HTML to a template file for backend rendering if needed
      // Logo: Place your logo in assets/img/logo.png or update the src below
      const logoUrl = 'assets/img/logo.png';
      const today = new Date();
      const dateStr = today.toLocaleDateString();
      // Example summary data (replace with backend data)
      const summary = [
        { label: 'Total Reports', value: '1,245' },
        { label: 'Active Outbreaks', value: '7' },
        { label: 'Avg. Yield (t/ha)', value: '3.2' }
      ];
      // Example analytics table (replace with backend data)
      const analyticsRows = [
        ['Crop', 'Disease Cases', 'Yield (t/ha)', 'Engagement'],
        ['Maize', '45', '3.2', '120'],
        ['Wheat', '30', '2.7', '90'],
        ['Rice', '15', '4.1', '60']
      ];
      document.getElementById('export-report').innerHTML = `
        <div style="background:#fff;border-radius:18px;box-shadow:0 4px 18px rgba(93,124,58,0.08);padding:2.5rem 2.5rem 2rem 2.5rem;max-width:720px;margin:0 auto;font-family:'Segoe UI',sans-serif;">
          <div style="display:flex;align-items:center;gap:1.2rem;margin-bottom:1.5rem;">
            <img src='${logoUrl}' alt='CropAI Logo' style='height:54px;width:auto;border-radius:8px;box-shadow:0 1px 4px #e2e8f0;'>
            <div style="font-size:2rem;font-weight:700;color:#5D7C3A;letter-spacing:1px;">CropAI Analytics Report</div>
          </div>
          <div style="font-size:1.08rem;color:#46602a;margin-bottom:0.7rem;">Date: <b>${dateStr}</b></div>
          <div style="margin-bottom:2.2rem;display:flex;gap:2.5rem;">
            ${summary.map(s => `<div style='background:#f7faf7;border-radius:10px;padding:1.1rem 1.7rem;box-shadow:0 1px 4px #e2e8f0;font-size:1.13rem;font-weight:600;color:#46602a;min-width:120px;text-align:center;'>${s.label}<br><span style='font-size:1.5rem;color:#5D7C3A;'>${s.value}</span></div>`).join('')}
          </div>
          <div style="margin-bottom:2.2rem;">
            <div style="font-size:1.15rem;font-weight:600;color:#46602a;margin-bottom:0.7rem;">Crop Analytics</div>
            <table style='width:100%;border-collapse:collapse;font-size:1.08rem;'>
              <thead><tr>${analyticsRows[0].map(h => `<th style='background:#f7faf7;color:#5D7C3A;padding:0.7rem 0.5rem;border-bottom:2px solid #e2e8f0;font-weight:700;'>${h}</th>`).join('')}</tr></thead>
              <tbody>
                ${analyticsRows.slice(1).map(row => `<tr>${row.map((cell, i) => `<td style='padding:0.7rem 0.5rem;border-bottom:1px solid #e2e8f0;color:${i === 0 ? '#46602a' : '#5D7C3A'};font-weight:${i === 0 ? '600' : '500'};'>${cell}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div style="margin-top:2.5rem;font-size:1.02rem;color:#888;text-align:center;">Generated by CropAI | cropai.io</div>
        </div>
      `;
    }
    renderExportReport();
    // --- Export as PDF (Backend-Ready, Dynamic Loader) ---
    document.getElementById('exportPDF2').addEventListener('click', function () {
      const exportStatus = document.getElementById('exportStatus');
      // Helper: Load html2pdf.js dynamically if not present
      function loadHtml2Pdf(callback) {
        if (window.html2pdf) { callback(); return; }
        exportStatus.textContent = 'Loading PDF library...';
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = callback;
        script.onerror = function () {
          exportStatus.textContent = 'Failed to load PDF library.';
        };
        document.body.appendChild(script);
      }
      // Main export logic (easy for backend devs to swap/extend)
      function doExportPDF() {
        exportStatus.textContent = 'Generating PDF...';
        /*
          Backend Integration Point:
          - To export different content, change the selector below.
          - To use server-side PDF, replace this block with an API call.
          - The export-report div is styled and ready for backend customization.
        */
        html2pdf()
          .from(document.getElementById('export-report'))
          .set({ filename: 'CropAI-Analytics.pdf', margin: 0.3, html2canvas: { scale: 2 } })
          .save()
          .then(() => { exportStatus.textContent = 'PDF downloaded!'; setTimeout(() => { exportStatus.textContent = ''; }, 2000); })
          .catch(() => { exportStatus.textContent = 'PDF export failed.'; });
      }
      loadHtml2Pdf(doExportPDF);
    });
    // --- Export as CSV ---
    document.getElementById('exportCSV2').addEventListener('click', function () {
      // Example: Export summary data as CSV
      const rows = [
        ['Crop', 'Disease Cases', 'Yield (t/ha)', 'Engagement'],
        ['Maize', '45', '3.2', '120'],
        ['Wheat', '30', '2.7', '90'],
        ['Rice', '15', '4.1', '60']
      ];
      let csvContent = rows.map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CropAI-Analytics.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      document.getElementById('exportStatus').textContent = 'CSV downloaded!';
      setTimeout(() => { document.getElementById('exportStatus').textContent = ''; }, 2000);
    });
    // --- Share Dashboard (copy link) ---
    document.getElementById('shareDashboard').addEventListener('click', function () {
      const shareUrl = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(function () {
          document.getElementById('exportStatus').textContent = 'Dashboard link copied!';
          setTimeout(() => { document.getElementById('exportStatus').textContent = ''; }, 2000);
        }, function () {
          document.getElementById('exportStatus').textContent = 'Copy failed.';
        });
      } else {
        // fallback
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          document.getElementById('exportStatus').textContent = 'Dashboard link copied!';
        } catch (err) {
          document.getElementById('exportStatus').textContent = 'Copy failed.';
        }
        document.body.removeChild(textarea);
        setTimeout(() => { document.getElementById('exportStatus').textContent = ''; }, 2000);
      }
    });
  }

  // --- Export Buttons (stub) ---
  // Remove old stub export buttons if present
  const exportPDFbtn = document.getElementById('exportPDF');
  if (exportPDFbtn) exportPDFbtn.remove();
  const exportCSVbtn = document.getElementById('exportCSV');
  if (exportCSVbtn) exportCSVbtn.remove();
});
