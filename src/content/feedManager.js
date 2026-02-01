/**
 * FeedManager - Core pagination logic for LinkedIn feed
 * Handles detecting posts, managing pages, and controlling visibility
 */

const FeedManager = {
  // State
  posts: [],
  currentPage: 0,
  postsPerPage: 15,
  enabled: true,
  observer: null,
  scrollBlocked: false,
  feedContainer: null,
  isInitialized: false,

  // LinkedIn DOM selectors (may need updates if LinkedIn changes their structure)
  SELECTORS: {
    // Main feed container
    feedContainer: '.scaffold-finite-scroll__content',
    // Alternative feed selectors
    feedContainerAlt: '[data-finite-scroll-hotkey-context="FEED"]',
    // Individual post items in feed
    postItem: '.feed-shared-update-v2',
    // Alternative post selector
    postItemAlt: '[data-urn*="activity"]',
    // Main scrollable area
    mainContent: '.scaffold-layout__main'
  },

  /**
   * Reset all state - call before init on page refresh/navigation
   */
  reset() {
    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Remove scroll handler
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }

    // Reset all state
    this.posts = [];
    this.currentPage = 0;
    this.feedContainer = null;
    this.isInitialized = false;
    this.scrollBlocked = false;

    // Reset UI
    if (window.PaginationUI) {
      window.PaginationUI.reset();
    }

    console.log('[LinkedIn Pagination] State reset');
  },

  /**
   * Initialize the feed manager
   */
  async init() {
    // Always reset before initializing to handle page refresh/SPA navigation
    if (this.isInitialized) {
      this.reset();
    }

    // Load settings
    const settings = await StorageManager.getSettings();
    this.postsPerPage = settings.postsPerPage;
    this.enabled = settings.enabled;

    // Listen for settings changes
    StorageManager.onChanged((changes) => {
      if (changes.postsPerPage) {
        this.postsPerPage = changes.postsPerPage.newValue;
        this.refreshPage();
      }
      if (changes.enabled) {
        this.enabled = changes.enabled.newValue;
        if (this.enabled) {
          this.activate();
        } else {
          this.deactivate();
        }
      }
    });

    // Wait for feed to be available
    this.waitForFeed();
    this.isInitialized = true;
  },

  /**
   * Wait for LinkedIn's feed container to appear in DOM
   */
  waitForFeed() {
    const checkFeed = () => {
      this.feedContainer = document.querySelector(this.SELECTORS.feedContainer) ||
                          document.querySelector(this.SELECTORS.feedContainerAlt);

      if (this.feedContainer && this.enabled) {
        this.activate();
      } else {
        // Keep checking - LinkedIn loads content dynamically
        setTimeout(checkFeed, 500);
      }
    };
    checkFeed();
  },

  /**
   * Activate pagination
   */
  activate() {
    if (!this.feedContainer) return;

    // Collect existing posts
    this.collectPosts();

    // Set up observer for new posts
    this.setupObserver();

    // Block infinite scroll
    this.blockInfiniteScroll();

    // Show first page
    this.showPage(0);

    // Notify UI to show pagination bar
    if (window.PaginationUI) {
      window.PaginationUI.show();
      window.PaginationUI.update(this.getState());
    }
  },

  /**
   * Deactivate pagination and restore normal scrolling
   */
  deactivate() {
    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Unblock infinite scroll
    this.unblockInfiniteScroll();

    // Show all posts
    this.posts.forEach(post => {
      post.style.display = '';
    });

    // Hide pagination UI
    if (window.PaginationUI) {
      window.PaginationUI.hide();
    }
  },

  /**
   * Collect all posts currently in the feed
   */
  collectPosts() {
    const postElements = this.feedContainer.querySelectorAll(this.SELECTORS.postItem);
    const altPostElements = this.feedContainer.querySelectorAll(this.SELECTORS.postItemAlt);

    // Combine and deduplicate
    const allPosts = new Set([...postElements, ...altPostElements]);

    allPosts.forEach(post => {
      if (!this.posts.includes(post)) {
        this.posts.push(post);
      }
    });
  },

  /**
   * Set up MutationObserver to detect new posts loaded by LinkedIn
   */
  setupObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      let newPostsAdded = false;

      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is a post or contains posts
            if (node.matches && (node.matches(this.SELECTORS.postItem) ||
                node.matches(this.SELECTORS.postItemAlt))) {
              if (!this.posts.includes(node)) {
                this.posts.push(node);
                newPostsAdded = true;
              }
            }

            // Check for posts inside the added node
            const innerPosts = node.querySelectorAll ?
              node.querySelectorAll(`${this.SELECTORS.postItem}, ${this.SELECTORS.postItemAlt}`) : [];
            innerPosts.forEach(post => {
              if (!this.posts.includes(post)) {
                this.posts.push(post);
                newPostsAdded = true;
              }
            });
          }
        });
      });

      if (newPostsAdded) {
        // Re-apply current page visibility
        this.showPage(this.currentPage);

        // Update UI
        if (window.PaginationUI) {
          window.PaginationUI.update(this.getState());
        }
      }
    });

    this.observer.observe(this.feedContainer, {
      childList: true,
      subtree: true
    });
  },

  /**
   * Block LinkedIn's infinite scroll behavior
   */
  blockInfiniteScroll() {
    if (this.scrollBlocked) return;

    const mainContent = document.querySelector(this.SELECTORS.mainContent) || window;

    this.scrollHandler = (e) => {
      if (!this.enabled) return;

      // Get scroll position
      const scrollElement = e.target === document ? document.documentElement : e.target;
      const scrollTop = scrollElement.scrollTop || window.scrollY;
      const scrollHeight = scrollElement.scrollHeight || document.documentElement.scrollHeight;
      const clientHeight = scrollElement.clientHeight || window.innerHeight;

      // If near bottom, prevent LinkedIn from loading more automatically
      if (scrollTop + clientHeight >= scrollHeight - 500) {
        // We don't prevent the scroll, but we ensure posts stay hidden
        this.showPage(this.currentPage);
      }
    };

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    this.scrollBlocked = true;
  },

  /**
   * Remove scroll blocking
   */
  unblockInfiniteScroll() {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }
    this.scrollBlocked = false;
  },

  /**
   * Show a specific page of posts
   * @param {number} pageIndex - Zero-based page index
   */
  showPage(pageIndex) {
    const startIndex = pageIndex * this.postsPerPage;
    const endIndex = startIndex + this.postsPerPage;

    this.posts.forEach((post, index) => {
      if (index >= startIndex && index < endIndex) {
        post.style.display = '';
        post.style.visibility = 'visible';
      } else {
        post.style.display = 'none';
        post.style.visibility = 'hidden';
      }
    });

    this.currentPage = pageIndex;

    // Update UI
    if (window.PaginationUI) {
      window.PaginationUI.update(this.getState());
    }
  },

  /**
   * Go to next page
   */
  nextPage() {
    const nextPageStart = (this.currentPage + 1) * this.postsPerPage;

    // Check if we need more posts
    if (nextPageStart >= this.posts.length) {
      // Trigger LinkedIn to load more by scrolling to bottom briefly
      this.triggerLoadMore().then(() => {
        if ((this.currentPage + 1) * this.postsPerPage < this.posts.length) {
          this.currentPage++;
          this.showPage(this.currentPage);
          this.scrollToTop();
        }
      });
    } else {
      this.currentPage++;
      this.showPage(this.currentPage);
      this.scrollToTop();
    }
  },

  /**
   * Go to previous page
   */
  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.showPage(this.currentPage);
      this.scrollToTop();
    }
  },

  /**
   * Trigger LinkedIn to load more posts
   * @returns {Promise<void>}
   */
  triggerLoadMore() {
    return new Promise((resolve) => {
      // Temporarily show all posts to trigger LinkedIn's infinite scroll
      this.posts.forEach(post => {
        post.style.display = '';
      });

      // Scroll to bottom
      const scrollElement = document.querySelector(this.SELECTORS.mainContent) || document.documentElement;
      const originalScroll = scrollElement.scrollTop || window.scrollY;

      window.scrollTo(0, document.body.scrollHeight);

      // Wait for new posts to load
      setTimeout(() => {
        // Collect any new posts
        this.collectPosts();

        // Restore scroll position and page visibility
        window.scrollTo(0, originalScroll);
        this.showPage(this.currentPage);

        resolve();
      }, 1000);
    });
  },

  /**
   * Scroll to top of feed
   */
  scrollToTop() {
    const feedTop = this.feedContainer ? this.feedContainer.getBoundingClientRect().top + window.scrollY - 100 : 0;
    window.scrollTo({ top: feedTop, behavior: 'smooth' });
  },

  /**
   * Refresh current page (after settings change)
   */
  refreshPage() {
    // Recalculate which page we should be on based on the first visible post
    const firstVisibleIndex = this.currentPage * this.postsPerPage;
    this.currentPage = Math.floor(firstVisibleIndex / this.postsPerPage);
    this.showPage(this.currentPage);
  },

  /**
   * Get current state for UI
   * @returns {Object}
   */
  getState() {
    const startIndex = this.currentPage * this.postsPerPage;
    const endIndex = Math.min(startIndex + this.postsPerPage, this.posts.length);
    const totalPages = Math.ceil(this.posts.length / this.postsPerPage);

    return {
      currentPage: this.currentPage,
      totalPages: totalPages,
      totalPosts: this.posts.length,
      startIndex: startIndex + 1,
      endIndex: endIndex,
      postsPerPage: this.postsPerPage,
      hasPrevious: this.currentPage > 0,
      hasNext: true // Always true for cursor-based pagination
    };
  }
};

// Make available globally
window.FeedManager = FeedManager;
