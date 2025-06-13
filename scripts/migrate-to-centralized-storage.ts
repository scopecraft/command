#!/usr/bin/env bun
/**
 * Script to migrate tasks from local .tasks/ directory to centralized storage
 * at ~/.scopecraft/projects/{encoded}/tasks/
 * 
 * Usage: bun scripts/migrate-to-centralized-storage.ts [options]
 * Options:
 *   --dry-run    Show what would be migrated without actually doing it
 *   --force      Overwrite existing files without prompting
 */

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { getTasksDirectory } from '../src/core/directory-utils.js';
import { parseTaskDocument } from '../src/core/task-parser.js';
import { WorktreePathResolver } from '../src/core/environment/worktree-path-resolver.js';

// Parse command line arguments
const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    'force': { type: 'boolean', default: false },
  },
});

const DRY_RUN = values['dry-run'] ?? false;
const FORCE = values['force'] ?? false;

interface TaskInfo {
  path: string;
  title: string;
  status: string;
  type: string;
}

/**
 * Calculate MD5 hash of a file
 */
function calculateMD5(filePath: string): string {
  const content = readFileSync(filePath);
  return createHash('md5').update(content).digest('hex');
}

/**
 * Extract task metadata from a task file
 */
function getTaskInfo(filePath: string): TaskInfo | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const parsed = parseTaskDocument(content);
    
    if (!parsed.frontmatter) {
      return null;
    }
    
    return {
      path: filePath,
      title: parsed.frontmatter.title || basename(filePath).replace('.task.md', ''),
      status: parsed.frontmatter.status || 'unknown',
      type: parsed.frontmatter.type || 'unknown',
    };
  } catch (error) {
    console.warn(`Failed to parse task ${filePath}:`, error);
    return null;
  }
}

/**
 * Recursively find all task files in a directory
 */
async function findTaskFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  if (!existsSync(dir)) {
    return files;
  }
  
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip hidden directories
      if (entry.name.startsWith('.')) continue;
      
      // Recursively search subdirectories
      const subFiles = await findTaskFiles(fullPath);
      files.push(...subFiles);
    } else if (entry.name.endsWith('.task.md') || entry.name === '_overview.md') {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Prompt user to choose between conflicting files
 */
async function promptConflictResolution(
  localTask: TaskInfo,
  centralTask: TaskInfo
): Promise<'local' | 'central' | 'skip'> {
  console.log('\n🔄 Conflict detected!');
  console.log('─'.repeat(50));
  
  console.log('📁 Local task:');
  console.log(`   Title: ${localTask.title}`);
  console.log(`   Status: ${localTask.status}`);
  console.log(`   Type: ${localTask.type}`);
  console.log(`   Path: ${localTask.path}`);
  
  console.log('\n📦 Central task:');
  console.log(`   Title: ${centralTask.title}`);
  console.log(`   Status: ${centralTask.status}`);
  console.log(`   Type: ${centralTask.type}`);
  console.log(`   Path: ${centralTask.path}`);
  
  console.log('\nChoose an option:');
  console.log('  1) Keep local version (overwrite central)');
  console.log('  2) Keep central version (skip local)');
  console.log('  3) Skip this file');
  
  const response = prompt('Enter your choice (1/2/3): ');
  
  switch (response) {
    case '1':
      return 'local';
    case '2':
      return 'central';
    case '3':
    default:
      return 'skip';
  }
}

/**
 * Migrate a single file
 */
async function migrateFile(
  sourcePath: string,
  targetPath: string,
  localRoot: string,
  centralRoot: string
): Promise<boolean | 'identical'> {
  // Ensure target directory exists
  const targetDir = dirname(targetPath);
  if (!DRY_RUN) {
    await mkdir(targetDir, { recursive: true });
  }
  
  // Check if target already exists
  if (existsSync(targetPath) && !FORCE) {
    // First check if files are identical via MD5
    try {
      const localMD5 = calculateMD5(sourcePath);
      const centralMD5 = calculateMD5(targetPath);
      
      if (localMD5 === centralMD5) {
        console.log(`✓ Identical file, skipping: ${basename(sourcePath)}`);
        return 'identical';
      }
    } catch (error) {
      // If MD5 comparison fails, continue with normal conflict resolution
      console.warn(`Could not compare MD5 hashes: ${error}`);
    }
    
    const localTask = getTaskInfo(sourcePath);
    const centralTask = getTaskInfo(targetPath);
    
    if (!localTask || !centralTask) {
      console.log(`⚠️  Skipping ${sourcePath} - could not parse metadata`);
      return false;
    }
    
    const resolution = await promptConflictResolution(localTask, centralTask);
    
    switch (resolution) {
      case 'local':
        console.log(`✓ Overwriting with local version: ${basename(sourcePath)}`);
        break;
      case 'central':
        console.log(`✓ Keeping central version: ${basename(sourcePath)}`);
        return false;
      case 'skip':
        console.log(`⏭️  Skipping: ${basename(sourcePath)}`);
        return false;
    }
  }
  
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would copy: ${sourcePath} → ${targetPath}`);
  } else {
    await copyFile(sourcePath, targetPath);
    console.log(`✓ Migrated: ${sourcePath.replace(localRoot, '.')} → ${targetPath.replace(centralRoot, '~/.scopecraft/...')}`);
  }
  
  return true;
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Task Storage Migration Tool');
  console.log('==============================\n');
  
  // Get project root
  const projectRoot = process.cwd();
  console.log(`📍 Project root: ${projectRoot}`);
  
  // Check if we're in a worktree and get main repo
  const resolver = new WorktreePathResolver();
  const mainRepo = resolver.getMainRepositoryRootSync();
  if (mainRepo !== projectRoot) {
    console.log(`🔀 Detected worktree - main repo: ${mainRepo}`);
  }
  
  // Get paths
  const localTasksDir = join(projectRoot, '.tasks');
  const centralTasksDir = getTasksDirectory(projectRoot);
  
  console.log(`📂 Local tasks: ${localTasksDir}`);
  console.log(`📦 Central storage: ${centralTasksDir}\n`);
  
  // Check if local .tasks exists
  if (!existsSync(localTasksDir)) {
    console.log('✅ No local .tasks directory found - nothing to migrate!');
    return;
  }
  
  // Find all task files
  const workflows = ['backlog', 'current', 'archive'];
  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalConflicts = 0;
  let totalIdentical = 0;
  
  for (const workflow of workflows) {
    const localWorkflowDir = join(localTasksDir, workflow);
    const centralWorkflowDir = join(centralTasksDir, workflow);
    
    if (!existsSync(localWorkflowDir)) {
      continue;
    }
    
    console.log(`\n📋 Processing ${workflow}...`);
    console.log('─'.repeat(30));
    
    const taskFiles = await findTaskFiles(localWorkflowDir);
    
    if (taskFiles.length === 0) {
      console.log('  No tasks found');
      continue;
    }
    
    for (const taskFile of taskFiles) {
      const relativePath = taskFile.replace(localWorkflowDir, '');
      const targetPath = join(centralWorkflowDir, relativePath);
      
      const result = await migrateFile(
        taskFile,
        targetPath,
        localTasksDir,
        centralTasksDir
      );
      
      if (result === 'identical') {
        totalIdentical++;
      } else if (result === true) {
        totalMigrated++;
      } else {
        totalSkipped++;
        if (existsSync(targetPath)) {
          totalConflicts++;
        }
      }
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 Migration Summary:');
  console.log(`   ✓ Migrated: ${totalMigrated} tasks`);
  console.log(`   ⏭️  Skipped: ${totalSkipped} tasks`);
  console.log(`   🔄 Conflicts resolved: ${totalConflicts} tasks`);
  console.log(`   🟰 Identical files: ${totalIdentical} tasks`);
  
  if (DRY_RUN) {
    console.log('\n⚠️  This was a DRY RUN - no files were actually migrated');
    console.log('Run without --dry-run to perform the actual migration');
  } else if (totalMigrated > 0) {
    console.log('\n✅ Migration complete!');
    console.log('You can now safely remove the local .tasks directory if desired');
  }
}

// Run the migration
migrate().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});