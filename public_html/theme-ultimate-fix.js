console.log("[theme-ultimate-fix.js] Script loaded and executing...");
// ULTIMATE THEME DROPDOWN FIX
// This completely replaces the broken theme system

(function() {
    console.log('[Ultimate Theme Fix] Initializing...');
    
    // Wait for DOM
    function initThemeFix() {
        // Remove any existing broken dropdowns
        const existingDropdowns = document.querySelectorAll('.theme-dropdown, .matrix-dropdown');
        existingDropdowns.forEach(el => el.remove());
        
        // Find header buttons container
        const headerButtons = document.querySelector('.header-buttons');
        if (!headerButtons) {
            console.error('[Ultimate Theme Fix] No header buttons found, retrying...');
            setTimeout(initThemeFix, 1000);
            return;
        }
        
        // Create new theme system from scratch
        const themeSystem = document.createElement('div');
        themeSystem.innerHTML = `
            <style>
                .ultimate-theme-container {
                    position: relative;
                    display: inline-block;
                    z-index: 999999 !important;
                }
                
                .ultimate-theme-btn {
                    background: rgba(0, 255, 136, 0.1);
                    border: 2px solid #00ff88;
                    color: #00ff88;
                    padding: 8px 20px;
                    cursor: pointer;
                    border-radius: 20px;
                    font-family: "Courier New", monospace;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    transition: all 0.3s;
                }
                
                .ultimate-theme-btn:hover {
                    background: rgba(0, 255, 136, 0.2);
                    box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
                }
                
                .ultimate-dropdown {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    margin-top: 5px;
                    background: #000000;
                    border: 2px solid #00ff88;
                    min-width: 180px;
                    box-shadow: 0 8px 32px rgba(0, 255, 136, 0.3);
                    z-index: 999999 !important;
                    opacity: 0;
                    transform: translateY(-10px);
                    transition: opacity 0.3s, transform 0.3s;
                }
                
                .ultimate-dropdown.show {
                    display: block !important;
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .ultimate-dropdown a {
                    display: block;
                    padding: 12px 16px;
                    color: #00ff88;
                    text-decoration: none;
                    transition: all 0.2s;
                    font-size: 12px;
                    border-bottom: 1px solid rgba(0, 255, 136, 0.1);
                }
                
                .ultimate-dropdown a:last-child {
                    border-bottom: none;
                }
                
                .ultimate-dropdown a:hover {
                    background: rgba(0, 255, 136, 0.2);
                    padding-left: 20px;
                }
                
                .ultimate-dropdown a.active-theme {
                    background: rgba(0, 255, 136, 0.3);
                    font-weight: bold;
                }
            </style>
            
            <div class="ultimate-theme-container" id="ultimate-theme-system">
                <button class="ultimate-theme-btn" id="ultimate-theme-btn">
                    <span id="theme-icon">🌌</span> <span id="theme-name">COSMIC</span> <span>▼</span>
                </button>
                <div class="ultimate-dropdown" id="ultimate-dropdown">
                    <a href="#" data-theme="cosmic" data-icon="��">🌌 Cosmic</a>
                    <a href="#" data-theme="matrix" data-icon="💻">💻 Matrix</a>
                    <a href="#" data-theme="cyberpunk" data-icon="🤖">🤖 Cyberpunk</a>
                    <a href="#" data-theme="neon" data-icon="💜">💜 Neon</a>
                    <a href="#" data-theme="minimal" data-icon="⚪">⚪ Minimal</a>
                    <a href="#" data-theme="dark" data-icon="🌑">🌑 Dark</a>
                </div>
            </div>
        `;
        
        // Insert at beginning of header buttons
        headerButtons.insertBefore(themeSystem.firstElementChild, headerButtons.firstChild);
        headerButtons.insertBefore(themeSystem.lastElementChild, headerButtons.firstChild);
        
        // Get references
        const container = document.getElementById('ultimate-theme-system');
        const btn = document.getElementById('ultimate-theme-btn');
        const dropdown = document.getElementById('ultimate-dropdown');
        const themeIcon = document.getElementById('theme-icon');
        const themeName = document.getElementById('theme-name');
        
        // State
        let isOpen = false;
        let closeTimeout = null;
        
        // Helper functions
        function openDropdown() {
            clearTimeout(closeTimeout);
            dropdown.classList.add('show');
            isOpen = true;
            console.log('[Theme] Dropdown opened');
        }
        
        function closeDropdown() {
            clearTimeout(closeTimeout);
            closeTimeout = setTimeout(() => {
                dropdown.classList.remove('show');
                isOpen = false;
                console.log('[Theme] Dropdown closed');
            }, 100);
        }
        
        function immediateClose() {
            clearTimeout(closeTimeout);
            dropdown.classList.remove('show');
            isOpen = false;
        }
        
        // Event handlers
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isOpen) {
                immediateClose();
            } else {
                openDropdown();
            }
        });
        
        // Hover behavior - keep open when hovering over container
        container.addEventListener('mouseenter', () => {
            clearTimeout(closeTimeout);
            openDropdown();
        });
        
        container.addEventListener('mouseleave', () => {
            closeDropdown();
        });
        
        // Prevent dropdown from closing when hovering over it
        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(closeTimeout);
        });
        
        // Theme selection
        dropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const theme = link.dataset.theme;
                const icon = link.dataset.icon;
                
                // Update button
                themeIcon.textContent = icon;
                themeName.textContent = theme.toUpperCase();
                
                // Apply theme
                document.body.className = theme + '-theme';
                localStorage.setItem('crackerBotTheme', theme);
                
                // Update active state
                dropdown.querySelectorAll('a').forEach(a => a.classList.remove('active-theme'));
                link.classList.add('active-theme');
                
                // Close dropdown
                immediateClose();
                
                console.log('[Theme] Changed to:', theme);
            });
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                immediateClose();
            }
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('crackerBotTheme') || 'cosmic';
        const savedLink = dropdown.querySelector(`[data-theme="${savedTheme}"]`);
        if (savedLink) {
            savedLink.click();
        }
        
        // Mark as initialized
        window.ultimateThemeInitialized = true;
        console.log('[Ultimate Theme Fix] ✅ Successfully initialized!');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeFix);
    } else {
        setTimeout(initThemeFix, 100);
    }
})();
