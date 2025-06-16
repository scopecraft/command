/**
 * Tests for sc init mode templates functionality
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { handleInitCommand } from '../../src/cli/init.js';
import { directoryPathCache, pathContextCache } from '../../src/core/paths/cache.js';
import { createPathContext, getModesPath } from '../../src/core/paths/path-resolver.js';

describe('sc init - mode templates', () => {
  // Use a test project in /tmp to ensure complete isolation from the real project
  const testProjectRoot = join(
    '/tmp',
    `scopecraft-init-test-${Date.now()}-${Math.random().toString(36).substring(7)}`
  );
  let originalHome: string | undefined;
  let testHome: string;

  beforeEach(() => {
    // Override HOME for test isolation
    originalHome = process.env.HOME;
    testHome = join('/tmp', `.scopecraft-test-home-${Date.now()}`);
    process.env.HOME = testHome;

    // Clear caches to ensure clean state
    pathContextCache.clear();
    directoryPathCache.clear();

    // Create fresh test directory
    mkdirSync(testProjectRoot, { recursive: true });

    // Create a scopecraft config file to ensure proper project isolation
    const configPath = join(testProjectRoot, '.scopecraft.json');
    const config = { path: testProjectRoot };
    writeFileSync(configPath, JSON.stringify(config, null, 2));
  });

  afterEach(() => {
    // Restore original HOME
    if (originalHome) {
      process.env.HOME = originalHome;
    }

    // Clean up test directory
    if (existsSync(testProjectRoot)) {
      rmSync(testProjectRoot, { recursive: true, force: true });
    }

    // Clean up test home
    if (testHome && existsSync(testHome)) {
      rmSync(testHome, { recursive: true, force: true });
    }
  });

  it('should copy mode templates during initialization', async () => {
    // Run init command with override to treat as standalone project
    await handleInitCommand({ rootDir: testProjectRoot, override: true });

    // Create path context to get modes path
    const context = createPathContext(testProjectRoot, { override: true });
    const modesPath = getModesPath(context);

    // Check that modes directory exists
    expect(existsSync(modesPath)).toBe(true);

    // Check for expected mode files
    const expectedModeFiles = [
      'exploration/base.md',
      'design/base.md',
      'implementation/base.md',
      'orchestration/autonomous.md',
      'planning/base.md',
      'meta/base.md',
      'guidance/project-setup.md',
    ];

    for (const modeFile of expectedModeFiles) {
      const filePath = join(modesPath, modeFile);
      expect(existsSync(filePath)).toBe(true);
    }

    // Check for mode directories
    const expectedModeDirs = [
      'exploration',
      'design',
      'implementation',
      'orchestration',
      'planning',
      'meta',
      'guidance',
    ];

    for (const modeDir of expectedModeDirs) {
      const dirPath = join(modesPath, modeDir);
      expect(existsSync(dirPath)).toBe(true);
    }
  });

  it('should copy Claude commands during initialization', async () => {
    // Run init command
    await handleInitCommand({ rootDir: testProjectRoot, override: true });

    // Check Claude commands directory
    const claudeCommandsPath = join(testProjectRoot, '.claude', 'commands');
    expect(existsSync(claudeCommandsPath)).toBe(true);

    // Check for command files
    const expectedCommands = ['mode-init.md', 'mode-update.md'];

    for (const command of expectedCommands) {
      const commandPath = join(claudeCommandsPath, command);
      expect(existsSync(commandPath)).toBe(true);
    }
  });

  it('should not overwrite existing mode files', async () => {
    // Run init first time
    await handleInitCommand({ rootDir: testProjectRoot, override: true });

    const context = createPathContext(testProjectRoot, { override: true });
    const modesPath = getModesPath(context);

    // Modify a mode file
    const testModePath = join(modesPath, 'exploration/base.md');
    const customContent = '# Custom exploration mode\nThis was modified by user';
    const fs = await import('node:fs');
    fs.writeFileSync(testModePath, customContent);

    // Run init again
    await handleInitCommand({ rootDir: testProjectRoot, override: true });

    // Check that custom content is preserved
    const content = readFileSync(testModePath, 'utf-8');
    expect(content).toBe(customContent);
  });

  it('should create .tasks directory structure', async () => {
    // Run init command
    await handleInitCommand({ rootDir: testProjectRoot, override: true });

    // Check that .tasks directory exists
    const tasksDir = join(testProjectRoot, '.tasks');
    expect(existsSync(tasksDir)).toBe(true);

    // Check that .modes directory exists within .tasks
    const modesDir = join(tasksDir, '.modes');
    expect(existsSync(modesDir)).toBe(true);

    // Check that .templates directory exists within .tasks
    const templatesDir = join(tasksDir, '.templates');
    expect(existsSync(templatesDir)).toBe(true);
  });

  it('should handle missing source templates gracefully', async () => {
    // This test ensures the init doesn't fail if templates are missing
    // (e.g., in a production build where templates might not be bundled)

    // Run init command - should complete without throwing
    await expect(
      handleInitCommand({ rootDir: testProjectRoot, override: true })
    ).resolves.not.toThrow();

    // Basic structure should still be created
    expect(existsSync(join(testProjectRoot, '.tasks'))).toBe(true);
    expect(existsSync(join(testProjectRoot, '.tasks', '.templates'))).toBe(true);
  });
});
