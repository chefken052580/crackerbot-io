// NUCLEAR THEME FIX - Guarantees dropdown works
console.log('[Theme Nuclear Fix] Loading...');

// Wait for DOM and other scripts
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('[Theme Nuclear Fix] Applying override...');
        
        const dropdown = document.querySelector('.theme-dropdown');
        const button = document.querySelector('.theme-btn');
        const content = document.querySelector('.dropdown-content');
        
        if (!dropdown || !button || !content) {
            console.error('[Theme Nuclear Fix] Missing elements, retrying...');
            setTimeout(arguments.callee, 1000);
            return;
        }
        
        // FORCE solid black background
        content.style.cssText += 'background: #000000 !important; background-color: #000000 !important; z-index: 999999 !important;';
        
        // Remove all existing handlers
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        const newDropdown = dropdown.cloneNode(true);
        dropdown.parentNode.replaceChild(newDropdown, dropdown);
        
        // Get fresh references
        const finalButton = document.querySelector('.theme-btn');
        const finalContent = document.querySelector('.dropdown-content');
        const finalDropdown = document.querySelector('.theme-dropdown');
        
        // Add NEW handlers
        let isOpen = false;
        let hoverTimeout;
        
        finalButton.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            isOpen = !isOpen;
            finalContent.style.display = isOpen ? 'block' : 'none';
            if (isOpen) {
                finalContent.style.background = '#000000';
                finalContent.style.backgroundColor = '#000000';
            }
            console.log('[Theme Nuclear Fix] Toggled:', isOpen);
        });
        
        finalDropdown.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            finalContent.style.display = 'block';
            finalContent.style.background = '#000000';
            isOpen = true;
        });
        
        finalDropdown.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                finalContent.style.display = 'none';
                isOpen = false;
            }, 600);
        });
        
        // Re-attach theme selection
        finalContent.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const theme = link.getAttribute('data-theme');
                if (theme && window.applyTheme) {
                    window.applyTheme(theme);
                    finalContent.style.display = 'none';
                    isOpen = false;
                }
            });
        });
        
        console.log('[Theme Nuclear Fix] ✅ COMPLETE - Dropdown should work now!');
        
    }, 1500); // Wait for all other scripts
});
