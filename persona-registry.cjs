/**
 * Persona Registry
 * Manages ~/.clawdbot/persona-registry.json for tracking all registered personas
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.clawdbot', 'persona-registry.json');

/**
 * Initialize registry file if it doesn't exist
 */
function _ensureRegistry() {
  const dir = path.dirname(REGISTRY_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(REGISTRY_PATH)) {
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify({ personas: {}, lastUpdated: null }, null, 2));
  }
}

/**
 * Read the registry
 * @returns {Object} Registry data
 */
function _readRegistry() {
  _ensureRegistry();
  try {
    const content = fs.readFileSync(REGISTRY_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return { personas: {}, lastUpdated: null };
  }
}

/**
 * Write to the registry
 * @param {Object} data - Registry data to write
 */
function _writeRegistry(data) {
  _ensureRegistry();
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2));
}

/**
 * List all registered personas with their status
 * @returns {Array} Array of persona summaries
 */
function list() {
  const registry = _readRegistry();
  return Object.entries(registry.personas).map(([name, data]) => ({
    name,
    status: data.status,
    repo: data.repo,
    path: data.path,
    keysConfigured: Object.keys(data.keys || {}),
    missingKeys: _getMissingKeys(data.keys || {}),
    createdAt: data.createdAt,
    lastUpdated: data.lastUpdated
  }));
}

/**
 * Get details for a specific persona
 * @param {string} name - Persona name
 * @returns {Object|null} Persona details or null if not found
 */
function get(name) {
  const registry = _readRegistry();
  const persona = registry.personas[name];
  
  if (!persona) {
    return null;
  }
  
  return {
    name,
    ...persona,
    keysConfigured: Object.keys(persona.keys || {}),
    missingKeys: _getMissingKeys(persona.keys || {}),
    isReady: _isPersonaReady(persona)
  };
}

/**
 * Register a new persona
 * @param {string} name - Persona name
 * @param {string} repo - GitHub repo (org/repo format)
 * @param {string} path - Local path to persona
 * @returns {Object} Registered persona data
 */
function register(name, repo, path) {
  const registry = _readRegistry();
  
  if (registry.personas[name]) {
    console.log(`Persona "${name}" already registered, updating...`);
  }
  
  registry.personas[name] = {
    status: 'needs-setup',
    repo,
    path,
    keys: {},
    createdAt: registry.personas[name]?.createdAt || new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
  
  _writeRegistry(registry);
  
  console.log(`Registered persona: ${name}`);
  return registry.personas[name];
}

/**
 * Update the status of a persona
 * @param {string} name - Persona name
 * @param {string} status - New status (ready, needs-setup, error, etc.)
 * @returns {boolean} Success
 */
function updateStatus(name, status) {
  const registry = _readRegistry();
  
  if (!registry.personas[name]) {
    console.error(`Persona "${name}" not found in registry`);
    return false;
  }
  
  registry.personas[name].status = status;
  registry.personas[name].lastUpdated = new Date().toISOString();
  
  _writeRegistry(registry);
  console.log(`Updated status for "${name}": ${status}`);
  return true;
}

/**
 * Mark a key as configured for a persona
 * @param {string} name - Persona name
 * @param {string} keyType - Key type (e.g., 'openai', 'anthropic', 'elevenlabs')
 * @returns {boolean} Success
 */
function addKey(name, keyType) {
  const registry = _readRegistry();
  
  if (!registry.personas[name]) {
    console.error(`Persona "${name}" not found in registry`);
    return false;
  }
  
  if (!registry.personas[name].keys) {
    registry.personas[name].keys = {};
  }
  
  registry.personas[name].keys[keyType] = {
    configured: true,
    configuredAt: new Date().toISOString()
  };
  registry.personas[name].lastUpdated = new Date().toISOString();
  
  _writeRegistry(registry);
  console.log(`Added key "${keyType}" to persona "${name}"`);
  return true;
}

/**
 * Remove a key from a persona
 * @param {string} name - Persona name
 * @param {string} keyType - Key type to remove
 * @returns {boolean} Success
 */
function removeKey(name, keyType) {
  const registry = _readRegistry();
  
  if (!registry.personas[name] || !registry.personas[name].keys) {
    return false;
  }
  
  delete registry.personas[name].keys[keyType];
  registry.personas[name].lastUpdated = new Date().toISOString();
  _writeRegistry(registry);
  return true;
}

/**
 * Unregister a persona
 * @param {string} name - Persona name
 * @returns {boolean} Success
 */
function unregister(name) {
  const registry = _readRegistry();
  
  if (!registry.personas[name]) {
    console.error(`Persona "${name}" not found in registry`);
    return false;
  }
  
  delete registry.personas[name];
  _writeRegistry(registry);
  console.log(`Unregistered persona: ${name}`);
  return true;
}

/**
 * Get all configured keys for a persona
 * @param {string} name - Persona name
 * @returns {Array} Array of configured key types
 */
function getKeys(name) {
  const persona = get(name);
  return persona ? Object.keys(persona.keys || {}) : [];
}

// Common key types that personas might need
const COMMON_KEYS = [
  'openai',
  'anthropic',
  'google',
  'elevenlabs',
  'huggingface',
  'replicate',
  'stability',
  'midjourney',
  'custom'
];

/**
 * Get list of missing keys based on common key types
 * @param {Object} configuredKeys - Currently configured keys
 * @returns {Array} Array of missing key types
 */
function _getMissingKeys(configuredKeys) {
  // Return keys that are NOT configured
  return COMMON_KEYS.filter(key => !configuredKeys[key]);
}

/**
 * Check if a persona is ready (has at least one key configured)
 * @param {Object} persona - Persona data
 * @returns {boolean}
 */
function _isPersonaReady(persona) {
  const configuredKeys = Object.keys(persona.keys || {});
  return configuredKeys.length > 0 && persona.status !== 'error';
}

/**
 * Get common key types
 * @returns {Array}
 */
function getCommonKeyTypes() {
  return [...COMMON_KEYS];
}

module.exports = {
  list,
  get,
  register,
  updateStatus,
  addKey,
  removeKey,
  unregister,
  getKeys,
  getCommonKeyTypes,
  REGISTRY_PATH
};
