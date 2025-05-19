#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
/**
 * STDIO MCP server CLI
 * Command-line interface for starting the MCP server with STDIO transport
 */
import { Command } from 'commander';
import { ConfigurationManager } from '../core/config/configuration-manager.js';
import { projectConfig } from '../core/index.js';
import { startStdioServer } from './stdio-server.js';

// Read package version from package.json
let version = '0.2.0'; // Default
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
  .name('scopecraft-stdio')
  .description('MCP server for MDTM files using STDIO transport')
  .version(version)
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--mode <mode>', 'Force project mode (roo or standalone)')
  .option('--root-dir <path>', 'Set project root directory')
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

    // Handle mode option - now this is handled by configuration manager
    if (options.mode) {
      console.log(`Note: Mode option is deprecated. Project configuration is now managed automatically.`);
    }

    // Validate environment using projectConfig
    if (!projectConfig.validateEnvironment()) {
      console.error(`Error: Project structure not found in the current directory`);
      console.error(
        `Initialize the project first with "sc init"`
      );

      // Attempt to create the directory structure if it doesn't exist
      try {
        console.log(`Creating project structure...`);
        projectConfig.initializeProjectStructure();
        console.log(`Project structure created successfully.`);
      } catch (error) {
        console.error(
          `Failed to create directory structure: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        process.exit(1);
      }
    }

    // Start server
    const modeText = 'Standard';
    console.log(`Starting STDIO MCP server in ${modeText} mode...`);

    await startStdioServer({
      verbose: options.verbose || false,
    });
  });

// Parse command line arguments
program.parse(process.argv);

// Direct execution
if (import.meta.url === import.meta.main) {
  // Directly executed
}
