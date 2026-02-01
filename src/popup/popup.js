/**
 * LinkedIn Pagination Extension - Popup Script
 * Handles settings UI interactions
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  const enabledToggle = document.getElementById('enabled-toggle');
  const postsPerPage = document.getElementById('posts-per-page');
  const postsValue = document.getElementById('posts-value');
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = statusIndicator.querySelector('.status-text');

  // Load current settings
  const settings = await StorageManager.getSettings();

  // Apply settings to UI
  enabledToggle.checked = settings.enabled;
  postsPerPage.value = settings.postsPerPage;
  postsValue.textContent = settings.postsPerPage;

  // Update status indicator
  updateStatus(settings.enabled);

  // Handle enable/disable toggle
  enabledToggle.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await StorageManager.setEnabled(enabled);
    updateStatus(enabled);

    // Notify content script
    notifyContentScript({ type: 'settingsChanged', enabled });
  });

  // Handle posts per page slider
  postsPerPage.addEventListener('input', (e) => {
    postsValue.textContent = e.target.value;
  });

  postsPerPage.addEventListener('change', async (e) => {
    const count = parseInt(e.target.value, 10);
    await StorageManager.setPostsPerPage(count);

    // Notify content script
    notifyContentScript({ type: 'settingsChanged', postsPerPage: count });
  });

  /**
   * Update status indicator
   */
  function updateStatus(enabled) {
    if (enabled) {
      statusIndicator.classList.remove('inactive');
      statusIndicator.classList.add('active');
      statusText.textContent = 'Active on LinkedIn';
    } else {
      statusIndicator.classList.remove('active');
      statusIndicator.classList.add('inactive');
      statusText.textContent = 'Paused';
    }
  }

  /**
   * Send message to content script
   */
  async function notifyContentScript(message) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('linkedin.com')) {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Content script may not be loaded yet, that's okay
        });
      }
    } catch (err) {
      // Ignore errors - content script may not be ready
    }
  }

  // Check if we're on LinkedIn
  checkCurrentTab();

  async function checkCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && !tab.url.includes('linkedin.com')) {
        statusIndicator.classList.add('not-linkedin');
        statusText.textContent = 'Navigate to LinkedIn to use';
      }
    } catch (err) {
      // Ignore
    }
  }
});
