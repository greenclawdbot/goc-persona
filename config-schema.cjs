/**
 * Config Schema Generator
 * Generates config.yaml for personas with model, skills, and settings
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = `# Persona Configuration for {name}

# Default model for this persona
defaultModel: {model}

# Skills available to this persona (add skill names here)
skills: []

# Personality settings
personality:
  tone: neutral
  verbosity: medium
  creativity: 0.7

# Memory settings
memory:
  enabled: true
  maxEntries: 100

# Model-specific settings
modelSettings:
  temperature: 0.7
  maxTokens: 4096
`;

/**
 * Generates the config.yaml file for a persona
 * @param {string} name - Persona name
 * @param {string} model - Default model
 * @returns {Promise<void>}
 */
async function createConfig(name, model = 'minimax/MiniMax-M2.1') {
  const basePath = process.env.HOME || process.env.USERPROFILE;
  const configPath = path.join(basePath, 'personas', name, 'config.yaml');
  
  const configContent = DEFAULT_CONFIG
    .replace(/{name}/g, name)
    .replace(/{model}/g, model);
  
  fs.writeFileSync(configPath, configContent);
  console.log(`Created: ${configPath}`);
  
  return configPath;
}

module.exports = { createConfig };
