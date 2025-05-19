import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import {
  extractNameFromDirectory,
  getAllFiles,
  getConfigDirectory,
  getFilePath,
  getOverviewFilePath,
  getPhaseDirectory,
  getTaskFilePath,
  getTasksDirectory,
  getTemplatesDirectory,
  isAreaDirectory,
  isFeatureDirectory,
  isOverviewFile,
  isSystemDirectory,
  listPhaseDirectories,
  listSubdirectories,
  migrateSystemDirectories,
  parseTaskPath,
  phaseExists,
  subdirectoryExists,
  toSafeDirectoryName,
} from '../src/core/task-manager/directory-utils.js';
import type { RuntimeConfig } from '../src/core/config/types.js';

describe('Directory Utils', () => {
  let testDir: string;
  let testConfig: RuntimeConfig;

  beforeEach(() => {
    testDir = join(process.cwd(), '.test-directory-utils');
    testConfig = { rootPath: testDir };
    
    // Create test directory structure
    mkdirSync(join(testDir, '.tasks'), { recursive: true });
    mkdirSync(join(testDir, '.tasks', '.config'), { recursive: true });
    mkdirSync(join(testDir, '.tasks', '.templates'), { recursive: true });
    mkdirSync(join(testDir, '.tasks', 'development'), { recursive: true });
    mkdirSync(join(testDir, '.tasks', 'production'), { recursive: true });
    mkdirSync(join(testDir, '.tasks', 'development', 'FEATURE_auth'), { recursive: true });
    mkdirSync(join(testDir, '.tasks', 'development', 'AREA_security'), { recursive: true });
    
    // Create some test files
    writeFileSync(join(testDir, '.tasks', 'TASK-ROOT.md'), 'root task');
    writeFileSync(join(testDir, '.tasks', 'development', 'TASK-001.md'), 'dev task');
    writeFileSync(join(testDir, '.tasks', 'development', 'FEATURE_auth', 'TASK-002.md'), 'feature task');
    writeFileSync(join(testDir, '.tasks', 'development', 'FEATURE_auth', '_overview.md'), 'feature overview');
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('getTasksDirectory', () => {
    it('should return the tasks directory path', () => {
      const result = getTasksDirectory(testConfig);
      expect(result).toBe(join(testDir, '.tasks'));
    });

    it('should work without config', () => {
      const result = getTasksDirectory();
      expect(result).toBeTruthy();
    });
  });

  describe('getTemplatesDirectory', () => {
    it('should return the templates directory with dot-prefix', () => {
      const result = getTemplatesDirectory(testConfig);
      expect(result).toBe(join(testDir, '.tasks', '.templates'));
    });
  });

  describe('getConfigDirectory', () => {
    it('should return the config directory with dot-prefix', () => {
      const result = getConfigDirectory(testConfig);
      expect(result).toBe(join(testDir, '.tasks', '.config'));
    });
  });

  describe('parseTaskPath', () => {
    it('should parse root task (no phase)', () => {
      const filePath = join(testDir, '.tasks', 'TASK-ROOT.md');
      const result = parseTaskPath(filePath, testConfig);
      expect(result).toEqual({});
    });

    it('should parse task with phase only', () => {
      const filePath = join(testDir, '.tasks', 'development', 'TASK-001.md');
      const result = parseTaskPath(filePath, testConfig);
      expect(result).toEqual({ phase: 'development' });
    });

    it('should parse task with phase and subdirectory', () => {
      const filePath = join(testDir, '.tasks', 'development', 'FEATURE_auth', 'TASK-002.md');
      const result = parseTaskPath(filePath, testConfig);
      expect(result).toEqual({ phase: 'development', subdirectory: 'FEATURE_auth' });
    });

    it('should skip dot-prefix directories', () => {
      const filePath = join(testDir, '.tasks', '.config', 'something.md');
      const result = parseTaskPath(filePath, testConfig);
      expect(result).toEqual({});
    });

    it('should handle files outside tasks directory', () => {
      const filePath = join(testDir, 'outside.md');
      const result = parseTaskPath(filePath, testConfig);
      expect(result).toEqual({});
    });

    it('should handle relative paths by converting to absolute', () => {
      // Create a relative path that exists in our test structure
      const absolutePath = join(testDir, '.tasks', 'development', 'TASK-001.md');
      const relativePath = join('.', 'development', 'TASK-001.md');
      
      // Change to the tasks directory so relative path works
      const originalCwd = process.cwd();
      process.chdir(join(testDir, '.tasks'));
      
      const result = parseTaskPath(relativePath, testConfig);
      
      // Restore original directory
      process.chdir(originalCwd);
      
      expect(result.phase).toBe('development');
    });
  });

  describe('getTaskFilePath', () => {
    it('should build path for root task', () => {
      const result = getTaskFilePath('TASK-001', undefined, undefined, testConfig);
      expect(result).toBe(join(testDir, '.tasks', 'TASK-001.md'));
    });

    it('should build path with phase', () => {
      const result = getTaskFilePath('TASK-001', 'development', undefined, testConfig);
      expect(result).toBe(join(testDir, '.tasks', 'development', 'TASK-001.md'));
    });

    it('should build path with phase and subdirectory', () => {
      const result = getTaskFilePath('TASK-001', 'development', 'FEATURE_auth', testConfig);
      expect(result).toBe(join(testDir, '.tasks', 'development', 'FEATURE_auth', 'TASK-001.md'));
    });
  });

  describe('migrateSystemDirectories', () => {
    it('should migrate old directory names to dot-prefix', () => {
      // Create old-style directories
      mkdirSync(join(testDir, '.tasks', 'config'), { recursive: true });
      mkdirSync(join(testDir, '.tasks', 'templates'), { recursive: true });
      
      migrateSystemDirectories(testConfig);
      
      expect(() => mkdirSync(join(testDir, '.tasks', '.config'))).toThrow(); // Already exists
      expect(() => mkdirSync(join(testDir, '.tasks', '.templates'))).toThrow(); // Already exists
    });

    it('should not fail if directories already migrated', () => {
      expect(() => migrateSystemDirectories(testConfig)).not.toThrow();
    });
  });

  describe('Phase utilities', () => {
    it('getPhaseDirectory should return phase path', () => {
      const result = getPhaseDirectory('development', testConfig);
      expect(result).toBe(join(testDir, '.tasks', 'development'));
    });

    it('listPhaseDirectories should exclude dot-prefix directories', () => {
      const result = listPhaseDirectories(testConfig);
      expect(result).toContain('development');
      expect(result).toContain('production');
      expect(result).not.toContain('.config');
      expect(result).not.toContain('.templates');
    });

    it('phaseExists should check if phase exists', () => {
      expect(phaseExists('development', testConfig)).toBe(true);
      expect(phaseExists('staging', testConfig)).toBe(false);
    });
  });

  describe('Subdirectory utilities', () => {
    it('isFeatureDirectory should identify feature directories', () => {
      expect(isFeatureDirectory('FEATURE_auth')).toBe(true);
      expect(isFeatureDirectory('AREA_security')).toBe(false);
      expect(isFeatureDirectory('random')).toBe(false);
    });

    it('isAreaDirectory should identify area directories', () => {
      expect(isAreaDirectory('AREA_security')).toBe(true);
      expect(isAreaDirectory('FEATURE_auth')).toBe(false);
      expect(isAreaDirectory('random')).toBe(false);
    });

    it('listSubdirectories should list all subdirectories', () => {
      const result = listSubdirectories('development', undefined, testConfig);
      expect(result).toContain('FEATURE_auth');
      expect(result).toContain('AREA_security');
    });

    it('listSubdirectories should filter by type', () => {
      const features = listSubdirectories('development', 'feature', testConfig);
      expect(features).toContain('FEATURE_auth');
      expect(features).not.toContain('AREA_security');

      const areas = listSubdirectories('development', 'area', testConfig);
      expect(areas).toContain('AREA_security');
      expect(areas).not.toContain('FEATURE_auth');
    });

    it('subdirectoryExists should check existence', () => {
      expect(subdirectoryExists('development', 'FEATURE_auth', testConfig)).toBe(true);
      expect(subdirectoryExists('development', 'FEATURE_nonexistent', testConfig)).toBe(false);
    });
  });

  describe('General file utilities', () => {
    it('getFilePath should build generic file path', () => {
      const result = getFilePath('test.md', 'development', 'FEATURE_auth', testConfig);
      expect(result).toBe(join(testDir, '.tasks', 'development', 'FEATURE_auth', 'test.md'));
    });

    it('getAllFiles should recursively find .md files', () => {
      const result = getAllFiles(join(testDir, '.tasks'));
      expect(result).toHaveLength(4); // All test .md files
      expect(result.some(f => f.includes('TASK-ROOT.md'))).toBe(true);
      expect(result.some(f => f.includes('TASK-001.md'))).toBe(true);
      expect(result.some(f => f.includes('TASK-002.md'))).toBe(true);
      expect(result.some(f => f.includes('_overview.md'))).toBe(true);
    });
  });

  describe('System directory utilities', () => {
    it('isSystemDirectory should identify dot-prefix directories', () => {
      expect(isSystemDirectory('.config')).toBe(true);
      expect(isSystemDirectory('.templates')).toBe(true);
      expect(isSystemDirectory('development')).toBe(false);
    });
  });

  describe('Overview file utilities', () => {
    it('getOverviewFilePath should build overview path', () => {
      const result = getOverviewFilePath('development', 'FEATURE_auth', testConfig);
      expect(result).toBe(join(testDir, '.tasks', 'development', 'FEATURE_auth', '_overview.md'));
    });

    it('isOverviewFile should identify overview files', () => {
      expect(isOverviewFile('_overview.md')).toBe(true);
      expect(isOverviewFile('/path/to/_overview.md')).toBe(true);
      expect(isOverviewFile('TASK-001.md')).toBe(false);
    });
  });

  describe('Name conversion utilities', () => {
    it('toSafeDirectoryName should convert to safe names', () => {
      expect(toSafeDirectoryName('My Feature!')).toBe('MY_FEATURE_');
      expect(toSafeDirectoryName('auth & security')).toBe('AUTH_SECURITY');
      expect(toSafeDirectoryName('test__name')).toBe('TEST_NAME');
      expect(toSafeDirectoryName('auth', 'FEATURE')).toBe('FEATURE_AUTH');
    });

    it('extractNameFromDirectory should extract clean names', () => {
      expect(extractNameFromDirectory('FEATURE_auth_system')).toBe('Auth System');
      expect(extractNameFromDirectory('AREA_security')).toBe('Security');
      expect(extractNameFromDirectory('random_name')).toBe('Random Name');
    });
  });

  describe('Edge cases', () => {
    it('should handle non-existent directories gracefully', () => {
      const nonExistentConfig: RuntimeConfig = { rootPath: '/non/existent/path' };
      
      expect(listPhaseDirectories(nonExistentConfig)).toEqual([]);
      expect(listSubdirectories('fake', undefined, nonExistentConfig)).toEqual([]);
      expect(getAllFiles('/non/existent')).toEqual([]);
    });

    it('should handle empty strings and undefined values', () => {
      expect(isFeatureDirectory('')).toBe(false);
      expect(isAreaDirectory('')).toBe(false);
      expect(isSystemDirectory('')).toBe(false);
      expect(toSafeDirectoryName('')).toBe('');
      expect(extractNameFromDirectory('')).toBe('');
    });
  });
});