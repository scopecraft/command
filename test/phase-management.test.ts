/**
 * Tests for phase management functionality
 */
import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import sinon from 'sinon';
import { 
  listPhases, 
  createPhase, 
  updatePhase,
  getTasksDirectory,
  getPhasesDirectory
} from '../src/core/task-manager';
import { projectConfig } from '../src/core/project-config';
import { Phase } from '../src/core/types';

describe('Phase Management', () => {
  // Sandbox for sinon stubs
  let sandbox: sinon.SinonSandbox;
  
  // Mock directories and filepaths
  const mockTasksRoot = '/mock/tasks';
  const mockConfigRoot = '/mock/tasks/config';
  const mockPhasesConfig = '/mock/tasks/config/phases.toml';
  
  // Sample phases for testing
  const testPhase1: Phase = {
    id: 'phase-1',
    name: 'Phase 1',
    description: 'Test phase 1',
    status: '🟡 Planned',
    tasks: [],
    order: 1
  };
  
  const testPhase2: Phase = {
    id: 'phase-2',
    name: 'Phase 2',
    description: 'Test phase 2',
    status: '🟡 Planned',
    tasks: [],
    order: 2
  };
  
  beforeEach(() => {
    // Create a sinon sandbox
    sandbox = sinon.createSandbox();
    
    // Stub fs methods
    sandbox.stub(fs, 'existsSync').returns(true);
    sandbox.stub(fs, 'mkdirSync');
    sandbox.stub(fs, 'writeFileSync');
    sandbox.stub(fs, 'readFileSync').callsFake((filePath) => {
      if (filePath === mockPhasesConfig) {
        return `[phases]
[[phases]]
id = "phase-1"
name = "Phase 1"
description = "Test phase 1"
status = "🟡 Planned"
order = 1

[[phases]]
id = "phase-2"
name = "Phase 2"
description = "Test phase 2"
status = "🟡 Planned"
order = 2
`;
      }
      return '';
    });
    sandbox.stub(fs, 'readdirSync').returns([
      { name: 'phase-1', isDirectory: () => true },
      { name: 'phase-2', isDirectory: () => true },
      { name: 'config', isDirectory: () => true }
    ] as any);
    
    // Stub projectConfig methods
    sandbox.stub(projectConfig, 'getTasksDirectory').returns(mockTasksRoot);
    sandbox.stub(projectConfig, 'getPhasesDirectory').returns(mockTasksRoot);
    sandbox.stub(projectConfig, 'getConfigDirectory').returns(mockConfigRoot);
    sandbox.stub(projectConfig, 'getPhasesConfigPath').returns(mockPhasesConfig);
  });
  
  afterEach(() => {
    // Restore stubs
    sandbox.restore();
  });
  
  describe('updatePhase', () => {
    it('should successfully update a phase without changing ID', async () => {
      // Arrange
      const phaseId = 'phase-1';
      const updates = {
        name: 'Updated Phase 1',
        description: 'Updated description',
        status: '🔵 In Progress'
      };
      
      // Act
      const result = await updatePhase(phaseId, updates);
      
      // Assert
      expect(result.success).to.be.true;
      if (result.success && result.data) {
        expect(result.data.id).to.equal(phaseId);
        expect(result.data.name).to.equal(updates.name);
        expect(result.data.description).to.equal(updates.description);
        expect(result.data.status).to.equal(updates.status);
      }
    });
    
    it('should successfully update a phase with ID change', async () => {
      // Arrange
      const phaseId = 'phase-1';
      const updates = {
        id: 'phase-1-new',
        name: 'Updated Phase 1',
        description: 'Updated description',
        status: '🔵 In Progress'
      };
      
      // Stub methods needed for directory rename
      const rmdirStub = sandbox.stub(fs, 'rmdirSync');
      const copyFileStub = sandbox.stub(fs, 'copyFileSync');
      
      // Stub listTasks for updating task references
      const listTasksStub = sandbox.stub().resolves({
        success: true,
        data: [
          {
            metadata: {
              id: 'task-1',
              title: 'Task 1',
              phase: 'phase-1'
            },
            content: 'Task 1 content',
            filePath: '/mock/tasks/phase-1-new/task-1.md'
          }
        ]
      });
      const formatTaskFileStub = sandbox.stub().returns('formatted task content');
      
      // Replace the originals with stubs in module imports
      const taskManager = require('../src/core/task-manager');
      sandbox.stub(taskManager, 'listTasks').get(() => listTasksStub);
      sandbox.stub(taskManager, 'formatTaskFile').get(() => formatTaskFileStub);
      
      // Act
      const result = await updatePhase(phaseId, updates);
      
      // Assert
      expect(result.success).to.be.true;
      if (result.success && result.data) {
        expect(result.data.id).to.equal(updates.id);
        expect(result.data.name).to.equal(updates.name);
        expect(result.data.description).to.equal(updates.description);
        expect(result.data.status).to.equal(updates.status);
      }
      
      // Verify that directory was renamed
      expect(fs.mkdirSync.calledWith(path.join(mockTasksRoot, updates.id), { recursive: true })).to.be.true;
    });
    
    it('should return error when phase does not exist', async () => {
      // Arrange
      const phaseId = 'non-existent-phase';
      const updates = {
        name: 'Non-existent Phase',
        status: '🟡 Planned'
      };
      
      // Act
      const result = await updatePhase(phaseId, updates);
      
      // Assert
      expect(result.success).to.be.false;
      expect(result.error).to.include('not found');
    });
    
    it('should return error when new phase ID is invalid', async () => {
      // Arrange
      const phaseId = 'phase-1';
      const updates = {
        id: 'phase 1 with spaces', // Invalid ID with spaces
        name: 'Invalid Phase ID'
      };
      
      // Act
      const result = await updatePhase(phaseId, updates);
      
      // Assert
      expect(result.success).to.be.false;
      expect(result.error).to.include('Invalid phase ID format');
    });
    
    it('should return error when new phase ID already exists', async () => {
      // Arrange
      const phaseId = 'phase-1';
      const updates = {
        id: 'phase-2', // ID that already exists
        name: 'Duplicate Phase ID'
      };
      
      // Act
      const result = await updatePhase(phaseId, updates);
      
      // Assert
      expect(result.success).to.be.false;
      expect(result.error).to.include('already exists');
    });
  });
});