/**
 * Environment Command Handlers
 * 
 * Command handlers for managing development environments (worktrees).
 * Provides direct control over worktree creation, listing, and cleanup.
 */

import { z } from 'zod';
import { ConfigurationManager } from '../../core/config/configuration-manager.js';
import { EnvironmentResolver } from '../../core/environment/resolver.js';
import { WorktreeManager } from '../../core/environment/worktree-manager.js';
import { EnvironmentError, EnvironmentErrorCodes } from '../../core/environment/types.js';
import { OutputFormatService } from '../../core/environment/index.js';
import * as core from '../../core/index.js';

// Initialize centralized configuration services
const outputFormatService = new OutputFormatService();

// ============================================
// Validation Schemas
// ============================================

const envCreateSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  base: z.string().optional(),
  force: z.boolean().default(false),
});

const envListSchema = z.object({
  format: z.enum(outputFormatService.getValidFormats()).default(outputFormatService.getDefaultFormat()),
  verbose: z.boolean().default(false),
});

const envCloseSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  force: z.boolean().default(false),
  keepBranch: z.boolean().default(false),
});

const envPathSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
});

// ============================================
// Command Handlers
// ============================================

/**
 * Handle env create/switch command
 * Creates or switches to a worktree for the given task
 */
export async function handleEnvCreateCommand(
  taskId: string,
  options: {
    base?: string;
    force?: boolean;
  } = {}
): Promise<void> {
  try {
    // Validate input
    const validated = envCreateSchema.parse({ taskId, ...options });
    
    // Initialize services
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = configManager.getRootConfig().path;
    const resolver = new EnvironmentResolver();
    
    // Verify task exists first
    const taskResult = await core.get(projectRoot, validated.taskId);
    if (!taskResult.success) {
      console.error(`Error: Task '${validated.taskId}' not found`);
      console.error(`  ${taskResult.error}`);
      process.exit(1);
    }
    
    // Resolve environment ID (handles parent/subtask logic)
    const envId = await resolver.resolveEnvironmentId(validated.taskId);
    
    // Create or get existing environment
    const envInfo = await resolver.ensureEnvironment(envId);
    
    // Check if this is a new environment or existing
    const isNew = !await new WorktreeManager().exists(envId);
    
    if (isNew) {
      console.log(`✓ Created environment for task: ${validated.taskId}`);
      if (envId !== validated.taskId) {
        console.log(`  Environment ID: ${envId} (parent task)`);
      }
    } else {
      console.log(`✓ Switched to existing environment: ${validated.taskId}`);
    }
    
    console.log(`  Path: ${envInfo.path}`);
    console.log(`  Branch: ${envInfo.branch}`);
    
    // Show helpful next steps
    console.log('\nNext steps:');
    console.log(`  cd "${envInfo.path}"`);
    console.log('  # Start working on your task');
    
    // Show related tasks if this is a parent environment
    if (envId !== validated.taskId) {
      console.log(`\nNote: This is a shared environment for parent task '${envId}'`);
      console.log(`      You requested task '${validated.taskId}' which is a subtask`);
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error: Invalid input');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    
    if (error instanceof EnvironmentError) {
      console.error(`Error: ${error.message}`);
      if (error.code === EnvironmentErrorCodes.TASK_NOT_FOUND) {
        console.error('\nTip: Use "sc task list" to see available tasks');
      } else if (error.code === EnvironmentErrorCodes.WORKTREE_CONFLICT) {
        console.error('\nTip: Use --force to overwrite existing path');
      }
      process.exit(1);
    }
    
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handle env list command
 * Lists all active environments with formatting
 */
export async function handleEnvListCommand(
  options: {
    format?: 'table' | 'json' | 'minimal';
    verbose?: boolean;
  } = {}
): Promise<void> {
  try {
    // Validate input
    const validated = envListSchema.parse(options);
    
    // Initialize services
    const worktreeManager = new WorktreeManager();
    
    // Get all worktrees
    const worktrees = await worktreeManager.list();
    
    // Format output based on requested format
    if (validated.format === 'json') {
      console.log(JSON.stringify(worktrees, null, 2));
      return;
    }
    
    if (validated.format === 'minimal') {
      if (worktrees.length === 0) {
        // Output nothing for minimal format when empty
        return;
      }
      worktrees.forEach(wt => {
        console.log(`${wt.taskId}\t${wt.path}`);
      });
      return;
    }
    
    // Table format handles empty case with user-friendly message
    if (worktrees.length === 0) {
      console.log('No active environments found.');
      console.log('\nCreate an environment with:');
      console.log('  sc env <taskId>');
      return;
    }
    
    // Default table format
    console.log('Active Environments:');
    console.log('====================');
    
    // Calculate column widths using centralized config
    const tableConfig = outputFormatService.getTableConfig();
    const maxTaskIdWidth = Math.max(tableConfig.minTaskIdWidth, ...worktrees.map(wt => wt.taskId.length));
    const maxBranchWidth = Math.max(tableConfig.minBranchWidth, ...worktrees.map(wt => wt.branch.length));
    
    // Header
    const taskIdHeader = 'Task ID'.padEnd(maxTaskIdWidth);
    const branchHeader = 'Branch'.padEnd(maxBranchWidth);
    console.log(`${taskIdHeader}${tableConfig.columnSeparator}${branchHeader}${tableConfig.columnSeparator}Path`);
    console.log(`${tableConfig.separatorChar.repeat(maxTaskIdWidth)}-+-${tableConfig.separatorChar.repeat(maxBranchWidth)}-+------`);
    
    // Rows
    for (const wt of worktrees) {
      const taskId = wt.taskId.padEnd(maxTaskIdWidth);
      const branch = wt.branch.padEnd(maxBranchWidth);
      console.log(`${taskId}${tableConfig.columnSeparator}${branch}${tableConfig.columnSeparator}${wt.path}`);
      
      if (validated.verbose) {
        console.log(`${' '.repeat(maxTaskIdWidth)}   ${' '.repeat(maxBranchWidth)}   Commit: ${wt.commit.substring(0, 8)}`);
      }
    }
    
    console.log(`\nTotal: ${worktrees.length} active environment${worktrees.length === 1 ? '' : 's'}`);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error: Invalid options');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handle env close command
 * Safely closes an environment with status checks
 */
export async function handleEnvCloseCommand(
  taskId: string,
  options: {
    force?: boolean;
    keepBranch?: boolean;
  } = {}
): Promise<void> {
  try {
    // Validate input
    const validated = envCloseSchema.parse({ taskId, ...options });
    
    // Initialize services
    const resolver = new EnvironmentResolver();
    const worktreeManager = new WorktreeManager();
    
    // Resolve environment ID
    const envId = await resolver.resolveEnvironmentId(validated.taskId);
    
    // Check if environment exists
    const envInfo = await resolver.getEnvironmentInfo(envId);
    if (!envInfo) {
      console.error(`Error: No environment found for task '${validated.taskId}'`);
      console.error('\nTip: Use "sc env list" to see active environments');
      process.exit(1);
    }
    
    // Safety checks if not forced
    if (!validated.force) {
      // TODO: Check for uncommitted changes
      // TODO: Check for untracked files
      // For now, just show a warning
      console.log(`About to close environment for task: ${validated.taskId}`);
      console.log(`  Environment ID: ${envId}`);
      console.log(`  Path: ${envInfo.path}`);
      console.log(`  Branch: ${envInfo.branch}`);
      console.log('\nUse --force to skip this confirmation.');
      console.log('Close cancelled (use --force to close)');
      return;
    }
    
    // Remove the worktree
    await worktreeManager.remove(envId);
    
    console.log(`✓ Closed environment for task: ${validated.taskId}`);
    if (envId !== validated.taskId) {
      console.log(`  Environment ID: ${envId} (parent task)`);
    }
    console.log(`  Removed path: ${envInfo.path}`);
    
    if (!validated.keepBranch) {
      console.log(`  Branch '${envInfo.branch}' preserved (use --keep-branch=false to delete)`);
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error: Invalid input');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    
    if (error instanceof EnvironmentError) {
      console.error(`Error: ${error.message}`);
      if (error.code === EnvironmentErrorCodes.WORKTREE_NOT_FOUND) {
        console.error('\nTip: Use "sc env list" to see active environments');
      }
      process.exit(1);
    }
    
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handle env path command
 * Outputs the path for shell integration
 */
export async function handleEnvPathCommand(
  taskId: string,
  options: {} = {}
): Promise<void> {
  try {
    // Validate input
    const validated = envPathSchema.parse({ taskId, ...options });
    
    // Initialize services
    const resolver = new EnvironmentResolver();
    
    // Resolve environment ID
    const envId = await resolver.resolveEnvironmentId(validated.taskId);
    
    // Get environment info
    const envInfo = await resolver.getEnvironmentInfo(envId);
    if (!envInfo) {
      console.error(`Error: No environment found for task '${validated.taskId}'`);
      process.exit(1);
    }
    
    // Output just the path for shell integration
    console.log(envInfo.path);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error: Invalid input');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    
    if (error instanceof EnvironmentError) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
    
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}