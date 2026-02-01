# Persona Setup Guide

This guide walks you through setting up a new persona for use with Clawdbot.

---

## Table of Contents

1. [Discord Bot Setup](#discord-bot-setup)
2. [API Keys Configuration](#api-keys-configuration)
3. [Channel Configuration](#channel-configuration)
4. [Testing Your Persona](#testing-your-persona)

---

## Discord Bot Setup

Create a bot at the Discord Developer Portal: https://discord.com/developers/applications

### Step 1: Create the Bot Application

1. Click **"New Application"** and give it a name (e.g., `developer-bot`)
2. Go to **"Bot"** section and click **"Add Bot"**
3. **Important Settings:**
   - ❌ Uncheck **"Public Bot"** (keep it private for your server only)
   - ✅ **"Server Members Intent"** (see who talks to the bot)
   - ✅ **"Message Content Intent"** ⭐ **REQUIRED** to read messages and respond
   - ❌ **"Presence Intent"** (not needed for personas)
4. Copy the **Bot Token** — you'll need this!

### Step 2: Invite the Bot to Your Server

Use the Discord Developer Portal's URL generator with these permissions:

**Essential Permissions:**
- ✅ View Channels
- ✅ Send Messages
- ✅ Manage Messages
- ✅ Embed Links
- ✅ Attach Files
- ✅ Read Message History
- ✅ Add Reactions
- ✅ Use Slash Commands
- ✅ Mention Everyone (@bot-to-bot mentions)
- ✅ Manage Threads
- ✅ Create Public Threads
- ✅ Create Private Threads
- ✅ Send Messages in Threads
- ✅ Pin Messages
- ✅ Manage Webhooks

**Optional but Recommended:**
- ✅ Create Polls
- ✅ Bypass Slowmode
- ✅ Send TTS Messages
- ✅ Use External Emojis
- ✅ Use External Stickers

**Voice Permissions (if using voice):**
- ✅ Connect
- ✅ Speak
- ✅ Video
- ✅ Mute Members
- ✅ Deafen Members
- ✅ Move Members
- ✅ Use Voice Activity
- ✅ Priority Speaker
- ✅ Request To Speak

**Server Management (optional, for admin bots):**
- ✅ View Audit Log
- ✅ Manage Server
- ✅ Manage Roles
- ✅ Manage Channels
- ✅ Manage Events
- ✅ Create Events
- ✅ Moderate Members
- ✅ Change Nickname
- ✅ Manage Nicknames
- ✅ Manage Expressions
- ✅ Create Expressions

### Step 3: Get Required IDs

Enable **Developer Mode** in Discord (Settings → Advanced → Developer Mode):

| Item | How to Get |
|------|-----------|
| **Guild ID** | Right-click server name → Copy ID |
| **Channel IDs** | Right-click each channel → Copy ID |
| **User IDs** | Right-click user → Copy ID (for mentions) |

---

## API Keys Configuration

Configure API keys for services your persona needs:

### Common API Keys

| Key Type | Provider | Get Key At |
|----------|----------|------------|
| `openai` | OpenAI (GPT-4) | https://platform.openai.com/api-keys |
| `anthropic` | Anthropic (Claude) | https://console.anthropic.com/ |
| `elevenlabs` | ElevenLabs TTS | https://elevenlabs.io/app/settings/api |
| `huggingface` | Hugging Face | https://huggingface.co/settings/tokens |
| `google` | Google Cloud | https://console.cloud.google.com/ |
| `discord` | Discord Bot Token | https://discord.com/developers/applications |

### Adding Keys

```bash
# Add a specific key type
clawdbot skill run goc-persona --add-key <persona-name> <key-type>

# Example
clawdbot skill run goc-persona --add-key developer openai
clawdbot skill run goc-persona --add-key developer anthropic
clawdbot skill run goc-persona --add-key developer elevenlabs
clawdbot skill run goc-persona --add-key developer discord
```

### Storing Keys Securely

Keys are stored in `~/.clawdbot/persona-registry.json` with timestamps:

```json
{
  "personas": {
    "developer": {
      "status": "needs-setup",
      "keys": {
        "openai": {
          "configured": true,
          "configuredAt": "2024-01-15T10:30:00.000Z"
        }
      }
    }
  }
}
```

**Security Note**: Never commit API keys to version control!

---

## Channel Configuration

Update your persona's `config.yaml` with Discord configuration:

```yaml
# ~/personas/<persona-name>/config.yaml

discord:
  botToken: "YOUR_BOT_TOKEN_HERE"
  guildId: "123456789012345678"
  channels:
    main: "123456789012345679"
    logs: "123456789012345680"
    admin: "123456789012345681"
  settings:
    prefix: "!"
    mentionAsResponse: true
    deleteUserCommands: false
```

### Channel Types

| Channel | Purpose |
|---------|---------|
| **main** | Primary channel for persona interactions |
| **logs** | Audit log for persona actions |
| **admin** | Admin-only commands (optional) |

---

## Testing Your Persona

### 1. Check Persona Status

```bash
clawdbot skill run goc-persona --status <persona-name>
```

Expected output:
```
═══════════════════════════════════════════════════════════
PERSONA: developer
═══════════════════════════════════════════════════════════
Status: needs-setup
Repo: greenclawdbot/goc-persona-developer
Path: /Users/you/personas/developer
Keys: openai, anthropic, elevenlabs, discord
Missing: none
═══════════════════════════════════════════════════════════
```

### 2. List All Personas

```bash
clawdbot skill run goc-persona --list
```

### 3. Test Discord Connection

Once Discord credentials are configured:

1. Invite the bot to your server
2. Type a message in the main channel
3. Check the bot responds appropriately
4. Check logs channel for audit trail

---

## Troubleshooting

### Bot Not Responding?

- ✅ Verify bot token is correct
- ✅ Check bot has proper permissions
- ✅ Ensure bot is online (check Discord)
- ✅ Verify channel IDs are correct
- ✅ Check bot has access to the channel

### API Key Issues?

- ✅ Verify key is valid and not expired
- ✅ Check API usage limits
- ✅ Ensure correct key type is configured
- ✅ Check persona status for missing keys

### Getting Help

- 💬 Discord Support: #help channel
- 🐛 Report Issues: GitHub Issues

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `clawdbot skill run goc-persona --create-persona <name>` | Create new persona |
| `clawdbot skill run goc-persona --setup <name>` | Show setup guide |
| `clawdbot skill run goc-persona --list` | List all personas |
| `clawdbot skill run goc-persona --status <name>` | Check persona status |
| `clawdbot skill run goc-persona --add-key <name> <type>` | Add API key |
| `clawdbot skill run goc-persona --register <name>` | Register existing persona |

---

*Last updated: 2024-01-15*
