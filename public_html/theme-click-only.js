// CLICK-ONLY THEME SYSTEM - Stays open until you click
console.log('[Click-Only Theme] Initializing...');

(function() {
    // Remove any existing theme buttons
    setTimeout(() => {
        // Remove all existing theme buttons
        document.querySelectorAll('.theme-btn, .nuclear-theme-btn, .fallback-theme-btn, .inline-theme-btn').forEach(el => {
            if (el.parentElement) el.parentElement.remove();
            el.remove();
        });
        
        // Create new click-only theme system
        const style = document.createElement('style');
        style.textContent = `
            #click-theme-container {
                position: fixed !important;
                top: 10px !important;
                right: 10px !important;
                z-index: 2147483647 !important;
            }
            
            #click-theme-btn {
                background: linear-gradient(135deg, #8a2be2, #00ff88) !important;
                border: none !important;
                color: white !important;
                padding: 12px 24px !important;
                cursor: pointer !important;
                border-radius: 25px !important;
                font-weight: bold !important;
                font-size: 14px !important;
                text-transform: uppercase !important;
                box-shadow: 0 4px 15px rgba(138, 43, 226, 0.4) !important;
                transition: transform 0.2s !important;
            }
            
            #click-theme-btn:hover {
                transform: scale(1.05) !important;
            }
            
            #click-theme-menu {
                display: none !important;
                position: absolute !important;
                top: 100% !important;
                right: 0 !important;
                margin-top: 10px !important;
                background: #000000 !important;
                border: 3px solid #00ff88 !important;
                border-radius: 15px !important;
                overflow: hidden !important;
                box-shadow: 0 10px 40px rgba(0, 255, 136, 0.5) !important;
                min-width: 200px !important;
            }
            
            #click-theme-menu.open {
                display: block !important;
            }
            
            .click-theme-option {
                display: block !important;
                width: 100% !important;
                padding: 15px 20px !important;
                background: #000000 !important;
                border: none !important;
                color: #00ff88 !important;
                cursor: pointer !important;
                text-align: left !important;
                font-size: 14px !important;
                font-family: monospace !important;
                transition: all 0.2s !important;
                border-bottom: 1px solid rgba(0, 255, 136, 0.2) !important;
            }
            
            .click-theme-option:last-child {
                border-bottom: none !important;
            }
            
            .click-theme-option:hover {
                background: rgba(0, 255, 136, 0.3) !important;
                padding-left: 30px !important;
            }
            
            .click-theme-option.active {
                background: rgba(138, 43, 226, 0.3) !important;
                font-weight: bold !important;
            }
        `;
        document.head.appendChild(style);
        
        // Create container
        const container = document.createElement('div');
        container.id = 'click-theme-container';
        container.innerHTML = `
            <button id="click-theme-btn">🎨 THEME ▼</button>
            <div id="click-theme-menu">
                <button class="click-theme-option" data-theme="cosmic" data-icon="🌌">🌌 Cosmic</button>
                <button class="click-theme-option" data-theme="matrix" data-icon="💻">💻 Matrix</button>
                <button class="click-theme-option" data-theme="cyberpunk" data-icon="🤖">🤖 Cyberpunk</button>
                <button class="click-theme-option" data-theme="neon" data-icon="��">💜 Neon</button>
                <button class="click-theme-option" data-theme="minimal" data-icon="⚪">⚪ Minimal</button>
                <button class="click-theme-option" data-theme="dark" data-icon="🌑">🌑 Dark</button>
            </div>
        `;
        document.body.appendChild(container);
        
        const btn = document.getElementById('click-theme-btn');
        const menu = document.getElementById('click-theme-menu');
        const options = document.querySelectorAll('.click-theme-option');
        
        let isOpen = false;
        
        // Toggle menu on button click
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            isOpen = !isOpen;
            if (isOpen) {
                menu.classList.add('open');
                console.log('[Click-Only Theme] Menu opened');
            } else {
                menu.classList.remove('open');
                console.log('[Click-Only Theme] Menu closed');
            }
        });
        
        // Theme selection
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const theme = option.dataset.theme;
                const icon = option.dataset.icon;
                
                // Apply theme
                document.body.className = theme === 'cosmic' ? '' : theme + '-theme';
                localStorage.setItem('crackerBotTheme', theme);
                
                // Update button text
                btn.innerHTML = `${icon} ${theme.toUpperCase()} ▼`;
                
                // Update active state
                options.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Close menu
                menu.classList.remove('open');
                isOpen = false;
                
                console.log('[Click-Only Theme] Changed to:', theme);
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target) && isOpen) {
                menu.classList.remove('open');
                isOpen = false;
                console.log('[Click-Only Theme] Closed by outside click');
            }
        });
        
        // Prevent menu from closing when clicking inside it
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('crackerBotTheme') || 'cosmic';
        const savedOption = document.querySelector(`[data-theme="${savedTheme}"]`);
        if (savedOption) {
            savedOption.click();
        }
        
        console.log('[Click-Only Theme] ✅ System ready! Click the THEME button to open menu.');
        
    }, 1000);
})();
