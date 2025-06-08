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
} from './configuration-services.js';

// Export worktree manager
export { WorktreeManager } from './worktree-manager.js';

// Export environment resolver
export { EnvironmentResolver } from './resolver.js';

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