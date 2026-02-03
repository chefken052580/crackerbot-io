// bot_backend/src/redisClient.js
// Clean version - No syntax errors, no circular dependencies
/**
 * Redis Client Module
 * Simple Redis connection for CrackerBot backend
 */

import { createClient } from 'redis';

const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || 'crackerbot';
const REDIS_DB = process.env.REDIS_DB || 0;

const redisClient = createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}/${REDIS_DB}`,
  password: REDIS_PASSWORD,
});

// Simple error handling without circular imports
redisClient.on('error', (err) => {
  console.error(`Redis client error: ${err.message}`);
});

redisClient.on('connect', () => {
  console.log('Redis connection established');
});

/**
 * Validates JSON string.
 * @param {string} str - String to validate
 * @returns {boolean} True if valid JSON
 */
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sets a key-value pair in Redis with JSON consistency.
 * @async
 * @param {string} key - Redis key
 * @param {any} value - Value to store (stringified as JSON)
 * @param {number} [ttl] - Time-to-live in seconds (optional)
 * @returns {Promise<void>}
 */
async function set(key, value, ttl) {
  try {
    const jsonValue = JSON.stringify(value);
    if (ttl) {
      await redisClient.setEx(key, ttl, jsonValue);
      console.log(`Set key ${key} with TTL ${ttl}s`);
    } else {
      await redisClient.set(key, jsonValue);
      console.log(`Set key ${key}`);
    }
  } catch (err) {
    console.error(`Failed to set ${key}: ${err.message}`);
    throw err;
  }
}

/**
 * Gets a value from Redis, parsing it as JSON.
 * @async
 * @param {string} key - Redis key
 * @returns {Promise<any|null>} Parsed value or null if not found
 */
async function get(key) {
  try {
    const value = await redisClient.get(key);
    return value && isValidJSON(value) ? JSON.parse(value) : null;
  } catch (err) {
    console.error(`Failed to get ${key}: ${err.message}`);
    return null;
  }
}

/**
 * Retrieves all keys matching a pattern from Redis.
 * @async
 * @param {string} pattern - Key pattern
 * @returns {Promise<string[]>} Array of matching keys
 */
async function keys(pattern) {
  try {
    const matchingKeys = await redisClient.keys(pattern);
    console.log(`Fetched ${matchingKeys.length} keys matching pattern ${pattern}`);
    return matchingKeys;
  } catch (err) {
    console.error(`Failed to fetch keys for pattern ${pattern}: ${err.message}`);
    return [];
  }
}

/**
 * Deletes a key from Redis.
 * @async
 * @param {string|string[]} key - Redis key or array of keys
 * @returns {Promise<void>}
 */
async function del(key) {
  try {
    await redisClient.del(key);
    console.log(`Deleted key(s) ${Array.isArray(key) ? key.join(', ') : key}`);
  } catch (err) {
    console.error(`Failed to delete ${Array.isArray(key) ? key.join(', ') : key}: ${err.message}`);
    throw err;
  }
}

/**
 * Sets a field in a Redis hash.
 * @async
 * @param {string} hashKey - Hash key
 * @param {string} field - Field name
 * @param {any} value - Value to store (stringified)
 * @returns {Promise<void>}
 */
async function hSet(hashKey, field, value) {
  try {
    await redisClient.hSet(hashKey, field, JSON.stringify(value));
    console.log(`Set hash ${hashKey} field ${field}`);
  } catch (err) {
    console.error(`Failed to set hash ${hashKey} field ${field}: ${err.message}`);
    throw err;
  }
}

/**
 * Gets a field from a Redis hash.
 * @async
 * @param {string} hashKey - Hash key
 * @param {string} field - Field name
 * @returns {Promise<any|null>} Parsed value or null if not found
 */
async function hGet(hashKey, field) {
  try {
    const value = await redisClient.hGet(hashKey, field);
    return value && isValidJSON(value) ? JSON.parse(value) : null;
  } catch (err) {
    console.error(`Failed to get hash ${hashKey} field ${field}: ${err.message}`);
    return null;
  }
}

/**
 * Gets all fields from a Redis hash.
 * @async
 * @param {string} hashKey - Hash key
 * @returns {Promise<Object>} Object of field-value pairs
 */
async function hGetAll(hashKey) {
  try {
    const values = await redisClient.hGetAll(hashKey);
    const parsed = {};
    for (const [field, value] of Object.entries(values)) {
      if (isValidJSON(value)) {
        parsed[field] = JSON.parse(value);
      } else {
        await redisClient.hDel(hashKey, field);
        console.log(`Cleared corrupted hash ${hashKey} field ${field}`);
      }
    }
    console.log(`Fetched hash ${hashKey} with ${Object.keys(parsed).length} fields`);
    return parsed;
  } catch (err) {
    console.error(`Failed to fetch hash ${hashKey}: ${err.message}`);
    return {};
  }
}

/**
 * Deletes a field from a Redis hash.
 * @async
 * @param {string} hashKey - Hash key
 * @param {string} field - Field name
 * @returns {Promise<void>}
 */
async function hDel(hashKey, field) {
  try {
    await redisClient.hDel(hashKey, field);
    console.log(`Deleted hash ${hashKey} field ${field}`);
  } catch (err) {
    console.error(`Failed to delete hash ${hashKey} field ${field}: ${err.message}`);
    throw err;
  }
}

/**
 * Adds a value to a Redis set.
 * @async
 * @param {string} setKey - Set key
 * @param {string} value - Value to add
 * @returns {Promise<void>}
 */
async function sAdd(setKey, value) {
  try {
    await redisClient.sAdd(setKey, value);
    console.log(`Added ${value} to set ${setKey}`);
  } catch (err) {
    console.error(`Failed to add ${value} to set ${setKey}: ${err.message}`);
    throw err;
  }
}

/**
 * Retrieves all members of a Redis set.
 * @async
 * @param {string} setKey - Set key
 * @returns {Promise<string[]>} Array of set members
 */
async function sMembers(setKey) {
  try {
    const members = await redisClient.sMembers(setKey);
    console.log(`Fetched ${members.length} members from set ${setKey}`);
    return members;
  } catch (err) {
    console.error(`Failed to fetch members of set ${setKey}: ${err.message}`);
    return [];
  }
}

// Export all functions
export { 
  redisClient, 
  isValidJSON, 
  set, 
  get, 
  keys, 
  del, 
  hSet, 
  hGet, 
  hGetAll, 
  hDel, 
  sAdd, 
  sMembers 
};

// Default export for compatibility
export default redisClient;