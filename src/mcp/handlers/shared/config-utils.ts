/**
 * Shared configuration utilities for MCP handlers
 * Provides consistent config access across handlers
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ConfigurationManager } from '../../../core/config/configuration-manager.js';
import type { ProjectConfig } from '../../../core/types.js';

/**
 * Get the project root from params or config
 * This is used by ALL handlers to get consistent project root
 */
export function getProjectRoot(params: { rootDir?: string }): string {
  const configManager = ConfigurationManager.getInstance();
  return params.rootDir || configManager.getRootConfig().path;
}

/**
 * Get configuration manager instance
 * Provided for handlers that need direct config access
 */
export function getConfigManager(): ConfigurationManager {
  return ConfigurationManager.getInstance();
}

/**
 * Load project configuration from .tasks/.config/project.json
 * Returns undefined if file doesn't exist or is invalid
 */
export function loadProjectConfig(projectRoot: string): ProjectConfig | undefined {
  const configPath = join(projectRoot, '.tasks', '.config', 'project.json');

  if (!existsSync(configPath)) {
    return undefined;
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content) as ProjectConfig;
    return config;
  } catch (_error) {
    // Invalid JSON or read error - return undefined
    return undefined;
  }
}
