// bot_backend/src/socket.js
// Clean version - No external websocket connections
/**
 * Socket Module - Provides socket reference for AI helper
 * Simplified to work with the main app's socket.io server only
 */

import { log, error, debug } from './logger.js';

/**
 * Socket.IO client instance - Set by main app
 * @type {Object|null}
 */
export let botSocket = null;

/**
 * Sets the bot socket instance (called by main app)
 * @param {Object} socket - Socket.io instance from main app
 */
export function setBotSocket(socket) {
    botSocket = socket;
    log('Bot socket reference set for AI helper');
}

/**
 * Emits an event with error handling
 * @async
 * @param {string} event - Event name
 * @param {Object} data - Event data
 * @returns {Promise<void>}
 */
export async function emit(event, data) {
    try {
        if (!botSocket) {
            await debug(`No socket available to emit ${event}`);
            return;
        }
        
        if (!botSocket.connected) {
            await debug(`Socket not connected, cannot emit ${event}`);
            return;
        }
        
        await debug(`Emitting ${event} with data: ${JSON.stringify(data).slice(0, 100)}...`);
        botSocket.emit(event, data);
        await log(`Emitted ${event} successfully`);
    } catch (err) {
        await error(`Failed to emit ${event}: ${err.message}`);
    }
}

/**
 * Resolved promise that provides the socket (for compatibility)
 * Now just returns the current botSocket reference
 */
export const botSocketPromise = Promise.resolve(null);

// Initialize logging
(async () => {
    try {
        await log('🌌 bot_backend socket.js v2025-09-08 initialized (local mode)');
        await log('🌌 Socket module ready - using main app socket references');
    } catch (err) {
        await error(`Socket module initialization failed: ${err.message}`);
    }
})();

// Export all functions for compatibility
export default {
    botSocket,
    setBotSocket,
    emit,
    botSocketPromise
};