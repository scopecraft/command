/**
 * Tests for ConfigurationManager
 */

import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ConfigurationManager } from '../src/core/config/configuration-manager.js';
import { ConfigSource, CONFIG_CONSTANTS, ENV_VARS } from '../src/core/config/types.js';

describe('ConfigurationManager', () => {
  let configManager: ConfigurationManager;
  let originalCwd: string;
  let tempDir: string;
  let homeDir: string;

  beforeEach(() => {
    // Create fresh instance (singleton reset)
    // @ts-ignore - accessing private for testing
    ConfigurationManager.instance = undefined;

    // Save original state
    originalCwd = process.cwd();
    
    // Create temp directories
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scopecraft-test-'));
    homeDir = path.join(tempDir, 'home');
    fs.mkdirSync(homeDir, { recursive: true });
    
    // Mock home directory
    process.env.HOME = homeDir;
    process.env.USERPROFILE = homeDir; // Windows support
    
    // Now create the instance after setting HOME
    configManager = ConfigurationManager.getInstance();
  });

  afterEach(() => {
    // Restore original state
    process.chdir(originalCwd);
    delete process.env[ENV_VARS.SCOPECRAFT_ROOT];
    
    // Clean up temp directories
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Root Validation', () => {
    it('should validate directory with .tasks folder', () => {
      const projectDir = path.join(tempDir, 'project1');
      fs.mkdirSync(path.join(projectDir, '.tasks'), { recursive: true });
      
      expect(configManager.validateRoot(projectDir)).toBe(true);
    });

    it('should validate directory with .ruru folder', () => {
      const projectDir = path.join(tempDir, 'project2');
      fs.mkdirSync(path.join(projectDir, '.ruru'), { recursive: true });
      
      expect(configManager.validateRoot(projectDir)).toBe(true);
    });

    it('should not validate directory without .tasks or .ruru', () => {
      const projectDir = path.join(tempDir, 'invalid');
      fs.mkdirSync(projectDir, { recursive: true });
      
      expect(configManager.validateRoot(projectDir)).toBe(false);
    });

    it('should not validate non-existent directory', () => {
      const projectDir = path.join(tempDir, 'non-existent');
      
      expect(configManager.validateRoot(projectDir)).toBe(false);
    });
  });

  describe('Precedence Logic', () => {
    let validProjectDir: string;

    beforeEach(() => {
      // Create a valid project directory
      validProjectDir = path.join(tempDir, 'valid-project');
      fs.mkdirSync(path.join(validProjectDir, '.tasks'), { recursive: true });
    });

    it('should prioritize runtime config over all others', () => {
      // Set up all other sources
      configManager.setRootFromCLI(validProjectDir);
      process.env[ENV_VARS.SCOPECRAFT_ROOT] = validProjectDir;
      configManager.setRootFromSession(validProjectDir);
      
      // Runtime should override all
      const runtimeDir = path.join(tempDir, 'runtime-project');
      fs.mkdirSync(path.join(runtimeDir, '.tasks'), { recursive: true });
      
      const config = configManager.getRootConfig({ rootPath: runtimeDir });
      expect(config.path).toBe(runtimeDir);
      expect(config.source).toBe(ConfigSource.RUNTIME);
    });

    it('should prioritize CLI parameter over environment and below', () => {
      const cliDir = path.join(tempDir, 'cli-project');
      fs.mkdirSync(path.join(cliDir, '.tasks'), { recursive: true });
      
      configManager.setRootFromCLI(cliDir);
      process.env[ENV_VARS.SCOPECRAFT_ROOT] = validProjectDir;
      
      const config = configManager.getRootConfig();
      expect(config.path).toBe(cliDir);
      expect(config.source).toBe(ConfigSource.CLI);
    });

    it('should prioritize environment variable over session and below', () => {
      const envDir = path.join(tempDir, 'env-project');
      fs.mkdirSync(path.join(envDir, '.tasks'), { recursive: true });
      
      process.env[ENV_VARS.SCOPECRAFT_ROOT] = envDir;
      configManager.setRootFromSession(validProjectDir);
      
      const config = configManager.getRootConfig();
      expect(config.path).toBe(envDir);
      expect(config.source).toBe(ConfigSource.ENVIRONMENT);
    });

    it('should use session config when higher precedence not available', () => {
      const sessionDir = path.join(tempDir, 'session-project');
      fs.mkdirSync(path.join(sessionDir, '.tasks'), { recursive: true });
      
      configManager.setRootFromSession(sessionDir);
      
      const config = configManager.getRootConfig();
      expect(config.path).toBe(sessionDir);
      expect(config.source).toBe(ConfigSource.SESSION);
    });

    it('should fall back to auto-detect when no config source available', () => {
      process.chdir(validProjectDir);
      
      const config = configManager.getRootConfig();
      // Use fs.realpathSync to normalize paths for comparison
      expect(fs.realpathSync(config.path)).toBe(fs.realpathSync(validProjectDir));
      expect(config.source).toBe(ConfigSource.AUTO_DETECT);
    });
  });

  describe('Config File Support', () => {
    let configDir: string;
    let configFile: string;

    beforeEach(() => {
      configDir = path.join(homeDir, CONFIG_CONSTANTS.CONFIG_DIR_NAME);
      configFile = path.join(configDir, CONFIG_CONSTANTS.CONFIG_FILE_NAME);
      fs.mkdirSync(configDir, { recursive: true });
    });

    it('should load projects from config file', () => {
      const project1 = path.join(tempDir, 'project1');
      const project2 = path.join(tempDir, 'project2');
      
      fs.mkdirSync(path.join(project1, '.tasks'), { recursive: true });
      fs.mkdirSync(path.join(project2, '.tasks'), { recursive: true });
      
      const config = {
        version: CONFIG_CONSTANTS.VERSION,
        defaultProject: 'project1',
        projects: [
          { name: 'project1', path: project1 },
          { name: 'project2', path: project2 }
        ]
      };
      
      fs.writeFileSync(configFile, JSON.stringify(config));
      
      const projects = configManager.getProjects();
      expect(projects).toHaveLength(2);
      expect(projects[0].name).toBe('project1');
      expect(projects[1].name).toBe('project2');
    });

    it('should use default project from config file', () => {
      const project1 = path.join(tempDir, 'project1');
      fs.mkdirSync(path.join(project1, '.tasks'), { recursive: true });
      
      const config = {
        version: CONFIG_CONSTANTS.VERSION,
        defaultProject: 'project1',
        projects: [
          { name: 'project1', path: project1 }
        ]
      };
      
      fs.writeFileSync(configFile, JSON.stringify(config));
      
      const rootConfig = configManager.resolveRoot();
      expect(rootConfig.path).toBe(project1);
      expect(rootConfig.source).toBe(ConfigSource.CONFIG_FILE);
      expect(rootConfig.projectName).toBe('project1');
    });

    it('should handle missing config file gracefully', () => {
      const projects = configManager.getProjects();
      expect(projects).toEqual([]);
    });

    it('should handle invalid config file gracefully', () => {
      fs.writeFileSync(configFile, 'invalid json');
      
      const projects = configManager.getProjects();
      expect(projects).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid CLI path', () => {
      const invalidPath = path.join(tempDir, 'invalid');
      fs.mkdirSync(invalidPath, { recursive: true });
      
      expect(() => {
        configManager.setRootFromCLI(invalidPath);
      }).toThrow('Invalid project root');
    });

    it('should throw error for invalid session path', () => {
      const invalidPath = path.join(tempDir, 'invalid');
      fs.mkdirSync(invalidPath, { recursive: true });
      
      expect(() => {
        configManager.setRootFromSession(invalidPath);
      }).toThrow('Invalid project root');
    });

    it('should return error for invalid config project', () => {
      const result = configManager.setRootFromConfig('non-existent');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Configuration file not found');
    });
  });

  describe('Cache Management', () => {
    it('should clear cache when configuration changes', () => {
      const project1 = path.join(tempDir, 'project1');
      const project2 = path.join(tempDir, 'project2');
      
      fs.mkdirSync(path.join(project1, '.tasks'), { recursive: true });
      fs.mkdirSync(path.join(project2, '.tasks'), { recursive: true });
      
      // Initial config
      configManager.setRootFromSession(project1);
      const config1 = configManager.getRootConfig();
      expect(config1.path).toBe(project1);
      
      // Change config
      configManager.setRootFromSession(project2);
      const config2 = configManager.getRootConfig();
      expect(config2.path).toBe(project2);
    });

    it('should clear session config', () => {
      const projectDir = path.join(tempDir, 'project');
      fs.mkdirSync(path.join(projectDir, '.tasks'), { recursive: true });
      
      configManager.setRootFromSession(projectDir);
      expect(configManager.getRootConfig().source).toBe(ConfigSource.SESSION);
      
      configManager.clearSessionConfig();
      expect(configManager.getRootConfig().source).not.toBe(ConfigSource.SESSION);
    });
  });
});