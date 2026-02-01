/**
 * LinkedIn Pagination Extension - Main Content Script
 * Entry point that initializes the extension on LinkedIn pages
 */

(function() {
  'use strict';

  // Only run on LinkedIn feed pages
  const isLinkedInFeed = () => {
    const url = window.location.href;
    return url.includes('linkedin.com/feed') ||
           (url === 'https://www.linkedin.com/' || url === 'https://linkedin.com/') ||
           url.match(/linkedin\.com\/?(\?|#|$)/);
  };

  // Initialize extension
  const init = async () => {
    if (!isLinkedInFeed()) {
      return;
    }

    // Add body class for CSS
    document.body.classList.add('linkedin-pagination-active');

    // Reset and initialize the feed manager
    if (window.FeedManager) {
      window.FeedManager.reset();
      await window.FeedManager.init();
    }

    console.log('[LinkedIn Pagination] Extension initialized');
  };

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
