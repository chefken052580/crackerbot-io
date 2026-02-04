// Global Socket.io initialization
console.log('Initializing Socket.io connection...');

// Backend URL for dev system
const BACKEND_URL = "https://crackerbot.io:8443";

// Initialize socket globally
if (typeof io !== 'undefined') {
    window.socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
    });
    
    window.socket.on('connect', () => {
        console.log('✅ Socket.io connected!');
        console.log('Socket ID:', window.socket.id);
        console.log('Backend:', BACKEND_URL);
        
        // Update UI if function exists
        if (typeof window.addMessage === 'function') {
            window.addMessage('System', '✅ Connected to AI Backend', 'system');
        }
    });
    
    window.socket.on('disconnect', (reason) => {
        console.log('❌ Socket.io disconnected:', reason);
        if (typeof window.addMessage === 'function') {
            window.addMessage('System', '❌ Disconnected: ' + reason, 'system');
        }
    });
    
    window.socket.on('error', (error) => {
        console.error('Socket.io error:', error);
    });
    
    // REMOVED: project_generated listener now handled by crackerbot-main.js (single source of truth)
    
    window.socket.on('code_modified', (data) => {
        console.log('✏️ Code modified:', data);
        if (window.handleCodeModified) {
            window.handleCodeModified(data);
        }
    });
    
} else {
    console.error('❌ Socket.io library not loaded!');
}
