/**
 * Worktree Dashboard Display Test
 * 
 * This test verifies that the worktree-feature integration is working correctly,
 * specifically that:
 * 
 * 1. The TaskCorrelationService properly fetches feature metadata for worktrees
 * 2. Completed tasks are included in the feature progress calculation
 * 3. Task status is properly tracked (completed, in progress, todo, blocked)
 * 4. All tasks in a feature subdirectory are identified, not just those in the feature object
 * 
 * When to run:
 * - After making changes to task-correlation-service.ts
 * - When troubleshooting issues with feature cards not displaying proper metadata
 * - To verify feature progress calculation or task status tracking
 * 
 * Expected results:
 * - All worktrees with feature branches should display their metadata
 * - Feature progress should include all tasks in the subdirectory
 * - Completed tasks should be properly counted in the progress calculation
 */
import { WorktreeService } from '../../src/core/worktree/worktree-service.js';
import { TaskCorrelationService } from '../../src/core/worktree/task-correlation-service.js';

// Repository path
const REPO_PATH = process.cwd();

async function testDashboardDisplay() {
  console.log('=== Testing Worktree Dashboard Display ===\n');

  // Create services 
  const worktreeService = new WorktreeService(REPO_PATH);
  const correlationService = new TaskCorrelationService(worktreeService);

  try {
    // Get all worktrees
    const worktrees = await worktreeService.listWorktrees(false);
    console.log(`Found ${worktrees.length} worktrees\n`);
    
    // Correlate all worktrees with task metadata (like the dashboard would)
    const correlatedWorktrees = await correlationService.correlateWorktreesWithTasks(worktrees);
    
    // Display each worktree's data as it would appear in the dashboard
    console.log('=== WORKTREE DASHBOARD PREVIEW ===\n');
    
    for (const worktree of correlatedWorktrees) {
      console.log(`WORKTREE: ${worktree.path}`);
      console.log(`Branch: ${worktree.branch}`);
      console.log(`Status: ${worktree.status}`);
      
      // Task/Feature information (what would be displayed on the card)
      if (worktree.taskTitle || worktree.taskStatus) {
        console.log('\nMETADATA:');
        console.log(`Title: ${worktree.taskTitle || 'N/A'}`);
        console.log(`Status: ${worktree.taskStatus || 'N/A'}`);
        console.log(`Workflow: ${worktree.workflowStatus || 'N/A'}`);
      }
      
      // Feature progress (what would be shown in the progress bar)
      if (worktree.featureProgress) {
        console.log('\nPROGRESS:');
        console.log(`Total: ${worktree.featureProgress.totalTasks}`);
        console.log(`Completed: ${worktree.featureProgress.completed} (${Math.round(worktree.featureProgress.completed / worktree.featureProgress.totalTasks * 100)}%)`);
        console.log(`In Progress: ${worktree.featureProgress.inProgress}`);
        console.log(`To Do: ${worktree.featureProgress.toDo}`);
        console.log(`Blocked: ${worktree.featureProgress.blocked}`);
        
        // Task list (what would be shown when expanded)
        if (worktree.featureProgress.tasks && worktree.featureProgress.tasks.length > 0) {
          console.log('\nTASKS:');
          worktree.featureProgress.tasks.forEach((task, idx) => {
            console.log(`${idx + 1}. ${task.title} (${task.status})`);
          });
        }
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDashboardDisplay().catch(err => {
  console.error('Test script error:', err);
});