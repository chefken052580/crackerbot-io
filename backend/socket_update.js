// Add this before the server start in app.js

// Enhanced Socket.IO connection handler  
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle user name requests
    socket.on('get_user', async (data) => {
        try {
            let userData = null;
            if (redis) {
                userData = await redis.hgetall(`user:${data.userId}`);
            }
            socket.emit('user_data', { userData });
        } catch (error) {
            console.error('Get user error:', error);
            socket.emit('user_error', { message: 'Failed to get user data' });
        }
    });

    // Handle user save requests
    socket.on('save_user', async (data) => {
        try {
            if (redis) {
                await redis.hset(`user:${data.userId}`, data);
            }
            socket.emit('user_saved', { success: true });
        } catch (error) {
            console.error('Save user error:', error);
            socket.emit('user_error', { message: 'Failed to save user data' });
        }
    });

    // Handle message requests
    socket.on('message', async (data) => {
        try {
            if (aiHandlers) {
                const response = await aiHandlers.handleMessage(data, socket);
                socket.emit('response', response);
            } else {
                socket.emit('response', { message: 'AI handlers not available' });
            }
        } catch (error) {
            console.error('Message handling error:', error);
            socket.emit('error', { message: 'Failed to process message' });
        }
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
