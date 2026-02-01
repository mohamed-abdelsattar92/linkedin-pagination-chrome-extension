/**
 * PaginationUI - Fixed bottom pagination bar for LinkedIn
 * Creates and manages the pagination controls UI
 */

const PaginationUI = {
  container: null,
  prevButton: null,
  nextButton: null,
  statusText: null,
  isVisible: false,

  /**
   * Create the pagination bar DOM elements
   */
  create() {
    if (this.container) return;

    // Create container
    this.container = document.createElement('div');
    this.container.id = 'linkedin-pagination-bar';
    this.container.className = 'linkedin-pagination-bar';

    // Create inner content
    this.container.innerHTML = `
      <div class="linkedin-pagination-content">
        <button class="linkedin-pagination-btn linkedin-pagination-prev" disabled>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10.5 12.5L5.5 8l5-4.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Previous</span>
        </button>
        <div class="linkedin-pagination-status">
          <span class="linkedin-pagination-range">Posts 1-15</span>
          <span class="linkedin-pagination-total">of 0+</span>
        </div>
        <button class="linkedin-pagination-btn linkedin-pagination-next">
          <span>Next</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 3.5L10.5 8l-5 4.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;

    // Get references to elements
    this.prevButton = this.container.querySelector('.linkedin-pagination-prev');
    this.nextButton = this.container.querySelector('.linkedin-pagination-next');
    this.statusText = this.container.querySelector('.linkedin-pagination-status');
    this.rangeText = this.container.querySelector('.linkedin-pagination-range');
    this.totalText = this.container.querySelector('.linkedin-pagination-total');

    // Add event listeners
    this.prevButton.addEventListener('click', () => {
      if (window.FeedManager) {
        window.FeedManager.previousPage();
      }
    });

    this.nextButton.addEventListener('click', () => {
      if (window.FeedManager) {
        window.FeedManager.nextPage();
      }
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Only if pagination is visible and no input is focused
      if (!this.isVisible) return;
      if (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA' ||
          document.activeElement.isContentEditable) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (window.FeedManager) {
          window.FeedManager.previousPage();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (window.FeedManager) {
          window.FeedManager.nextPage();
        }
      }
    });

    // Append to body (hidden by default)
    document.body.appendChild(this.container);
  },

  /**
   * Show the pagination bar
   */
  show() {
    if (!this.container) {
      this.create();
    }
    this.container.classList.add('visible');
    this.isVisible = true;
  },

  /**
   * Hide the pagination bar
   */
  hide() {
    if (this.container) {
      this.container.classList.remove('visible');
    }
    this.isVisible = false;
  },

  /**
   * Update the pagination bar with current state
   * @param {Object} state - State from FeedManager.getState()
   */
  update(state) {
    if (!this.container) return;

    const { startIndex, endIndex, totalPosts, hasPrevious, hasNext } = state;

    // Update range text
    this.rangeText.textContent = `Posts ${startIndex}-${endIndex}`;
    this.totalText.textContent = `of ${totalPosts}+`;

    // Update button states
    this.prevButton.disabled = !hasPrevious;
    this.nextButton.disabled = !hasNext;

    // Update button classes for styling
    this.prevButton.classList.toggle('disabled', !hasPrevious);
    this.nextButton.classList.toggle('disabled', !hasNext);
  },

  /**
   * Reset the pagination bar to initial state
   * Called when page refreshes or navigates
   */
  reset() {
    if (!this.container) return;

    // Reset to initial state
    this.rangeText.textContent = 'Posts 1-0';
    this.totalText.textContent = 'of 0+';

    // Disable previous button (we're on first page)
    this.prevButton.disabled = true;
    this.prevButton.classList.add('disabled');

    // Enable next button
    this.nextButton.disabled = false;
    this.nextButton.classList.remove('disabled');
  },

  /**
   * Destroy the pagination bar
   */
  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
      this.prevButton = null;
      this.nextButton = null;
      this.statusText = null;
    }
    this.isVisible = false;
  }
};

// Make available globally
window.PaginationUI = PaginationUI;
