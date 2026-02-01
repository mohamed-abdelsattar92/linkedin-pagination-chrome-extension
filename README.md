# LinkedIn Pagination

A Chrome extension that converts LinkedIn's infinite scroll into cursor-based pagination, helping you break the doom-scrolling habit.

## The Problem

LinkedIn's infinite scroll is designed to keep you engaged longer than intended. You open the app to check one notification and suddenly 45 minutes have vanished. Sound familiar?

## The Solution

This extension adds **friction** to your LinkedIn browsing by replacing infinite scroll with pagination. Instead of endlessly scrolling, you consciously decide when to load more content by clicking "Next Page".

![Pagination Bar Preview](docs/preview.png)

## Features

- **Cursor-based pagination** — Navigate through your feed page by page
- **Previous & Next buttons** — Move forward or go back to posts you passed
- **Configurable page size** — Choose 5-30 posts per page (default: 15)
- **Keyboard shortcuts** — Use arrow keys to navigate between pages
- **Clean UI** — Pagination bar matches LinkedIn's design language
- **Dark mode support** — Works seamlessly with LinkedIn's dark theme
- **Zero data collection** — All preferences stored locally

## Installation

### From Chrome Web Store

> [!NOTE]
> Chrome Web Store listing coming soon.

### Manual Installation (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/mohamed-abdelsattar92/linkedin-pagination-chrome-extension.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top right)

4. Click **Load unpacked**

5. Select the cloned repository folder

6. Navigate to [linkedin.com/feed](https://www.linkedin.com/feed) and enjoy mindful browsing

## Usage

Once installed, the extension automatically activates on LinkedIn feed pages.

| Action | Result |
|--------|--------|
| Click **Next** | Load next page of posts |
| Click **Previous** | Go back to previous page |
| Press `→` or `↓` | Next page |
| Press `←` or `↑` | Previous page |
| Click extension icon | Open settings popup |

### Settings

Access settings by clicking the extension icon in your toolbar:

- **Enable/Disable** — Toggle pagination on or off
- **Posts per page** — Slider to adjust page size (5-30)

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    LinkedIn Feed                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Post 1                                          │   │
│  │ Post 2                                          │   │
│  │ ...                                             │   │
│  │ Post 15                                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [< Previous]    Posts 1-15 of 45+    [Next >]  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

The extension:
1. Detects LinkedIn's feed container
2. Observes posts as LinkedIn loads them
3. Hides posts outside the current page range
4. Displays a pagination bar at the bottom
5. Resets state on page refresh (Ctrl+R)

> [!IMPORTANT]
> The extension resets when you refresh the page (Ctrl+R / F5). Clicking the LinkedIn logo or Home icon performs SPA navigation which does not trigger a reset.

## Privacy

This extension is **privacy-focused**:

- **NO** data collection
- **NO** tracking or analytics
- **NO** external server communication
- All preferences stored locally via Chrome Storage API

Read the full [Privacy Policy](docs/privacy-policy.html).

## Tech Stack

- Chrome Extension Manifest V3
- Vanilla JavaScript (no frameworks, no dependencies)
- Chrome Storage API
- MutationObserver API

## Project Structure

```
├── manifest.json              # Extension configuration
├── src/
│   ├── content/
│   │   ├── content.js         # Entry point
│   │   ├── content.css        # Pagination bar styles
│   │   ├── feedManager.js     # Core pagination logic
│   │   └── paginationUI.js    # UI component
│   ├── popup/
│   │   ├── popup.html         # Settings popup
│   │   ├── popup.js           # Settings logic
│   │   └── popup.css          # Popup styles
│   ├── background/
│   │   └── background.js      # Service worker
│   └── utils/
│       └── storage.js         # Chrome storage utilities
├── icons/                     # Extension icons
└── docs/                      # Privacy policy (GitHub Pages)
```

## Development

```bash
# Clone the repo
git clone https://github.com/mohamed-abdelsattar92/linkedin-pagination-chrome-extension.git

# Load in Chrome
# 1. Go to chrome://extensions
# 2. Enable Developer mode
# 3. Load unpacked → select project folder

# Make changes and reload extension to test
```

> [!CAUTION]
> LinkedIn frequently updates their DOM structure. If the extension stops working after a LinkedIn update, the CSS selectors in `feedManager.js` may need to be updated.

## Known Limitations

- Does not persist pagination state across SPA navigation (clicking LinkedIn logo/Home)
- May need selector updates when LinkedIn changes their UI
- Only works on the main feed (not on profile feeds or search results)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License — feel free to use this code however you'd like.

---

<p align="center">
  <sub>
    Built to reclaim my time from the LinkedIn algorithm.<br>
    🤙 Vibe coded with <a href="https://claude.ai">Claude</a> — because life's too short for doom-scrolling.
  </sub>
</p>
