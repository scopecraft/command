/**
 * Integration tests for configuration system
 */

import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ConfigurationManager } from '../src/core/config/configuration-manager.js';
import { ENV_VARS } from '../src/core/config/types.js';
import { listTasks } from '../src/core/task-manager/task-crud.js';

describe('Configuration Integration', () => {
  let originalCwd: string;
  let tempDir: string;
  let originalHome: string;

  beforeEach(() => {
    // Save original state
    originalCwd = process.cwd();
    originalHome = process.env.HOME || '';
    
    // Create temp directories
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scopecraft-test-'));
  });

  afterEach(() => {
    // Restore original state
    process.chdir(originalCwd);
    process.env.HOME = originalHome;
    delete process.env[ENV_VARS.SCOPECRAFT_ROOT];
    
    // Clean up temp directories
    fs.rmSync(tempDir, { recursive: true, force: true });
    
    // Clear singleton
    // @ts-ignore
    ConfigurationManager.instance = undefined;
  });

  describe('Runtime Config in Functions', () => {
    it('should use runtime config for listTasks', async () => {
      // Create two different projects
      const project1 = path.join(tempDir, 'project1');
      const project2 = path.join(tempDir, 'project2');
      
      fs.mkdirSync(path.join(project1, '.tasks'), { recursive: true });
      fs.mkdirSync(path.join(project2, '.tasks'), { recursive: true });
      
      // Create a task in project1
      const task1Path = path.join(project1, '.tasks', 'task1.md');
      fs.writeFileSync(task1Path, `+++
id = "task-1"
title = "Task 1"
+++

Task 1 content`);
      
      // Create a task in project2
      const task2Path = path.join(project2, '.tasks', 'task2.md');
      fs.writeFileSync(task2Path, `+++
id = "task-2"
title = "Task 2"
+++

Task 2 content`);
      
      // List tasks from project1 using runtime config
      const result1 = await listTasks({ config: { rootPath: project1 } });
      expect(result1.success).toBe(true);
      expect(result1.data).toHaveLength(1);
      expect(result1.data?.[0].metadata.id).toBe('task-1');
      
      // List tasks from project2 using runtime config
      const result2 = await listTasks({ config: { rootPath: project2 } });
      expect(result2.success).toBe(true);
      expect(result2.data).toHaveLength(1);
      expect(result2.data?.[0].metadata.id).toBe('task-2');
    });

    it('should use environment variable when no runtime config', async () => {
      const project = path.join(tempDir, 'env-project');
      fs.mkdirSync(path.join(project, '.tasks'), { recursive: true });
      
      const taskPath = path.join(project, '.tasks', 'env-task.md');
      fs.writeFileSync(taskPath, `+++
id = "env-task"
title = "Environment Task"
+++

Environment task content`);
      
      // Set environment variable
      process.env[ENV_VARS.SCOPECRAFT_ROOT] = project;
      
      // List tasks without runtime config
      const result = await listTasks();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].metadata.id).toBe('env-task');
    });
  });
});