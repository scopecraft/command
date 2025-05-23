#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
/**
 * Main CLI entry point
 * Sets up commands and validates environment
 */
import { Command } from 'commander';
import { ConfigurationManager } from '../core/config/configuration-manager.js';
import { ensureDirectoryExists, getTasksDirectory, projectConfig } from '../core/index.js';
import { setupEntityCommands } from './entity-commands.js';

// Create the main command
const program = new Command();

// Read package version from package.json
let version = '0.10.6'; // Default
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
  );
  version = packageJson.version || version;
} catch (_error) {
  // Silently fail and use default version
}

program
  .name('scopecraft')
  .description(
    'CLI for managing Markdown-Driven Task Management (MDTM) files with TOML/YAML frontmatter'
  )
  .version(version)
  .option('--root-dir <path>', 'Set project root directory (overrides all other sources)')
  .option('--config <path>', 'Path to configuration file (default: ~/.scopecraft/config.json)');

// Configure global options handler
program.hook('preAction', () => {
  const options = program.opts();
  const configManager = ConfigurationManager.getInstance();

  // Handle --root-dir parameter
  if (options.rootDir) {
    try {
      configManager.setRootFromCLI(options.rootDir);
      console.log(`Using project root from CLI: ${options.rootDir}`);
    } catch (error) {
      console.error(
        `Error setting root directory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      process.exit(1);
    }
  }

  // Handle --config parameter
  if (options.config) {
    configManager.setConfigFilePath(options.config);
    console.log(`Using config file: ${options.config}`);
  }
});

// Add structured help overview
program.addHelpText(
  'beforeAll',
  `
USAGE: sc [entity] [command] [options]

Available entity types:
  task       Task operations (create, list, update, delete, etc.)
  phase      Phase management operations
  feature    Feature management operations
  area       Area management operations
  workflow   Task workflow and sequence operations
  template   Template management operations
  config     Configuration management operations

Global options:
  --root-dir <path>   Set project root directory (overrides environment variables and config)
  --config <path>     Path to configuration file (default: ~/.scopecraft/config.json)

Examples:
  sc task list                     List all tasks
  sc task create --title "New task" --type "🌟 Feature"   Create a new task
  sc phase list                    List all phases
  sc workflow next                 Find next task to work on
  sc --root-dir ./e2e_test/worktree-test task list    List tasks in specified directory
`
);

// Set up entity commands (task, phase, feature, area, workflow)
setupEntityCommands(program);

// No footnote needed for alternative command formats

/**
 * Validate environment before running commands
 */
function validateEnvironment() {
  if (!projectConfig.validateEnvironment()) {
    console.error('\n⚠️  No Scopecraft project found in this directory.\n');
    console.error('To get started:');
    console.error('  sc init               - Initialize a new project here');
    console.error('  sc --root-dir <path>  - Use an existing project\n');
    console.error('Learn more: https://github.com/scopecraft/scopecraft-command\n');
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
