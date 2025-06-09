/**
 * Integration tests for the dispatch command
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { create as createTask } from '../../src/core/task-crud.js';

const TEST_DIR = join(process.cwd(), 'test-workspace-dispatch');
const CLI_PATH = join(process.cwd(), 'src/cli/cli.ts');

describe('Dispatch Command', () => {
  beforeEach(() => {
    // Create test workspace
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
    
    // Initialize project structure
    mkdirSync(join(TEST_DIR, '.tasks'), { recursive: true });
    mkdirSync(join(TEST_DIR, '.tasks/backlog'), { recursive: true });
    mkdirSync(join(TEST_DIR, '.tasks/current'), { recursive: true });
    mkdirSync(join(TEST_DIR, '.tasks/archive'), { recursive: true });
    
    // Initialize git repo (required for worktree operations)
    execSync('git init', { cwd: TEST_DIR });
    execSync('git config user.name "Test User"', { cwd: TEST_DIR });
    execSync('git config user.email "test@example.com"', { cwd: TEST_DIR });
    execSync('echo "test" > README.md', { cwd: TEST_DIR });
    execSync('git add README.md', { cwd: TEST_DIR });
    execSync('git commit -m "Initial commit"', { cwd: TEST_DIR });
  });

  afterEach(() => {
    // Cleanup
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  it('should require task ID', () => {
    try {
      execSync(
        `bun run ${CLI_PATH} --root-dir ${TEST_DIR} dispatch`,
        { encoding: 'utf8' }
      );
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).not.toBe(0);
      const output = error.stderr || error.stdout || '';
      expect(output.toLowerCase()).toContain('required');
    }
  });

  it('should show dispatch command in main help', () => {
    const output = execSync(
      `bun run ${CLI_PATH} --help`,
      { encoding: 'utf8' }
    );
    
    expect(output).toContain('dispatch');
    expect(output).toContain('Run autonomous Claude session');
  });

  it('should show help for dispatch command', () => {
    const output = execSync(
      `bun run ${CLI_PATH} --root-dir ${TEST_DIR} dispatch --help 2>&1`,
      { encoding: 'utf8' }
    );
    
    expect(output).toContain('Run autonomous Claude session');
    expect(output).toContain('--mode');
    expect(output).toContain('--exec');
    expect(output).toContain('docker|detached');
  });

  it('should reject invalid task ID', async () => {
    try {
      execSync(
        `bun run ${CLI_PATH} --root-dir ${TEST_DIR} dispatch non-existent-task 2>&1`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).not.toBe(0);
      const output = error.stdout || '';
      expect(output.toLowerCase()).toContain('not found');
    }
  });

  it('should accept mode option', () => {
    const output = execSync(
      `bun run ${CLI_PATH} --root-dir ${TEST_DIR} dispatch --help 2>&1`,
      { encoding: 'utf8' }
    );
    
    expect(output).toContain('--mode');
    expect(output).toContain('auto|implement|explore|orchestrate|diagnose');
  });

  it('should accept exec option', () => {
    const output = execSync(
      `bun run ${CLI_PATH} --root-dir ${TEST_DIR} dispatch --help 2>&1`,
      { encoding: 'utf8' }
    );
    
    expect(output).toContain('--exec');
    expect(output).toContain('docker|detached');
    expect(output).toContain('default: docker');
  });

  it('should have short alias', () => {
    const output = execSync(
      `bun run ${CLI_PATH} --root-dir ${TEST_DIR} d --help 2>&1`,
      { encoding: 'utf8' }
    );
    
    expect(output).toContain('dispatch');
    expect(output).toContain('Run autonomous Claude session');
  });

  it('should show Docker as default execution type', () => {
    const output = execSync(
      `bun run ${CLI_PATH} --root-dir ${TEST_DIR} dispatch --help 2>&1`,
      { encoding: 'utf8' }
    );
    
    expect(output).toContain('Docker Execution:');
    expect(output).toContain('my-claude:authenticated');
    expect(output).toContain('docker (default)');
  });
});