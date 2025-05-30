/**
 * Tests for phase management functionality
 */
import fs from 'node:fs';
import path from 'node:path';
import { expect } from 'chai';
import sinon from 'sinon';
import { projectConfig } from '../src/core/project-config';
import {
  createPhase,
  getPhasesDirectory,
  getTasksDirectory,
  listPhases,
  updatePhase,
} from '../src/core/task-manager';
import type { Phase } from '../src/core/types';

describe('Phase Management', () => {
  // Sandbox for sinon stubs
  let sandbox: sinon.SinonSandbox;

  // Mock directories and filepaths
  const mockTasksRoot = '/mock/tasks';
  const mockConfigRoot = '/mock/tasks/config';
  const mockPhasesConfig = '/mock/tasks/config/phases.toml';

  // Sample phases for testing
  const _testPhase1: Phase = {
    id: 'phase-1',
    name: 'Phase 1',
    description: 'Test phase 1',
    status: '🟡 Planned',
    tasks: [],
    order: 1,
  };

  const _testPhase2: Phase = {
    id: 'phase-2',
    name: 'Phase 2',
    description: 'Test phase 2',
    status: '🟡 Planned',
    tasks: [],
    order: 2,
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
      { name: 'config', isDirectory: () => true },
    ] as any);

    // Stub projectConfig methods
    sandbox.stub(projectConfig, 'getTasksDirectory').returns(mockTasksRoot);
    sandbox.stub(projectConfig, 'getPhasesDirectory').returns(mockTasksRoot);
    sandbox.stub(projectConfig, 'getConfigDirectory').returns(mockConfigRoot);
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
        status: '🔵 In Progress',
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
        status: '🔵 In Progress',
      };

      // Stub methods needed for directory rename
      const _rmdirStub = sandbox.stub(fs, 'rmdirSync');
      const _copyFileStub = sandbox.stub(fs, 'copyFileSync');

      // Stub listTasks for updating task references
      const listTasksStub = sandbox.stub().resolves({
        success: true,
        data: [
          {
            metadata: {
              id: 'task-1',
              title: 'Task 1',
              phase: 'phase-1',
            },
            content: 'Task 1 content',
            filePath: '/mock/tasks/phase-1-new/task-1.md',
          },
        ],
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
      expect(fs.mkdirSync.calledWith(path.join(mockTasksRoot, updates.id), { recursive: true })).to
        .be.true;
    });

    it('should return error when phase does not exist', async () => {
      // Arrange
      const phaseId = 'non-existent-phase';
      const updates = {
        name: 'Non-existent Phase',
        status: '🟡 Planned',
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
        name: 'Invalid Phase ID',
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
        name: 'Duplicate Phase ID',
      };

      // Act
      const result = await updatePhase(phaseId, updates);

      // Assert
      expect(result.success).to.be.false;
      expect(result.error).to.include('already exists');
    });
  });

  describe('deletePhase', () => {
    it('should successfully delete a phase with no tasks', async () => {
      // Arrange
      const phaseId = 'phase-1';

      // Stub listPhases to return a phase with no tasks
      const listPhasesStub = sandbox.stub().resolves({
        success: true,
        data: [
          {
            id: 'phase-1',
            name: 'Phase 1',
            description: 'Test phase 1',
            status: '🟡 Planned',
            tasks: [],
          },
        ],
      });

      // Replace the originals with stubs in module imports
      const taskManager = require('../src/core/task-manager');
      sandbox.stub(taskManager, 'listPhases').get(() => listPhasesStub);

      // Add stubs for directory removal
      const rmdirStub = sandbox.stub(fs, 'rmdirSync');
      const _unlinkStub = sandbox.stub(fs, 'unlinkSync');

      // Act
      const result = await taskManager.deletePhase(phaseId);

      // Assert
      expect(result.success).to.be.true;
      expect(result.message).to.include('deleted successfully');
      expect(rmdirStub.called).to.be.true;
    });

    it('should return error when trying to delete a phase with tasks without force option', async () => {
      // Arrange
      const phaseId = 'phase-1';
      const listPhasesStub = sandbox.stub().resolves({
        success: true,
        data: [
          {
            id: 'phase-1',
            name: 'Phase 1',
            description: 'Test phase 1',
            status: '🟡 Planned',
            tasks: ['task-1', 'task-2'],
          },
        ],
      });

      // Replace the originals with stubs in module imports
      const taskManager = require('../src/core/task-manager');
      sandbox.stub(taskManager, 'listPhases').get(() => listPhasesStub);

      // Act
      const result = await taskManager.deletePhase(phaseId);

      // Assert
      expect(result.success).to.be.false;
      expect(result.error).to.include('has 2 tasks');
      expect(result.error).to.include('--force');
    });

    it('should successfully delete a phase with tasks when force option is used', async () => {
      // Arrange
      const phaseId = 'phase-1';
      const listPhasesStub = sandbox.stub().resolves({
        success: true,
        data: [
          {
            id: 'phase-1',
            name: 'Phase 1',
            description: 'Test phase 1',
            status: '🟡 Planned',
            tasks: ['task-1', 'task-2'],
          },
        ],
      });

      // Replace the originals with stubs in module imports
      const taskManager = require('../src/core/task-manager');
      sandbox.stub(taskManager, 'listPhases').get(() => listPhasesStub);

      // Add stubs for directory removal
      const _rmdirStub = sandbox.stub(fs, 'rmdirSync');
      const _unlinkStub = sandbox.stub(fs, 'unlinkSync');

      // Act
      const result = await taskManager.deletePhase(phaseId, { force: true });

      // Assert
      expect(result.success).to.be.true;
      expect(result.message).to.include('deleted successfully');
    });
  });
});
