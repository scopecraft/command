import { describe, it, expect, beforeEach, afterEach, beforeAll, jest } from '@jest/globals';
import { join } from 'path';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { ProjectConfig } from '../../src/core/project-config.js';

describe('Project Root Configuration Integration', () => {
  let testDir: string;
  let project1Dir: string;
  let project2Dir: string;
  let configPath: string;

  beforeAll(() => {
    testDir = join(process.cwd(), '.test-projects');
    project1Dir = join(testDir, 'project1');
    project2Dir = join(testDir, 'project2');
    configPath = join(testDir, 'test-config.json');
  });
  
  beforeEach(() => {
    // Create test directories
    mkdirSync(testDir, { recursive: true });
    mkdirSync(join(project1Dir, '.tasks'), { recursive: true });
    mkdirSync(join(project2Dir, '.tasks'), { recursive: true });
    
    // Create test config file
    const config = {
      version: '1.0.0',
      projects: {
        project1: {
          path: project1Dir,
          description: 'Test project 1'
        },
        project2: {
          path: project2Dir,
          description: 'Test project 2'
        }
      },
      defaultProject: 'project1'
    };
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    // Create sample task files
    const taskContent = `---
id: TASK-001
title: Test Task
type: feature
status: 🟡 To Do
---

# Test Task

This is a test task for integration testing.`;
    
    writeFileSync(join(project1Dir, '.tasks', 'TASK-001.md'), taskContent);
    writeFileSync(join(project2Dir, '.tasks', 'TASK-002.md'), taskContent.replace('001', '002'));
  });
  
  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    // Reset configuration
    delete process.env.SCOPECRAFT_ROOT;
  });
  
  describe('CLI Parameter Integration', () => {
    it('should respect --root-dir parameter', () => {
      const result = execSync(
        `bun run src/cli/cli.ts task list --root-dir ${project1Dir}`,
        { encoding: 'utf8' }
      );
      
      expect(result).toContain('TASK-001');
      expect(result).not.toContain('TASK-002');
    });
    
    it('should respect --config parameter', () => {
      const result = execSync(
        `bun run src/cli/cli.ts task list --config ${configPath}`,
        { encoding: 'utf8' }
      );
      
      // Should use default project from config
      expect(result).toContain('TASK-001');
    });
    
    it('should prioritize CLI over config', () => {
      const result = execSync(
        `bun run src/cli/cli.ts task list --root-dir ${project2Dir} --config ${configPath}`,
        { encoding: 'utf8' }
      );
      
      // Should use CLI parameter, not config default
      expect(result).toContain('TASK-002');
      expect(result).not.toContain('TASK-001');
    });
  });
  
  describe('MCP Command Integration', () => {
    it('should handle init_root command', async () => {
      // This test would require actual MCP server testing
      // For now, we just verify the functionality exists
      
      const projectConfig = new ProjectConfig();
      const rootDir = projectConfig.getProjectRoot();
      
      expect(rootDir).toBeDefined();
    });
  });
  
  describe('Configuration Precedence', () => {
    it('should follow correct precedence order', () => {
      // Test environment variable precedence
      process.env.SCOPECRAFT_ROOT = project1Dir;
      
      const projectConfig = new ProjectConfig();
      const rootDir = projectConfig.getProjectRoot();
      
      // Should pick up from environment
      expect(rootDir).toBe(project1Dir);
      
      delete process.env.SCOPECRAFT_ROOT;
    });
  });
  
  describe('Error Handling', () => {
    it('should handle invalid project paths', () => {
      const invalidPath = join(testDir, 'nonexistent');
      
      expect(() => {
        execSync(`bun run src/cli/cli.ts task list --root-dir ${invalidPath}`);
      }).toThrow();
    });
    
    it('should handle missing config files gracefully', () => {
      const missingConfig = join(testDir, 'missing-config.json');
      
      // Should fall back to current directory
      const result = execSync(
        `bun run src/cli/cli.ts task list --config ${missingConfig}`,
        { encoding: 'utf8', cwd: project1Dir }
      );
      
      expect(result).toContain('TASK-001');
    });
  });
  
  describe('Multi-Project Switching', () => {
    it('should switch between projects correctly', () => {
      // Test basic project switching via environment
      process.env.SCOPECRAFT_ROOT = project2Dir;
      let projectConfig = new ProjectConfig();
      expect(projectConfig.getProjectRoot()).toBe(project2Dir);
      
      // Switch to project1
      process.env.SCOPECRAFT_ROOT = project1Dir;
      projectConfig = new ProjectConfig();
      expect(projectConfig.getProjectRoot()).toBe(project1Dir);
      
      delete process.env.SCOPECRAFT_ROOT;
    });
  });
});

describe('IDE-Specific Integration', () => {
  it('should work with Cursor-style configuration', () => {
    // Simulate Cursor's MCP server startup
    const result = execSync(
      'bun run src/mcp/cli.ts --root-dir /path/to/project --help',
      { encoding: 'utf8' }
    );
    
    expect(result).toContain('--root-dir');
    expect(result).toContain('--config');
  });
  
  it('should work with Claude Desktop configuration', () => {
    // Simulate Claude Desktop's STDIO transport
    const result = execSync(
      'bun run src/mcp/stdio-cli.ts --root-dir /path/to/project --help',
      { encoding: 'utf8' }
    );
    
    expect(result).toContain('--root-dir');
    expect(result).toContain('--config');
  });
});

describe('Performance', () => {
  it('should handle large project directories efficiently', () => {
    const largeProjectDir = join(testDir, 'large-project');
    mkdirSync(join(largeProjectDir, '.tasks'), { recursive: true });
    
    // Create many task files
    for (let i = 0; i < 100; i++) {
      const taskContent = `---
id: TASK-${i.toString().padStart(3, '0')}
title: Task ${i}
type: feature
status: 🟡 To Do
---

# Task ${i}`;
      writeFileSync(
        join(largeProjectDir, '.tasks', `TASK-${i.toString().padStart(3, '0')}.md`),
        taskContent
      );
    }
    
    const startTime = performance.now();
    const result = execSync(
      `bun run src/cli/cli.ts task list --root-dir ${largeProjectDir}`,
      { encoding: 'utf8' }
    );
    const endTime = performance.now();
    
    expect(result).toContain('TASK-099');
    expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
  });
});

describe('Edge Cases', () => {
  it('should handle symlinks correctly', () => {
    const symlinkPath = join(testDir, 'project-link');
    execSync(`ln -s ${project1Dir} ${symlinkPath}`);
    
    const result = execSync(
      `bun run src/cli/cli.ts task list --root-dir ${symlinkPath}`,
      { encoding: 'utf8' }
    );
    
    expect(result).toContain('TASK-001');
  });
  
  it('should handle paths with spaces', () => {
    const spaceDir = join(testDir, 'project with spaces');
    mkdirSync(join(spaceDir, '.tasks'), { recursive: true });
    
    const taskContent = `---
id: TASK-SPACE
title: Space Task
type: feature
status: 🟡 To Do
---

# Space Task`;
    writeFileSync(join(spaceDir, '.tasks', 'TASK-SPACE.md'), taskContent);
    
    const result = execSync(
      `bun run src/cli/cli.ts task list --root-dir "${spaceDir}"`,
      { encoding: 'utf8' }
    );
    
    expect(result).toContain('TASK-SPACE');
  });
});