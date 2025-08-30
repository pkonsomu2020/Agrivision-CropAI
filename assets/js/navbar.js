// navbar.js
// Handles navbar interactivity: hamburger toggle, active state, notification badge, and responsive behavior

document.addEventListener('DOMContentLoaded', function() {
  // Inject settings modal if not present
  if (!document.getElementById('settingsModal')) {
    fetch('components/settings.html')
      .then(res => res.text())
      .then(html => {
        document.body.insertAdjacentHTML('beforeend', html);
        // Dynamically load settings.js after modal is injected
        if (!window.__settingsScriptLoaded) {
          var script = document.createElement('script');
          script.src = 'assets/js/settings.js';
          script.onload = function() { window.__settingsScriptLoaded = true; };
          document.body.appendChild(script);
        }
      });
  }
  // Hamburger menu toggle
  const hamburger = document.getElementById('navbar-hamburger');
  const navLinks = document.getElementById('navbar-links');

  // Hamburger menu toggle and overlay logic
  const navOverlay = document.getElementById('nav-overlay');
  function openNav() {
    navLinks.classList.add('open');
    document.body.classList.add('nav-open');
    hamburger.setAttribute('aria-expanded', 'true');
    if (navOverlay) navOverlay.style.display = 'block';
  }
  function closeNav() {
    navLinks.classList.remove('open');
    document.body.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
    if (navOverlay) navOverlay.style.display = 'none';
  }
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      if (navLinks.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
      }
    });
  }
  // Close menu on link click (mobile)
  document.querySelectorAll('#navbar-links a').forEach(link => {
    link.addEventListener('click', () => {
      closeNav();
    });
  });
  // Close menu on overlay click
  if (navOverlay) {
    navOverlay.addEventListener('click', closeNav);
  }

  // Set active link based on current page
  let path = window.location.pathname.split('/').pop();
  // Treat index.html as main.html for active link
  if (path === 'index.html' || path === '') path = 'main.html';
  document.querySelectorAll('#navbar-links a').forEach(link => {
    if (link.getAttribute('href') === path) {
      link.classList.add('active');
    }
  });

  // Notification badge (simulate new alerts)
  const alertBadge = document.getElementById('alert-badge');
  if (alertBadge) {
    // TODO: Replace with backend logic for real alerts
    const hasNewAlerts = true; // Simulate
    alertBadge.style.display = hasNewAlerts ? 'inline-block' : 'none';
  }
});
