/**
 * Environment Management Module
 *
 * Provides core utilities for environment resolution and worktree management.
 * All components follow the principle of centralized configuration.
 */

// Export all types
export * from './types.js';

// Export path resolver
export { WorktreePathResolver } from './worktree-path-resolver.js';

// Export configuration services
export {
  BranchNamingService,
  DockerConfigService,
  ModeDefaultsService,
  OutputFormatService,
} from './configuration-services.js';

// Export worktree manager
export { WorktreeManager } from './worktree-manager.js';

// Export environment resolver (class-based for backward compatibility)
export { EnvironmentResolver } from './resolver.js';

// Export pure worktree functions
export * from './worktree-functions.js';

// Export pure environment resolver functions
export {
  resolveEnvironmentId,
  getWorktreePath,
  getBranchNameForTask,
  ensureEnvironment,
  getEnvironmentInfo,
  getTaskEnvironmentInfo,
  ensureTaskEnvironment,
} from './resolver-functions.js';

// Import classes for factory functions
import { EnvironmentResolver as EnvironmentResolverClass } from './resolver.js';
import { WorktreeManager as WorktreeManagerClass } from './worktree-manager.js';
import { WorktreePathResolver as WorktreePathResolverClass } from './worktree-path-resolver.js';

// Export convenience factory functions
export function createEnvironmentResolver(): EnvironmentResolverClass {
  return new EnvironmentResolverClass();
}

export function createWorktreeManager(): WorktreeManagerClass {
  return new WorktreeManagerClass();
}

export function createPathResolver(): WorktreePathResolverClass {
  return new WorktreePathResolverClass();
}
