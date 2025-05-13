#!/usr/bin/env node
/**
 * Main CLI entry point
 * Sets up commands and validates environment
 */
import { Command } from 'commander';
import { setupEntityCommands } from './entity-commands.js';
import { getTasksDirectory, ensureDirectoryExists, projectConfig } from '../core/index.js';
import fs from 'fs';
import path from 'path';

// Create the main command
const program = new Command();

// Read package version from package.json
let version = '0.4.2'; // Default
try {
  const packageJson = JSON.parse(fs.readFileSync(
    path.join(process.cwd(), 'package.json'), 
    'utf-8'
  ));
  version = packageJson.version || version;
} catch (error) {
  // Silently fail and use default version
}

program
  .name('scopecraft')
  .description('CLI for managing Markdown-Driven Task Management (MDTM) files with TOML/YAML frontmatter')
  .version(version);

// Set up entity commands (task, phase, feature, area, workflow)
setupEntityCommands(program);

/**
 * Validate environment before running commands
 */
function validateEnvironment() {
  if (!projectConfig.validateEnvironment()) {
    console.error('Error: Task directory structure not found in the current directory');
    console.error('Please run "scopecraft init" or "sc init" first to set up the necessary structure');
    process.exit(1);
  }

  // Ensure tasks directory exists
  const tasksDir = getTasksDirectory();
  ensureDirectoryExists(tasksDir);
}

// Validate environment before running commands (except for 'init')
const runningInitCommand = process.argv.length > 2 && process.argv[2] === 'init';
if (process.env.NODE_ENV !== 'test' && !runningInitCommand) {
  validateEnvironment();
}

// Parse command line arguments
program.parse(process.argv);

// If no arguments, show help
if (process.argv.length <= 2) {
  program.help();
}