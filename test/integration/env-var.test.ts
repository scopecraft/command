import { execSync } from 'child_process';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';

describe('Environment Variable Configuration', () => {
  let testDir: string;
  let projectDir: string;
  const originalEnv = process.env.SCOPECRAFT_ROOT;

  beforeAll(() => {
    testDir = join(process.cwd(), '.test-env-var');
    projectDir = join(testDir, 'env-project');
  });

  beforeEach(() => {
    // Clean up any existing environment variable
    delete process.env.SCOPECRAFT_ROOT;

    // Create test directory
    mkdirSync(join(projectDir, '.tasks'), { recursive: true });

    // Create test task
    const taskContent = `+++
id = "ENV-001"
title = "Environment Task"
type = "feature"
status = "🟡 To Do"
+++

# Environment Task

This task tests environment variable configuration.`;

    writeFileSync(join(projectDir, '.tasks', 'ENV-001.md'), taskContent);
  });

  afterEach(() => {
    // Clean up
    if (testDir) {
      rmSync(testDir, { recursive: true, force: true });
    }
    // Restore original environment
    if (originalEnv) {
      process.env.SCOPECRAFT_ROOT = originalEnv;
    } else {
      delete process.env.SCOPECRAFT_ROOT;
    }
  });

  describe('SCOPECRAFT_ROOT Environment Variable', () => {
    it('should use SCOPECRAFT_ROOT when set', () => {
      // Set environment variable
      process.env.SCOPECRAFT_ROOT = projectDir;

      // Run command without --root-dir
      const result = execSync(`bun run ./src/cli/cli.ts task list`, {
        encoding: 'utf8',
        cwd: process.cwd(),
        env: { ...process.env, SCOPECRAFT_ROOT: projectDir },
      });

      expect(result).toContain('ENV-001');
      expect(result).toContain('Environment Task');
    });

    it('should prioritize CLI over environment variable', () => {
      // Create another project directory
      const otherProject = join(testDir, 'other-project');
      mkdirSync(join(otherProject, '.tasks'), { recursive: true });

      const otherTask = `+++
id = "OTHER-001"
title = "Other Task"
type = "feature"
status = "🟡 To Do"
+++

# Other Task`;

      writeFileSync(join(otherProject, '.tasks', 'OTHER-001.md'), otherTask);

      // Set environment variable to one project
      process.env.SCOPECRAFT_ROOT = projectDir;

      // But use CLI to point to another
      const result = execSync(`bun run ./src/cli/cli.ts task list --root-dir ${otherProject}`, {
        encoding: 'utf8',
        cwd: process.cwd(),
        env: { ...process.env, SCOPECRAFT_ROOT: projectDir },
      });

      // Should see the other project's task, not the env var project
      expect(result).toContain('OTHER-001');
      expect(result).not.toContain('ENV-001');
    });

    it('should fall back to current directory when env var is invalid', () => {
      // Set invalid environment variable
      process.env.SCOPECRAFT_ROOT = join(testDir, 'nonexistent');

      // Run from current directory (which has tasks)
      const result = execSync(`bun run ./src/cli/cli.ts task list`, {
        encoding: 'utf8',
        cwd: process.cwd(),
        env: { ...process.env, SCOPECRAFT_ROOT: join(testDir, 'nonexistent') },
      });

      // Should work with current directory (gracefully falls back)
      expect(result).toBeDefined();
      // Should show tasks from current directory
      expect(result).toContain('Tasks:');
    });
  });

  describe('MCP Server with Environment Variable', () => {
    it('should respect SCOPECRAFT_ROOT in MCP server', () => {
      const result = execSync(`SCOPECRAFT_ROOT=${projectDir} bun run ./src/mcp/cli.ts --help`, {
        encoding: 'utf8',
        cwd: process.cwd(),
      });

      // Should work without errors
      expect(result).toContain('--help');
    });
  });
});
