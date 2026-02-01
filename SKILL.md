# Persona Creator Skill

Scaffolds new AI personas with folder structure, config, and GitHub repo.

## Usage

```bash
clawdbot skill run goc-persona --name <persona-name> [--model <model>] [--description <desc>]
```

## Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| `name` | Yes | - | Persona name (e.g., `green-open`) |
| `model` | No | `minimax/MiniMax-M2.1` | Default model for the persona |
| `description` | No | `""` | Persona description |

## Examples

```bash
# Create a basic persona with default model
clawdbot skill run goc-persona --name green-open

# Create a persona with a specific model
clawdbot skill run goc-persona --name green-open --model gpt-4

# Create a persona with description
clawdbot skill run goc-persona --name my-persona --description "A helpful coding assistant"
```

## What It Creates

For a persona named `green-open`, the skill creates:

```
~/personas/green-open/
├── .gitkeep          # Keeps skills/ folder in git
├── IDENTITY.md       # Persona identity document
├── SOUL.md           # Persona soul/personality document
├── config.yaml       # Persona configuration
├── memory/
│   └── .gitkeep      # Keeps memory/ folder in git
└── skills/
    └── .gitkeep      # Place skills here
```

## Generated Files

### config.yaml

```yaml
# Persona Configuration for green-open

defaultModel: minimax/MiniMax-M2.1

# Skills available to this persona
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
```

### IDENTITY.md

Template for documenting the persona's core identity, role, purpose, and expertise.

### SOUL.md

Template for defining the persona's personality, behavioral guidelines, and constraints.

## GitHub Integration

The skill automatically:

1. Initializes a git repository
2. Creates a public GitHub repository under `greenclawdbot` organization
3. Commits all scaffolded files
4. Pushes to GitHub

Repository URL: `https://github.com/greenclawdbot/{persona-name}`

## After Creation

1. Edit `IDENTITY.md` with the persona's identity
2. Edit `SOUL.md` with the persona's personality
3. Customize `config.yaml` as needed
4. Add skills to the `skills/` folder
5. The persona is ready to use!
