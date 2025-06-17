#!/usr/bin/env node
/**
 * Migration script for two-state workflow architecture
 * 
 * Migrates tasks from three-state (backlog/current/archive) to two-state (current/archive)
 * based on task phase metadata. This is a one-time migration to support the new
 * architecture where workflow phase is tracked via metadata rather than location.
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

  // Track migration stats
  let movedCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  // Process each task
  for (const task of backlogTasks.data) {
    try {
      // Move ALL tasks to current (two-state architecture)
      const phase = task.document.frontmatter.phase as TaskPhase | undefined;
      
      console.log(`Moving task ${task.metadata.id} to current...`);
      
      if (!isDryRun) {
        const moveResult = await move(projectRoot, task.metadata.id, {
          targetState: 'current',
          updateStatus: false // Don't auto-update status
        });
        
        if (!moveResult.success) {
          throw new Error(moveResult.error);
        }
        
        // Ensure phase is set (default to 'planning' if not set)
        if (!phase) {
          const updateResult = await update(projectRoot, task.metadata.id, {
            phase: 'planning'
          });
          
          if (!updateResult.success) {
            throw new Error(updateResult.error);
          }
        }
      }
      
      movedCount++;
    } catch (error) {
      errorCount++;
      const errorMsg = `Failed to process task ${task.metadata.id}: ${error}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  // Summary
  console.log('\n=== Migration Summary ===');
  console.log(`Total tasks processed: ${backlogTasks.data.length}`);
  console.log(`Tasks moved to current: ${movedCount}`);
  console.log(`Tasks remaining in backlog: ${backlogTasks.data.length - movedCount}`);
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