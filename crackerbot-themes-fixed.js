console.log("[crackerbot-themes-fixed.js] Script loaded and executing...");
// MAIN THEME SYSTEM - SINGLE SOURCE OF TRUTH
console.log('[Themes] Loading MAIN theme system...');

(function() {
    // Prevent multiple initializations
    if (window.themeSystemInitialized) {
        console.log('[Themes] Already initialized, skipping...');
        return;
    }
    window.themeSystemInitialized = true;

    const THEMES = {
        cosmic: {
            name: "🌌 Cosmic",
            background: "linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)",
            primary: "#00ff88",
            secondary: "#00ccff"
        },
        matrix: {
            name: "💻 Matrix",
            background: "linear-gradient(135deg, #000000 0%, #001100 100%)",
            primary: "#00ff00",
            secondary: "#008800"
        },
        cyberpunk: {
            name: "🤖 Cyberpunk",
            background: "linear-gradient(135deg, #ff006e 0%, #8338ec 100%)",
            primary: "#ffbe0b",
            secondary: "#fb5607"
        },
        neon: {
            name: "💜 Neon",
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            primary: "#00ffcc",
            secondary: "#ff00cc"
        },
        minimal: {
            name: "⚪ Minimal",
            background: "#ffffff",
            primary: "#333333",
            secondary: "#666666"
        },
        dark: {
            name: "🌑 Dark",
            background: "#111111",
            primary: "#ffffff",
            secondary: "#888888"
        }
    };

    let currentTheme = localStorage.getItem('crackerBotTheme') || 'cosmic';
    let dropdownOpen = false;
    let hoverTimeout = null;
    let matrixRainInterval = null;

    function initThemes() {
        console.log('[Themes] Initializing...');
        
        // Apply saved theme
        applyTheme(currentTheme);
        
        // Add CSS to override hover behavior
        addOverrideCSS();
        
        // Create dropdown after delay
        setTimeout(createThemeDropdown, 500);
        
        // Initialize Matrix canvas
        initMatrixCanvas();
    }

    function addOverrideCSS() {
        const style = document.createElement('style');
        style.id = 'theme-override-css';
        style.textContent = `
            /* Override CSS hover - JavaScript controls dropdown */
            .theme-dropdown:hover .dropdown-content,
            .matrix-dropdown:hover .dropdown-content {
                display: none !important;
            }
            
            .dropdown-content.active {
                display: block !important;
                background: #000000 !important;
                background-color: #000000 !important;
                position: absolute !important;
                z-index: 2147483647 !important;
                border: 2px solid #00ff88 !important;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 255, 136, 0.3) !important;
            }
        `;
        document.head.appendChild(style);
    }

    function createThemeDropdown() {
        const headerButtons = document.querySelector('.header-buttons');
        if (!headerButtons) {
            console.log('[Themes] Header not found, retrying...');
            setTimeout(createThemeDropdown, 500);
            return;
        }

        // Remove any existing dropdown
        const existing = document.querySelector('.theme-dropdown');
        if (existing) existing.remove();

        // Create dropdown HTML
        const dropdown = document.createElement('div');
        dropdown.className = 'theme-dropdown';
        dropdown.style.cssText = 'position: relative; display: inline-block; z-index: 999998;';
        
        dropdown.innerHTML = `
            <button class="theme-btn" id="current-theme" style="
                background: rgba(0, 255, 136, 0.1);
                border: 2px solid #00ff88;
                color: #00ff88;
                padding: 8px 20px;
                cursor: pointer;
                text-transform: uppercase;
                font-size: 11px;
                transition: all 0.3s;
                border-radius: 20px;
                font-weight: bold;
            ">${getThemeName(currentTheme)} ▼</button>
            <div class="dropdown-content" style="
                display: none;
                position: absolute;
                background: #000000;
                min-width: 180px;
                right: 0;
                top: 100%;
                margin-top: 5px;
                border-radius: 10px;
                padding: 5px;
                border: 2px solid #00ff88;
            ">
                ${Object.keys(THEMES).map(key => `
                    <a href="#" data-theme="${key}" style="
                        color: #00ff88;
                        padding: 12px 16px;
                        text-decoration: none;
                        display: block;
                        transition: all 0.3s;
                        border-radius: 5px;
                        background: #000000;
                        ${key === currentTheme ? 'background: rgba(0,255,136,0.3); font-weight: bold;' : ''}
                    ">${THEMES[key].name}</a>
                `).join('')}
            </div>
        `;

        // Insert before first button or at start
        const firstButton = headerButtons.querySelector('button');
        if (firstButton) {
            headerButtons.insertBefore(dropdown, firstButton);
        } else {
            headerButtons.appendChild(dropdown);
        }

        // Get elements
        const button = dropdown.querySelector('.theme-btn');
        const content = dropdown.querySelector('.dropdown-content');

        // Track whether mouse is over dropdown area
        let mouseOverDropdown = false;
        
        // Click to toggle
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            dropdownOpen = !dropdownOpen;
            if (dropdownOpen) {
                content.classList.add('active');
                content.style.display = 'block';
                console.log('[Themes] Dropdown opened via click');
            } else {
                content.classList.remove('active');
                content.style.display = 'none';
                console.log('[Themes] Dropdown closed via click');
            }
        });

        // Mouse tracking for hover
        function enterDropdown() {
            clearTimeout(hoverTimeout);
            mouseOverDropdown = true;
            if (!dropdownOpen) {
                dropdownOpen = true;
                content.classList.add('active');
                content.style.display = 'block';
                console.log('[Themes] Dropdown opened via hover');
            }
        }
        
        function leaveDropdown() {
            mouseOverDropdown = false;
            hoverTimeout = setTimeout(function() {
                if (!mouseOverDropdown && dropdownOpen) {
                    dropdownOpen = false;
                    content.classList.remove('active');
                    content.style.display = 'none';
                    console.log('[Themes] Dropdown closed after hover timeout');
                }
            }, 800); // 800ms delay before closing
        }

        // Apply hover handlers to button
        button.addEventListener('mouseenter', enterDropdown);
        button.addEventListener('mouseleave', leaveDropdown);
        
        // Apply hover handlers to dropdown content
        content.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimeout);
            mouseOverDropdown = true;
            console.log('[Themes] Mouse over dropdown content');
        });
        
        content.addEventListener('mouseleave', function() {
            mouseOverDropdown = false;
            hoverTimeout = setTimeout(function() {
                if (!mouseOverDropdown && dropdownOpen) {
                    dropdownOpen = false;
                    content.classList.remove('active');
                    content.style.display = 'none';
                    console.log('[Themes] Dropdown closed after leaving content');
                }
            }, 800);
        });

        // Theme selection
        content.querySelectorAll('a').forEach(link => {
            link.addEventListener('mouseenter', function() {
                if (this.dataset.theme !== currentTheme) {
                    this.style.background = 'rgba(0,255,136,0.2)';
                }
            });
            
            link.addEventListener('mouseleave', function() {
                if (this.dataset.theme !== currentTheme) {
                    this.style.background = '#000000';
                } else {
                    this.style.background = 'rgba(0,255,136,0.3)';
                }
            });
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                selectTheme(this.dataset.theme);
            });
        });

        // Close on outside click
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target)) {
                if (dropdownOpen) {
                    dropdownOpen = false;
                    content.classList.remove('active');
                    content.style.display = 'none';
                    console.log('[Themes] Dropdown closed via outside click');
                }
            }
        });

        console.log('[Themes] Dropdown created successfully');
    }

    function getThemeName(theme) {
        const names = {
            matrix: "💻 MATRIX",
            cosmic: "🌌 COSMIC",
            cyberpunk: "🤖 CYBER",
            neon: "💜 NEON",
            minimal: "⚪ MIN",
            dark: "🌑 DARK"
        };
        return names[theme] || "🌌 COSMIC";
    }

    function selectTheme(themeKey) {
        currentTheme = themeKey;
        applyTheme(themeKey);
        localStorage.setItem('crackerBotTheme', themeKey);
        
        // Update button text
        const btn = document.querySelector('.theme-btn');
        if (btn) btn.innerHTML = getThemeName(themeKey) + ' ▼';
        
        // Update active state
        document.querySelectorAll('.dropdown-content a').forEach(link => {
            if (link.dataset.theme === themeKey) {
                link.style.background = 'rgba(0,255,136,0.3)';
                link.style.fontWeight = 'bold';
            } else {
                link.style.background = '#000000';
                link.style.fontWeight = 'normal';
            }
        });
        
        // Close dropdown
        dropdownOpen = false;
        const content = document.querySelector('.dropdown-content');
        if (content) {
            content.classList.remove('active');
            content.style.display = 'none';
        }
        
        // Show notification
        if (window.addMessage) {
            window.addMessage('System', `${THEMES[themeKey].name} theme activated!`, 'system');
        }
    }

    function applyTheme(themeKey) {
        const theme = THEMES[themeKey];
        if (!theme) return;
        
        console.log('[Themes] Applying:', theme.name);
        
        // Remove all theme classes
        Object.keys(THEMES).forEach(key => {
            document.body.classList.remove(`${key}-theme`);
        });
        
        // Add theme class
        document.body.classList.add(`${themeKey}-theme`);
        
        // Apply styles
        document.body.style.background = theme.background;
        
        // Handle Matrix rain
        if (themeKey === 'matrix') {
            startMatrixRain();
        } else {
            stopMatrixRain();
        }
    }

    function initMatrixCanvas() {
        if (!document.getElementById('matrix-rain')) {
            const canvas = document.createElement('canvas');
            canvas.id = 'matrix-rain';
            canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;opacity:0.3;pointer-events:none;';
            document.body.appendChild(canvas);
        }
    }

    function startMatrixRain() {
        const canvas = document.getElementById('matrix-rain');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const matrix = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}';
        const matrixArray = matrix.split('');
        const fontSize = 10;
        const columns = canvas.width / fontSize;
        const drops = [];
        
        for (let x = 0; x < columns; x++) {
            drops[x] = Math.floor(Math.random() * -canvas.height / fontSize);
        }
        
        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        
        if (matrixRainInterval) clearInterval(matrixRainInterval);
        matrixRainInterval = setInterval(draw, 35);
    }

    function stopMatrixRain() {
        if (matrixRainInterval) {
            clearInterval(matrixRainInterval);
            matrixRainInterval = null;
        }
        const canvas = document.getElementById('matrix-rain');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemes);
    } else {
        initThemes();
    }

    // Global exports
    window.applyTheme = applyTheme;
    window.setTheme = applyTheme;
    window.changeTheme = applyTheme;

    console.log('[Themes] ✅ Main theme system ready');
})();
