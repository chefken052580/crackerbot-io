console.log('[WebSocket] Loading connection via LiteSpeed proxy...');
(function() {
    if (typeof io === 'undefined') {
        console.error('[WebSocket] Socket.io not loaded');
        return;
    }
    
    console.log('[WebSocket] Connecting via proxy...');
    let socket = io('https://crackerbot.io:8443', {
        path: '/socket.io/',
        transports: ['websocket', 'polling']
    });
    
    socket.on('connect', function() {
        console.log('[WebSocket] CONNECTED via proxy:', socket.id);
        window.socket = socket;
        window.isConnected = true;
    });
    
    socket.on('connect_error', function(error) {
        console.error('[WebSocket] CONNECTION ERROR:', error);
    });
    
    window.socket = socket;
})();
