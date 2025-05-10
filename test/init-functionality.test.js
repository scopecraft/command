/**
 * Integration tests for initialization functionality
 */
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { ProjectConfig, ProjectMode } from '../src/core/project-config.js';

// These tests will create temporary directories to verify real initialization
describe('Initialization Functionality', () => {
  const testDir = path.join(process.cwd(), 'test-init-functionality');
  
  beforeEach(() => {
    // Setup test directory
    if (fs.existsSync(testDir)) {
      // Clean up existing directory
      cleanupTestDir(testDir);
    }
    
    // Create fresh test directory
    fs.mkdirSync(testDir, { recursive: true });
    
    // Save original cwd and change to test directory
    process.env.ORIGINAL_CWD = process.cwd();
    process.chdir(testDir);
  });
  
  afterEach(() => {
    // Change back to original directory
    process.chdir(process.env.ORIGINAL_CWD);
    
    // Clean up test directory
    cleanupTestDir(testDir);
  });
  
  it('should correctly detect standalone mode in a fresh directory', () => {
    // Create a ProjectConfig instance in a fresh directory
    const config = new ProjectConfig();
    
    // Default should be standalone
    expect(config.getMode()).toBe(ProjectMode.STANDALONE);
    
    // Validate environment should be false (directory doesn't exist yet)
    expect(config.validateEnvironment()).toBe(false);
  });
  
  it('should correctly detect roo-commander mode when .ruru exists', () => {
    // Create a .ruru directory
    fs.mkdirSync(path.join(testDir, '.ruru'), { recursive: true });
    
    // Create a ProjectConfig instance
    const config = new ProjectConfig();
    
    // Should detect roo-commander mode
    expect(config.getMode()).toBe(ProjectMode.ROO_COMMANDER);
    
    // Validate environment should be true (.ruru exists)
    expect(config.validateEnvironment()).toBe(true);
  });
  
  it('should correctly detect standalone mode when .tasks exists', () => {
    // Create a .tasks directory
    fs.mkdirSync(path.join(testDir, '.tasks'), { recursive: true });
    
    // Create a ProjectConfig instance
    const config = new ProjectConfig();
    
    // Should detect standalone mode
    expect(config.getMode()).toBe(ProjectMode.STANDALONE);
    
    // Validate environment should be true (.tasks exists)
    expect(config.validateEnvironment()).toBe(true);
  });
  
  it('should initialize structure for ROO_COMMANDER mode', () => {
    // Create a ProjectConfig instance
    const config = new ProjectConfig();
    config.setMode(ProjectMode.ROO_COMMANDER);
    
    // Initialize
    config.initializeProjectStructure();
    
    // Verify directories were created
    expect(fs.existsSync(path.join(testDir, '.ruru'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, '.ruru', 'tasks'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, '.ruru', 'config'))).toBe(true);
  });
  
  it('should initialize structure for STANDALONE mode', () => {
    // Create a ProjectConfig instance
    const config = new ProjectConfig();
    config.setMode(ProjectMode.STANDALONE);
    
    // Initialize
    config.initializeProjectStructure();
    
    // Verify directories were created
    expect(fs.existsSync(path.join(testDir, '.tasks'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, '.tasks', 'phases'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, '.tasks', 'config'))).toBe(true);
  });
});

// Helper to clean up test directory
function cleanupTestDir(dir) {
  if (fs.existsSync(dir)) {
    // Delete all subdirectories and files recursively
    fs.rmSync(dir, { recursive: true, force: true });
  }
}