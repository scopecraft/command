/**
 * Project configuration manager
 * Uses ConfigurationManager for root resolution and handles project-specific config
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseToml, stringify as stringifyToml } from '@iarna/toml';
import { ConfigurationManager } from './config/configuration-manager.js';
import type { RuntimeConfig } from './config/types.js';

/**
 * Interface for project paths
 */
export interface ProjectPaths {
  tasksRoot: string;
  phasesRoot: string;
  configRoot: string;
  templatesRoot: string;
}

/**
 * Interface for project configuration
 */
export interface ProjectConfigData {
  idFormat?: 'concise' | 'timestamp';
  customStopWords?: string[];
  maxContextLength?: number;
}

// Default configuration values
const DEFAULT_CONFIG: ProjectConfigData = {
  idFormat: 'concise',
  maxContextLength: 2,
};

// Default directory structure
const DEFAULT_DIRECTORIES = {
  tasks: '.tasks',
  phases: '.tasks/phases',
  config: '.tasks/config',
  templates: '.tasks/templates',
};

/**
 * Project configuration class
 * Handles project configuration and path resolution
 */
export class ProjectConfig {
  private configManager: ConfigurationManager;
  private paths: ProjectPaths;
  private config: ProjectConfigData = { ...DEFAULT_CONFIG };
  private runtime?: RuntimeConfig;

  constructor(runtime?: RuntimeConfig) {
    this.configManager = ConfigurationManager.getInstance();
    this.runtime = runtime;
    this.paths = this.buildProjectPaths();
    this.loadConfig();
  }

  /**
   * Get singleton instance (for backward compatibility)
   */
  static getInstance(runtime?: RuntimeConfig): ProjectConfig {
    return new ProjectConfig(runtime);
  }

  /**
   * Get the project root directory
   */
  private getRoot(): string {
    return this.configManager.getRootConfig(this.runtime).path;
  }

  /**
   * Build project paths based on configuration
   */
  private buildProjectPaths(): ProjectPaths {
    const root = this.getRoot();
    const project = this.getProjectDefinition();

    const dirs = DEFAULT_DIRECTORIES;

    return {
      tasksRoot: path.join(root, dirs.tasks),
      phasesRoot: path.join(root, dirs.phases),
      configRoot: path.join(root, dirs.config),
      templatesRoot: path.join(root, dirs.templates),
    };
  }

  /**
   * Get project definition from configuration
   */
  private getProjectDefinition() {
    const root = this.getRoot();
    const projects = this.configManager.getProjects();
    return projects.find((p) => p.path === root);
  }

  /**
   * Load project configuration from file
   */
  private loadConfig(): void {
    const configPath = this.getProjectConfigPath();

    try {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf-8');
        const parsed = parseToml(content) as ProjectConfigData;
        this.config = { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch (error) {
      // Log error but continue with defaults
      console.error(`Failed to load project config: ${error}`);
    }
  }

  /**
   * Get tasks directory
   */
  getTasksDirectory(): string {
    return this.paths.tasksRoot;
  }

  /**
   * Get phases directory
   */
  getPhasesDirectory(): string {
    return this.paths.phasesRoot;
  }

  /**
   * Get configuration directory
   */
  getConfigDirectory(): string {
    return this.paths.configRoot;
  }

  /**
   * Get templates directory
   */
  getTemplatesDirectory(): string {
    return this.paths.templatesRoot;
  }

  /**
   * Get phases config file path
   */
  getPhasesConfigPath(): string {
    return path.join(this.paths.configRoot, 'phases.toml');
  }

  /**
   * Get project configuration file path
   */
  getProjectConfigPath(): string {
    return path.join(this.paths.configRoot, 'project.toml');
  }

  /**
   * Initialize project structure
   * Creates necessary directories
   */
  initializeProjectStructure(): void {
    // Create all directories
    Object.values(this.paths).forEach((dirPath) => {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  /**
   * Validate project environment
   */
  validateEnvironment(): boolean {
    return this.configManager.validateRoot(this.getRoot());
  }

  /**
   * Get project configuration data
   */
  getConfig(): ProjectConfigData {
    return this.config;
  }

  /**
   * Update project configuration
   */
  updateConfig(updates: Partial<ProjectConfigData>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  /**
   * Save project configuration to file
   */
  private saveConfig(): void {
    const configPath = this.getProjectConfigPath();
    const configDir = path.dirname(configPath);

    try {
      // Ensure config directory exists
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      // Only save non-default values
      const configToSave: Partial<ProjectConfigData> = {};

      for (const [key, value] of Object.entries(this.config)) {
        if (value !== DEFAULT_CONFIG[key as keyof ProjectConfigData]) {
          configToSave[key as keyof ProjectConfigData] = value;
        }
      }

      const content = stringifyToml(configToSave);
      fs.writeFileSync(configPath, content);
    } catch (error) {
      console.error(`Failed to save project config: ${error}`);
    }
  }

  /**
   * Get task file path
   */
  getTaskFilePath(id: string, phase: string, subdirectory: string): string {
    const baseDir = phase ? path.join(this.paths.tasksRoot, phase) : this.paths.tasksRoot;

    return path.join(baseDir, subdirectory, `${id}.md`);
  }

  /**
   * Parse task path to extract phase and subdirectory
   */
  parseTaskPath(filePath: string): { phase?: string; subdirectory?: string } {
    const tasksRoot = this.paths.tasksRoot;
    const relativePath = path.relative(tasksRoot, filePath);
    const parts = relativePath.split(path.sep);

    let phase: string | undefined;
    let subdirectory: string | undefined;

    // If under phases directory, first part is phase name
    if (parts.length >= 3 && parts[0] === 'phases') {
      phase = parts[1];
      subdirectory = parts[2];
    } else if (parts.length >= 2) {
      // Direct subdirectory under tasks
      subdirectory = parts[0];
    }

    return { phase, subdirectory };
  }
}

// Export a singleton instance (for backward compatibility)
export const projectConfig = new ProjectConfig();
