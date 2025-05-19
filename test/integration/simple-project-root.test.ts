import { describe, it, expect, beforeEach, afterEach, beforeAll } from '@jest/globals';
import { join } from 'path';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

describe('Project Root Configuration - Simple Integration', () => {
  let testDir: string;
  let project1Dir: string;
  let project2Dir: string;
  let configPath: string;

  beforeAll(() => {
    testDir = join(process.cwd(), '.test-projects-simple');
    project1Dir = join(testDir, 'project1');
    project2Dir = join(testDir, 'project2');
    configPath = join(testDir, 'config.json');
  });
  
  beforeEach(() => {
    // Create test directories
    mkdirSync(join(project1Dir, '.tasks'), { recursive: true });
    mkdirSync(join(project2Dir, '.tasks'), { recursive: true });
    
    // Create test config file
    const config = {
      version: '1.0.0',
      projects: [
        {
          name: 'project1',
          path: project1Dir,
          description: 'Test project 1'
        },
        {
          name: 'project2',
          path: project2Dir,
          description: 'Test project 2'
        }
      ],
      defaultProject: 'project1'
    };
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    // Create simple task files
    const task1 = `+++
id = "SIMPLE-001"
title = "Simple Test Task"
type = "feature"
status = "🟡 To Do"
+++

# Simple Test Task`;
    
    const task2 = `+++
id = "SIMPLE-002"
title = "Another Simple Task"
type = "feature"
status = "🟡 To Do"
+++

# Another Simple Task`;
    
    writeFileSync(join(project1Dir, '.tasks', 'SIMPLE-001.md'), task1);
    writeFileSync(join(project2Dir, '.tasks', 'SIMPLE-002.md'), task2);
  });
  
  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });
  
  describe('Basic Functionality', () => {
    it('should list tasks with --root-dir parameter', () => {
      const result = execSync(
        `bun run ./src/cli/cli.ts task list --root-dir ${project1Dir}`,
        { encoding: 'utf8', cwd: process.cwd() }
      );
      
      expect(result).toContain('SIMPLE-001');
      expect(result).toContain('Simple Test Task');
    });
    
    it('should switch projects with --root-dir', () => {
      const result1 = execSync(
        `bun run ./src/cli/cli.ts task list --root-dir ${project1Dir}`,
        { encoding: 'utf8', cwd: process.cwd() }
      );
      
      expect(result1).toContain('SIMPLE-001');
      expect(result1).not.toContain('SIMPLE-002');
      
      const result2 = execSync(
        `bun run ./src/cli/cli.ts task list --root-dir ${project2Dir}`,
        { encoding: 'utf8', cwd: process.cwd() }
      );
      
      expect(result2).toContain('SIMPLE-002');
      expect(result2).not.toContain('SIMPLE-001');
    });
  });
  
  describe('MCP Server', () => {
    it('should accept --root-dir in MCP server', () => {
      const result = execSync(
        `bun run ./src/mcp/cli.ts --help`,
        { encoding: 'utf8', cwd: process.cwd() }
      );
      
      expect(result).toContain('--root-dir');
    });
    
    it('should accept --root-dir in STDIO server', () => {
      const result = execSync(
        `bun run ./src/mcp/stdio-cli.ts --help`,
        { encoding: 'utf8', cwd: process.cwd() }
      );
      
      expect(result).toContain('--root-dir');
    });
  });
});