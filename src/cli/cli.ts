#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
/**
 * Main CLI entry point for v2
 * Sets up commands and validates environment
 */
import { Command } from 'commander';
import { ConfigurationManager } from '../core/config/configuration-manager.js';
import * as v2 from '../core/index.js';
import { setupEntityCommands } from './entity-commands.js';

// Create the main command
const program = new Command();

// Read package version from package.json
let version = '0.11.0'; // v2 version
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
  .description('CLI v2 for managing workflow-based task management with Markdown files')
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
  parent     Parent task management (folder-based tasks with subtasks)
  area       Cross-cutting area management  
  workflow   Task workflow and sequence operations
  template   Template management operations

Workflow shortcuts:
  backlog    List backlog tasks
  current    List current tasks
  archive    List archived tasks

Global options:
  --root-dir <path>   Set project root directory (overrides environment variables and config)
  --config <path>     Path to configuration file (default: ~/.scopecraft/config.json)

Examples:
  sc init                          Initialize new project with workflow folders
  sc task create --title "New task" --type feature   Create a new task in backlog
  sc task list --current           List tasks in current workflow
  sc workflow promote <id>         Move task from backlog to current
  sc parent create --name "Epic"   Create a parent task with subtasks
`
);

// Set up entity commands (task, parent, area, workflow)
setupEntityCommands(program);

/**
 * Validate environment before running commands
 */
function validateEnvironment() {
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = configManager.getProjectRoot();

  if (!projectRoot) {
    console.error('\n⚠️  No Scopecraft project found.\n');
    console.error('To get started:');
    console.error('  sc init               - Initialize a new v2 project here');
    console.error('  sc --root-dir <path>  - Use an existing project\n');
    console.error('Learn more: https://github.com/scopecraft/scopecraft-command\n');
    process.exit(1);
  }

  // Check structure version
  const structureVersion = v2.detectStructureVersion(projectRoot);

  if (structureVersion === 'none') {
    console.error('\n⚠️  No Scopecraft project structure found.\n');
    console.error('Run: sc init');
    process.exit(1);
  }

  if (structureVersion === 'v1') {
    console.warn('\n⚠️  This project uses v1 structure (phases). Consider migrating to v2.\n');
  }

  // Ensure workflow directories exist for v2
  if (structureVersion === 'v2' || structureVersion === 'mixed') {
    v2.ensureWorkflowDirectories(projectRoot);
  }
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
