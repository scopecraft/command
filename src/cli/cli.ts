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
let version = '0.8.0-template-list'; // Default
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

// Add structured help overview
program.addHelpText('beforeAll', `
USAGE: sc [entity] [command] [options]

Available entity types:
  task       Task operations (create, list, update, delete, etc.)
  phase      Phase management operations
  feature    Feature management operations
  area       Area management operations
  workflow   Task workflow and sequence operations
  template   Template management operations

Examples:
  sc task list                     List all tasks
  sc task create --title "New task" --type "🌟 Feature"   Create a new task
  sc phase list                    List all phases
  sc workflow next                 Find next task to work on
`);

// Set up entity commands (task, phase, feature, area, workflow)
setupEntityCommands(program);

// No footnote needed for alternative command formats

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