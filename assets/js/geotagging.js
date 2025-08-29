// geotagging.js
// Handles map, FABs, sidebar, and geotagging logic for geotagging.html
// All backend integration points are clearly commented for backend team

// --- Navbar toggle logic ---
function setupNavbar() {
  const navbarToggle = document.getElementById('navbar-toggle');
  const sidebarNav = document.getElementById('sidebar-nav');
  const overlay = document.getElementById('nav-overlay');
  const closeSidebar = document.getElementById('close-sidebar');

  if (navbarToggle && sidebarNav && overlay) {
    navbarToggle.addEventListener('click', () => {
      sidebarNav.classList.toggle('open');
      overlay.classList.toggle('show');
    });
    overlay.addEventListener('click', () => {
      sidebarNav.classList.remove('open');
      overlay.classList.remove('show');
    });
  }
  if (closeSidebar && sidebarNav && overlay) {
    closeSidebar.addEventListener('click', () => {
      sidebarNav.classList.remove('open');
      overlay.classList.remove('show');
    });
  }
}

// --- Dark/Light mode toggle ---
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      // Optionally persist theme in localStorage
    });
  }
}

// --- Maplibre map initialization ---
// Placeholder: Replace with backend-provided user region/coordinates
const defaultCoords = [36.8219, -1.2921]; // Nairobi, Kenya
const defaultZoom = 7;

// Basemap styles
const basemaps = [
  { name: 'Street', url: 'https://api.maptiler.com/maps/streets/style.json?key=nejBaczk5JFmHmXR9bjG' },
  { name: 'Satellite', url: 'https://api.maptiler.com/maps/hybrid/style.json?key=nejBaczk5JFmHmXR9bjG' },
  { name: 'Terrain', url: 'https://api.maptiler.com/maps/terrain/style.json?key=nejBaczk5JFmHmXR9bjG' },
  { name: 'Dark', url: 'https://api.maptiler.com/maps/darkmatter/style.json?key=nejBaczk5JFmHmXR9bjG' },
  { name: 'Light', url: 'https://api.maptiler.com/maps/positron/style.json?key=nejBaczk5JFmHmXR9bjG' },
  { name: 'Custom', url: 'https://api.maptiler.com/tiles/v3/style.json?key=nejBaczk5JFmHmXR9bjG' },
];

let map;
let currentBasemap = basemaps[0].url;

function initMap() {
  map = new maplibregl.Map({
    container: 'map',
    style: currentBasemap,
    center: defaultCoords,
    zoom: defaultZoom,
  });
  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  setupBasemapSwitcher();
}

// --- Basemap Switcher ---
function setupBasemapSwitcher() {
  const switcher = document.getElementById('basemap-switcher');
  if (!switcher) return;
  switcher.innerHTML = '';
  basemaps.forEach((bm, idx) => {
    const btn = document.createElement('button');
    btn.className = 'btn-secondary';
    btn.textContent = bm.name;
    btn.style.marginBottom = '4px';
    btn.onclick = () => {
      map.setStyle(bm.url);
      currentBasemap = bm.url;
    };
    switcher.appendChild(btn);
  });
}

// --- FABs logic ---
function setupFABs() {
  document.getElementById('fab-add').innerHTML = '+';
  document.getElementById('fab-locate').innerHTML = '📍';
  document.getElementById('fab-filters').innerHTML = '☰';
  // Add event listeners for FABs
  document.getElementById('fab-add').onclick = () => openAddOutbreakModal();
  document.getElementById('fab-locate').onclick = () => locateFarm();
  document.getElementById('fab-filters').onclick = () => toggleSidePanel();
}

// --- Side Panel Interactivity ---
function toggleSidePanel() {
  const panel = document.getElementById('side-panel');
  panel.classList.toggle('open');
}

// --- Outbreaks List (Sidebar) ---
/**
 * Render outbreaks in the sidebar list.
 * Backend-ready: outbreaks[] should be loaded from backend.
 */
function renderOutbreaksList(outbreaks) {
  const list = document.getElementById('outbreaks-list');
  list.innerHTML = '';
  if (!outbreaks.length) {
    list.innerHTML = '<div style="color:#888;">No outbreaks found.</div>';
    return;
  }
  outbreaks.forEach(ob => {
    const card = document.createElement('div');
    card.className = 'geo-outbreak-card';
    card.innerHTML = `
      <div class="geo-card-header">
        <div class="geo-card-title">${ob.location || ob.coords}</div>
        <span class="geo-card-severity ${ob.severity}">${ob.severity}</span>
      </div>
      <div class="geo-card-disease">${ob.diseaseType}</div>
      <div class="geo-card-date">${ob.date}</div>
      <div class="geo-card-notes">${ob.notes || ''}</div>
      <button class="geo-card-more" onclick="openOutbreakDetails('${ob.id}')">More</button>
    `;
    list.appendChild(card);
  });
}

/**
 * Fetch outbreaks from backend API.
 * Replace this with your backend integration (Supabase, REST, etc).
 * Should return a Promise that resolves to an array of outbreak objects.
 */
async function fetchOutbreaks() {
  // TODO: Replace this sample data with a real backend call
  // Example: return fetch('/api/outbreaks').then(res => res.json());
  return [
    { id: '1', location: 'Field A', coords: '36.8,-1.29', diseaseType: 'Maize Rust', severity: 'high', date: '2025-08-25', notes: 'Spotted near river.' },
    { id: '2', location: 'Field B', coords: '36.9,-1.30', diseaseType: 'Blight', severity: 'medium', date: '2025-08-26', notes: 'Early signs.' },
  ];
}

// Holds the current list of outbreaks in memory
let outbreaks = [];

// --- Severity Badge Colors ---
const style = document.createElement('style');
style.innerHTML = `
  .severity-high { background: #FF6B6B; color: #fff; padding: 2px 10px; border-radius: 12px; }
  .severity-medium { background: #FFD93D; color: #333; padding: 2px 10px; border-radius: 12px; }
  .severity-low { background: #8BAA61; color: #fff; padding: 2px 10px; border-radius: 12px; }
`;
document.head.appendChild(style);

// --- FAB Actions (UI + Backend placeholders) ---
let tempMarker = null;
let outbreakMarkers = [];

function openAddOutbreakModal() {
  // User clicks Add: enable pin drop on map
  if (tempMarker) {
    map.removeLayer(tempMarker);
    tempMarker = null;
  }
  map.getCanvas().style.cursor = 'crosshair';
  const mapClickHandler = (e) => {
    const coords = [e.lngLat.lng, e.lngLat.lat];
    if (tempMarker) tempMarker.remove();
    tempMarker = new maplibregl.Marker({ color: '#5D7C3A' })
      .setLngLat(coords)
      .addTo(map);
    showAddOutbreakForm(coords);
    map.getCanvas().style.cursor = '';
    map.off('click', mapClickHandler);
  };
  map.once('click', mapClickHandler);
}

function showAddOutbreakForm(coords) {
  const modal = document.getElementById('modal-container');
  modal.innerHTML = `
    <div class="geo-modal-bg">
      <div class="geo-modal-card">
        <button class="close-btn" onclick="document.getElementById('modal-container').innerHTML=''">&times;</button>
        <h3>Add New Outbreak</h3>
        <form id="addOutbreakForm">
          <input type="hidden" name="coords" value="${coords.join(',')}">
          <input type="text" name="disease" required placeholder="Disease Type (e.g. Maize Rust)" />
          <select name="severity" required>
            <option value="">Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <textarea name="notes" placeholder="Short note..."></textarea>
          <input type="file" name="image" accept="image/*" style="margin-bottom:0.7rem;">
          <button type="submit">Save Outbreak</button>
        </form>
        <div class="geo-modal-note">* Backend will save this outbreak and update the map & sidebar.</div>
      </div>
    </div>
  `;
  document.getElementById('addOutbreakForm').onsubmit = function(e) {
    e.preventDefault();
    // Backend: Save outbreak to DB, including image
    const form = e.target;
    const data = {
      id: Date.now().toString(),
      coords: form.coords.value,
      location: `(${form.coords.value})`,
      diseaseType: form.disease.value,
      severity: form.severity.value,
      notes: form.notes.value,
      date: new Date().toISOString().slice(0,10),
      // Backend: handle image upload
    };
    // --- BACKEND INTEGRATION: Save new outbreak to backend here ---
    // Example: await fetch('/api/outbreaks', { method: 'POST', body: JSON.stringify(data) })
    // For now, just update local list:
    addOutbreakMarker(data);
    outbreaks.unshift(data);
    renderOutbreaksList(outbreaks);
    document.getElementById('modal-container').innerHTML = '';
    showNotification('New outbreak added!');
  };
}

function addOutbreakMarker(data) {
  const marker = new maplibregl.Marker({ color: data.severity === 'high' ? '#FF6B6B' : data.severity === 'medium' ? '#FFD93D' : '#8BAA61' })
    .setLngLat(data.coords.split(',').map(Number))
    .setPopup(new maplibregl.Popup({ offset: 18 })
      .setHTML(`
        <b>${data.diseaseType}</b><br>
        <span class='geo-card-severity ${data.severity}'>${data.severity}</span><br>
        <span style='font-size:0.97em;'>${data.date}</span><br>
        <span style='font-size:0.97em;'>${data.notes || ''}</span>
      `))
    .addTo(map);
  outbreakMarkers.push(marker);
}

function showNotification(msg) {
  // Simple notification (replace with real notification system as needed)
  const notif = document.createElement('div');
  notif.textContent = msg;
  notif.style.position = 'fixed';
  notif.style.top = '80px';
  notif.style.right = '30px';
  notif.style.background = '#5D7C3A';
  notif.style.color = '#fff';
  notif.style.padding = '1rem 1.5rem';
  notif.style.borderRadius = '0.7rem';
  notif.style.boxShadow = '0 2px 8px rgba(93,124,58,0.13)';
  notif.style.zIndex = 3000;
  notif.style.fontWeight = '600';
  notif.style.opacity = 0.97;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2500);
}

// Filter by issue type
/**
 * Filter outbreaks based on UI filter controls.
 * Backend-ready: outbreaks[] should be up-to-date from backend.
 */
function filterOutbreaks() {
  const disease = document.getElementById('filter-disease').value;
  const severity = document.getElementById('filter-severity').value;
  let filtered = outbreaks;
  if (disease) filtered = filtered.filter(o => o.diseaseType.toLowerCase().includes(disease.replace('_',' ').toLowerCase()));
  if (severity) filtered = filtered.filter(o => o.severity === severity);
  renderOutbreaksList(filtered);
  // Optionally update map markers as well
}

document.addEventListener('change', function(e) {
  if (e.target && (e.target.id === 'filter-disease' || e.target.id === 'filter-severity')) {
    filterOutbreaks();
  }
});

// On map load, add markers for all outbreaks
function addAllOutbreakMarkers() {
  outbreakMarkers.forEach(m => m.remove());
  outbreakMarkers = [];
  outbreaks.forEach(addOutbreakMarker);
}

// --- INIT ---
// --- MAIN ENTRY: Backend-ready initialization ---
window.onload = async () => {
  setupNavbar();
  setupThemeToggle();
  initMap();
  setupFABs();

  // --- BACKEND INTEGRATION: Load outbreaks from backend and render ---
  try {
    outbreaks = await fetchOutbreaks(); // Fetch from backend (replace fetchOutbreaks with your API call)
    renderOutbreaksList(outbreaks);
    addAllOutbreakMarkers();
    // Update filter bar for a cleaner, less crowded look
    const filterBar = document.querySelector('.filter-bar');
    if (filterBar) {
      filterBar.classList.add('geo-filter-bar');
      filterBar.innerHTML = `
        <select id="filter-disease">
          <option value="">All Diseases</option>
          <option value="maize_rust">Maize Rust</option>
          <option value="blight">Blight</option>
        </select>
        <select id="filter-severity">
          <option value="">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input type="date" id="filter-date-start" placeholder="Start Date">
        <input type="date" id="filter-date-end" placeholder="End Date">
        <input type="search" id="filter-search" placeholder="Search...">
      `;
    }
    console.log('[CropAI Geotagging] Initial render complete');
  } catch (err) {
    console.error('[CropAI Geotagging] Failed to load outbreaks from backend:', err);
    // Optionally show error UI here
  }
};
