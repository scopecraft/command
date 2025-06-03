#!/usr/bin/env bun

/**
 * Script to normalize all task metadata by reading and re-saving through core
 * This ensures all values go through the proper normalization process
 */

import * as path from 'path';
import * as fs from 'fs';
import * as core from '../src/core/index.js';
import { ConfigurationManager } from '../src/core/config/configuration-manager.js';

async function findFiles(dir: string, pattern: RegExp): Promise<string[]> {
  const results: string[] = [];
  
  async function walk(currentDir: string) {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.push(fullPath);
      }
    }
  }
  
  await walk(dir);
  return results;
}

async function normalizeAllTasks() {
  console.log('🔄 Starting task normalization process...\n');

  const configManager = ConfigurationManager.getInstance();
  const projectRoot = configManager.getRootConfig().path;
  const tasksDir = path.join(projectRoot, '.tasks');

  // Find all task files
  const taskFiles = await findFiles(tasksDir, /\.task\.md$/);
  const overviewFiles = await findFiles(tasksDir, /_overview\.md$/);
  
  const allFiles = [...taskFiles, ...overviewFiles];
  console.log(`Found ${allFiles.length} task files to normalize\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ file: string; error: string }> = [];

  for (const filePath of allFiles) {
    const relativePath = path.relative(tasksDir, filePath);
    
    try {
      // Extract task ID from filename
      const filename = path.basename(filePath);
      const taskId = filename.replace(/\.(task\.md|_overview\.md)$/, '');
      
      // Determine if it's a subtask by checking parent directory
      const parentDir = path.basename(path.dirname(filePath));
      const isSubtask = parentDir !== 'backlog' && parentDir !== 'current' && parentDir !== 'archive';
      const parentId = isSubtask ? parentDir : undefined;

      // Get the task using core
      const result = await core.get(projectRoot, taskId, undefined, parentId);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to read task');
      }

      const task = result.data;

      // Build update options with only defined values
      const updateOptions: core.TaskUpdateOptions = {
        title: task.document.title,
        frontmatter: {},
        sections: {},
      };

      // Only include defined frontmatter fields
      if (task.document.frontmatter.type !== undefined) {
        updateOptions.frontmatter!.type = task.document.frontmatter.type;
      }
      if (task.document.frontmatter.status !== undefined) {
        updateOptions.frontmatter!.status = task.document.frontmatter.status;
      }
      if (task.document.frontmatter.priority !== undefined) {
        updateOptions.frontmatter!.priority = task.document.frontmatter.priority;
      }
      if (task.document.frontmatter.area !== undefined) {
        updateOptions.frontmatter!.area = task.document.frontmatter.area;
      }
      if (task.document.frontmatter.tags !== undefined) {
        updateOptions.frontmatter!.tags = task.document.frontmatter.tags;
      }
      if (task.document.frontmatter.assignee !== undefined) {
        updateOptions.frontmatter!.assignee = task.document.frontmatter.assignee;
      }

      // Only include defined sections
      if (task.document.sections.instruction !== undefined) {
        updateOptions.sections!.instruction = task.document.sections.instruction;
      }
      if (task.document.sections.tasks !== undefined) {
        updateOptions.sections!.tasks = task.document.sections.tasks;
      }
      if (task.document.sections.deliverable !== undefined) {
        updateOptions.sections!.deliverable = task.document.sections.deliverable;
      }
      if (task.document.sections.log !== undefined) {
        updateOptions.sections!.log = task.document.sections.log;
      }

      // Re-save the task using core update
      // This will normalize all values through the core normalizers
      const updateResult = await core.update(
        projectRoot,
        taskId,
        updateOptions,
        undefined,
        parentId
      );

      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update task');
      }

      console.log(`✅ Normalized: ${relativePath}`);
      successCount++;
    } catch (error) {
      console.log(`❌ Failed: ${relativePath} - ${error}`);
      errorCount++;
      errors.push({
        file: relativePath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully normalized: ${successCount} tasks`);
  console.log(`❌ Failed: ${errorCount} tasks`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }

  console.log('\n✨ Normalization complete!');
}

// Run the script
normalizeAllTasks().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});