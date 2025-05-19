/**
 * Tests for MCP configuration commands
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ConfigurationManager } from '../src/core/config/configuration-manager.js';
import { handleGetCurrentRoot, handleInitRoot, handleListProjects } from '../src/mcp/handlers.js';

describe('MCP Configuration Commands', () => {
  let configManager: ConfigurationManager;
  let testDir: string;
  let testProjectDir: string;

  beforeEach(() => {
    // Clear singleton instance for fresh tests
    (ConfigurationManager as any).instance = null;
    configManager = ConfigurationManager.getInstance();

    // Create test directories
    testDir = path.join(os.tmpdir(), 'mcp-config-test');
    testProjectDir = path.join(testDir, 'test-project');

    fs.mkdirSync(testDir, { recursive: true });
    fs.mkdirSync(path.join(testProjectDir, '.tasks'), { recursive: true });
  });

  afterEach(() => {
    // Clean up test directories
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe('init_root command', () => {
    it('should set project root successfully', async () => {
      const result = await handleInitRoot({ path: testProjectDir });

      expect(result.success).toBe(true);
      expect(result.data?.path).toBe(testProjectDir);
      expect(result.data?.source).toBe('session');
      expect(result.data?.validated).toBe(true);
      expect(result.message).toContain('Successfully set project root');
    });

    it('should reject invalid project root', async () => {
      const invalidPath = path.join(testDir, 'invalid-project');
      const result = await handleInitRoot({ path: invalidPath });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid project root');
      expect(result.error).toContain('does not contain .tasks or .ruru directory');
    });

    it('should persist root in current session', async () => {
      await handleInitRoot({ path: testProjectDir });

      const rootConfig = configManager.getRootConfig();
      expect(rootConfig.path).toBe(testProjectDir);
      expect(rootConfig.source).toBe('session');
    });
  });

  describe('get_current_root command', () => {
    it('should return current root configuration', async () => {
      await handleInitRoot({ path: testProjectDir });

      const result = await handleGetCurrentRoot({});

      expect(result.success).toBe(true);
      expect(result.data?.path).toBe(testProjectDir);
      expect(result.data?.source).toBe('session');
      expect(result.data?.validated).toBe(true);
      expect(result.message).toContain('Current root:');
    });

    it('should return auto-detected root when no session is set', async () => {
      const result = await handleGetCurrentRoot({});

      expect(result.success).toBe(true);
      expect(result.data?.source).toBe('auto_detect');
    });
  });

  describe('list_projects command', () => {
    it('should list configured projects from config file', async () => {
      // Create a test config file
      const configDir = path.join(os.tmpdir(), '.scopecraft');
      const configFile = path.join(configDir, 'config.json');

      fs.mkdirSync(configDir, { recursive: true });

      const config = {
        version: '1.0.0',
        projects: [
          { name: 'project1', path: '/path/to/project1', description: 'Test project 1' },
          { name: 'project2', path: '/path/to/project2', description: 'Test project 2' },
        ],
        defaultProject: 'project1',
      };

      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

      // Override HOME for testing
      const originalHome = process.env.HOME;
      process.env.HOME = os.tmpdir();

      try {
        // Create fresh instance with test HOME
        (ConfigurationManager as any).instance = null;
        const result = await handleListProjects({});

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data?.[0].name).toBe('project1');
        expect(result.data?.[1].name).toBe('project2');
        expect(result.message).toContain('Found 2 configured projects');
      } finally {
        // Restore original HOME
        process.env.HOME = originalHome;
        // Clean up test config
        fs.rmSync(configDir, { recursive: true, force: true });
      }
    });

    it('should return empty array when no config file exists', async () => {
      const result = await handleListProjects({});

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.message).toContain('Found 0 configured projects');
    });
  });

  describe('Integration with other commands', () => {
    it('should use configured root for task operations', async () => {
      await handleInitRoot({ path: testProjectDir });

      // Create a test task in the configured project
      const taskPath = path.join(testProjectDir, '.tasks', 'TEST-001.md');
      const taskContent = `+++
id = "TEST-001"
title = "Test Task"
type = "test"
status = "🟡 To Do"
+++

# Test Task`;

      fs.writeFileSync(taskPath, taskContent);

      // Now task operations should use the configured root
      const { listTasks } = await import('../src/core/index.js');
      const result = await listTasks({});

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].metadata.id).toBe('TEST-001');
    });
  });
});
