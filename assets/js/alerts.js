// --- Disease Alerts Tab Logic ---
// Backend-ready: All alert data is loaded via fetchAlerts(). Replace fetchAlerts with your backend API call (e.g., Supabase, REST, GraphQL, etc).

/**
 * Fetch alerts from backend API.
 * Replace this with your backend integration (Supabase, REST, etc).
 * Should return a Promise that resolves to an array of alert objects.
 */
async function fetchAlerts() {
  // TODO: Replace this sample data with a real backend call
  // Example: return fetch('/api/alerts').then(res => res.json());
  return [
    {
      id: 1,
      title: 'Maize Rust Outbreak',
      crop: 'Maize',
      disease: 'Maize Rust',
      severity: 'Critical',
      region: 'Western',
      time: '18 min ago',
      reportedAt: Date.now() - 18*60*1000,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=80&q=80',
      location: [36.8, -0.9],
      farmers: ['John Doe', 'Jane Smith'],
      recommendations: 'Spray with recommended fungicide. Monitor closely.'
    },
    {
      id: 2,
      title: 'Wheat Rust Detected',
      crop: 'Wheat',
      disease: 'Wheat Rust',
      severity: 'Warning',
      region: 'Rift Valley',
      time: '1 hr ago',
      reportedAt: Date.now() - 60*60*1000,
      image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=80&q=80',
      location: [35.3, -0.5],
      farmers: ['Mary W.', 'Paul K.'],
      recommendations: 'Scout nearby fields. Early intervention advised.'
    },
    {
      id: 3,
      title: 'Rice Blast Observation',
      crop: 'Rice',
      disease: 'Rice Blast',
      severity: 'Info',
      region: 'Central',
      time: '3 hrs ago',
      reportedAt: Date.now() - 3*60*60*1000,
      image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=80&q=80',
      location: [37.1, -0.2],
      farmers: ['Ali M.'],
      recommendations: 'Monitor for spread. No action needed yet.'
    },
    {
      id: 4,
      title: 'New Maize Streak Virus',
      crop: 'Maize',
      disease: 'Maize Streak Virus',
      severity: 'Warning',
      region: 'Central',
      time: '2 hrs ago',
      reportedAt: Date.now() - 2*60*60*1000,
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=80&q=80',
      location: [36.9, -0.3],
      farmers: ['Grace N.'],
      recommendations: 'Isolate affected plants. Report further spread.'
    },
    {
      id: 5,
      title: 'Wheat Smut Alert',
      crop: 'Wheat',
      disease: 'Wheat Smut',
      severity: 'Info',
      region: 'Western',
      time: '5 hrs ago',
      reportedAt: Date.now() - 5*60*60*1000,
      image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=80&q=80',
      location: [36.7, -1.1],
      farmers: ['Peter O.'],
      recommendations: 'Monitor and report if symptoms worsen.'
    }
  ];
}

// Holds the current list of alerts in memory
let alerts = [];

// MapTiler basemaps (updated keys and styles)
let currentMapStyle = 'street';
const mapStyles = {
  street: 'https://api.maptiler.com/maps/streets/style.json?key=nejBaczk5JFmHmXR9bjG',
  satellite: 'https://api.maptiler.com/maps/hybrid/style.json?key=nejBaczk5JFmHmXR9bjG',
  terrain: 'https://api.maptiler.com/maps/terrain/style.json?key=nejBaczk5JFmHmXR9bjG',
  dark: 'https://api.maptiler.com/maps/darkmatter/style.json?key=nejBaczk5JFmHmXR9bjG',
  light: 'https://api.maptiler.com/maps/positron/style.json?key=nejBaczk5JFmHmXR9bjG',
  custom: 'https://api.maptiler.com/tiles/v3/style.json?key=nejBaczk5JFmHmXR9bjG'
};
let map;
let mapLoaded = false;

/**
 * Filter alerts based on UI filter controls.
 * This function is backend-ready: just ensure alerts[] is up-to-date from backend.
 */
function filterAlerts() {
  const cropFilter = document.getElementById('filter-crop');
  const severityFilter = document.getElementById('filter-severity');
  const timeFilter = document.getElementById('filter-time');
  let filtered = alerts;
  if (cropFilter && cropFilter.value !== 'All') filtered = filtered.filter(a => a.crop === cropFilter.value);
  if (severityFilter && severityFilter.value !== 'All') filtered = filtered.filter(a => a.severity === severityFilter.value);
  if (timeFilter && timeFilter.value !== 'all') {
    const now = Date.now();
    let ms = 24*60*60*1000;
    if (timeFilter.value === '7d') ms = 7*24*60*60*1000;
    if (timeFilter.value === '30d') ms = 30*24*60*60*1000;
    filtered = filtered.filter(a => now - a.reportedAt <= ms);
  }
  renderAlerts(filtered);
  ensureMap(filtered);
  console.log(`[CropAI Alerts] Cards rendered: ${filtered.length}`);
}

function renderAlerts(alertList) {
  const alertsCards = document.getElementById('alertsCards');
  if (!alertsCards) return;
  alertsCards.innerHTML = '';
  if (!alertList.length) {
    alertsCards.innerHTML = '<div style="color:#aaa;text-align:center;padding:2rem;">No alerts found for selected filters.</div>';
    return;
  }
  alertList.forEach(alert => {
    const card = document.createElement('div');
    card.className = 'alert-card';
    card.innerHTML = `
      <img src="${alert.image}" class="alert-img" alt="Disease image">
      <div class="alert-info">
        <div class="alert-title">${alert.title}</div>
        <div class="alert-meta">${alert.crop} • ${alert.disease} • <span class="alert-region">${alert.region}</span></div>
        <div class="alert-badges">
          <span class="badge badge-${alert.severity.toLowerCase()}">${alert.severity}</span>
        </div>
        <div class="alert-time">${alert.time}</div>
      </div>
    `;
    card.addEventListener('click', () => showAlertDetails(alert));
    alertsCards.appendChild(card);
  });
  console.log('[CropAI Alerts] Alert cards rendered');
}

function ensureMap(alertList) {
  const mapDiv = document.getElementById('alertsMap');
  if (!mapDiv) {
    console.error('[CropAI Alerts] Map container not found!');
    return;
  }
  mapDiv.innerHTML = '';
  if (!window.maplibregl) {
    mapDiv.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#aaa;">MapLibre not loaded</div>';
    console.error('[CropAI Alerts] MapLibre GL JS not loaded!');
    return;
  }
  if (!map) {
    map = new maplibregl.Map({
      container: 'alertsMap',
      style: mapStyles[currentMapStyle],
      center: [36.8, -1.0],
      zoom: 6
    });
    map.on('load', () => {
      mapLoaded = true;
      drawMarkers(alertList);
      console.log('[CropAI Alerts] Map loaded, markers drawn');
    });
    map.on('style.load', () => {
      if (mapLoaded) drawMarkers(alertList);
    });
  } else {
    map.setStyle(mapStyles[currentMapStyle]);
  }
}

function drawMarkers(alertList) {
  if (!map) return;
  if (map._alertMarkers) map._alertMarkers.forEach(m => m.remove());
  map._alertMarkers = [];
  alertList.forEach(alert => {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.background = alert.severity === 'Critical' ? '#e53e3e' : alert.severity === 'Warning' ? '#f59e42' : '#38a169';
    el.style.width = '18px';
    el.style.height = '18px';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid #fff';
    el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.13)';
    el.title = `${alert.title} (${alert.severity})`;
    const marker = new maplibregl.Marker(el).setLngLat(alert.location).addTo(map);
    map._alertMarkers.push(marker);
  });
  console.log(`[CropAI Alerts] Markers drawn: ${alertList.length}`);
}


// --- MAIN ENTRY: Backend-ready initialization ---
document.addEventListener('DOMContentLoaded', async function () {
  console.log('[CropAI Alerts] JS loaded, DOM ready');

  // Map style switcher
  const mapStyleSwitcher = document.getElementById('mapStyleSwitcher');
  if (mapStyleSwitcher) {
    mapStyleSwitcher.addEventListener('change', function () {
      currentMapStyle = this.value;
      if (map) map.setStyle(mapStyles[currentMapStyle]);
    });
  }

  // Share menu logic (unchanged)
  const shareBtn = document.getElementById('shareBanner');
  const shareMenu = document.getElementById('shareMenu');
  let shareMenuOpen = false;
  if (shareBtn && shareMenu) {
    shareBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      shareMenu.style.display = shareMenuOpen ? 'none' : 'flex';
      shareMenuOpen = !shareMenuOpen;
    });
    document.body.addEventListener('click', function () {
      if (shareMenuOpen) {
        shareMenu.style.display = 'none';
        shareMenuOpen = false;
      }
    });
    shareMenu.addEventListener('click', e => e.stopPropagation());
    function getBannerText() {
      const bannerTitle = document.getElementById('bannerTitle');
      const bannerMeta = document.getElementById('bannerMeta');
      return (bannerTitle ? bannerTitle.textContent : '') + ' - ' + (bannerMeta ? bannerMeta.textContent : '');
    }
    const shareWhatsApp = document.getElementById('shareWhatsApp');
    const shareTelegram = document.getElementById('shareTelegram');
    const shareEmail = document.getElementById('shareEmail');
    const shareCopy = document.getElementById('shareCopy');
    if (shareWhatsApp) shareWhatsApp.addEventListener('click', function () {
      const text = encodeURIComponent(getBannerText() + '\n' + window.location.href);
      window.open('https://wa.me/?text=' + text, '_blank');
    });
    if (shareTelegram) shareTelegram.addEventListener('click', function () {
      const text = encodeURIComponent(getBannerText() + '\n' + window.location.href);
      window.open('https://t.me/share/url?url=' + encodeURIComponent(window.location.href) + '&text=' + text, '_blank');
    });
    if (shareEmail) shareEmail.addEventListener('click', function () {
      const subject = encodeURIComponent('CropAI Disease Alert');
      const body = encodeURIComponent(getBannerText() + '\n' + window.location.href);
      window.open('mailto:?subject=' + subject + '&body=' + body, '_blank');
    });
    if (shareCopy) shareCopy.addEventListener('click', function () {
      navigator.clipboard.writeText(getBannerText() + '\n' + window.location.href);
      shareMenu.style.display = 'none';
      shareMenuOpen = false;
      shareBtn.innerHTML = '<i class="fas fa-share-alt mr-2"></i>Copied!';
      setTimeout(() => { shareBtn.innerHTML = '<i class="fas fa-share-alt mr-2"></i>Share'; }, 1200);
    });
  }

  // Filters
  const cropFilter = document.getElementById('filter-crop');
  const severityFilter = document.getElementById('filter-severity');
  const timeFilter = document.getElementById('filter-time');
  if (cropFilter) cropFilter.addEventListener('change', filterAlerts);
  if (severityFilter) severityFilter.addEventListener('change', filterAlerts);
  if (timeFilter) timeFilter.addEventListener('change', filterAlerts);

  // Banner (top urgent alert)
  function updateBanner() {
    const banner = document.getElementById('alertsBanner');
    const bannerTitle = document.getElementById('bannerTitle');
    const bannerMeta = document.getElementById('bannerMeta');
    // Find most recent critical alert
    const critical = alerts.filter(a => a.severity === 'Critical').sort((a,b) => b.reportedAt - a.reportedAt)[0];
    if (bannerTitle && bannerMeta) {
      if (critical) {
        bannerTitle.textContent = `Critical: ${critical.title} in ${critical.region}`;
        bannerMeta.innerHTML = `${critical.time} • Severity: <span class="badge badge-critical">Critical</span> • ${critical.crop}`;
      } else {
        bannerTitle.textContent = 'No critical alerts currently.';
        bannerMeta.innerHTML = '';
      }
    }
  }

  // Alert details modal (simple)
  function showAlertDetails(alert) {
    const modal = document.createElement('div');
    modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.25);z-index:1000;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div style="background:#fff;border-radius:12px;max-width:420px;width:95vw;padding:2rem 1.5rem;box-shadow:0 4px 24px 0 rgba(0,0,0,0.13);position:relative;">
        <button style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.3rem;cursor:pointer;color:#64748b;" onclick="this.parentNode.parentNode.remove()"><i class="fas fa-times"></i></button>
        <img src="${alert.image}" alt="Disease image" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px;margin-bottom:1rem;">
        <div style="font-weight:700;font-size:1.1rem;color:#46602a;margin-bottom:0.3rem;">${alert.title}</div>
        <div style="color:#64748b;font-size:0.98rem;margin-bottom:0.3rem;">${alert.crop} • ${alert.disease} • <span style='color:#5D7C3A;font-weight:500;'>${alert.region}</span></div>
        <div style="margin-bottom:0.3rem;"><span class="badge badge-${alert.severity.toLowerCase()}">${alert.severity}</span> <span style="color:#a0aec0;font-size:0.95rem;">${alert.time}</span></div>
        <div style="margin-bottom:0.5rem;"><b>Reporting Farmers:</b> ${alert.farmers.join(', ')}</div>
        <div style="margin-bottom:0.5rem;"><b>Recommendations:</b> ${alert.recommendations}</div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // --- BACKEND INTEGRATION: Load alerts from backend and render ---
  try {
    alerts = await fetchAlerts(); // Fetch from backend (replace fetchAlerts with your API call)
    updateBanner();
    filterAlerts();
    console.log('[CropAI Alerts] Initial render complete');
  } catch (err) {
    console.error('[CropAI Alerts] Failed to load alerts from backend:', err);
    // Optionally show error UI here
  }
});
