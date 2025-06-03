/**
 * Shared configuration utilities for MCP handlers
 * Provides consistent config access across handlers
 */

import { ConfigurationManager } from '../../../core/config/configuration-manager.js';

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