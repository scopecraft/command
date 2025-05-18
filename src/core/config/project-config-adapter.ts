/**
 * Adapter for bridging existing ProjectConfig with new ConfigurationManager
 * Provides backward compatibility during migration
 */

import fs from 'node:fs';
import path from 'node:path';
import { ConfigurationManager } from './configuration-manager.js';
import { type RuntimeConfig } from './types.js';
import { ProjectConfig, ProjectMode } from '../project-config.js';

/**
 * Extended ProjectConfig that uses ConfigurationManager for root resolution
 */
export class ConfigAwareProjectConfig extends ProjectConfig {
  private configManager: ConfigurationManager;

  constructor() {
    super();
    this.configManager = ConfigurationManager.getInstance();
  }

  /**
   * Override to use ConfigurationManager for root path
   */
  public detectProjectMode(runtime?: RuntimeConfig): ProjectMode {
    const rootConfig = this.configManager.getRootConfig(runtime);
    const root = rootConfig.path;

    // Use the resolved root instead of process.cwd()
    const ruruDir = path.join(root, '.ruru');
    if (fs.existsSync(ruruDir)) {
      return ProjectMode.ROO_COMMANDER;
    }

    const tasksDir = path.join(root, '.tasks');
    if (fs.existsSync(tasksDir)) {
      return ProjectMode.STANDALONE;
    }

    return ProjectMode.STANDALONE;
  }

  /**
   * Get root directory using ConfigurationManager
   */
  getRootDirectory(runtime?: RuntimeConfig): string {
    const rootConfig = this.configManager.getRootConfig(runtime);
    return rootConfig.path;
  }
}

// Re-export for gradual migration
export { ConfigurationManager } from './configuration-manager.js';
export * from './types.js';