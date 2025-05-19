/**
 * Tests for CLI parameter handling
 */

import { beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { ConfigurationManager } from '../src/core/config/configuration-manager.js';

describe('CLI Parameters', () => {
  let configManager: ConfigurationManager;

  beforeEach(() => {
    // Clear singleton instance for fresh tests
    (ConfigurationManager as any).instance = null;
    configManager = ConfigurationManager.getInstance();
  });

  describe('--root-dir parameter', () => {
    it('should set root directory from CLI parameter', () => {
      const testPath = '/test-project';

      // Create a spy for existsSync
      const existsSyncSpy = spyOn(fs, 'existsSync');
      existsSyncSpy.mockImplementation((path: string) => {
        if (path === testPath) return true;
        if (path === `/test-project/.tasks`) return true;
        return false;
      });

      configManager.setRootFromCLI(testPath);
      const config = configManager.getRootConfig();

      expect(config.path).toBe(testPath);
      expect(config.source).toBe('cli');
      expect(config.validated).toBe(true);
    });

    it('should throw error for invalid root directory', () => {
      const invalidPath = '/invalid-project';

      // Create a spy for existsSync
      const existsSyncSpy = spyOn(fs, 'existsSync');
      existsSyncSpy.mockImplementation((path: string) => {
        if (path === invalidPath) return true;
        return false;
      });

      expect(() => {
        configManager.setRootFromCLI(invalidPath);
      }).toThrow('Invalid project root');
    });

    it('should have highest precedence', () => {
      const cliPath = '/cli-project';
      const envPath = '/env-project';

      // Set environment variable
      process.env.SCOPECRAFT_ROOT = envPath;

      // Mock validation for both paths
      const existsSyncSpy = spyOn(fs, 'existsSync');
      existsSyncSpy.mockImplementation((path: string) => {
        if (path === cliPath || path === envPath) return true;
        if (path.endsWith('.tasks')) return true;
        return false;
      });

      // Set CLI path
      configManager.setRootFromCLI(cliPath);
      const config = configManager.getRootConfig();

      expect(config.path).toBe(cliPath);
      expect(config.source).toBe('cli');

      // Clean up
      delete process.env.SCOPECRAFT_ROOT;
    });
  });

  describe('--config parameter', () => {
    it('should use custom config file path', () => {
      const customConfigPath = '/custom/config.json';
      const configContent = {
        version: '1.0.0',
        projects: [
          {
            name: 'test-project',
            path: '/test-project',
            description: 'Test project',
          },
        ],
        defaultProject: 'test-project',
      };

      // Mock file system for custom config
      const existsSyncSpy = spyOn(fs, 'existsSync');
      existsSyncSpy.mockImplementation((path: string) => {
        if (path === customConfigPath) return true;
        if (path === '/test-project') return true;
        if (path.endsWith('.tasks')) return true;
        return false;
      });

      const readFileSyncSpy = spyOn(fs, 'readFileSync');
      readFileSyncSpy.mockImplementation((path: string) => {
        if (path === customConfigPath) {
          return JSON.stringify(configContent);
        }
        throw new Error('File not found');
      });

      // Set custom config path
      configManager.setConfigFilePath(customConfigPath);

      // Set root from config
      const result = configManager.setRootFromConfig();
      expect(result.success).toBe(true);

      const config = configManager.getRootConfig();
      expect(config.path).toBe('/test-project');
      expect(config.source).toBe('config_file');
    });
  });

  describe('Combined parameters', () => {
    it('should handle both --root-dir and --config together', () => {
      const cliPath = '/cli-override';
      const customConfigPath = '/custom/config.json';

      const configContent = {
        version: '1.0.0',
        projects: [
          {
            name: 'config-project',
            path: '/config-project',
            description: 'Config project',
          },
        ],
        defaultProject: 'config-project',
      };

      // Mock file system
      const existsSyncSpy = spyOn(fs, 'existsSync');
      existsSyncSpy.mockImplementation((path: string) => {
        if (path === cliPath) return true;
        if (path === customConfigPath) return true;
        if (path.endsWith('.tasks')) return true;
        return false;
      });

      const readFileSyncSpy = spyOn(fs, 'readFileSync');
      readFileSyncSpy.mockImplementation((path: string) => {
        if (path === customConfigPath) {
          return JSON.stringify(configContent);
        }
        throw new Error('File not found');
      });

      // Set both parameters
      configManager.setConfigFilePath(customConfigPath);
      configManager.setRootFromCLI(cliPath);

      // CLI should take precedence
      const config = configManager.getRootConfig();
      expect(config.path).toBe(cliPath);
      expect(config.source).toBe('cli');
    });
  });
});
