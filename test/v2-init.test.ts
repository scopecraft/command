/**
 * Test v2 initialization
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as v2 from '../src/core/v2/index.js';

describe('V2 Init Test', () => {
  let testDir: string;
  
  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'scopecraft-v2-test-'));
  });
  
  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });
  
  it('should initialize v2 structure', () => {
    // Initialize
    v2.initializeV2ProjectStructure(testDir);
    
    // Check structure
    const version = v2.detectStructureVersion(testDir);
    expect(version).toBe('v2');
    
    // Check workflow directories exist
    const states = v2.getExistingWorkflowStates(testDir);
    expect(states).toContain('backlog');
    expect(states).toContain('current');
    expect(states).toContain('archive');
  });
  
  it('should create a task in backlog', async () => {
    // Initialize
    v2.initializeV2ProjectStructure(testDir);
    
    // Create task
    const result = await v2.createTask(testDir, {
      title: 'Test Task',
      type: 'feature',
      area: 'general',
      workflowState: 'backlog',
      status: 'To Do'
    });
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.metadata.location.workflowState).toBe('backlog');
    expect(result.data!.document.title).toBe('Test Task');
  });
});