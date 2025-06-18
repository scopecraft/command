#!/usr/bin/env node
/**
 * Migration script for two-state workflow architecture
 * 
 * Migrates tasks from three-state (backlog/current/archive) to two-state (current/archive)
 * and ensures all tasks have a phase field set. Specifically:
 * 1. Moves all backlog tasks to current workflow state
 * 2. Sets default phase to 'backlog' for any task without a phase
 * 
 * This is a one-time migration to support the new architecture where workflow 
 * phase is tracked via metadata rather than location.
 * 
 * Usage: bun run scripts/migrate-workflow.ts [--dry-run]
 */

import { list, move, update } from '../src/core/task-crud.js';
import { ConfigurationManager } from '../src/core/config/configuration-manager.js';
import type { TaskLocation, TaskPhase } from '../src/core/types.js';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

async function migrateWorkflow() {
  console.log('Starting workflow migration...');
  if (isDryRun) {
    console.log('DRY RUN MODE - No changes will be made');
  }

  // Get project root
  const configManager = ConfigurationManager.getInstance();
  const projectRoot = configManager.getProjectRoot();
  
  if (!projectRoot) {
    console.error('No project root found. Please run from within a project directory.');
    process.exit(1);
  }

  console.log(`Project root: ${projectRoot}`);

  // Get all tasks from backlog
  const backlogTasks = await list(projectRoot, { location: { workflowState: 'backlog' } });
  
  if (!backlogTasks.success) {
    console.error('Failed to list backlog tasks:', backlogTasks.error);
    process.exit(1);
  }

  console.log(`Found ${backlogTasks.data.length} tasks in backlog`);

  // Also get current tasks that might need phase defaults
  const currentTasks = await list(projectRoot, { location: { workflowState: 'current' } });
  
  if (!currentTasks.success) {
    console.error('Failed to list current tasks:', currentTasks.error);
    process.exit(1);
  }

  // Filter current tasks that don't have a phase set
  const currentTasksWithoutPhase = currentTasks.data.filter(task => !task.document.frontmatter.phase);
  console.log(`Found ${currentTasksWithoutPhase.length} current tasks without phase field`);

  // Combine all tasks that need processing
  const allTasks = [...backlogTasks.data, ...currentTasksWithoutPhase];

  // Track migration stats
  let movedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  console.log(`Total tasks to process: ${allTasks.length}`);

  // Process each task
  for (const task of allTasks) {
    try {
      const phase = task.document.frontmatter.phase as TaskPhase | undefined;
      const isBacklogTask = task.metadata.workflowState === 'backlog';
      
      // Extract parent ID from path for subtasks
      let parentId: string | undefined = undefined;
      const currentIndex = task.metadata.path.indexOf('/current/');
      if (currentIndex !== -1) {
        const afterCurrent = task.metadata.path.substring(currentIndex + 9);
        const isSubtask = afterCurrent.includes('/');
        if (isSubtask) {
          parentId = afterCurrent.split('/')[0];
        }
      }
      
      if (isBacklogTask) {
        console.log(`Moving task ${task.metadata.id} from backlog to current...`);
        
        if (!isDryRun) {
          const moveResult = await move(projectRoot, task.metadata.id, {
            targetState: 'current',
            updateStatus: false // Don't auto-update status
          });
          
          if (!moveResult.success) {
            throw new Error(moveResult.error);
          }
        }
        movedCount++;
      }
      
      // Ensure phase is set (default to 'backlog' if not set)
      if (!phase) {
        console.log(`Setting phase to 'backlog' for task ${task.metadata.id}${parentId ? ` (parent: ${parentId})` : ''}...`);
        
        if (!isDryRun) {
          const updateResult = await update(projectRoot, task.metadata.id, {
            frontmatter: { phase: 'backlog' }
          }, undefined, parentId);
          
          if (!updateResult.success) {
            throw new Error(updateResult.error);
          }
        }
        updatedCount++;
      }
    } catch (error) {
      errorCount++;
      const errorMsg = `Failed to process task ${task.metadata.id}: ${error}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  // Summary
  console.log('\n=== Migration Summary ===');
  console.log(`Total tasks processed: ${allTasks.length}`);
  console.log(`Tasks moved from backlog to current: ${movedCount}`);
  console.log(`Tasks updated with 'backlog' phase: ${updatedCount}`);
  console.log(`Current tasks without phase: ${currentTasksWithoutPhase.length}`);
  console.log(`Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\nErrors encountered:');
    errors.forEach(err => console.error(`  - ${err}`));
  }

  if (isDryRun) {
    console.log('\nDRY RUN COMPLETE - No changes were made');
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log('\nMigration complete!');
  }
}

// Run migration
migrateWorkflow().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});