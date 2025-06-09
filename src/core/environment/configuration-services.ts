/**
 * Configuration Services
 *
 * Centralized services for all configurable values.
 * These services ensure magic strings and patterns are defined in ONE place.
 */

import type { Task, TaskType } from '../types.js';
import type {
  BranchNamingService as IBranchNamingService,
  DockerConfigService as IDockerConfigService,
  ModeDefaultsService as IModeDefaultsService,
  WorkMode,
} from './types.js';

/**
 * Centralized branch naming service
 * All branch naming patterns must go through this service
 */
export class BranchNamingService implements IBranchNamingService {
  /**
   * Gets the branch name for a task
   * Pattern: task/{taskId}
   *
   * This is the ONLY place this pattern should exist
   */
  getBranchName(taskId: string): string {
    return `task/${taskId}`;
  }

  /**
   * Gets the default base branch
   * Could later read from config, git default, etc.
   */
  getDefaultBaseBranch(): string {
    // TODO: Could check git config for init.defaultBranch
    // For now, use 'main' as the modern default
    return 'main';
  }

  /**
   * Extracts task ID from a branch name
   * Inverse of getBranchName
   */
  extractTaskIdFromBranch(branchName: string): string | null {
    const match = branchName.match(/^task\/(.*)$/);
    return match ? match[1] : null;
  }
}

/**
 * Docker configuration service
 * Centralizes all Docker-related configuration
 */
export class DockerConfigService implements IDockerConfigService {
  /**
   * Gets the default Docker image for Claude execution
   * This is the ONLY place this should be defined
   */
  getDefaultImage(): string {
    // TODO: Make this configurable via project settings
    return 'my-claude:authenticated';
  }

  /**
   * Gets the workspace mount path inside Docker
   * This is where the project will be mounted in the container
   */
  getWorkspaceMountPath(): string {
    return '/workspace';
  }

  /**
   * Gets additional Docker run arguments
   * Centralized place for Docker configuration
   */
  getDockerRunArgs(): string[] {
    return [
      '--rm', // Remove container after exit
      '-it', // Interactive with TTY
    ];
  }

  /**
   * Gets environment variables to pass to Docker
   */
  getDockerEnvVars(): Record<string, string> {
    // TODO: Add any required env vars
    // For now, return empty - can be extended later
    return {};
  }
}

/**
 * Mode inference service
 * Centralizes work mode selection logic
 */
export class ModeDefaultsService implements IModeDefaultsService {
  /**
   * Infers the work mode from task metadata
   * This is the ONLY place mode inference logic should exist
   */
  inferMode(task: Task): WorkMode {
    // Parent tasks always use orchestrate mode
    if (task.metadata.isParentTask) {
      return 'orchestrate';
    }

    // Check for explicit mode in tags
    const modeTags = task.document.frontmatter.tags?.filter((tag) => tag.startsWith('mode:')) || [];
    if (modeTags.length > 0) {
      const mode = modeTags[0].substring('mode:'.length) as WorkMode;
      if (this.isValidMode(mode)) {
        return mode;
      }
    }

    // Type-based inference
    const typeToModeMap: Record<TaskType, WorkMode> = {
      bug: 'diagnose',
      spike: 'explore',
      feature: 'implement',
      chore: 'implement',
      documentation: 'implement',
      test: 'implement',
      idea: 'explore',
    };

    return typeToModeMap[task.document.frontmatter.type] || 'implement';
  }

  /**
   * Validates if a string is a valid work mode
   */
  isValidMode(mode: string): mode is WorkMode {
    const validModes: WorkMode[] = ['implement', 'explore', 'orchestrate', 'diagnose'];
    return validModes.includes(mode as WorkMode);
  }

  /**
   * Gets the mode description for help text
   */
  getModeDescription(mode: WorkMode): string {
    const descriptions: Record<WorkMode, string> = {
      implement: 'Build and code the solution',
      explore: 'Research and investigate options',
      orchestrate: 'Manage subtasks and coordinate work',
      diagnose: 'Debug and find root causes',
    };

    return descriptions[mode];
  }
}

/**
 * CLI Output Format Configuration Service
 */
export class OutputFormatService {
  /**
   * Get valid output formats for env commands
   */
  getValidFormats(): readonly ['table', 'json', 'minimal'] {
    return ['table', 'json', 'minimal'] as const;
  }

  /**
   * Get default output format
   */
  getDefaultFormat(): 'table' {
    return 'table';
  }

  /**
   * Get table formatting constants
   */
  getTableConfig() {
    return {
      minTaskIdWidth: 7, // Width of "Task ID" header
      minBranchWidth: 6, // Width of "Branch" header
      separatorChar: '-',
      columnSeparator: ' | ',
    };
  }
}
