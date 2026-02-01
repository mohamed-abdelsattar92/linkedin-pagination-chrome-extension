/**
 * Storage utilities for Chrome extension
 * Handles reading/writing settings to Chrome's sync storage
 */

const StorageManager = {
  DEFAULTS: {
    enabled: true,
    postsPerPage: 15
  },

  /**
   * Get all settings from storage
   * @returns {Promise<{enabled: boolean, postsPerPage: number}>}
   */
  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(this.DEFAULTS, (result) => {
        resolve(result);
      });
    });
  },

  /**
   * Save settings to storage
   * @param {Object} settings - Settings to save
   * @returns {Promise<void>}
   */
  async saveSettings(settings) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(settings, () => {
        resolve();
      });
    });
  },

  /**
   * Get enabled state
   * @returns {Promise<boolean>}
   */
  async isEnabled() {
    const settings = await this.getSettings();
    return settings.enabled;
  },

  /**
   * Set enabled state
   * @param {boolean} enabled
   * @returns {Promise<void>}
   */
  async setEnabled(enabled) {
    return this.saveSettings({ enabled });
  },

  /**
   * Get posts per page setting
   * @returns {Promise<number>}
   */
  async getPostsPerPage() {
    const settings = await this.getSettings();
    return settings.postsPerPage;
  },

  /**
   * Set posts per page
   * @param {number} count - Number of posts per page (5-30)
   * @returns {Promise<void>}
   */
  async setPostsPerPage(count) {
    const clamped = Math.min(30, Math.max(5, count));
    return this.saveSettings({ postsPerPage: clamped });
  },

  /**
   * Listen for storage changes
   * @param {Function} callback - Called with (changes, areaName)
   */
  onChanged(callback) {
    chrome.storage.onChanged.addListener(callback);
  }
};

// Make available globally for content scripts
window.StorageManager = StorageManager;
