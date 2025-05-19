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
  config: '.tasks/.config',
  templates: '.tasks/.templates',
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

    const dirs = DEFAULT_DIRECTORIES;

    // Use runtime config if provided
    if (this.runtime?.tasksDir) {
      return {
        tasksRoot: this.runtime.tasksDir,
        configRoot: path.join(this.runtime.tasksDir, '.config'),
        templatesRoot: path.join(this.runtime.tasksDir, '.templates'),
      };
    }

    return {
      tasksRoot: path.join(root, dirs.tasks),
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
   * @deprecated phases are now first-level directories under tasks
   */
  getPhasesDirectory(): string {
    // Return tasks directory as phases are now first-level directories
    return this.paths.tasksRoot;
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
    for (const dirPath of Object.values(this.paths)) {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
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
   * @deprecated Use directory-utils.parseTaskPath instead
   */
  parseTaskPath(filePath: string): { phase?: string; subdirectory?: string } {
    const tasksRoot = this.paths.tasksRoot;

    // Ensure we're working with absolute paths
    const absoluteFilePath = path.resolve(filePath);
    const absoluteTasksRoot = path.resolve(tasksRoot);

    // Check if the file is actually under the tasks root
    if (!absoluteFilePath.startsWith(absoluteTasksRoot)) {
      return {};
    }

    // Get the relative path from tasks root
    const relativePath = path.relative(absoluteTasksRoot, absoluteFilePath);
    const parts = relativePath.split(path.sep);

    // Skip dot-prefix directories (system dirs)
    if (parts.length > 0 && parts[0].startsWith('.')) {
      return {};
    }

    if (parts.length === 1) {
      // Only filename, no phase or subdirectory
      return {};
    }

    if (parts.length === 2) {
      // phase/filename - has phase but no subdirectory
      return { phase: parts[0] };
    }

    // Has both phase and subdirectory (or more levels)
    const phase = parts[0];
    // Combine all middle directories as the subdirectory path
    const subdirectory = parts.slice(1, -1).join(path.sep);
    return { phase, subdirectory };
  }
}

// Export a singleton instance (for backward compatibility)
export const projectConfig = new ProjectConfig();
