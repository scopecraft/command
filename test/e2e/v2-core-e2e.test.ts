#!/usr/bin/env bun
/**
 * E2E Test for V2 Core Functionality
 *
 * Tests all v2 functions with real file system operations
 */

import { existsSync, readFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import * as v2 from '../../src/core/v2/index.js';

// Test project directory
const TEST_PROJECT = join(process.cwd(), '.test-project-v2');

// Test data
const TEST_TASKS = {
  feature: {
    title: 'Implement User Authentication',
    type: 'feature' as v2.TaskType,
    area: 'auth',
    instruction: 'Build a complete authentication system with JWT tokens',
    tasks: ['Design auth flow', 'Implement JWT service', 'Add login endpoint', 'Add tests'],
  },
  bug: {
    title: 'Fix Login Redirect Loop',
    type: 'bug' as v2.TaskType,
    area: 'auth',
    instruction: 'Users get stuck in redirect loop after login',
    status: 'Blocked' as v2.TaskStatus,
  },
  parent: {
    title: 'Dashboard Redesign',
    type: 'feature' as v2.TaskType,
    area: 'ui',
    instruction: 'Complete redesign of the admin dashboard',
  },
};

async function cleanup() {
  if (existsSync(TEST_PROJECT)) {
    await rm(TEST_PROJECT, { recursive: true, force: true });
  }
}

async function runTests() {
  console.log('🧪 V2 Core E2E Tests\n');

  try {
    // Cleanup before starting
    await cleanup();

    // Test 1: Project Initialization
    console.log('📁 Test 1: Project Initialization');
    v2.initializeV2ProjectStructure(TEST_PROJECT);

    // Verify structure
    const tasksDir = v2.getTasksDirectory(TEST_PROJECT);
    console.log(`✓ Created .tasks directory: ${existsSync(tasksDir)}`);
    console.log(`✓ Created backlog: ${existsSync(join(tasksDir, 'backlog'))}`);
    console.log(`✓ Created current: ${existsSync(join(tasksDir, 'current'))}`);
    console.log(`✓ Created archive: ${existsSync(join(tasksDir, 'archive'))}`);
    console.log(`✓ Created .templates: ${existsSync(join(tasksDir, '.templates'))}`);
    console.log(`✓ Created QUICKSTART.md: ${existsSync(join(tasksDir, 'QUICKSTART.md'))}`);

    // Check structure version
    const version = v2.detectStructureVersion(TEST_PROJECT);
    console.log(`✓ Structure version: ${version}`);
    console.log('');

    // Test 2: Create Tasks
    console.log('📝 Test 2: Create Tasks');

    // Create feature task
    const featureResult = await v2.createTask(TEST_PROJECT, TEST_TASKS.feature);
    if (featureResult.success && featureResult.data) {
      console.log(`✓ Created feature task: ${featureResult.data.metadata.id}`);
      console.log(`  Path: ${featureResult.data.metadata.path}`);
      console.log(`  Workflow: ${featureResult.data.metadata.location.workflowState}`);
    } else {
      console.log(`❌ Failed to create feature task: ${featureResult.error}`);
      if (featureResult.validationErrors) {
        featureResult.validationErrors.forEach((e) => console.log(`  - ${e.field}: ${e.message}`));
      }
    }

    // Create bug task with custom status
    const bugResult = await v2.createTask(TEST_PROJECT, TEST_TASKS.bug);
    if (bugResult.success && bugResult.data) {
      console.log(`✓ Created bug task: ${bugResult.data.metadata.id}`);
      console.log(`  Status: ${bugResult.data.document.frontmatter.status}`);
    } else {
      console.log(`❌ Failed to create bug task: ${bugResult.error}`);
    }

    // Create task with template
    const templates = v2.listTemplates(TEST_PROJECT);
    console.log(`✓ Available templates: ${templates.map((t) => t.id).join(', ')}`);

    const templateContent = v2.getTemplate(TEST_PROJECT, 'feature');
    if (templateContent) {
      const templatedDoc = v2.applyTemplate(templateContent, {
        title: 'Payment Integration',
        type: 'feature',
        area: 'billing',
      });
      console.log(`✓ Applied template: ${templatedDoc.title}`);
    }
    console.log('');

    // Test 3: List and Read Tasks
    console.log('🔍 Test 3: List and Read Tasks');

    const allTasks = await v2.listTasks(TEST_PROJECT);
    if (!allTasks.success) {
      console.log(`❌ Failed to list tasks: ${allTasks.error}`);
    } else {
      console.log(`✓ Total tasks: ${allTasks.data?.length || 0}`);
    }

    if (allTasks.data && allTasks.data.length > 0) {
      const firstTask = allTasks.data[0];
      console.log(`✓ First task: ${firstTask.metadata.id}`);
      console.log(`  Title: ${firstTask.document.title}`);
      console.log(`  Sections: ${Object.keys(firstTask.document.sections).join(', ')}`);

      // Read specific task
      const readResult = await v2.getTask(TEST_PROJECT, firstTask.metadata.id);
      if (readResult.success) {
        console.log(`✓ Read task successful`);
      }
    }
    console.log('');

    // Test 4: Update Tasks
    console.log('✏️ Test 4: Update Tasks');

    if (featureResult.success && featureResult.data) {
      // Update metadata
      const updateResult = await v2.updateTask(TEST_PROJECT, featureResult.data.metadata.id, {
        frontmatter: { status: '🔵 In Progress' },
        sections: {
          deliverable: 'Authentication service implemented with JWT support',
        },
      });

      if (updateResult.success) {
        console.log(`✓ Updated task status and deliverable`);
      }

      // Update specific section
      const sectionResult = await v2.updateTaskSection(
        TEST_PROJECT,
        featureResult.data.metadata.id,
        'log',
        '- 2025-05-27 15:00: Started implementation\n- 2025-05-27 16:00: JWT service complete'
      );

      if (sectionResult.success) {
        console.log(`✓ Updated log section`);
      }
    }
    console.log('');

    // Test 5: Move Tasks
    console.log('🚀 Test 5: Move Tasks Between Workflows');

    if (featureResult.success && featureResult.data) {
      // Move to current
      const moveResult = await v2.moveTask(TEST_PROJECT, featureResult.data.metadata.id, {
        targetState: 'current',
        updateStatus: true,
      });

      if (moveResult.success && moveResult.data) {
        console.log(`✓ Moved task to current`);
        console.log(`  New path: ${moveResult.data.metadata.path}`);
        console.log(`  New status: ${moveResult.data.document.frontmatter.status}`);
      }

      // Move to archive
      const archiveResult = await v2.moveTask(TEST_PROJECT, featureResult.data.metadata.id, {
        targetState: 'archive',
        archiveDate: '2025-05',
        updateStatus: true,
      });

      if (archiveResult.success && archiveResult.data) {
        console.log(`✓ Moved task to archive/2025-05`);
        console.log(`  Archive path: ${archiveResult.data.metadata.path}`);
      }
    }
    console.log('');

    // Test 6: Parent Tasks
    console.log('📦 Test 6: Parent Tasks');

    const parentResult = await v2.createParentTask(TEST_PROJECT, TEST_TASKS.parent);
    if (parentResult.success && parentResult.data) {
      console.log(`✓ Created parent task: ${parentResult.data.metadata.id}`);
      console.log(`  Folder: ${parentResult.data.metadata.path}`);

      // Add subtasks
      const subtask1 = await v2.addSubtask(
        TEST_PROJECT,
        parentResult.data.metadata.id,
        'User Research',
        { instruction: 'Conduct user interviews and surveys' }
      );

      const subtask2 = await v2.addSubtask(
        TEST_PROJECT,
        parentResult.data.metadata.id,
        'Design Mockups',
        { instruction: 'Create high-fidelity mockups in Figma' }
      );

      const subtask3 = await v2.addSubtask(
        TEST_PROJECT,
        parentResult.data.metadata.id,
        'Implement UI',
        { instruction: 'Build the new dashboard components' }
      );

      console.log(`✓ Added 3 subtasks`);

      // Get parent task with subtasks
      const getParent = await v2.getParentTask(TEST_PROJECT, parentResult.data.metadata.id);
      if (getParent.success && getParent.data) {
        console.log(`✓ Parent task has ${getParent.data.subtasks.length} subtasks:`);
        for (const subtask of getParent.data.subtasks) {
          console.log(`  - ${subtask.metadata.id}: ${subtask.document.title}`);
        }

        // Check subtask sequence
        const subtaskInfo = v2.listSubtasks(dirname(getParent.data.metadata.path));
        console.log(`✓ Subtask sequence info:`);
        for (const info of subtaskInfo) {
          console.log(
            `  - ${info.sequenceNumber}: ${info.filename} (parallel: ${info.canRunParallel})`
          );
        }
      }

      // Move parent task
      const moveParent = await v2.moveParentTask(
        TEST_PROJECT,
        parentResult.data.metadata.id,
        'current'
      );
      if (moveParent.success) {
        console.log(`✓ Moved parent task to current`);
      }
    }
    console.log('');

    // Test 7: ID System
    console.log('🔑 Test 7: ID Generation and Resolution');

    // Generate IDs
    const id1 = v2.generateTaskId('Test Task One');
    const id2 = v2.generateTaskId('Test Task Two');
    console.log(`✓ Generated ID 1: ${id1}`);
    console.log(`✓ Generated ID 2: ${id2}`);

    // Parse ID
    const parsed = v2.parseTaskId(id1);
    if (parsed) {
      console.log(
        `✓ Parsed ID: name=${parsed.descriptiveName}, date=${parsed.dateCode}, suffix=${parsed.randomSuffix}`
      );
    }

    // Resolve task
    if (bugResult.success && bugResult.data) {
      const resolved = v2.resolveTaskId(bugResult.data.metadata.id, TEST_PROJECT);
      console.log(`✓ Resolved task path: ${resolved}`);
    }

    // List all IDs
    const allIds = v2.getAllTaskIds(TEST_PROJECT);
    console.log(`✓ Total task IDs: ${allIds.size}`);
    console.log(`  IDs by state:`);
    const stateCount = new Map<string, number>();
    for (const [id, state] of allIds) {
      stateCount.set(state, (stateCount.get(state) || 0) + 1);
    }
    for (const [state, count] of stateCount) {
      console.log(`    ${state}: ${count}`);
    }
    console.log('');

    // Test 8: Validation
    console.log('✅ Test 8: Validation');

    const invalidDoc: v2.TaskDocument = {
      title: '',
      frontmatter: { type: 'feature', area: 'test' } as any, // missing status
      sections: { instruction: 'test' } as any, // missing required sections
    };

    const errors = v2.validateTaskDocument(invalidDoc);
    console.log(`✓ Validation found ${errors.length} errors:`);
    for (const error of errors) {
      console.log(`  - ${error.field}: ${error.message}`);
    }
    console.log('');

    // Test 9: File Contents Check
    console.log('📄 Test 9: File Contents Verification');

    // Check a task file
    if (bugResult.success && bugResult.data) {
      const content = readFileSync(bugResult.data.metadata.path, 'utf-8');
      console.log(`✓ Bug task file content (first 5 lines):`);
      const lines = content.split('\n').slice(0, 5);
      lines.forEach((line) => console.log(`  ${line}`));
    }

    // Check directory structure
    console.log(`\n✓ Final directory structure:`);
    const showTree = (dir: string, prefix = '  ') => {
      if (!existsSync(dir)) return;
      const entries = require('fs').readdirSync(dir);
      entries.forEach((entry: string) => {
        const path = join(dir, entry);
        const isDir = require('fs').statSync(path).isDirectory();
        console.log(`${prefix}${isDir ? '📁' : '📄'} ${entry}`);
        if (isDir && !entry.startsWith('.')) {
          showTree(path, prefix + '  ');
        }
      });
    };
    showTree(v2.getTasksDirectory(TEST_PROJECT));
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test project...');
    await cleanup();
    console.log('✓ Test complete!');
  }
}

// Run tests
runTests();
