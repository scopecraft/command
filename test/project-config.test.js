/**
 * Basic tests for ProjectConfig
 */
import { describe, expect, it } from 'bun:test';
import { ProjectConfig, ProjectMode } from '../src/core/project-config.js';

// These tests verify the behavior of the ProjectConfig class
// without mocking the file system
describe('ProjectConfig', () => {
  // Test path generation for different modes
  describe('Path Generation', () => {
    it('should correctly generate paths for ROO_COMMANDER mode', () => {
      const config = new ProjectConfig();
      // Force mode for testing
      config.setMode(ProjectMode.ROO_COMMANDER);

      // Verify paths contain correct directories
      expect(config.getTasksDirectory()).toContain('.ruru/tasks');
      expect(config.getConfigDirectory()).toContain('.ruru/config');
      expect(config.getPhasesConfigPath()).toContain('.ruru/config/phases.toml');
    });

    it('should correctly generate paths for STANDALONE mode', () => {
      const config = new ProjectConfig();
      // Force mode for testing
      config.setMode(ProjectMode.STANDALONE);

      // Verify paths contain correct directories
      expect(config.getTasksDirectory()).toContain('.tasks');
      expect(config.getPhasesDirectory()).toContain('.tasks/phases');
      expect(config.getConfigDirectory()).toContain('.tasks/config');
      expect(config.getPhasesConfigPath()).toContain('.tasks/config/phases.toml');
    });
  });

  // Test mode setting and getting
  describe('Mode Management', () => {
    it('should correctly set and get mode', () => {
      const config = new ProjectConfig();

      // Set to ROO_COMMANDER
      config.setMode(ProjectMode.ROO_COMMANDER);
      expect(config.getMode()).toBe(ProjectMode.ROO_COMMANDER);

      // Set to STANDALONE
      config.setMode(ProjectMode.STANDALONE);
      expect(config.getMode()).toBe(ProjectMode.STANDALONE);
    });
  });
});
