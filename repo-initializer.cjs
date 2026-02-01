/**
 * Repository Initializer
 * Handles git initialization and GitHub repo creation
 */

const { execSync } = require('child_process');
const path = require('path');
const registry = require('./persona-registry.cjs');

/**
 * Initializes git repo and creates GitHub repo under the organization
 * @param {string} localPath - Local path to the persona directory
 * @param {string} repoName - Repository name (e.g., goc-persona-green-open)
 * @param {string} orgName - GitHub organization name
 * @returns {Promise<{success: boolean, repo: string}>}
 */
async function initializeRepo(localPath, repoName, orgName = 'greenclawdbot') {
  const cwd = process.cwd();
  let repoUrl = null;
  
  // Extract persona name from repo name (e.g., "goc-persona-green-open" -> "green-open")
  const personaName = repoName.replace(/^goc-persona-/, '');
  
  try {
    // Change to persona directory
    process.chdir(localPath);
    
    // Initialize git if not already initialized
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
      console.log('Git repo already initialized');
    } catch {
      execSync('git init', { stdio: 'inherit' });
      execSync('git branch -M main', { stdio: 'inherit' });
      console.log('Git initialized');
    }
    
    // Configure git user if not set
    try {
      execSync('git config user.name', { stdio: 'ignore' });
    } catch {
      execSync('git config user.name "Clawdbot"', { stdio: 'inherit' });
      execSync('git config user.email "bot@greenclaw.dev"', { stdio: 'inherit' });
    }
    
    // Stage all files
    execSync('git add .', { stdio: 'inherit' });
    
    // Create initial commit
    try {
      execSync('git commit -m "Initial commit: scaffold persona"', { stdio: 'inherit' });
    } catch {
      console.log('No changes to commit');
    }
    
    // Create GitHub repo using gh CLI or direct API
    const githubRepo = `${orgName}/${repoName}`;
    console.log(`Creating GitHub repo: ${githubRepo}`);
    
    try {
      // Try using gh CLI first
      execSync(`gh repo create ${githubRepo} --public --source=. --push`, { 
        stdio: 'inherit',
        timeout: 30000
      });
      repoUrl = `https://github.com/${githubRepo}`;
    } catch (ghError) {
      // Fallback: create remote and push manually
      console.log('Using alternative method for repo creation...');
      
      // Add remote
      try {
        execSync('git remote get-url origin', { stdio: 'ignore' });
      } catch {
        const remoteUrl = `https://github.com/${githubRepo}.git`;
        execSync(`git remote add origin ${remoteUrl}`, { stdio: 'inherit' });
        repoUrl = `https://github.com/${githubRepo}`;
      }
      
      // Push to GitHub
      execSync('git push -u origin main', { stdio: 'inherit', timeout: 30000 });
    }
    
    // Auto-register the persona after successful GitHub push
    console.log('Auto-registering persona...');
    registry.register(personaName, githubRepo, localPath);
    console.log(`✓ Persona "${personaName}" registered in persona registry`);
    
    // Return to original directory
    process.chdir(cwd);
    
    return { success: true, repo: githubRepo };
    
  } catch (error) {
    process.chdir(cwd);
    console.error(`Failed to initialize repo for ${repoName}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Register an existing persona that was pushed to GitHub manually
 * @param {string} localPath - Local path to the persona directory
 * @param {string} repoName - Repository name (e.g., goc-persona-green-open)
 * @param {string} orgName - GitHub organization name
 * @returns {Promise<{success: boolean, repo: string}>}
 */
async function registerExistingRepo(localPath, repoName, orgName = 'greenclawdbot') {
  const githubRepo = `${orgName}/${repoName}`;
  
  // Extract persona name from repo name (e.g., "goc-persona-green-open" -> "green-open")
  const personaName = repoName.replace(/^goc-persona-/, '');
  
  console.log(`Registering existing persona: ${personaName}`);
  console.log(`Path: ${localPath}`);
  console.log(`Repo: ${githubRepo}`);
  
  // Verify the path exists
  if (!require('fs').existsSync(localPath)) {
    console.error(`Persona path does not exist: ${localPath}`);
    return { success: false, error: 'Path does not exist' };
  }
  
  // Register in the persona registry
  registry.register(personaName, githubRepo, localPath);
  
  console.log(`✓ Persona "${personaName}" registered successfully!`);
  
  return { success: true, repo: githubRepo };
}

module.exports = { initializeRepo, registerExistingRepo };
