/**
 * V2-aware initialization command
 */
import path from 'node:path';
import { ConfigurationManager } from '../core/config/configuration-manager.js';
import * as v2 from '../core/index.js';

export async function handleInitV2Command(options: {
  mode?: string;
  rootDir?: string;
  v2?: boolean;
}): Promise<void> {
  try {
    const initRoot = options.rootDir || process.cwd();

    console.log('DEBUG: handleInitV2Command called with options:', options);

    // Check current structure
    const structureVersion = v2.detectStructureVersion(initRoot);

    if (structureVersion !== 'none') {
      console.log(`✓ Project already initialized with ${structureVersion} structure`);

      if (structureVersion === 'v1' && options.v2) {
        console.log('\n⚠️  This project uses v1 structure (phases).');
        console.log('Migration from v1 to v2 is not yet implemented.');
        console.log('\nV2 features:');
        console.log('  - Workflow-based organization (backlog → current → archive)');
        console.log('  - Parent tasks (folder-based tasks with subtasks)');
        console.log('  - Automatic status updates on workflow transitions');
      }
      return;
    }

    // Default to v2 for new projects
    const useV2 = options.v2 !== false;

    if (useV2) {
      // Initialize v2 structure
      v2.initializeV2ProjectStructure(initRoot);

      console.log('\n🚀 Welcome to Scopecraft v2!\n');
      console.log(`Initialized project in: ${initRoot}`);
      console.log('✓ Created v2 workflow structure:');
      console.log('  .tasks/backlog/     📋 Tasks waiting to be worked on');
      console.log('  .tasks/current/     🚀 Tasks actively being worked on');
      console.log('  .tasks/archive/     ✅ Completed tasks (organized by date)');
      console.log('  .tasks/.templates/  📝 Task templates');
      console.log('✓ Generated quick start guide\n');

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
    } else {
      // Fall back to v1 initialization
      console.log('Initializing v1 structure (phase-based)...');
      const { projectConfig, initializeTemplates } = await import('../core/index.js');
      projectConfig.initializeProjectStructure();
      initializeTemplates();

      console.log('\n🚀 Welcome to Scopecraft Command!\n');
      console.log('✓ Created v1 structure with phases');
      console.log('✓ Installed task templates');
      console.log('\nConsider using v2 for new projects: sc init --v2');
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}
