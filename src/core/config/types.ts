/**
 * Core configuration types for project root configuration system
 */

import type { OperationResult } from '../types.js';

/**
 * Enumeration of configuration sources in order of precedence
 */
export enum ConfigSource {
  RUNTIME = 'runtime',
  CLI = 'cli',
  ENVIRONMENT = 'environment',
  SESSION = 'session',
  CONFIG_FILE = 'config_file',
  AUTO_DETECT = 'auto_detect',
}

/**
 * Root configuration with source tracking
 */
export interface RootConfig {
  path: string;
  source: ConfigSource;
  projectName?: string;
  validated: boolean;
}

/**
 * Runtime configuration options for core functions
 */
export interface RuntimeConfig {
  rootPath?: string;
  // Future: additional runtime overrides
}

/**
 * Project definition for config file
 */
export interface ProjectDefinition {
  name: string;
  path: string;
  directories?: {
    tasks?: string; // Default: ".tasks"
    phases?: string; // Default: ".tasks/phases"
    config?: string; // Default: ".tasks/config"
    templates?: string; // Default: ".tasks/templates"
  };
  description?: string;
  tags?: string[];
}

/**
 * Global configuration file structure
 */
export interface ScopecraftConfig {
  version: string;
  defaultProject?: string;
  projects: ProjectDefinition[];
}

/**
 * Configuration manager interface
 */
export interface IConfigurationManager {
  // Get current root configuration
  getRootConfig(runtime?: RuntimeConfig): RootConfig;

  // Set root via different sources
  setRootFromCLI(path: string): void;
  setRootFromEnvironment(): void;
  setRootFromSession(path: string): void;
  setRootFromConfig(projectName?: string): OperationResult<void>;

  // Validation and utilities
  validateRoot(path: string): boolean;
  resolveRoot(runtime?: RuntimeConfig): RootConfig;
  getProjects(): ProjectDefinition[];
  clearSessionConfig(): void;
}

/**
 * Configuration error class for detailed error reporting
 */
export class ConfigurationError extends Error {
  constructor(
    message: string,
    public source: ConfigSource,
    public path?: string,
    public operation?: string
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Environment variable names
 */
export const ENV_VARS = {
  SCOPECRAFT_ROOT: 'SCOPECRAFT_ROOT',
} as const;

/**
 * Configuration file constants
 */
export const CONFIG_CONSTANTS = {
  CONFIG_DIR_NAME: '.scopecraft',
  CONFIG_FILE_NAME: 'config.json',
  VERSION: '1.0.0',
} as const;
