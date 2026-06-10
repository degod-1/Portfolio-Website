# Portfolio
---

- **Command Palette (`Cmd+K` / `Ctrl+K`):** A custom, lightweight keyboard-driven search console built from scratch in vanilla JS. Instantly searches, indexes, and filters through experience history, projects, and skills. Includes a system action command to toggle light/dark modes.
- **Smooth Page Router:** Hash-based SPA router (`#/overview`, `#/experience`, etc.) that handles page swaps instantly with zero page reloads.
- **Dynamic Interface Audio:** Uses the browser-native **Web Audio API** to synthesize game-like feedback sounds in real time: retro-mechanical keyboard clicks (on page navigation and button events), high-frequency ticks (when tabbing links or cycling search results), and multi-tone frequency chimes (when swapping theme modes). No external audio files are downloaded.
- **Production-Grade Keyboard Accessibility:** Supports full `Tab` navigation cycling, visual `:focus-visible` highlights, and key-press triggers on all interactive elements.
- **Theme Modes & Hotkeys:** Persistent Light/Dark theme configuration toggleable via sidebar icons, a search palette action, or global hotkeys.
- **Metric-Driven Layouts:** Projects are structured as **Product Specs / Specs** showcasing *Objective*, *Execution & Design*, and *Impact Metrics* in a clean grid.
- **Literary Typography:** Sleek technical sans-serifs (**Geist**) paired with an elegant serif (**Newsreader**) for highlighted editorial italics, creating an understated and intelligent tone.
- **Fluid Micro-Animations:** Grayscale hover blending on photos and high-performance cubic-bezier transformations (`cubic-bezier(0.16, 1, 0.3, 1)`) matching Linear's motion principles.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Context | Action | Feedback Sound |
|---|---|---|---|
| `Cmd + K` or `Ctrl + K` | Global | Opens / closes the Search Command Menu | Click |
| `Tab` | App Shell | Cycles focus through sidebar links | High-freq Tick |
| `Enter` | App Shell | Selects and navigates to the focused link | Click |
| `1` — `6` | Global | Swaps pages instantly (`1` Overview, `2` Experience, `3` Specs, etc.) | Click |
| `/` or `s` | Global | Opens search palette and focuses input | Click |
| `t` | Global | Toggles light / dark mode instantly | Up-down Chime |
| `ArrowUp` / `ArrowDown` | Search Menu | Navigates the matching results list | High-freq Tick |
| `Enter` | Search Menu | Selects and opens the highlighted result | Click |
| `Esc` | Search Menu | Closes the search palette menu overlay | Click |

---

## 📁 Directory Structure

```
├── assets/
│   └── images/
│       ├── atri_portrait.jpg       # Overview portrait photo (zoomed & cropped)
│       ├── leadership_board.jpg    # Technical Board group photo
│       └── coding_club_board.jpg   # Coding Club group photo
├── index.html                      # App layout structure & content pages
├── style.css                       # Color themes, layout grids, and animations
├── app.js                          # Router, Command Palette search, and key events
└── README.md                       # Documentation & extension guide
```

---

## 🎨 Design System & Tokens

All typography, spacing, borders, and colors are defined using CSS Custom Properties in the header of `style.css`.

### Colors & Accent
- **Dark Mode (Default):** Base background `#09090b`, card background `#0e0e11`, modal backgrounds `#121215`, borders `#1f1f23`.
- **Light Mode:** Base background `#fcfcfd`, card background `#f4f4f5`, borders `#e4e4e7`.
- **Accent Color:** Warm, intelligent clay/amber (`#e06b4e` HSL `12, 72%, 59%`) inspired by Anthropic.

### Typography
- **Primary Sans-Serif:** `Geist` via Google Fonts. Used for structure, hierarchy, and UI.
- **Monospace:** `Geist Mono` via Google Fonts. Used for numerical metrics, keyboard shortcuts, and code mockups.
- **Editorial Serif:** `Newsreader` via Google Fonts. Applied to the `.editorial-italic` class for sophisticated typographical accents.

---

## 🚀 How to Add or Edit Content

### 1. Adding a New Project (PRD Spec)
To add a new project, follow these two steps:

**Step A: Update the HTML (`index.html`)**
Add a new article inside `<section id="view-projects">` under the `.spec-list` container:
```html
<article class="spec-item" id="proj-custom-id">
    <div class="spec-header-row">
        <div class="spec-meta">
            <h3 class="spec-title">PRD-05: Project Name</h3>
            <span class="spec-org">Host Organization</span>
            <span class="spec-date">Jan 2026</span>
        </div>
        <a href="https://your-link.com" target="_blank" rel="noopener" class="btn-action">
            <span>Link</span>
            <span class="arrow-up-right">↗</span>
        </a>
    </div>
    
    <div class="spec-grid">
        <div class="spec-metric-card">
            <span class="metric-val">100k+</span>
            <span class="metric-lbl">Metrics Description</span>
        </div>
        <!-- Add up to 4 metric columns -->
    </div>

    <div class="spec-body">
        <div class="spec-section">
            <h4 class="spec-subtitle">Objective</h4>
            <p>Describe the goal here...</p>
        </div>
        <div class="spec-section">
            <h4 class="spec-subtitle">Execution & Design</h4>
            <p>Describe execution parameters...</p>
        </div>
    </div>
</article>
```

**Step B: Update the Search Index (`app.js`)**
Open `app.js` and add a search object to the `searchIndex` array. This registers the project with the Command Palette:
```javascript
{ 
    type: 'project', 
    title: 'PRD-05: Project Name', 
    subtitle: '100k+ Metric highlight brief description', 
    target: 'projects', 
    elementId: 'proj-custom-id', 
    keywords: ['project name', 'keyword1', 'keyword2'] 
}
```

### 2. Adjusting Image Crop Positions
All banner and portrait images are aligned using CSS `object-fit: cover`. If you change the pictures later and heads or focus areas get cut off:
- Adjust `object-position: center 10%;` for the portrait in `style.css`.
- Adjust `object-position: center 32%;` (or similar vertical percentages) for banners.

---

## 💻 Local Hosting

Since this website is built using zero dependencies, it does not require a build step. You can serve it using any local static web server:

### Option A: Python (Standard)
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

### Option B: Node.js (npx)
```bash
npx serve
```
