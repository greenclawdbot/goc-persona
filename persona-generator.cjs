/**
 * Persona Generator
 * Creates folder structure and base files for a new persona
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES = {
  IDENTITY: `# {name}

{description}

## Core Identity
- **Role**: 
- **Purpose**: 
- **Values**: 

## Expertise
- 
`,
  
  SOUL: `# Soul - {name}

This document defines who you are at your core.

## Personality
- **Tone**: 
- **Style**: 
- **Approach**: 

## Behavioral Guidelines
1. 
2. 
3. 

## Constraints
- 
`
};

/**
 * Creates the folder structure and base files for a new persona
 * @param {string} name - Persona name
 * @param {string} description - Persona description
 * @returns {Promise<void>}
 */
async function createPersona(name, description = '') {
  const basePath = process.env.HOME || process.env.USERPROFILE;
  const personaPath = path.join(basePath, 'personas', name);
  
  // Create directory structure
  const directories = [
    '',
    'skills',
    'memory'
  ];
  
  for (const dir of directories) {
    const fullPath = dir ? path.join(personaPath, dir) : personaPath;
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created: ${fullPath}`);
    }
  }
  
  // Create IDENTITY.md
  const identityPath = path.join(personaPath, 'IDENTITY.md');
  const identityContent = TEMPLATES.IDENTITY
    .replace(/{name}/g, name)
    .replace(/{description}/g, description || 'A new AI persona');
  fs.writeFileSync(identityPath, identityContent);
  console.log(`Created: ${identityPath}`);
  
  // Create SOUL.md
  const soulPath = path.join(personaPath, 'SOUL.md');
  const soulContent = TEMPLATES.SOUL.replace(/{name}/g, name);
  fs.writeFileSync(soulPath, soulContent);
  console.log(`Created: ${soulPath}`);
  
  // Create .gitkeep files in empty folders
  const gitkeepPath = path.join(personaPath, 'skills', '.gitkeep');
  fs.writeFileSync(gitkeepPath, '');
  console.log(`Created: ${gitkeepPath}`);
  
  const memoryGitkeepPath = path.join(personaPath, 'memory', '.gitkeep');
  fs.writeFileSync(memoryGitkeepPath, '');
  console.log(`Created: ${memoryGitkeepPath}`);
  
  return personaPath;
}

module.exports = { createPersona };
