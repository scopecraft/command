#!/usr/bin/env node
/**
 * Main CLI entry point
 * Sets up commands and validates environment
 */
import { Command } from 'commander';
import {
  handleListCommand,
  handleGetCommand,
  handleCreateCommand,
  handleUpdateCommand,
  handleDeleteCommand,
  handleNextTaskCommand,
  handleMarkCompleteNextCommand,
  handlePhasesCommand,
  handlePhaseCreateCommand,
  handleCurrentTaskCommand,
  handleInitCommand,
  handleListTemplatesCommand
} from './commands.js';
import { getTasksDirectory, ensureDirectoryExists, projectConfig } from '../core/index.js';
import fs from 'fs';
import path from 'path';

// Create the main command
const program = new Command();

// Read package version from package.json
let version = '0.3.0'; // Default
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

// List tasks command
program
  .command('list')
  .description('List all tasks')
  .option('-s, --status <status>', 'Filter by status (e.g., "🟡 To Do", "🟢 Done")')
  .option('-t, --type <type>', 'Filter by type (e.g., "🌟 Feature", "🐛 Bug")')
  .option('-a, --assignee <assignee>', 'Filter by assignee')
  .option('-g, --tags <tags...>', 'Filter by tags')
  .option('-p, --phase <phase>', 'Filter by phase')
  .option('-d, --subdirectory <subdirectory>', 'Filter by subdirectory (e.g., "FEATURE_Login")')
  .option('-o, --overview', 'Show only overview files (_overview.md)')
  .option('-f, --format <format>', 'Output format: table, json, minimal, workflow', 'table')
  .action(handleListCommand);

// Get a single task
program
  .command('get <id>')
  .description('Get a task by ID')
  .option('-f, --format <format>', 'Output format: default, json, markdown, full', 'default')
  .option('-p, --phase <phase>', 'Phase to look in')
  .option('-d, --subdirectory <subdirectory>', 'Subdirectory to look in')
  .action(handleGetCommand);

// Create a new task
program
  .command('create')
  .description('Create a new task')
  .option('--id <id>', 'Task ID (generated if not provided, use "_overview" for feature overview files)')
  .option('--title <title>', 'Task title')
  .option('--type <type>', 'Task type (e.g., "🌟 Feature", "🐛 Bug")')
  .option('--status <status>', 'Task status (default: "🟡 To Do")')
  .option('--priority <priority>', 'Task priority (default: "▶️ Medium")')
  .option('--assignee <assignee>', 'Assigned to')
  .option('--phase <phase>', 'Phase ID or name')
  .option('--subdirectory <subdirectory>', 'Subdirectory within phase (e.g., "FEATURE_Login")')
  .option('--parent <parent>', 'Parent task ID')
  .option('--depends <depends...>', 'Dependencies (task IDs)')
  .option('--previous <previous>', 'Previous task in workflow')
  .option('--next <next>', 'Next task in workflow')
  .option('--tags <tags...>', 'Tags for the task')
  .option('--content <content>', 'Task content')
  .option('--file <file>', 'Create from file (JSON or TOML+Markdown)')
  .option('--template <template>', 'Use a predefined template (feature, bug, etc.)')
  .requiredOption('--title <title>', 'Task title is required')
  .requiredOption('--type <type>', 'Task type is required')
  .action(handleCreateCommand);

// List available templates
program
  .command('list-templates')
  .description('List available task templates')
  .action(handleListTemplatesCommand);

// Update an existing task
program
  .command('update <id>')
  .description('Update a task')
  .option('--title <title>', 'Task title')
  .option('--status <status>', 'Task status')
  .option('--type <type>', 'Task type')
  .option('--priority <priority>', 'Task priority')
  .option('--assignee <assignee>', 'Assigned to')
  .option('--phase <phase>', 'Phase ID or name (where to move the task)')
  .option('--subdirectory <subdirectory>', 'Subdirectory within phase (where to move the task)')
  .option('--search-phase <searchPhase>', 'Phase to search for the task')
  .option('--search-subdirectory <searchSubdirectory>', 'Subdirectory to search for the task')
  .option('--parent <parent>', 'Parent task ID')
  .option('--depends <depends...>', 'Dependencies (task IDs)')
  .option('--previous <previous>', 'Previous task in workflow')
  .option('--next <next>', 'Next task in workflow')
  .option('--tags <tags...>', 'Tags for the task')
  .option('--content <content>', 'Task content')
  .option('--file <file>', 'Update from file (JSON or TOML+Markdown)')
  .action(handleUpdateCommand);

// Delete a task
program
  .command('delete <id>')
  .description('Delete a task')
  .option('-p, --phase <phase>', 'Phase to look in')
  .option('-d, --subdirectory <subdirectory>', 'Subdirectory to look in')
  .action(handleDeleteCommand);

// Status shortcut commands
program
  .command('start <id>')
  .description('Mark a task as "In Progress"')
  .action(async (id) => {
    await handleUpdateCommand(id, { status: '🔵 In Progress' });
  });

program
  .command('complete <id>')
  .description('Mark a task as "Done"')
  .action(async (id) => {
    await handleUpdateCommand(id, { status: '🟢 Done' });
  });

program
  .command('block <id>')
  .description('Mark a task as "Blocked"')
  .action(async (id) => {
    await handleUpdateCommand(id, { status: '⚪ Blocked' });
  });

program
  .command('review <id>')
  .description('Mark a task as "In Review"')
  .action(async (id) => {
    await handleUpdateCommand(id, { status: '🟣 Review' });
  });

// Phase commands
program
  .command('phases')
  .description('List all phases')
  .option('-f, --format <format>', 'Output format: table, json', 'table')
  .action(handlePhasesCommand);

program
  .command('phase-create')
  .description('Create a new phase')
  .requiredOption('--id <id>', 'Phase ID')
  .requiredOption('--name <name>', 'Phase name')
  .option('--description <description>', 'Phase description')
  .option('--status <status>', 'Phase status (default: "🟡 Pending")')
  .option('--order <order>', 'Phase order (number)', parseInt)
  .action(handlePhaseCreateCommand);

// Next task command
program
  .command('next-task [id]')
  .description('Find the next task to work on, optionally based on a current task')
  .option('-f, --format <format>', 'Output format: default, json, markdown, full', 'default')
  .action(handleNextTaskCommand);

// Current task shortcut
program
  .command('current-task')
  .description('Show tasks currently in progress')
  .option('-f, --format <format>', 'Output format: table, json, minimal, workflow', 'table')
  .action(handleCurrentTaskCommand);

// Mark complete and move to next task
program
  .command('mark-complete-next <id>')
  .description('Mark a task as done and show the next task')
  .option('-f, --format <format>', 'Output format: default, json, markdown, full', 'default')
  .action(handleMarkCompleteNextCommand);

// Init command to set up project structure
program
  .command('init')
  .description('Initialize task directory structure')
  .option('--mode <mode>', 'Force project mode (roo or standalone)')
  .action(handleInitCommand);

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