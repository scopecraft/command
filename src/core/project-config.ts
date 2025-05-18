/**
 * Project configuration manager
 * Handles project type detection and path resolution
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseToml, stringify as stringifyToml } from '@iarna/toml';

/**
 * Enum for project mode detection
 */
export enum ProjectMode {
  ROO_COMMANDER = 'roo_commander',
  STANDALONE = 'standalone',
}

/**
 * Interface for project paths
 */
export interface ProjectPaths {
  tasksRoot: string;
  phasesRoot: string;
  configRoot: string;
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

/**
 * Project configuration class
 * Handles project type detection and path resolution
 */
export class ProjectConfig {
  private mode: ProjectMode;
  private paths: ProjectPaths;
  private config: ProjectConfigData = { ...DEFAULT_CONFIG };

  constructor() {
    this.mode = this.detectProjectMode();
    this.paths = this.buildProjectPaths();
    this.loadConfig();
  }

  /**
   * Detect project mode based on directory structure
   * @returns ProjectMode based on detected directories
   */
  private detectProjectMode(): ProjectMode {
    const ruruDir = path.join(process.cwd(), '.ruru');

    if (fs.existsSync(ruruDir)) {
      return ProjectMode.ROO_COMMANDER;
    }

    // Check for standalone mode - look for .tasks directory
    const tasksDir = path.join(process.cwd(), '.tasks');
    if (fs.existsSync(tasksDir)) {
      return ProjectMode.STANDALONE;
    }

    // Default to standalone mode if neither exists
    return ProjectMode.STANDALONE;
  }

  /**
   * Build project paths based on detected mode
   * @returns ProjectPaths object with all necessary paths
   */
  private buildProjectPaths(): ProjectPaths {
    if (this.mode === ProjectMode.ROO_COMMANDER) {
      return {
        tasksRoot: path.join(process.cwd(), '.ruru', 'tasks'),
        phasesRoot: path.join(process.cwd(), '.ruru', 'tasks'), // In Roo Commander, phases are structured as subdirectories
        configRoot: path.join(process.cwd(), '.ruru', 'config'),
      };
    }
    return {
      tasksRoot: path.join(process.cwd(), '.tasks'),
      phasesRoot: path.join(process.cwd(), '.tasks', 'phases'),
      configRoot: path.join(process.cwd(), '.tasks', 'config'),
    };
  }

  /**
   * Get current project mode
   * @returns Current project mode
   */
  getMode(): ProjectMode {
    return this.mode;
  }

  /**
   * Get tasks directory
   * @returns Path to the tasks directory
   */
  getTasksDirectory(): string {
    return this.paths.tasksRoot;
  }

  /**
   * Get phases directory
   * @returns Path to the phases directory
   */
  getPhasesDirectory(): string {
    return this.paths.phasesRoot;
  }

  /**
   * Get configuration directory
   * @returns Path to the configuration directory
   */
  getConfigDirectory(): string {
    return this.paths.configRoot;
  }

  /**
   * Get phases config file path
   * @returns Path to the phases configuration file
   */
  getPhasesConfigPath(): string {
    return path.join(this.paths.configRoot, 'phases.toml');
  }

  /**
   * Initialize project structure
   * Creates necessary directories for the current mode
   */
  initializeProjectStructure(): void {
    const rootDir =
      this.mode === ProjectMode.ROO_COMMANDER
        ? path.join(process.cwd(), '.ruru')
        : path.join(process.cwd(), '.tasks');

    // Create root directory if it doesn't exist
    if (!fs.existsSync(rootDir)) {
      fs.mkdirSync(rootDir, { recursive: true });
    }

    // Ensure tasks directory exists
    if (!fs.existsSync(this.paths.tasksRoot)) {
      fs.mkdirSync(this.paths.tasksRoot, { recursive: true });
    }

    // Ensure phases directory exists (only needed in standalone mode)
    if (this.mode === ProjectMode.STANDALONE && !fs.existsSync(this.paths.phasesRoot)) {
      fs.mkdirSync(this.paths.phasesRoot, { recursive: true });
    }

    // Ensure config directory exists
    if (!fs.existsSync(this.paths.configRoot)) {
      fs.mkdirSync(this.paths.configRoot, { recursive: true });
    }

    // In standalone mode, also create a templates directory
    if (this.mode === ProjectMode.STANDALONE) {
      const templatesDir = path.join(rootDir, 'templates');
      if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
      }
    }
  }

  /**
   * Force a specific project mode
   * @param mode The project mode to force
   */
  setMode(mode: ProjectMode): void {
    this.mode = mode;
    this.paths = this.buildProjectPaths();
  }

  /**
   * Validate if project structure exists
   * @returns Whether the project structure is valid
   */
  validateEnvironment(): boolean {
    if (this.mode === ProjectMode.ROO_COMMANDER) {
      const ruruDir = path.join(process.cwd(), '.ruru');
      return fs.existsSync(ruruDir);
    }
    return fs.existsSync(this.paths.tasksRoot);
  }

  /**
   * Get task file path in appropriate directory
   * @param taskId Task ID
   * @param phase Optional phase for nested location
   * @param subdirectory Optional subdirectory within phase (e.g., "FEATURE_Login")
   * @returns Path to the task file
   */
  getTaskFilePath(taskId: string, phase?: string, subdirectory?: string): string {
    if (phase) {
      const phaseDir = path.join(this.paths.tasksRoot, phase);
      if (subdirectory) {
        const featureDir = path.join(phaseDir, subdirectory);
        return path.join(featureDir, `${taskId}.md`);
      }
      return path.join(phaseDir, `${taskId}.md`);
    }
    return path.join(this.paths.tasksRoot, `${taskId}.md`);
  }

  /**
   * Builds task directory path based on phase and subdirectory
   * @param phase Optional phase name
   * @param subdirectory Optional subdirectory name
   * @returns Path to the task directory
   */
  getTaskDirectory(phase?: string, subdirectory?: string): string {
    let baseDir = this.paths.tasksRoot;

    if (phase) {
      baseDir = path.join(baseDir, phase);
    }

    if (subdirectory) {
      baseDir = path.join(baseDir, subdirectory);
    }

    return baseDir;
  }

  /**
   * Creates all directories needed for a task path
   * @param phase Optional phase name
   * @param subdirectory Optional subdirectory name
   * @returns Path to the created directory
   */
  ensureTaskDirectory(phase?: string, subdirectory?: string): string {
    const dirPath = this.getTaskDirectory(phase, subdirectory);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    return dirPath;
  }

  /**
   * Parses a file path to extract phase and subdirectory
   * @param filePath Path to a task file
   * @returns Object with phase and subdirectory
   */
  parseTaskPath(filePath: string): { phase?: string; subdirectory?: string } {
    const tasksRoot = this.paths.tasksRoot;

    // Check if the path is relative to tasks root
    if (!filePath.startsWith(tasksRoot)) {
      return {};
    }

    // Remove tasks root from path and split by separator
    const relativePath = filePath.substring(tasksRoot.length + 1);
    const pathParts = relativePath.split(path.sep);

    if (pathParts.length === 1) {
      // Only filename, no phase or subdirectory
      return {};
    }
    if (pathParts.length === 2) {
      // Has phase but no subdirectory
      return { phase: pathParts[0] };
    }
    // Has both phase and subdirectory (or more levels)
    const phase = pathParts[0];
    // Combine all middle directories as the subdirectory path
    const subdirectory = pathParts.slice(1, -1).join(path.sep);
    return { phase, subdirectory };
  }

  /**
   * Load project configuration from file
   */
  private loadConfig(): void {
    const configPath = this.getProjectConfigPath();

    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf-8');
        const fileConfig = parseToml(content) as ProjectConfigData;
        // Merge with defaults (file config overrides defaults)
        this.config = { ...DEFAULT_CONFIG, ...fileConfig };
      } catch (error) {
        console.warn(`Failed to load project config: ${error}`);
      }
    }
    // If no config file exists, we already have the defaults
  }

  /**
   * Get project configuration data
   * @returns Project configuration
   */
  getConfig(): ProjectConfigData {
    return this.config;
  }

  /**
   * Update project configuration
   * @param updates Configuration updates
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
   * Get project configuration file path
   * @returns Path to the project configuration file
   */
  getProjectConfigPath(): string {
    return path.join(this.paths.configRoot, 'project.toml');
  }
}

// Export a singleton instance
export const projectConfig = new ProjectConfig();
