// bot_backend/src/logger.js
// Fixed version - Cosmic logging with reliable startup
/**
 * CrackerBot's Cosmic Log Forge
 * Simplified for reliable startup while maintaining cosmic swagger
 */

import fs from 'fs/promises';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';
import { createWriteStream } from 'fs';
import { createClient } from 'redis';

const logDir = process.env.LOG_DIR || './logs';
const dateStr = new Date().toISOString().split('T')[0];
const logFile = path.join(logDir, `bot_backend_${dateStr}.log`);
const maxLogSize = 10 * 1024 * 1024; // 10MB
const maxBufferSize = 100; // Added missing variable

// Ensure log directory exists
if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
}

let logStream = createWriteStream(logFile, { flags: 'a' });
let logSize = 0;
let logBuffer = [];
const flushInterval = 5000; // Flush every 5s

// Redis client (no auto-connection - connect only when needed)
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  // Silenced Redis logging errors to prevent startup issues
});

// REMOVED problematic auto-connection code that caused syntax error

/**
 * Rotates log file if size exceeds limit with supernova precision.
 * @returns {Promise<void>}
 */
async function rotateLog() {
  try {
    const stats = await fs.stat(logFile);
    if (stats.size + logSize >= maxLogSize) {
      logStream.end();
      const archiveFile = path.join(logDir, `bot_backend_${dateStr}_${Date.now()}.log`);
      await fs.rename(logFile, archiveFile);
      logStream = createWriteStream(logFile, { flags: 'a' });
      logSize = 0;
      console.log(`🌌 Log supernova-rotated to ${archiveFile}`);
    }
  } catch (err) {
    console.error(`💥 Critical supernova error rotating log: ${err.message}`);
  }
}

/**
 * Flushes log buffer to file and stdout with cosmic efficiency.
 * @returns {Promise<void>}
 */
async function flushBuffer() {
  if (logBuffer.length === 0) return;
  const messages = logBuffer.join('');
  logBuffer = [];
  try {
    await rotateLog();
    logStream.write(messages);
    process.stdout.write(messages);
    logSize += Buffer.byteLength(messages);
  } catch (err) {
    console.error(`💥 Critical supernova error flushing log buffer: ${err.message}`);
  }
}

setInterval(flushBuffer, flushInterval);

/**
 * Logs a message with cosmic flair
 * @param {string} message - Message to log
 * @param {string} [level='INFO'] - Log level (INFO, ERROR, WARN, DEBUG)
 * @param {Object} [options] - Optional metadata
 * @returns {Promise<void>}
 */
export async function log(message, level = 'INFO', options = {}) {
  const {
    taskId,
    frontendId,
    ip,
    taskName,
    taskType,
    progress,
    fileCount,
    contentSize,
    jsonContent,
  } = options;
  
  const flair = {
    INFO: '🌟',
    ERROR: '💥',
    WARN: '⚠️',
    DEBUG: '🔍',
  }[level] || '🌟';
  
  const metadata = [
    taskId ? ` [Task: ${taskId}]` : '',
    taskName ? ` [Name: ${taskName}]` : '',
    taskType ? ` [Type: ${taskType}]` : '',
    progress !== undefined ? ` [Progress: ${progress}%]` : '',
    fileCount !== undefined ? ` [Files: ${fileCount}]` : '',
    contentSize !== undefined ? ` [Size: ${contentSize} bytes]` : '',
    jsonContent ? ` [JSON: ${Object.keys(jsonContent.files || {}).length} files]` : '',
  ].join('');
  
  const logMessage = `[${new Date().toISOString()}] ${level} ${flair}: ${message}${metadata}\n`;
  logBuffer.push(logMessage);

  const consoleMessage = `${flair} ${logMessage.trim()}`;
  if (level === 'ERROR') {
    console.error(consoleMessage);
  } else if (level === 'WARN') {
    console.warn(consoleMessage);
  } else {
    console.log(consoleMessage);
  }

  // Try Redis storage (non-blocking)
  try {
    if (redisClient.isReady) {
      await redisClient.lPush(`logs:${taskId || 'general'}`, logMessage);
      await redisClient.lTrim(`logs:${taskId || 'general'}`, 0, 99);
    }
  } catch (err) {
    // Silent fail - don't break logging if Redis unavailable
  }

  if (logBuffer.length >= maxBufferSize) await flushBuffer();
}

/**
 * Logs an error message with stack trace
 * @param {string} message - Error message
 * @param {Object} [options] - Optional metadata
 * @returns {Promise<void>}
 */
export async function error(message, options = {}) {
  const err = new Error(message);
  const stackMessage = `${message}\n${err.stack}`;
  await log(stackMessage, 'ERROR', options);
}

/**
 * Logs a warning message
 * @param {string} message - Warning message
 * @param {Object} [options] - Optional metadata
 * @returns {Promise<void>}
 */
export async function warn(message, options = {}) {
  await log(message, 'WARN', options);
}

/**
 * Logs a debug message
 * @param {string} message - Debug message
 * @param {Object} [options] - Optional metadata
 * @returns {Promise<void>}
 */
export async function debug(message, options = {}) {
  await log(message, 'DEBUG', options);
}

/**
 * Debug logging function (alias for compatibility)
 * @param {string} section - Log section
 * @param {string} message - Debug message
 * @param {Object} [data] - Optional data object
 * @returns {Promise<void>}
 */
export async function logDebug(section, message, data = null) {
  const fullMessage = data ? `[${section}] ${message}` : `[${section}] ${message}`;
  const options = data ? { jsonContent: data } : {};
  await debug(fullMessage, options);
}

// Cleanup on exit
process.on('beforeExit', async () => {
  await flushBuffer();
  logStream.end();
  try {
    if (redisClient.isReady) {
      await redisClient.quit();
    }
  } catch (err) {
    // Silent fail on cleanup
  }
});