// Check Backend Connection
setTimeout(() => {
    console.log('[Backend Check] Current backend URL:', window.BACKEND_URL);
    console.log('[Backend Check] Socket connected:', !!window.socket?.connected);
    console.log('[Backend Check] Socket ID:', window.socket?.id);
    
    if (window.socket) {
        // Test backend connectivity
        window.socket.emit('test_connection', { test: true });
        
        window.socket.on('test_response', (data) => {
            console.log('[Backend Check] Backend responded:', data);
        });
    }
}, 2000);
