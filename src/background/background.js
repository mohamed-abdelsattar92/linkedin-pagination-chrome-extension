/**
 * LinkedIn Pagination Extension - Background Service Worker
 * Handles extension lifecycle and cross-tab communication
 */

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default settings
    await chrome.storage.sync.set({
      enabled: true,
      postsPerPage: 15
    });

    console.log('[LinkedIn Pagination] Extension installed with default settings');
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getStatus') {
    // Return current enabled status
    chrome.storage.sync.get({ enabled: true }, (result) => {
      sendResponse({ enabled: result.enabled });
    });
    return true; // Indicates async response
  }
});

// Optional: Add badge to show status
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.enabled) {
    updateBadge(changes.enabled.newValue);
  }
});

function updateBadge(enabled) {
  if (enabled) {
    chrome.action.setBadgeText({ text: '' });
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#666666' });
  }
}

// Initialize badge on startup
chrome.storage.sync.get({ enabled: true }, (result) => {
  updateBadge(result.enabled);
});
