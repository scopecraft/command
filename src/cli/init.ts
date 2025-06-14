/**
 * Initialization command
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ConfigurationManager } from '../core/config/configuration-manager.js';
import { WorktreePathResolver } from '../core/environment/worktree-path-resolver.js';
import * as core from '../core/index.js';
import { PATH_TYPES, createPathContext, resolvePath } from '../core/paths/path-resolver.js';
import { TaskStoragePathEncoder } from '../core/task-storage-path-encoder.js';

export async function handleInitCommand(options: {
  mode?: string;
  rootDir?: string;
  override?: boolean; // For testing
  force?: boolean; // Force re-initialization
}): Promise<void> {
  try {
    const initRoot = options.rootDir || process.cwd();

    // Simple check: does the centralized tasks directory exist?
    if (!options.force && !options.override) {
      const context = createPathContext(initRoot, { override: options.override });
      const tasksDir = resolvePath(PATH_TYPES.TASKS, context);

      if (existsSync(tasksDir)) {
        console.log('✓ Project already initialized');
        console.log('Use --force to reinitialize');
        return;
      }
    }

    // Initialize project structure with override option
    const config = options.override ? { override: true } : undefined;
    core.initializeProjectStructure(initRoot, config);

    // Get the encoded project path for display
    let mainRepoRoot: string;
    let encoded: string;

    if (options.override) {
      // For override/testing, use the init root directly
      mainRepoRoot = initRoot;
      encoded = TaskStoragePathEncoder.encode(initRoot);
    } else {
      const resolver = new WorktreePathResolver();
      mainRepoRoot = resolver.getMainRepositoryRootSync();
      encoded = TaskStoragePathEncoder.encode(mainRepoRoot);
    }

    console.log('\n🚀 Welcome to Scopecraft!\n');
    console.log(`Initialized project in: ${initRoot}`);
    console.log('✓ Created hybrid storage structure:');
    console.log('\n📁 Repository (.tasks/):');
    console.log('  .tasks/.templates/  📝 Task templates');
    console.log('  .tasks/.modes/      🎯 AI execution modes');
    console.log('\n🤖 Claude Integration:');
    console.log('  .claude/commands/   📋 Mode management commands');
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

    console.log('\n🎯 Next Steps - Initialize Your Modes:');
    console.log('');
    console.log('1. 🏗 Initialize modes for your project:');
    console.log('   Run: claude "/project:mode-init YourProjectName"');
    console.log('   (This will customize the templates for your project type)');
    console.log('');
    console.log('2. 🎯 Add specific guidance as needed:');
    console.log('   claude "/project:mode-update exploration guidance Add-domain-patterns"');
    console.log('   claude "/project:mode-update implementation area-specific Add-React-patterns"');
    console.log('');
    console.log('3. 🧪 Validate your setup:');
    console.log('   claude "/project:mode-baseline initial-setup"');
    console.log('   (Tests your modes against diverse scenarios)');
    console.log('');
    console.log('💡 The commands will analyze your project and customize the');
    console.log('   modes automatically. No manual editing required!');
    console.log('');
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
