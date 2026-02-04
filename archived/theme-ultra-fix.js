// ULTRA AGGRESSIVE FIX - Constantly enforces dropdown behavior
console.log('[Theme ULTRA Fix] Starting aggressive override...');

// Wait a bit for everything to load
setTimeout(() => {
    let dropdownOpen = false;
    let hoverTimer = null;
    
    const dropdown = document.querySelector('.theme-dropdown');
    const button = document.querySelector('.theme-btn');
    const content = document.querySelector('.dropdown-content');
    
    if (!dropdown || !button || !content) {
        console.error('[Theme ULTRA Fix] Elements not found!');
        return;
    }
    
    // Override ALL styles constantly
    const forceStyles = () => {
        content.style.cssText = `
            display: ${dropdownOpen ? 'block' : 'none'} !important;
            position: absolute !important;
            background: #000000 !important;
            background-color: #000000 !important;
            min-width: 180px !important;
            box-shadow: 0px 8px 16px rgba(0, 255, 0, 0.3) !important;
            border: 2px solid #00ff88 !important;
            top: 100% !important;
            right: 0 !important;
            z-index: 2147483647 !important;
            border-radius: 10px !important;
            padding: 5px !important;
            margin-top: 5px !important;
            pointer-events: auto !important;
            opacity: 1 !important;
        `;
    };
    
    // Check every 100ms if dropdown should be visible
    setInterval(() => {
        if (dropdownOpen) {
            content.style.display = 'block';
            content.style.zIndex = '2147483647';
        }
    }, 100);
    
    // New button handler
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        dropdownOpen = !dropdownOpen;
        forceStyles();
        console.log('[ULTRA] Toggled:', dropdownOpen);
    }, true);
    
    // Hover detection using mouse position
    document.addEventListener('mousemove', (e) => {
        const rect = dropdown.getBoundingClientRect();
        const expanded = {
            left: rect.left - 10,
            right: rect.right + 10,
            top: rect.top - 10,
            bottom: rect.bottom + 100 // Include dropdown area
        };
        
        const isHovering = e.clientX >= expanded.left && 
                          e.clientX <= expanded.right && 
                          e.clientY >= expanded.top && 
                          e.clientY <= expanded.bottom;
        
        if (isHovering) {
            clearTimeout(hoverTimer);
            if (!dropdownOpen) {
                dropdownOpen = true;
                forceStyles();
            }
        } else if (dropdownOpen) {
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => {
                dropdownOpen = false;
                forceStyles();
            }, 500);
        }
    });
    
    // Click handlers for theme options
    content.querySelectorAll('a').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const theme = link.getAttribute('data-theme');
            if (window.applyTheme) {
                window.applyTheme(theme);
            }
            dropdownOpen = false;
            forceStyles();
        };
    });
    
    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdownOpen = false;
            forceStyles();
        }
    }, true);
    
    console.log('[Theme ULTRA Fix] ✅ AGGRESSIVE OVERRIDE ACTIVE!');
    
}, 2000);
