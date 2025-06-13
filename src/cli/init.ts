/**
 * Initialization command
 */
import path from 'node:path';
import { ConfigurationManager } from '../core/config/configuration-manager.js';
import { WorktreePathResolver } from '../core/environment/worktree-path-resolver.js';
import * as core from '../core/index.js';
import { TaskStoragePathEncoder } from '../core/task-storage-path-encoder.js';

export async function handleInitCommand(options: {
  mode?: string;
  rootDir?: string;
}): Promise<void> {
  try {
    const initRoot = options.rootDir || process.cwd();

    console.log('DEBUG: handleInitCommand called with options:', options);

    // Check current structure
    const structureVersion = core.detectStructureVersion(initRoot);

    if (structureVersion !== 'none') {
      console.log(`✓ Project already initialized with ${structureVersion} structure`);

      if (structureVersion === 'v1') {
        console.log('\n⚠️  This project uses v1 structure (phases).');
        console.log('Migration from v1 is not yet implemented.');
        console.log('\nCurrent features:');
        console.log('  - Workflow-based organization (backlog → current → archive)');
        console.log('  - Parent tasks (folder-based tasks with subtasks)');
        console.log('  - Automatic status updates on workflow transitions');
      }
      return;
    }

    // Initialize project structure
    core.initializeProjectStructure(initRoot);

    // Get the encoded project path for display
    const resolver = new WorktreePathResolver();
    const mainRepoRoot = resolver.getMainRepositoryRootSync();
    const encoded = TaskStoragePathEncoder.encode(mainRepoRoot);

    console.log('\n🚀 Welcome to Scopecraft!\n');
    console.log(`Initialized project in: ${initRoot}`);
    console.log('✓ Created hybrid storage structure:');
    console.log('\n📁 Repository (.tasks/):');
    console.log('  .tasks/.templates/  📝 Task templates');
    console.log('  .tasks/.modes/      🎯 Execution modes');
    console.log('\n☁️  Centralized Storage:');
    console.log(`  ~/.scopecraft/projects/${encoded}/`);
    console.log('  └── tasks/');
    console.log('      ├── backlog/    📋 Tasks waiting to be worked on');
    console.log('      ├── current/    🚀 Tasks actively being worked on');
    console.log('      └── archive/    ✅ Completed tasks (organized by date)');
    console.log('\n✓ Ready to start!\n');

    console.log('🎯 Next Steps:');
    console.log('  1. Create your first task:');
    console.log('     sc task create --title "My first task" --type feature');
    console.log('  2. List tasks:');
    console.log('     sc task list');
    console.log('  3. Move task to current:');
    console.log('     sc workflow promote <task-id>');
    console.log('  4. Find next task:');
    console.log('     sc workflow next\n');

    console.log('📚 Learn more:');
    console.log('  - Workflow guide: .tasks/QUICKSTART.md');
    console.log('  - Templates: .tasks/.templates/');
    console.log('  - Documentation: https://github.com/scopecraft/scopecraft-command\n');

    // Update configuration if needed
    if (options.rootDir) {
      const configManager = ConfigurationManager.getInstance();
      configManager.setRootFromCLI(options.rootDir);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}
