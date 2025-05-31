/**
 * Configuration Manager implementation
 * Handles multiple configuration sources with clear precedence rules
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { OperationResult } from '../types.js';
import {
  CONFIG_CONSTANTS,
  type ConfigSource,
  ConfigurationError,
  ENV_VARS,
  type IConfigurationManager,
  type ProjectDefinition,
  type RootConfig,
  type RuntimeConfig,
  type ScopecraftConfig,
} from './types.js';

/**
 * Configuration Manager singleton implementation
 */
export class ConfigurationManager implements IConfigurationManager {
  private static instance: ConfigurationManager;
  private cliRootPath: string | null = null;
  private sessionConfig: RootConfig | null = null;
  private configFilePath: string;
  private customConfigFilePath: string | null = null;

  // Cache for resolved configuration
  private resolvedConfig: RootConfig | null = null;

  private constructor() {
    // Support testing by allowing HOME override
    const homeDir = process.env.HOME || os.homedir();
    this.configFilePath = path.join(
      homeDir,
      CONFIG_CONSTANTS.CONFIG_DIR_NAME,
      CONFIG_CONSTANTS.CONFIG_FILE_NAME
    );
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  /**
   * Get root configuration with runtime override support
   */
  public getRootConfig(runtime?: RuntimeConfig): RootConfig {
    // If runtime config provided, use it with highest priority
    if (runtime?.rootPath) {
      return {
        path: runtime.rootPath,
        source: 'runtime' as ConfigSource,
        validated: this.validateRoot(runtime.rootPath),
      };
    }

    // Use cached or resolve
    if (!this.resolvedConfig) {
      this.resolvedConfig = this.resolveRoot();
    }
    return this.resolvedConfig;
  }

  /**
   * Resolve root from all sources in precedence order
   */
  public resolveRoot(runtime?: RuntimeConfig): RootConfig {
    // 1. Check runtime parameter
    if (runtime?.rootPath) {
      return {
        path: runtime.rootPath,
        source: 'runtime' as ConfigSource,
        validated: this.validateRoot(runtime.rootPath),
      };
    }

    // 2. Check CLI parameter
    if (this.cliRootPath) {
      return {
        path: this.cliRootPath,
        source: 'cli' as ConfigSource,
        validated: this.validateRoot(this.cliRootPath),
      };
    }

    // 3. Check environment variable
    const envRoot = this.checkEnvironmentVariable();
    if (envRoot) return envRoot;

    // 4. Check session configuration
    if (this.sessionConfig) return this.sessionConfig;

    // 5. Check config file
    const configRoot = this.checkConfigFile();
    if (configRoot) return configRoot;

    // 6. Auto-detect (fallback)
    return this.autoDetect();
  }

  /**
   * Set root from CLI parameter
   */
  public setRootFromCLI(path: string): void {
    if (!this.validateRoot(path)) {
      throw new ConfigurationError(
        `Invalid project root: ${path} does not contain .tasks or .ruru directory`,
        'cli' as ConfigSource,
        path
      );
    }
    this.cliRootPath = path;
    this.clearCache();
  }

  /**
   * Set root from environment variable
   */
  public setRootFromEnvironment(): void {
    const envPath = process.env[ENV_VARS.SCOPECRAFT_ROOT];
    if (envPath) {
      if (!this.validateRoot(envPath)) {
        throw new ConfigurationError(
          `Invalid project root from environment: ${envPath}`,
          'environment' as ConfigSource,
          envPath
        );
      }
      // Environment variable is checked dynamically, no need to store
      this.clearCache();
    }
  }

  /**
   * Set root from session command
   */
  public setRootFromSession(path: string): void {
    if (!this.validateRoot(path)) {
      throw new ConfigurationError(
        `Invalid project root: ${path} does not contain .tasks or .ruru directory`,
        'session' as ConfigSource,
        path
      );
    }
    this.sessionConfig = {
      path,
      source: 'session' as ConfigSource,
      validated: true,
    };
    this.clearCache();
  }

  /**
   * Set root from config file
   */
  public setRootFromConfig(projectName?: string): OperationResult<void> {
    try {
      const config = this.loadConfigFile();
      if (!config) {
        return {
          success: false,
          error: 'Configuration file not found',
        };
      }

      let project: ProjectDefinition | undefined;

      if (projectName) {
        project = config.projects.find((p) => p.name === projectName);
        if (!project) {
          return {
            success: false,
            error: `Project '${projectName}' not found in configuration`,
          };
        }
      } else if (config.defaultProject) {
        project = config.projects.find((p) => p.name === config.defaultProject);
      }

      if (!project) {
        return {
          success: false,
          error: 'No project specified and no default project configured',
        };
      }

      if (!this.validateRoot(project.path)) {
        return {
          success: false,
          error: `Invalid project root: ${project.path}`,
        };
      }

      // Config file is checked dynamically, no need to store
      this.clearCache();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Error setting root from config: ${error}`,
      };
    }
  }

  /**
   * Validate a project root directory
   */
  public validateRoot(rootPath: string): boolean {
    try {
      // Check if path exists
      if (!fs.existsSync(rootPath)) return false;

      // Check for .tasks or .ruru directory
      const hasTasksDir = fs.existsSync(path.join(rootPath, '.tasks'));
      const hasRuruDir = fs.existsSync(path.join(rootPath, '.ruru'));

      return hasTasksDir || hasRuruDir;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get list of configured projects
   */
  public getProjects(): ProjectDefinition[] {
    try {
      const config = this.loadConfigFile();
      return config?.projects || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get project root path (convenience method)
   */
  public getProjectRoot(): string | null {
    try {
      const rootConfig = this.getRootConfig();
      return rootConfig?.path || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear session configuration
   */
  public clearSessionConfig(): void {
    this.sessionConfig = null;
    this.clearCache();
  }

  /**
   * Set custom config file path
   */
  public setConfigFilePath(path: string): void {
    this.customConfigFilePath = path;
    this.clearCache();
  }

  // Private helper methods

  private clearCache(): void {
    this.resolvedConfig = null;
  }

  private checkEnvironmentVariable(): RootConfig | null {
    const envPath = process.env[ENV_VARS.SCOPECRAFT_ROOT];
    if (envPath && this.validateRoot(envPath)) {
      return {
        path: envPath,
        source: 'environment' as ConfigSource,
        validated: true,
      };
    }
    return null;
  }

  private checkConfigFile(): RootConfig | null {
    try {
      const config = this.loadConfigFile();
      if (!config) return null;

      // Check for default project
      if (config.defaultProject) {
        const project = config.projects.find((p) => p.name === config.defaultProject);
        if (project && this.validateRoot(project.path)) {
          return {
            path: project.path,
            source: 'config_file' as ConfigSource,
            projectName: project.name,
            validated: true,
          };
        }
      }

      // Try to auto-detect based on current directory
      const cwd = process.cwd();
      const project = config.projects.find((p) => p.path === cwd);
      if (project && this.validateRoot(project.path)) {
        return {
          path: project.path,
          source: 'config_file' as ConfigSource,
          projectName: project.name,
          validated: true,
        };
      }
    } catch (error) {
      // Config file errors are non-fatal
    }
    return null;
  }

  private autoDetect(): RootConfig {
    const cwd = process.cwd();
    const validated = this.validateRoot(cwd);
    return {
      path: cwd,
      source: 'auto_detect' as ConfigSource,
      validated,
    };
  }

  private loadConfigFile(): ScopecraftConfig | null {
    try {
      // Use custom config file path if set, otherwise default
      const configPath = this.customConfigFilePath || this.configFilePath;

      if (!fs.existsSync(configPath)) {
        return null;
      }

      const content = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(content) as ScopecraftConfig;

      // Basic validation
      if (!config.version || !Array.isArray(config.projects)) {
        throw new Error('Invalid configuration file format');
      }

      return config;
    } catch (error) {
      console.error(`Error loading config file: ${error}`);
      return null;
    }
  }
}
