#!/usr/bin/env node

/**
 * Persona Creator Skill
 * Scaffolds new AI personas with folder structure, config, and GitHub repo
 */

const path = require('path');
const fs = require('fs');
const { createPersona } = require('./persona-generator.cjs');
const { createConfig } = require('./config-schema.cjs');
const { initializeRepo } = require('./repo-initializer.cjs');
const registry = require('./persona-registry.cjs');

// Default API keys that personas commonly need
const DEFAULT_KEY_TYPES = ['openai', 'anthropic', 'elevenlabs', 'huggingface'];

/**
 * Display setup guidance after persona creation
 * @param {string} name - Persona name
 * @param {string} githubRepo - GitHub repository URL
 */
function displaySetupGuidance(name, githubRepo) {
  console.log('\n' + '='.repeat(70));
  console.log('📋 SETUP GUIDANCE FOR YOUR NEW PERSONA');
  console.log('='.repeat(70));
  console.log(`\nPersona "${name}" created successfully!`);
  console.log(`GitHub: https://github.com/${githubRepo}`);
  console.log(`\nYour next steps:`);
  console.log(`\n1️⃣  CONFIGURE API KEYS`);
  console.log(`   Run: clawdbot skill run goc-persona --add-key ${name} <key-type>`);
  console.log(`   Common keys: ${DEFAULT_KEY_TYPES.join(', ')}`);
  console.log(`\n2️⃣  DISCORD BOT SETUP (if using Discord)`);
  console.log(`   Create bot at: https://discord.com/developers/applications`);
  console.log(`   You'll need:`);
  console.log(`   - Discord Bot Token`);
  console.log(`   - Channel IDs for persona interaction`);
  console.log(`   - Guild ID (server ID)`);
  console.log(`\n3️⃣  VIEW DETAILED SETUP INSTRUCTIONS`);
  console.log(`   Run: clawdbot skill run goc-persona --setup ${name}`);
  console.log(`\n4️⃣  CHECK PERSONA STATUS`);
  console.log(`   Run: clawdbot skill run goc-persona --status ${name}`);
  console.log('\n' + '='.repeat(70));
}

/**
 * Prompt user for required setup information
 * @param {Object} rl - Readline interface
 * @returns {Promise<Object>} Collected setup info
 */
async function promptForSetupInfo(rl) {
  const info = {
    discordBotToken: '',
    discordChannelIds: [],
    discordGuildId: '',
    apiKeys: []
  };
  
  return new Promise((resolve) => {
    rl.question('\n🤖 Discord Bot Setup (optional, press Enter to skip):\n', (answer) => {
      if (answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes') {
        rl.question('   Bot Token: ', (token) => {
          info.discordBotToken = token.trim();
          rl.question('   Guild ID (server ID): ', (guildId) => {
            info.discordGuildId = guildId.trim();
            rl.question('   Channel IDs (comma-separated): ', (channels) => {
              info.discordChannelIds = channels.split(',').map(c => c.trim()).filter(c => c);
              resolve(info);
            });
          });
        });
      } else {
        resolve(info);
      }
    });
  });
}

module.exports = {
  name: 'goc-persona',
  description: 'Creates and manages AI personas with folder structure, config, and GitHub repo',
  commands: {
    'create-persona': {
      description: 'Create a new AI persona',
      arguments: [
        { name: 'name', required: true, description: 'Persona name (e.g., green-open)' },
        { name: 'model', required: false, default: 'minimax/MiniMax-M2.1', description: 'Default model for the persona' },
        { name: 'description', required: false, default: '', description: 'Persona description' }
      ],
      async run({ name, model, description }) {
        const personaPath = path.join(process.env.HOME || process.env.USERPROFILE, 'personas', name);
        const githubOrg = 'greenclawdbot';
        const githubRepo = `${githubOrg}/goc-persona-${name}`;
        
        console.log(`Creating persona "${name}"...`);
        console.log(`Path: ${personaPath}`);
        console.log(`Model: ${model}`);
        
        // Step 1: Create folder structure and base files
        await createPersona(name, description);
        console.log('✓ Folder structure created');
        
        // Step 2: Generate config.yaml
        await createConfig(name, model);
        console.log('✓ Config generated');
        
        // Step 3: Initialize git and create GitHub repo
        await initializeRepo(personaPath, name, githubOrg);
        console.log('✓ Git repo initialized and pushed to GitHub');
        
        // Step 4: Register the persona
        registry.register(name, githubRepo, personaPath);
        console.log('✓ Persona registered');
        
        // Step 5: Display setup guidance
        displaySetupGuidance(name, githubRepo);
        
        // Optional: Interactive setup prompt
        console.log('\n💡 Want to set up your persona now?');
        console.log('   Run: clawdbot skill run goc-persona --setup ' + name);
      }
    },
    'setup': {
      description: 'Show setup guidance for a persona (Discord, API keys, channels)',
      arguments: [
        { name: 'name', required: true, description: 'Persona name' }
      ],
      async run({ name }) {
        const persona = registry.get(name);
        
        if (!persona) {
          console.error(`Persona "${name}" not found.`);
          console.log('Use --list to see registered personas.');
          return;
        }
        
        console.log('\n' + '═'.repeat(70));
        console.log(`🔧 SETUP GUIDE: ${name}`);
        console.log('═'.repeat(70));
        
        // Read and display setup guide if it exists
        const setupGuidePath = path.join(__dirname, 'setup-guide.md');
        if (fs.existsSync(setupGuidePath)) {
          const setupGuide = fs.readFileSync(setupGuidePath, 'utf8');
          console.log(setupGuide);
        } else {
          console.log(`
## 📖 Discord Bot Setup

Create a bot at the Discord Developer Portal: https://discord.com/developers/applications

1. **Create Bot**
   - Create application → Bot → Add Bot
   - Scroll down to "Privileged Gateway Intents":

| Intent | Enable? | Why |
|--------|---------|-----|
| Server Members Intent | ✅ YES | See who talks to the bot |
| Message Content Intent | ✅ YES ⭐ | REQUIRED to read & respond |
| Presence Intent | ❌ NO | Not needed |

2. **❌ Uncheck "Public Bot"** (keep private)
3. Copy the **Bot Token** (keep it secret!)

4. **Guild ID (Server ID)**
   - Enable Developer Mode in Discord settings
   - Right-click your server → Copy ID

5. **Channel IDs**
   - Enable Developer Mode
   - Right-click target channels → Copy ID
   - Common channels:
     • Persona interaction channel
     • Log/audit channel
     • Admin commands channel (if applicable)

### Required Permissions:

- View Channels, Send Messages, Manage Messages
- Embed Links, Attach Files, Read Message History
- Add Reactions, Use Slash Commands
- Mention Everyone (@bot-to-bot mentions)
- Manage Threads, Create Public/Private Threads
- Send Messages in Threads, Pin Messages
- Use External Emojis, Use External Stickers

### Generate Invite Link:

OAuth2 URL Generator:
- Scope: bot
- Permissions: See discord-permissions.png for required checkboxes

Copy the generated URL and open it to invite.

### API Keys Configuration:

Run these commands to configure API keys:
`);
          
          DEFAULT_KEY_TYPES.forEach(keyType => {
            console.log(`  clawdbot skill run goc-persona --add-key ${name} ${keyType}`);
          });
          
          console.log(`

### Next Steps:

1. Copy your bot token and run:
   clawdbot skill run goc-persona --add-key ${name} discord

2. Create/update ~/personas/${name}/config.yaml with channel/guild IDs

3. Invite your bot to the server with proper permissions

4. Test with: clawdbot skill run goc-persona --status ${name}
`);
        }
        
        console.log('═'.repeat(70) + '\n');
      }
    },
    'list': {
      description: 'List all registered personas',
      arguments: [],
      async run() {
        const personas = registry.list();
        
        if (personas.length === 0) {
          console.log('No personas registered yet.');
          console.log('Create one with: clawdbot skill run goc-persona --name <name>');
          return;
        }
        
        console.log('='.repeat(70));
        console.log('REGISTERED PERSONAS');
        console.log('='.repeat(70));
        
        personas.forEach(p => {
          const statusIcon = p.status === 'ready' ? '✅' : 
                            p.status === 'needs-setup' ? '⚠️' : 
                            p.status === 'error' ? '❌' : '📋';
          
          console.log(`\n${statusIcon} ${p.name}`);
          console.log(`   Status: ${p.status}`);
          console.log(`   Repo: ${p.repo}`);
          console.log(`   Keys: ${p.keysConfigured.length > 0 ? p.keysConfigured.join(', ') : 'none'}`);
          if (p.missingKeys.length > 0) {
            console.log(`   Missing: ${p.missingKeys.join(', ')}`);
          }
        });
        
        console.log('\n' + '='.repeat(70));
        console.log(`Total: ${personas.length} persona(s)`);
      }
    },
    'status': {
      description: 'Show status and configured keys for a persona',
      arguments: [
        { name: 'name', required: true, description: 'Persona name' }
      ],
      async run({ name }) {
        const persona = registry.get(name);
        
        if (!persona) {
          console.error(`Persona "${name}" not found.`);
          console.log('Use --list to see registered personas.');
          return;
        }
        
        console.log('='.repeat(70));
        console.log(`PERSONA: ${name}`);
        console.log('='.repeat(70));
        console.log(`Status: ${persona.status}`);
        console.log(`Repo: ${persona.repo}`);
        console.log(`Path: ${persona.path}`);
        console.log(`Created: ${persona.createdAt}`);
        console.log(`Last Updated: ${persona.lastUpdated}`);
        
        console.log('\n--- Keys & Configuration ---');
        const keys = registry.getKeys(name);
        if (keys.length === 0) {
          console.log('No keys configured yet.');
        } else {
          keys.forEach(key => {
            const keyData = persona.keys[key];
            console.log(`  ✅ ${key} (configured: ${keyData?.configuredAt})`);
          });
        }
        
        console.log('\n--- Missing Keys ---');
        if (persona.missingKeys.length === 0) {
          console.log('  All common keys configured! ✅');
        } else {
          console.log(`  ${persona.missingKeys.join(', ')}`);
        }
        
        console.log('\n--- Readiness ---');
        console.log(`  Status: ${persona.isReady ? '✅ Ready' : '⚠️ Needs Setup'}`);
        
        console.log('\n' + '='.repeat(70));
      }
    },
    'register': {
      description: 'Manually register an existing persona folder',
      arguments: [
        { name: 'name', required: true, description: 'Persona name' },
        { name: 'repo', required: false, description: 'GitHub repo (org/repo format)' },
        { name: 'path', required: false, description: 'Local path to persona' }
      ],
      async run({ name, repo, path: personaPath }) {
        const basePath = process.env.HOME || process.env.USERPROFILE;
        const resolvedPath = personaPath || path.join(basePath, 'personas', name);
        const resolvedRepo = repo || `greenclawdbot/goc-persona-${name}`;
        
        // Check if path exists
        if (!require('fs').existsSync(resolvedPath)) {
          console.error(`Persona path does not exist: ${resolvedPath}`);
          return;
        }
        
        registry.register(name, resolvedRepo, resolvedPath);
        console.log(`\n✅ Persona "${name}" registered successfully!`);
        
        const persona = registry.get(name);
        console.log(`   Status: ${persona.status}`);
        console.log(`   Keys: ${persona.keysConfigured.join(', ') || 'none'}`);
        console.log(`   Missing: ${persona.missingKeys.join(', ') || 'none'}`);
      }
    },
    'add-key': {
      description: 'Mark a key as configured for a persona',
      arguments: [
        { name: 'name', required: true, description: 'Persona name' },
        { name: 'keyType', required: true, description: 'Key type (e.g., openai, anthropic, elevenlabs)' }
      ],
      async run({ name, keyType }) {
        const persona = registry.get(name);
        
        if (!persona) {
          console.error(`Persona "${name}" not found.`);
          return;
        }
        
        registry.addKey(name, keyType);
        console.log(`Added key "${keyType}" to persona "${name}"`);
        
        // Check if all keys are now configured
        const updatedPersona = registry.get(name);
        if (updatedPersona.missingKeys.length === 0 && updatedPersona.status !== 'ready') {
          registry.updateStatus(name, 'ready');
          console.log(`🎉 All keys configured! Status updated to "ready"`);
        }
      }
    },
    'update-status': {
      description: 'Update the status of a persona',
      arguments: [
        { name: 'name', required: true, description: 'Persona name' },
        { name: 'status', required: true, description: 'New status (ready, needs-setup, error)' }
      ],
      async run({ name, status }) {
        const result = registry.updateStatus(name, status);
        if (result) {
          console.log(`Updated status for "${name}" to "${status}"`);
        }
      }
    },
    'unregister': {
      description: 'Remove a persona from the registry',
      arguments: [
        { name: 'name', required: true, description: 'Persona name' }
      ],
      async run({ name }) {
        const result = registry.unregister(name);
        if (result) {
          console.log(`Unregistered persona "${name}"`);
        }
      }
    }
  }
};
