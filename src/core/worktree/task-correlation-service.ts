import type { RuntimeConfig } from '../config/types.js';
import { get as getTask, parent } from '../index.js';
// Note: getFeature was replaced with getParentTask
import {
  DevelopmentMode,
  type FeatureProgress,
  TaskCorrelationError,
  WorkflowStatus,
  type Worktree,
} from './types.js';
import type { WorktreeService } from './worktree-service.js';

/**
 * Service for correlating worktrees with task metadata
 */
export class TaskCorrelationService {
  private worktreeService: WorktreeService;

  /**
   * Creates a new TaskCorrelationService
   * @param worktreeService The worktree service to use
   */
  constructor(worktreeService: WorktreeService) {
    this.worktreeService = worktreeService;
  }

  /**
   * Correlates a worktree with task metadata
   * @param worktree The worktree to correlate
   * @returns Enhanced worktree with task metadata
   */
  async correlateWorktreeWithTask(worktree: Worktree): Promise<Worktree> {
    try {
      // Skip if no task ID is available
      if (!worktree.taskId) {
        return worktree;
      }

      let taskId = worktree.taskId;
      let branchComponent = '';

      // Extract the potential identifier from branch name without complex regex
      // This handles 'feature/name', 'feature-name', etc. formats
      if (worktree.branch) {
        const parts = worktree.branch.split(/[/-]/);
        if (parts.length > 1 && parts[0].toLowerCase() === 'feature') {
          branchComponent = parts.slice(1).join('-');
        }
      }

      // Create a runtime config that includes the worktree's path as rootPath
      // This ensures we look for tasks/features in the worktree, not just the main repo
      const worktreeConfig = {
        rootPath: worktree.path,
      };

      // First try to get task metadata using direct taskId with worktree rootPath
      let taskResult = await getTask(worktree.path, taskId, worktreeConfig);

      // If not found in worktree, try main repo as fallback
      if (!taskResult.success) {
        taskResult = await getTask(process.cwd(), taskId);
      }

      // If not found and we have a branch component, try that in worktree
      if (!taskResult.success && branchComponent && branchComponent !== taskId) {
        taskResult = await getTask(worktree.path, branchComponent, worktreeConfig);

        // If not found in worktree, try main repo as fallback
        if (!taskResult.success) {
          taskResult = await getTask(process.cwd(), branchComponent);
        }

        // Update taskId if we found a match
        if (taskResult.success) {
          taskId = branchComponent;
        }
      }

      // If task is found, process it as a regular task
      if (taskResult.success && taskResult.data) {
        const task = taskResult.data;

        // Get mode from task tags (area)
        const mode = this.extractModeFromTags(task.metadata.tags || []);

        // Ensure we have a task status
        const taskStatus = task.metadata.status || 'Unknown';

        // Enhance worktree with task metadata
        const enhancedWorktree: Worktree = {
          ...worktree,
          taskTitle: task.metadata.title,
          taskStatus,
          workflowStatus: this.worktreeService.mapTaskStatusToWorkflow(taskStatus),
          mode: {
            current: mode,
          },
        };

        // If task has a parent feature, get feature progress
        if (task.metadata.parent_task) {
          try {
            // Check worktree first, then fall back to main repo
            const featureProgress = await this.getFeatureProgress(
              task.metadata.parent_task,
              worktreeConfig
            );

            if (featureProgress) {
              enhancedWorktree.featureProgress = featureProgress;
            }
          } catch (_error) {
            // Ignore feature progress errors
          }
        }

        return enhancedWorktree;
      }

      // Task not found, try as feature now - first in worktree
      let featureResult = await parent(worktree.path, taskId, worktreeConfig).get();

      // If not found in worktree, try main repo
      if (!featureResult.success) {
        featureResult = await parent(process.cwd(), taskId).get();
      }

      // If not found and we have a branch component, try that in worktree
      if (!featureResult.success && branchComponent && branchComponent !== taskId) {
        featureResult = await parent(worktree.path, branchComponent, worktreeConfig).get();

        // If not found in worktree, try main repo
        if (!featureResult.success) {
          featureResult = await parent(process.cwd(), branchComponent).get();
        }

        // If found, update taskId
        if (featureResult.success) {
          taskId = branchComponent;
        }
      }

      // If feature is found, process it
      if (featureResult.success && featureResult.data) {
        // Found a feature - treat this as a feature worktree
        const feature = featureResult.data;

        // Use overview data if available
        // TODO: Update to use new ParentTask structure
        const title = (feature as any).overview?.metadata?.title || (feature as any).name || taskId;

        // Get feature progress - use the ID without FEATURE_ prefix for consistency
        // Try worktree first, then fall back to main repo
        const featureProgress = await this.getFeatureProgress(
          feature.id.replace(/^FEATURE_/, ''),
          worktreeConfig
        );

        // Derive status from task progress
        let status = feature.overview?.metadata?.status || 'Unknown';

        // If we have feature progress, derive status from task counts
        if (featureProgress) {
          if (featureProgress.totalTasks === 0) {
            status = '🟡 To Do';
          } else if (featureProgress.blocked > 0) {
            status = '⚪ Blocked';
          } else if (featureProgress.completed === featureProgress.totalTasks) {
            status = '🟢 Done';
          } else if (featureProgress.inProgress > 0) {
            status = '🔵 In Progress';
          } else {
            status = '🟡 To Do';
          }
        }

        // Get mode from tags if available
        const tags = feature.overview?.metadata?.tags || [];
        const mode = this.extractModeFromTags(tags);

        // Enhance worktree with feature metadata
        const enhancedWorktree: Worktree = {
          ...worktree,
          taskTitle: title,
          taskStatus: status,
          workflowStatus: this.worktreeService.mapTaskStatusToWorkflow(status),
          mode: {
            current: mode,
          },
          featureProgress: featureProgress,
        };

        return enhancedWorktree;
      }

      // Neither task nor feature found
      return worktree;
    } catch (error) {
      // If correlation fails, return the original worktree
      console.error('Task correlation error:', error);
      return worktree;
    }
  }

  /**
   * Correlates multiple worktrees with task metadata
   * @param worktrees Worktrees to correlate
   * @returns Enhanced worktrees with task metadata
   */
  async correlateWorktreesWithTasks(worktrees: Worktree[]): Promise<Worktree[]> {
    return Promise.all(worktrees.map((worktree) => this.correlateWorktreeWithTask(worktree)));
  }

  /**
   * Gets feature progress information
   * @param featureId Feature ID
   * @param config Optional runtime configuration (for worktree-specific lookups)
   * @returns Feature progress or undefined if not found
   */
  async getFeatureProgress(
    featureId: string,
    config?: RuntimeConfig
  ): Promise<FeatureProgress | undefined> {
    try {
      // Get feature details with completed tasks, passing through config
      const feature = await this.getFeatureDetails(featureId, config);

      // Instead of using feature.tasks (which may be incomplete),
      // directly list all tasks in the feature subdirectory
      const featureDirName = featureId.startsWith('FEATURE_') ? featureId : `FEATURE_${featureId}`;
      // TODO: This needs to be updated to use the new API
      // The old listTasks API is no longer available
      const listResult = { success: true, data: [] };

      // Get task IDs from the list result
      const taskIds =
        listResult.success && listResult.data
          ? listResult.data.map((task) => task.metadata.id)
          : feature.tasks || [];

      // Process task statuses, passing through config
      const statusCounts = await this.countTasksByStatus(taskIds, config);

      // Get detailed task information, passing through config
      const taskDetails = await this.getTaskDetails(taskIds, config);

      // Create the feature progress object
      return {
        totalTasks: taskIds.length,
        ...statusCounts,
        tasks: taskDetails,
      };
    } catch (error) {
      throw new TaskCorrelationError(
        `Failed to get feature progress: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Gets feature details from the feature ID
   * @param featureId The feature ID
   * @param config Optional runtime configuration (for worktree-specific lookups)
   * @returns Feature data
   */
  private async getFeatureDetails(
    featureId: string,
    config?: RuntimeConfig
  ): Promise<{ tasks?: string[] }> {
    // TODO: This needs to be updated to use the new parent builder API
    // The old getParentTask function is no longer available
    // For now, return empty to avoid build errors
    throw new TaskCorrelationError(`Feature lookup not implemented with new API: ${featureId}`);
  }

  /**
   * Counts tasks by status categories
   * @param taskIds Array of task IDs
   * @param config Optional runtime configuration (for worktree-specific lookups)
   * @returns Object with counts for each status category
   */
  private async countTasksByStatus(
    taskIds: string[],
    config?: RuntimeConfig
  ): Promise<{
    completed: number;
    inProgress: number;
    blocked: number;
    toDo: number;
  }> {
    // Initialize counters
    const counters = {
      completed: 0,
      inProgress: 0,
      blocked: 0,
      toDo: 0,
    };

    // Get tasks and count by status, passing through config
    await this.processTaskStatuses(taskIds, counters, config);

    return counters;
  }

  /**
   * Processes tasks and updates status counters
   * @param taskIds Task IDs to process
   * @param counters Status counters to update
   * @param config Optional runtime configuration (for worktree-specific lookups)
   */
  private async processTaskStatuses(
    taskIds: string[],
    counters: { completed: number; inProgress: number; blocked: number; toDo: number },
    config?: RuntimeConfig
  ): Promise<void> {
    for (const taskId of taskIds) {
      // Try with config first (worktree-specific lookup)
      const projectRoot = config?.rootPath || process.cwd();
      let taskResult = await getTask(projectRoot, taskId, config);

      // If not found in worktree and config provided, try main repo as fallback
      if ((!taskResult.success || !taskResult.data) && config) {
        taskResult = await getTask(process.cwd(), taskId);
      }

      if (!taskResult.success || !taskResult.data) continue;

      const status = (taskResult.data.metadata.status || '').toLowerCase();
      this.updateStatusCounter(status, counters);
    }
  }

  /**
   * Updates the appropriate status counter based on the status
   * @param status The task status string
   * @param counters The counters object to update
   */
  private updateStatusCounter(
    status: string,
    counters: { completed: number; inProgress: number; blocked: number; toDo: number }
  ): void {
    if (this.isCompletedStatus(status)) {
      counters.completed++;
    } else if (this.isInProgressStatus(status)) {
      counters.inProgress++;
    } else if (this.isBlockedStatus(status)) {
      counters.blocked++;
    } else if (this.isToDoStatus(status)) {
      counters.toDo++;
    }
  }

  /**
   * Gets detailed task information for UI display
   * @param taskIds Array of task IDs
   * @param config Optional runtime configuration (for worktree-specific lookups)
   * @returns Array of task details objects
   */
  private async getTaskDetails(
    taskIds: string[],
    config?: RuntimeConfig
  ): Promise<
    Array<{
      id: string;
      title: string;
      status: string;
    }>
  > {
    const taskDetails = [];

    for (const taskId of taskIds) {
      // Try with config first (worktree-specific lookup)
      const projectRoot = config?.rootPath || process.cwd();
      let taskResult = await getTask(projectRoot, taskId, config);

      // If not found in worktree and config provided, try main repo as fallback
      if ((!taskResult.success || !taskResult.data) && config) {
        taskResult = await getTask(process.cwd(), taskId);
      }

      if (taskResult.success && taskResult.data) {
        const task = taskResult.data;
        taskDetails.push({
          id: taskId,
          title: task.metadata.title || '',
          status: task.metadata.status || 'Unknown',
        });
      }
    }

    return taskDetails;
  }

  // Helper methods for status checking
  private isCompletedStatus(status: string): boolean {
    return status.includes('done') || status.includes('complete') || status.includes('🟢');
  }

  private isInProgressStatus(status: string): boolean {
    return status.includes('progress') || status.includes('working') || status.includes('🔵');
  }

  private isBlockedStatus(status: string): boolean {
    return status.includes('blocked') || status.includes('waiting') || status.includes('🔴');
  }

  private isToDoStatus(status: string): boolean {
    return status.includes('to do') || status.includes('todo') || status.includes('🟡');
  }

  /**
   * Extracts development mode from task tags
   * @param tags Array of task tags
   * @returns Extracted development mode
   */
  private extractModeFromTags(tags: string[] = []): DevelopmentMode {
    // Default mode if no matching tag is found
    const mode = DevelopmentMode.UNKNOWN;

    // Try to extract area from tags (e.g. AREA:core, AREA:ui)
    for (const tag of tags) {
      const tagLower = tag.toLowerCase();

      if (tagLower.includes('area:')) {
        const area = tagLower.split('area:')[1].trim();
        return this.getModeFromArea(area);
      }
    }

    return mode;
  }

  /**
   * Get the development mode from an area string
   * @param area The area string (e.g. "ui", "core")
   * @returns The corresponding development mode
   */
  private getModeFromArea(area: string): DevelopmentMode {
    if (area.includes('typescript') || area.includes('core')) {
      return DevelopmentMode.TYPESCRIPT;
    }

    if (area.includes('ui')) {
      return DevelopmentMode.UI;
    }

    if (area.includes('cli')) {
      return DevelopmentMode.CLI;
    }

    if (area.includes('mcp')) {
      return DevelopmentMode.MCP;
    }

    if (area.includes('devops')) {
      return DevelopmentMode.DEVOPS;
    }

    return DevelopmentMode.UNKNOWN;
  }
}
