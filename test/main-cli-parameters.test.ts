/**
 * Tests for main CLI parameter handling
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { exec } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

describe('Main CLI Parameters', () => {
  const testDir = path.join(os.tmpdir(), 'scopecraft-cli-test');
  const testProjectDir = path.join(testDir, 'test-project');
  const anotherProjectDir = path.join(testDir, 'another-project');
  const configFile = path.join(testDir, 'config.json');
  const cliPath = path.join(process.cwd(), 'src/cli/cli.ts');

  beforeEach(async () => {
    // Create test directories
    await fs.promises.mkdir(testDir, { recursive: true });
    await fs.promises.mkdir(path.join(testProjectDir, '.tasks', 'test-phase'), { recursive: true });
    await fs.promises.mkdir(path.join(anotherProjectDir, '.tasks'), { recursive: true });

    // Create test task
    const taskContent = `+++
id = "TEST-001"
title = "Test Task"
type = "test"
status = "🟡 To Do"
created_date = "2025-05-18"
phase = "test-phase"
+++

# Test Task

This is a test task.`;

    await fs.promises.writeFile(
      path.join(testProjectDir, '.tasks', 'test-phase', 'TEST-001.md'),
      taskContent
    );

    // Create phases file
    await fs.promises.mkdir(path.join(testProjectDir, '.tasks', 'phases'), { recursive: true });
    await fs.promises.writeFile(
      path.join(testProjectDir, '.tasks', 'phases', 'phases.txt'),
      'test-phase'
    );

    // Create config file
    const config = {
      version: '1.0.0',
      projects: [
        {
          name: 'test-project',
          path: testProjectDir,
          description: 'Test project',
        },
      ],
      defaultProject: 'test-project',
    };

    await fs.promises.writeFile(configFile, JSON.stringify(config, null, 2));
  });

  afterEach(async () => {
    // Clean up test directories
    await fs.promises.rm(testDir, { recursive: true, force: true });
  });

  it('should use --root-dir parameter', async () => {
    const { stdout } = await execAsync(`bun ${cliPath} --root-dir ${testProjectDir} task list`);

    expect(stdout).toContain('Using project root from CLI:');
    expect(stdout).toContain('TEST-001');
    expect(stdout).toContain('Test Task');
  });

  it('should use --config parameter', async () => {
    const { stdout } = await execAsync(`bun ${cliPath} --config ${configFile} task list`);

    expect(stdout).toContain('Using config file:');
    expect(stdout).toContain('TEST-001');
    expect(stdout).toContain('Test Task');
  });

  it('should prioritize --root-dir over --config', async () => {
    const { stdout } = await execAsync(
      `bun ${cliPath} --config ${configFile} --root-dir ${anotherProjectDir} task list`
    );

    expect(stdout).toContain('Using project root from CLI:');
    expect(stdout).toContain('Using config file:');
    expect(stdout).toContain('No tasks found matching the criteria');
  });

  it('should show parameters in help', async () => {
    const { stdout } = await execAsync(`bun ${cliPath} --help`);

    expect(stdout).toContain('--root-dir <path>');
    expect(stdout).toContain('Set project root directory');
    expect(stdout).toContain('--config <path>');
    expect(stdout).toContain('Path to configuration file');
  });
});
