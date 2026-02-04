// crackerbot-backend-config.js
(function() {
    // Dynamic backend configuration
    const hostname = window.location.hostname;
    
    // Check for saved backend URL first
    const savedBackendUrl = localStorage.getItem('crackerbot_backend_url');
    window.CUSTOM_BACKEND_URL = savedBackendUrl;
    
    if (savedBackendUrl) {
        window.BACKEND_URL = savedBackendUrl;
        console.log("✅ Using saved backend:", window.BACKEND_URL);
    } else if (hostname.includes('ngrok.io')) {
        // On ngrok - backend URL must be configured
        console.warn("⚠️ On ngrok but no backend URL configured!");
        window.BACKEND_URL = null; // Don't set a wrong default
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Local development
        window.BACKEND_URL = "https://crackerbot.io";
        console.log("✅ Local backend:", window.BACKEND_URL);
    } else {
        // Unknown environment
        window.BACKEND_URL = `${window.location.protocol}//${hostname}`;
        console.log("✅ Backend configured at:", window.BACKEND_URL);
    }
    
    // Update socket URL if socket exists
    if (window.socket && window.socket.io && window.BACKEND_URL) {
        window.socket.io.uri = window.BACKEND_URL;
    }
})();

// UI Functions for Backend Configuration Modal
window.openBackendConfig = function() {
    document.getElementById('backend-overlay').style.display = 'block';
    document.getElementById('backend-config-modal').style.display = 'block';
    
    const currentUrl = window.CUSTOM_BACKEND_URL || window.BACKEND_URL || 'Not configured';
    document.getElementById('current-backend-url').textContent = currentUrl;
    
    if (window.CUSTOM_BACKEND_URL) {
        document.getElementById('backend-url-input').value = window.CUSTOM_BACKEND_URL;
    }
};

window.closeBackendConfig = function() {
    document.getElementById('backend-overlay').style.display = 'none';
    document.getElementById('backend-config-modal').style.display = 'none';
};

window.saveBackendUrl = function() {
    const urlInput = document.getElementById('backend-url-input').value.trim();
    if (urlInput) {
        try {
            new URL(urlInput);
            localStorage.setItem('crackerbot_backend_url', urlInput);
            window.CUSTOM_BACKEND_URL = urlInput;
            window.BACKEND_URL = urlInput;
            console.log('✅ Backend URL saved:', urlInput);
            
            closeBackendConfig();
            
            // Force reconnect with new URL
            if (window.socket) {
                window.socket.disconnect();
            }
            
            setTimeout(() => {
                location.reload();
            }, 500);
            
        } catch (e) {
            alert('Invalid URL! Please enter a valid URL like https://abc123.ngrok.app');
        }
    }
};

// Quick helper for console
window.setBackend = function(url) {
    if (!url) {
        console.error('Please provide a URL');
        return;
    }
    localStorage.setItem('crackerbot_backend_url', url);
    window.CUSTOM_BACKEND_URL = url;
    window.BACKEND_URL = url;
    console.log('Backend URL set to:', url);
    console.log('Reloading page...');
    setTimeout(() => location.reload(), 500);
};