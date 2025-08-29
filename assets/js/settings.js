// settings.js - Global Settings Modal Logic for CropAI
// Load this script on every page where you want the settings modal to work

document.addEventListener('DOMContentLoaded', function () {
  // Settings modal/button may be loaded dynamically, so use event delegation
  function get(id) { return document.getElementById(id); }

  // Wait for settingsBtn and settingsModal to exist in DOM
  function setupSettingsModal() {
    const settingsBtn = get('settingsBtn');
    const settingsModal = get('settingsModal');
    const closeSettings = get('closeSettings');
    const saveSettingsBtn = get('saveSettingsBtn');
    if (!settingsBtn || !settingsModal) return;

    settingsBtn.addEventListener('click', function () {
      settingsModal.classList.remove('hidden');
    });
    if (closeSettings) {
      closeSettings.addEventListener('click', function () {
        settingsModal.classList.add('hidden');
      });
    }
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', function () {
        settingsModal.classList.add('hidden');
        // Show a temporary success message
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
        notification.textContent = 'Settings saved successfully';
        document.body.appendChild(notification);
        setTimeout(() => { notification.remove(); }, 3000);
      });
    }
  }

  // If settings modal is loaded dynamically, poll until present
  function waitForSettings() {
    if (document.getElementById('settingsBtn') && document.getElementById('settingsModal')) {
      setupSettingsModal();
    } else {
      setTimeout(waitForSettings, 200);
    }
  }
  waitForSettings();
});
