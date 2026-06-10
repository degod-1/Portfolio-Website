/* ==========================================================================
   PM PORTFOLIO — APPLICATION CONTROLLER (PRODUCTION GRADE & AUDIBLE)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // State Variables
    // ----------------------------------------------------------------------
    let activeTab = 'overview';
    let isPaletteOpen = false;
    let selectedResultIndex = -1;
    let filteredResults = [];

    // ----------------------------------------------------------------------
    // DOM Elements
    // ----------------------------------------------------------------------
    const views = document.querySelectorAll('.tab-view');
    const navItems = document.querySelectorAll('.nav-item');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    const themeToggle = document.getElementById('theme-toggle');
    const cmdTrigger = document.getElementById('cmd-trigger');
    const cmdPalette = document.getElementById('cmd-palette');
    const cmdInput = document.getElementById('cmd-input');
    const cmdCloseBtn = document.getElementById('cmd-close-btn');
    const cmdSuggestions = document.getElementById('cmd-suggestions');
    const cmdResults = document.getElementById('cmd-results');

    // ----------------------------------------------------------------------
    // Audio Synthesizer (Web Audio API)
    // ----------------------------------------------------------------------
    const audio = {
        ctx: null,

        init() {
            if (this.ctx) return;
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        },

        playClick() {
            this.init();
            if (!this.ctx) return;
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);
            
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime); // Increased from 0.08
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.05);
        },

        playChime(isLight) {
            this.init();
            if (!this.ctx) return;
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            const startFreq = isLight ? 550 : 800;
            const endFreq = isLight ? 880 : 440;
            
            osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + 0.12);
            
            gain.gain.setValueAtTime(0.12, this.ctx.currentTime); // Increased from 0.06
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.16);
        },

        playTick() {
            this.init();
            if (!this.ctx) return;
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(2200, this.ctx.currentTime);
            
            gain.gain.setValueAtTime(0.04, this.ctx.currentTime); // Increased from 0.018
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.008);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.01);
        }
    };

    // ----------------------------------------------------------------------
    // Search Database / Index
    // ----------------------------------------------------------------------
    const searchIndex = [
        // Navigation Commands
        { type: 'nav', title: 'Go to Overview', subtitle: 'Main introductory landing page', target: 'overview', keywords: ['home', 'landing', 'intro', 'education', 'gpa', 'overview'] },
        { type: 'nav', title: 'Go to Experience', subtitle: 'Professional work history', target: 'experience', keywords: ['work', 'experience', 'jobs', 'metasky', 'unsnarl'] },
        { type: 'nav', title: 'Go to Projects', subtitle: 'Project specs and shipped features', target: 'projects', keywords: ['projects', 'mess app', 'dream11', 'skillpath', 'prj', 'specifications'] },
        { type: 'nav', title: 'Go to Leadership', subtitle: 'General Secretary and Coding Club management', target: 'leadership', keywords: ['leadership', 'general secretary', 'coding club', 'technical board'] },
        { type: 'nav', title: 'Go to Achievements', subtitle: 'Competitions, scholarships, and academic ranks', target: 'achievements', keywords: ['achievements', 'awards', 'tech mahindra', 'amazon', 'kriti', 'air'] },
        { type: 'nav', title: 'Go to Stack & Courses', subtitle: 'Languages, ML, design software, and courses', target: 'stack', keywords: ['skills', 'stack', 'courses', 'cpp', 'python', 'pytorch', 'figma', 'game theory'] },
        { type: 'nav', title: 'Go to Extra-curriculars', subtitle: 'Chess career and competitive sports honors', target: 'extracurricular', keywords: ['extracurricular', 'chess', 'sports', 'hobbies'] },
        
        // System Actions
        { type: 'nav', title: 'Toggle Theme Mode', subtitle: 'Switch color modes (Light / Dark theme)', target: 'toggle-theme', keywords: ['light', 'dark', 'theme', 'color', 'toggle', 'mode', 'switch', 'visual'] },

        // Experiences
        { type: 'experience', title: 'Metasky — Growth & CRM Intern', subtitle: 'Automated CRM Brevo campaigns ($10k+ revenue), 250% utility growth', target: 'experience', elementId: 'exp-metasky', keywords: ['metasky', 'crm', 'brevo', 'intern', 'marketing', 'growth'] },
        { type: 'experience', title: 'UNSNARL — Business Development', subtitle: 'Detectbox onboarding (SME adoption), Web3-Init (1000+ attendees)', target: 'experience', elementId: 'exp-unsnarl', keywords: ['unsnarl', 'merchant', 'onboarding', 'web3', 'detectbox', 'public relations'] },

        // Projects & specs
        { type: 'project', title: 'PRJ-01: IITG Mess App', subtitle: 'Digital mess subscription & QR access for 8,000+ campus users', target: 'projects', elementId: 'proj-mess-app', keywords: ['mess', 'iitg', 'qr', 'subscription', 'billing', 'hostel', 'hab', 'persona', 'prj', 'report'] },
        { type: 'project', title: 'PRJ-02: Dream 11 Predictor', subtitle: 'ML recommendation engine with SHAP local explainability UI', target: 'projects', elementId: 'proj-dream11', keywords: ['dream11', 'prediction', 'ml', 'shap', 'fantasy', 'sports', 'recommendation', 'prj', 'prototype'] },
        { type: 'project', title: 'PRJ-03: SkillPath Platform', subtitle: 'Visual wireframes & dash tracking 5 metrics for 500+ students', target: 'projects', elementId: 'proj-skillpath', keywords: ['skillpath', 'coursera', 'coding club', 'analytics', 'wireframe', 'dashboard', 'prj', 'details'] },
        { type: 'project', title: 'Low Light Image Enhancement', subtitle: 'MIRNet v2 architecture fine-tuning (residual blocks, 0.19 loss)', target: 'projects', elementId: 'proj-others', keywords: ['low light', 'mirnet', 'residual', 'dl', 'deep learning', 'vision', 'link'] },
        { type: 'project', title: 'ChainTune Protocol', subtitle: 'Decentralized P2P streaming smart contracts for audio listening', target: 'projects', elementId: 'proj-others', keywords: ['chaintune', 'p2p', 'streaming', 'music', 'contract', 'blockchain', 'decentralized', 'link'] },
        { type: 'extracurricular', title: 'Chess Career', subtitle: 'SGFI District/State Champion, World Youth rep, Best Player Inter IIT', target: 'extracurricular', elementId: 'ext-chess', keywords: ['chess', 'champion', 'sgfi', 'inter iit', 'sports'] },

        // Leadership
        { type: 'leadership', title: 'General Secretary, Technical Board', subtitle: 'Directing 15 clubs (700+ members) & INR 100L+ annual budget', target: 'leadership', elementId: 'lead-gensec', keywords: ['gensec', 'technical board', 'budget', 'clubs', 'vision 2030', 'inter iit', 'report', 'instagram'] },
        { type: 'leadership', title: 'Secretary, Coding Club', subtitle: 'Organized Codapeak (1.5k+ participants), secured INR 400k+ sponsor funding', target: 'leadership', elementId: 'lead-codingclub', keywords: ['secretary', 'coding club', 'codapeak', 'sponsorship', 'hackathon', 'report', 'instagram'] },

        // Achievements
        { type: 'achievement', title: 'Tech Mahindra Rank 4 Globally', subtitle: 'Secured rank 4 internationally in Innovation Track (2024)', target: 'achievements', keywords: ['tech mahindra', 'global', 'innovation'] },
        { type: 'achievement', title: 'Inter IIT Product Development Medal', subtitle: 'Bronze Medal in Product Development statement among 23 IITs (2024)', target: 'achievements', keywords: ['inter iit', 'bronze', 'product development'] },
        { type: 'achievement', title: 'Amazon DeepRacer Scholar', subtitle: 'Selected for AI/ML Scholarship and Amazon ML Summer School (2024)', target: 'achievements', keywords: ['amazon', 'deepracer', 'scholarship', 'summer school'] },
        { type: 'achievement', title: 'JEE Advanced AIR 1753', subtitle: 'Secured top 0.01% All India Rank of 1753 out of 200k+ (2022)', target: 'achievements', keywords: ['jee', 'advanced', 'air', 'rank', 'iit'] },

        // Skills / Stack
        { type: 'stack', title: 'Programming: C++ & Python', subtitle: 'Data structures, algorithm scripts, data science models', target: 'stack', keywords: ['c++', 'python', 'languages', 'programming'] },
        { type: 'stack', title: 'Web Tech: HTML5, CSS3, JavaScript', subtitle: 'Modern web UI frontend foundation', target: 'stack', keywords: ['html', 'css', 'javascript', 'js'] },
        { type: 'stack', title: 'ML/AI: PyTorch, Pandas, SHAP', subtitle: 'Deep learning modeling and model explainability frameworks', target: 'stack', keywords: ['pytorch', 'pandas', 'shap', 'numpy', 'matplotlib'] },
        { type: 'stack', title: 'Tools: Figma & Brevo CRM', subtitle: 'UI wireframing design and CRM sales automation campaigns', target: 'stack', keywords: ['figma', 'brevo', 'crm', 'design'] },
        { type: 'course', title: 'Course: Game Theory Management', subtitle: 'MOOC syllabus covering strategy planning (IIM Ahmedabad)', target: 'stack', keywords: ['game theory', 'iim', 'ahmedabad', 'coursework'] }
    ];

    // ----------------------------------------------------------------------
    // Navigation / Routing
    // ----------------------------------------------------------------------
    function switchTab(tabId) {
        const targetView = document.getElementById(`view-${tabId}`);
        if (!targetView) return;

        activeTab = tabId;

        // Update active view
        views.forEach(view => {
            view.classList.remove('active');
        });
        targetView.classList.add('active');

        // Update active sidebar nav item and tabindex (WAI-ARIA Pattern)
        navItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
                item.setAttribute('tabindex', '0');
            } else {
                item.classList.remove('active');
                item.setAttribute('tabindex', '-1');
            }
        });

        // Update active mobile nav item
        mobileNavItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Sync hash in URL
        if (location.hash !== `#/${tabId}`) {
            history.pushState(null, null, `#/${tabId}`);
        }

        // Auto-scroll viewport back to top
        document.querySelector('.app-viewport').scrollTop = 0;
    }

    // Hash routing listener
    function handleHashChange() {
        const hash = location.hash.replace('#/', '');
        if (hash) {
            switchTab(hash);
        } else {
            switchTab('overview');
        }
    }

    window.addEventListener('hashchange', handleHashChange);

    // Auto-close mobile menu when transitioning to desktop widths
    window.addEventListener('resize', () => {
        if (window.innerWidth > 840) {
            closeMobileMenu();
        }
    });

    // Initial Routing Load
    handleHashChange();

    // Disable tabbing for non-section elements to restrict Tab key usage to the 6 main sections
    function initTabRestrictions() {
        const disableTabElements = document.querySelectorAll(
            '.branding-link, .contact-link, .cmd-trigger-btn, .theme-toggle-btn, .btn-action'
        );
        disableTabElements.forEach(el => el.setAttribute('tabindex', '-1'));
    }
    initTabRestrictions();

    // Attach Click & Focus Handlers to navigation elements
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
            audio.playClick();
        });
        
        // Auto-switch tab on focus (Tab key navigation switches page instantly)
        item.addEventListener('focus', () => {
            const tabId = item.getAttribute('data-tab');
            if (activeTab !== tabId) {
                switchTab(tabId);
                audio.playTick();
            }
        });
        
        // Enter key navigation on focused elements
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tabId = item.getAttribute('data-tab');
                switchTab(tabId);
                audio.playClick();
            }
        });
    });

    mobileNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
            audio.playClick();
            closeMobileMenu();
        });
    });

    // ----------------------------------------------------------------------
    // Mobile Menu Toggling
    // ----------------------------------------------------------------------
    function toggleMobileMenu() {
        const isOpen = mobileMenu.classList.contains('open');
        audio.playClick();
        if (isOpen) {
            closeMobileMenu();
        } else {
            mobileMenu.classList.add('open');
            mobileMenuToggle.classList.add('open');
        }
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        mobileMenuToggle.classList.remove('open');
    }

    mobileMenuToggle.addEventListener('click', toggleMobileMenu);

    document.addEventListener('click', (e) => {
        if (mobileMenu.classList.contains('open') &&
            !mobileMenu.contains(e.target) &&
            !mobileMenuToggle.contains(e.target)) {
            closeMobileMenu();
            audio.playClick();
        }
    });

    // ----------------------------------------------------------------------
    // Theme Management (Light / Dark Mode)
    // ----------------------------------------------------------------------
    function initTheme() {
        const savedTheme = localStorage.getItem('pm-portfolio-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('pm-portfolio-theme', nextTheme);
        audio.playChime(nextTheme === 'light');
    }

    themeToggle.addEventListener('click', toggleTheme);
    initTheme();

    // ----------------------------------------------------------------------
    // Command Palette Menu Logic
    // ----------------------------------------------------------------------
    function openPalette() {
        isPaletteOpen = true;
        cmdPalette.classList.add('open');
        cmdInput.value = '';
        selectedResultIndex = 0;
        filteredResults = [];
        audio.playClick();
        
        renderSuggestions();
        
        setTimeout(() => {
            cmdInput.focus();
        }, 50);
    }

    function closePalette() {
        isPaletteOpen = false;
        cmdPalette.classList.remove('open');
        cmdInput.blur();
        audio.playClick();
    }

    function handleSelection(item) {
        if (!item) return;

        // Custom action intercepts
        if (item.target === 'toggle-theme') {
            toggleTheme();
            closePalette();
            return;
        }

        // Standard Navigation Swaps
        switchTab(item.target);
        audio.playClick();

        // Scroll to specific DOM item
        if (item.elementId) {
            setTimeout(() => {
                const element = document.getElementById(item.elementId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('pulse-highlight');
                    
                    setTimeout(() => {
                        element.classList.remove('pulse-highlight');
                    }, 1600);
                }
            }, 250);
        }

        closePalette();
    }

    function renderSuggestions() {
        cmdSuggestions.classList.remove('hidden');
        cmdResults.classList.add('hidden');
        
        const navItemsList = searchIndex.filter(item => item.type === 'nav');
        filteredResults = navItemsList;
        selectedResultIndex = 0;
        
        let html = '<div class="suggestions-label">Navigation Links</div>';
        
        navItemsList.forEach((item, index) => {
            const isSelected = index === selectedResultIndex ? 'selected' : '';
            const actionText = item.target === 'toggle-theme' ? 'Action' : 'Jump';
            html += `
                <div class="cmd-item ${isSelected}" data-index="${index}">
                    <div class="cmd-item-left">
                        <span class="cmd-item-icon">↳</span>
                        <span class="cmd-item-text">${item.title}</span>
                        <span class="cmd-item-desc">${item.subtitle}</span>
                    </div>
                    <span class="cmd-item-badge">${actionText}</span>
                </div>
            `;
        });
        
        cmdSuggestions.innerHTML = html;
        attachItemClickHandlers(cmdSuggestions);
    }

    function performSearch(query) {
        if (!query.trim()) {
            renderSuggestions();
            return;
        }

        cmdSuggestions.classList.add('hidden');
        cmdResults.classList.remove('hidden');

        const normalizedQuery = query.toLowerCase().trim();
        const queryTokens = normalizedQuery.split(/\s+/).filter(t => t.length > 0);

        if (queryTokens.length === 0) {
            renderSuggestions();
            return;
        }

        const scoredResults = [];

        searchIndex.forEach(item => {
            const title = item.title.toLowerCase();
            const subtitle = item.subtitle.toLowerCase();
            const keywords = item.keywords || [];

            // A item is a match if every query token matches something in the item
            let matchesAllTokens = true;
            let score = 0;

            for (const token of queryTokens) {
                let tokenMatches = false;

                if (title.includes(token)) {
                    tokenMatches = true;
                    score += 100;
                    if (title.startsWith(token)) {
                        score += 50;
                    }
                }
                
                if (subtitle.includes(token)) {
                    tokenMatches = true;
                    score += 20;
                }

                // Check keywords
                for (const keyword of keywords) {
                    const kw = keyword.toLowerCase();
                    if (kw.includes(token)) {
                        tokenMatches = true;
                        score += 40;
                        if (kw === token) {
                            score += 30; // Exact keyword match bonus
                        }
                    }
                }

                if (!tokenMatches) {
                    matchesAllTokens = false;
                    break;
                }
            }

            if (matchesAllTokens) {
                // Exact full-phrase title match bonus
                if (title.includes(normalizedQuery)) {
                    score += 200;
                }
                if (title === normalizedQuery) {
                    score += 1000;
                }
                scoredResults.push({ item, score });
            }
        });

        // Sort by score descending
        scoredResults.sort((a, b) => b.score - a.score);

        filteredResults = scoredResults.map(r => r.item);
        selectedResultIndex = 0;
        renderSearchResults();
    }

    function renderSearchResults() {
        if (filteredResults.length === 0) {
            cmdResults.innerHTML = `<div class="cmd-no-results">No results found for "${cmdInput.value}"</div>`;
            return;
        }

        let html = '';
        filteredResults.forEach((item, index) => {
            const isSelected = index === selectedResultIndex ? 'selected' : '';
            const actionText = item.target === 'toggle-theme' 
                ? 'Action' 
                : (item.type === 'nav' 
                    ? 'Jump' 
                    : (item.type === 'extracurricular' ? 'Extra' : item.type.toUpperCase()));
            
            html += `
                <div class="cmd-item ${isSelected}" data-index="${index}">
                    <div class="cmd-item-left">
                        <span class="cmd-item-icon">${getIcon(item.type)}</span>
                        <div>
                            <span class="cmd-item-text">${item.title}</span>
                            <span class="cmd-item-desc" style="display: block; margin-left: 0; margin-top: 0.15rem;">${item.subtitle}</span>
                        </div>
                    </div>
                    <span class="cmd-item-badge">${actionText}</span>
                </div>
            `;
        });

        cmdResults.innerHTML = html;
        attachItemClickHandlers(cmdResults);
        scrollToSelected();
    }

    function getIcon(type) {
        switch (type) {
            case 'nav': return '↳';
            case 'experience': return '◇';
            case 'project': return '□';
            case 'leadership': return '△';
            case 'achievement': return '☆';
            case 'stack': return '⚬';
            case 'extracurricular': return '⬡';
            default: return '·';
        }
    }

    // Attach click triggers to a specific container
    function attachItemClickHandlers(container) {
        const items = container.querySelectorAll('.cmd-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const idx = parseInt(item.getAttribute('data-index'), 10);
                handleSelection(filteredResults[idx]);
            });
        });
    }

    function scrollToSelected() {
        const selectedEl = document.querySelector('.cmd-item.selected');
        if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'nearest' });
        }
    }

    function updateSelectionHighlight() {
        const selector = cmdSuggestions.classList.contains('hidden') 
            ? '#cmd-results .cmd-item' 
            : '#cmd-suggestions .cmd-item';
        const items = document.querySelectorAll(selector);
        items.forEach((item, idx) => {
            if (idx === selectedResultIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        scrollToSelected();
        audio.playTick(); // Tick sound on selection change
    }

    // ----------------------------------------------------------------------
    // Global Event Handlers
    // ----------------------------------------------------------------------
    cmdTrigger.addEventListener('click', openPalette);
    cmdCloseBtn.addEventListener('click', closePalette);
    
    cmdPalette.addEventListener('click', (e) => {
        if (e.target === cmdPalette) {
            closePalette();
        }
    });

    cmdInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    // Global Key Listening
    document.addEventListener('keydown', (e) => {
        const isTyping = document.activeElement.tagName === 'INPUT' || 
                         document.activeElement.tagName === 'TEXTAREA' || 
                         document.activeElement.isContentEditable;

        // 1. Toggle Palette (Cmd+K or Ctrl+K) - Available Globally
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (isPaletteOpen) {
                closePalette();
            } else {
                openPalette();
            }
            return;
        }

        // 2. Navigation cycles inside Open Palette
        if (isPaletteOpen) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closePalette();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (filteredResults.length > 0) {
                    selectedResultIndex = (selectedResultIndex + 1) % filteredResults.length;
                    updateSelectionHighlight();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (filteredResults.length > 0) {
                    selectedResultIndex = (selectedResultIndex - 1 + filteredResults.length) % filteredResults.length;
                    updateSelectionHighlight();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredResults.length > 0 && selectedResultIndex >= 0) {
                    handleSelection(filteredResults[selectedResultIndex]);
                }
            }
            return;
        }

        // 3. Navigation Shortcuts & Global Keyboard Scroll (Only active when NOT typing)
        if (!isTyping) {
            // Theme toggle hotkey: 't' or 'T'
            if (e.key.toLowerCase() === 't') {
                e.preventDefault();
                toggleTheme();
            }
            
            // Search palette focus hotkey: '/' or 's'
            else if (e.key === '/' || e.key.toLowerCase() === 's') {
                e.preventDefault();
                openPalette();
            }

            // Global Arrow Key Scrolling for Viewport strictly
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const viewport = document.querySelector('.app-viewport');
                if (viewport) {
                    viewport.scrollBy({ top: 120 }); // Smooth scrolling governed by CSS
                    audio.playTick();
                }
            }
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const viewport = document.querySelector('.app-viewport');
                if (viewport) {
                    viewport.scrollBy({ top: -120 }); // Smooth scrolling governed by CSS
                    audio.playTick();
                }
            }

            // Escape key returns focus to the active sidebar tab
            else if (e.key === 'Escape') {
                e.preventDefault();
                const activeNavItem = document.querySelector('.nav-item.active');
                if (activeNavItem) {
                    activeNavItem.focus();
                    audio.playClick();
                }
            }

            // Tab / Shift+Tab cycling through the 6 sections only
            else if (e.key === 'Tab') {
                e.preventDefault();
                const currentIndex = Array.from(navItems).findIndex(item => item.getAttribute('data-tab') === activeTab);
                if (currentIndex !== -1) {
                    const nextIndex = e.shiftKey 
                        ? (currentIndex - 1 + navItems.length) % navItems.length
                        : (currentIndex + 1) % navItems.length;
                    const nextItem = navItems[nextIndex];
                    const tabId = nextItem.getAttribute('data-tab');
                    switchTab(tabId);
                    nextItem.focus();
                }
            }

            // Quick View Swap Shortcuts: '1' through '7' (Alt key optional)
            else if (!isNaN(e.key) || (e.altKey && !isNaN(e.key))) {
                const keyNum = parseInt(e.key, 10);
                const mapping = ['overview', 'experience', 'projects', 'leadership', 'achievements', 'stack', 'extracurricular'];
                if (keyNum >= 1 && keyNum <= 7) {
                    e.preventDefault();
                    switchTab(mapping[keyNum - 1]);
                    audio.playClick();
                }
            }
        }
    });
});
