import { getFeature, getTask } from '../task-manager/index.js';
import { TaskCorrelationError, Worktree, FeatureProgress, DevelopmentMode, WorkflowStatus } from './types.js';
import { WorktreeService } from './worktree-service.js';

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
      
      // Get task metadata
      const taskResult = await getTask(worktree.taskId);
      
      if (!taskResult.success || !taskResult.data) {
        return worktree;
      }
      
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
          const featureProgress = await this.getFeatureProgress(task.metadata.parent_task);
          if (featureProgress) {
            enhancedWorktree.featureProgress = featureProgress;
          }
        } catch (error) {
          // Ignore feature progress errors
        }
      }
      
      return enhancedWorktree;
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
    return Promise.all(
      worktrees.map(worktree => this.correlateWorktreeWithTask(worktree))
    );
  }

  /**
   * Gets feature progress information
   * @param featureId Feature ID
   * @returns Feature progress or undefined if not found
   */
  async getFeatureProgress(featureId: string): Promise<FeatureProgress | undefined> {
    try {
      // Use the feature_get method with appropriate parameters
      const featureResult = await getFeature(featureId, { phase: undefined });
      
      if (!featureResult.success || !featureResult.data) {
        throw new TaskCorrelationError(`Feature not found: ${featureId}`);
      }
      
      const feature = featureResult.data;
      
      // Count tasks in each status category
      let completed = 0;
      let inProgress = 0;
      let blocked = 0;
      let toDo = 0;
      
      const tasks = feature.tasks || [];
      
      for (const taskId of tasks) {
        // Get the task details
        const taskResult = await getTask(taskId);
        if (taskResult.success && taskResult.data) {
          const task = taskResult.data;
          const status = (task.metadata.status || '').toLowerCase();
          
          if (status.includes('done') || status.includes('complete') || status.includes('🟢')) {
            completed++;
          } else if (status.includes('progress') || status.includes('working') || status.includes('🔵')) {
            inProgress++;
          } else if (status.includes('blocked') || status.includes('waiting') || status.includes('🔴')) {
            blocked++;
          } else if (status.includes('to do') || status.includes('todo') || status.includes('🟡')) {
            toDo++;
          }
        }
      }
      
      // Create the feature progress object
      const featureProgress: FeatureProgress = {
        totalTasks: tasks.length,
        completed,
        inProgress,
        blocked,
        toDo,
      };
      
      return featureProgress;
    } catch (error) {
      throw new TaskCorrelationError(`Failed to get feature progress: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extracts development mode from task tags
   * @param tags Array of task tags
   * @returns Extracted development mode
   */
  private extractModeFromTags(tags: string[] = []): DevelopmentMode {
    // Default mode if no matching tag is found
    let mode = DevelopmentMode.UNKNOWN;
    
    // Try to extract area from tags (e.g. AREA:core, AREA:ui)
    for (const tag of tags) {
      const tagLower = tag.toLowerCase();
      
      if (tagLower.includes('area:')) {
        const area = tagLower.split('area:')[1].trim();
        
        if (area.includes('typescript') || area.includes('core')) {
          return DevelopmentMode.TYPESCRIPT;
        } else if (area.includes('ui')) {
          return DevelopmentMode.UI;
        } else if (area.includes('cli')) {
          return DevelopmentMode.CLI;
        } else if (area.includes('mcp')) {
          return DevelopmentMode.MCP;
        } else if (area.includes('devops')) {
          return DevelopmentMode.DEVOPS;
        }
      }
    }
    
    return mode;
  }
}