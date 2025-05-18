#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
/**
 * MCP server CLI
 * Command-line interface for starting the MCP server
 */
import { Command } from 'commander';
import { ConfigurationManager } from '../core/config/configuration-manager.js';
import {
  ProjectMode,
  ensureDirectoryExists,
  getTasksDirectory,
  projectConfig,
} from '../core/index.js';
import { startServer } from './server.js';

// Read package version from package.json
let version = '0.9.0'; // Default
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
  );
  version = packageJson.version || version;
} catch (_error) {
  // Silently fail and use default version
}

// Set up command-line interface
const program = new Command();

program
  .name('scopecraft-mcp')
  .description('MCP server for Markdown-Driven Task Management (MDTM)')
  .version(version)
  .option('-p, --port <port>', 'Port to listen on', (value) => Number.parseInt(value, 10), 3500)
  .option('--mode <mode>', 'Force project mode (roo or standalone)')
  .option('--root-dir <path>', 'Set project root directory (overrides all other sources)')
  .option('--config <path>', 'Path to configuration file (default: ~/.scopecraft/config.json)')
  .action(async (options) => {
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

    // Set specific mode if requested
    if (options.mode) {
      const mode = options.mode.toLowerCase();
      if (mode === 'roo' || mode === 'roo_commander') {
        projectConfig.setMode(ProjectMode.ROO_COMMANDER);
      } else if (mode === 'standalone') {
        projectConfig.setMode(ProjectMode.STANDALONE);
      } else {
        console.error(`Error: Unknown mode "${options.mode}". Use "roo" or "standalone".`);
        process.exit(1);
      }
    }

    // Validate environment using projectConfig
    if (!projectConfig.validateEnvironment()) {
      const mode = projectConfig.getMode();
      const rootDir = mode === ProjectMode.ROO_COMMANDER ? '.ruru' : '.tasks';

      console.error(`Error: ${rootDir} directory structure not found in the current directory`);
      console.error(
        `Initialize the project first with "sc init${mode === ProjectMode.STANDALONE ? ' --mode standalone' : ''}"`
      );

      // Attempt to create the directory structure if it doesn't exist
      try {
        console.log(`Creating ${rootDir} directory structure...`);
        projectConfig.initializeProjectStructure();
        console.log(`${rootDir} directory structure created successfully.`);
      } catch (error) {
        console.error(
          `Failed to create directory structure: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        process.exit(1);
      }
    }

    // Ensure tasks directory exists
    const tasksDir = getTasksDirectory();
    ensureDirectoryExists(tasksDir);

    // Start server
    const modeText =
      projectConfig.getMode() === ProjectMode.ROO_COMMANDER ? 'Roo Commander' : 'Standalone';
    console.log(`Starting MCP server in ${modeText} mode...`);
    await startServer(options.port);
  });

// Parse command line arguments
program.parse(process.argv);
