import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import type { RuntimeConfig } from '../src/core/config/types.js';
import {
  createTask,
  updateTask,
  deleteTask,
  getTask,
  listTasks,
} from '../src/core/task-manager/task-crud.js';
import {
  createFeature,
  updateFeature,
  deleteFeature,
  getFeature,
  listFeatures,
} from '../src/core/task-manager/feature-crud.js';
import {
  createArea,
  updateArea,
  deleteArea,
  getArea,
  listAreas,
} from '../src/core/task-manager/area-crud.js';
import {
  createPhase,
  updatePhase,
  deletePhase,
  listPhases,
} from '../src/core/task-manager/phase-crud.js';
import type { Task, Feature, Area, Phase } from '../src/core/types.js';

describe('CRUD Operations Refactor Tests', () => {
  let tempDir: string;
  let config: RuntimeConfig;

  beforeEach(() => {
    // Create a temporary directory for tests
    tempDir = fs.mkdtempSync(path.join('/tmp', 'crud-tests-'));
    config = {
      tasksDir: path.join(tempDir, '.tasks'),
      projectRoot: tempDir,
    };

    // Create the tasks directory
    fs.mkdirSync(config.tasksDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Task CRUD Operations', () => {
    it('should create a task with options pattern', async () => {
      const task: Task = {
        metadata: {
          id: 'TASK-001',
          title: 'Test Task',
          status: '🟡 To Do',
          type: '🌟 Feature',
          priority: '▶️ Medium',
          phase: 'backlog',
        },
        content: 'Test task content',
      };

      const result = await createTask(task, {
        subdirectory: 'test-subdir',
        config,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.metadata.id).toBe('TASK-001');
      expect(result.data?.metadata.subdirectory).toBe('test-subdir');

      // Verify file was created
      const filePath = path.join(config.tasksDir, 'backlog', 'test-subdir', 'TASK-001.md');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should update a task with options pattern', async () => {
      // First create a task
      const task: Task = {
        metadata: {
          id: 'TASK-UPDATE-001',
          title: 'Task to Update',
          status: '🟡 To Do',
          phase: 'backlog',
        },
        content: 'Original content',
      };

      await createTask(task, { config });

      // Now update it
      const result = await updateTask(
        'TASK-UPDATE-001',
        {
          status: '🔵 In Progress',
          content: 'Updated content',
        },
        {
          phase: 'backlog',
          config,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data?.metadata.status).toBe('🔵 In Progress');
      expect(result.data?.content).toBe('Updated content');
    });

    it('should delete a task with options pattern', async () => {
      // First create a task
      const task: Task = {
        metadata: {
          id: 'TASK-DELETE-001',
          title: 'Task to Delete',
          status: '🟡 To Do',
          phase: 'backlog',
        },
        content: 'Will be deleted',
      };

      await createTask(task, { config });

      // Verify it exists
      const getResult = await getTask('TASK-DELETE-001', { phase: 'backlog', config });
      expect(getResult.success).toBe(true);

      // Now delete it
      const deleteResult = await deleteTask('TASK-DELETE-001', {
        phase: 'backlog',
        config,
      });

      expect(deleteResult.success).toBe(true);

      // Verify it's gone
      const getAgainResult = await getTask('TASK-DELETE-001', { phase: 'backlog', config });
      expect(getAgainResult.success).toBe(false);
    });

    it('should list tasks with runtime config', async () => {
      // Create a few tasks
      const task1: Task = {
        metadata: {
          id: 'TASK-LIST-001',
          title: 'First Task',
          status: '🟡 To Do',
          phase: 'backlog',
        },
        content: 'First task',
      };

      const task2: Task = {
        metadata: {
          id: 'TASK-LIST-002',
          title: 'Second Task',
          status: '🔵 In Progress',
          phase: 'backlog',
        },
        content: 'Second task',
      };

      await createTask(task1, { config });
      await createTask(task2, { config });

      // List tasks
      const result = await listTasks({ config });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      expect(result.data?.find(t => t.metadata.id === 'TASK-LIST-001')).toBeDefined();
      expect(result.data?.find(t => t.metadata.id === 'TASK-LIST-002')).toBeDefined();
    });
  });

  describe('Feature CRUD Operations', () => {
    it('should create a feature with options pattern', async () => {
      // First create a phase
      await createPhase({ id: 'dev', name: 'Development' }, { config });

      const result = await createFeature('test-feature', {
        title: 'Test Feature',
        phase: 'dev',
        description: 'A test feature',
        config,
      });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('FEATURE_test-feature');
      expect(result.data?.title).toBe('Test Feature');

      // Verify directory was created
      const featureDir = path.join(config.tasksDir, 'dev', 'FEATURE_test-feature');
      expect(fs.existsSync(featureDir)).toBe(true);

      // Verify overview file was created
      const overviewPath = path.join(featureDir, '_overview.md');
      expect(fs.existsSync(overviewPath)).toBe(true);
    });

    it('should update a feature with options pattern', async () => {
      // Create phase and feature
      await createPhase({ id: 'dev', name: 'Development' }, { config });
      await createFeature('update-test', {
        title: 'Feature to Update',
        phase: 'dev',
        config,
      });

      // Update the feature
      const result = await updateFeature(
        'FEATURE_update-test',
        {
          title: 'Updated Feature Title',
          status: '🔵 In Progress',
        },
        {
          phase: 'dev',
          config,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Updated Feature Title');
      expect(result.data?.status).toBe('🔵 In Progress');
    });

    it('should delete a feature with options pattern', async () => {
      // Create phase and feature
      await createPhase({ id: 'dev', name: 'Development' }, { config });
      await createFeature('delete-test', {
        title: 'Feature to Delete',
        phase: 'dev',
        config,
      });

      // Verify it exists
      const getResult = await getFeature('FEATURE_delete-test', { phase: 'dev', config });
      expect(getResult.success).toBe(true);

      // Delete it
      const deleteResult = await deleteFeature('FEATURE_delete-test', {
        phase: 'dev',
        force: true,
        config,
      });

      expect(deleteResult.success).toBe(true);

      // Verify it's gone
      const getAgainResult = await getFeature('FEATURE_delete-test', { phase: 'dev', config });
      expect(getAgainResult.success).toBe(false);
    });

    it('should list features with runtime config', async () => {
      // Create phase and features
      await createPhase({ id: 'dev', name: 'Development' }, { config });
      await createFeature('feature-1', {
        title: 'Feature One',
        phase: 'dev',
        config,
      });
      await createFeature('feature-2', {
        title: 'Feature Two',
        phase: 'dev',
        config,
      });

      // List features
      const result = await listFeatures({ config });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      expect(result.data?.find(f => f.id === 'FEATURE_feature-1')).toBeDefined();
      expect(result.data?.find(f => f.id === 'FEATURE_feature-2')).toBeDefined();
    });
  });

  describe('Area CRUD Operations', () => {
    it('should create an area with options pattern', async () => {
      // First create a phase
      await createPhase({ id: 'dev', name: 'Development' }, { config });

      const result = await createArea('test-area', {
        title: 'Test Area',
        phase: 'dev',
        description: 'A test area',
        config,
      });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('AREA_test-area');
      expect(result.data?.title).toBe('Test Area');

      // Verify directory was created
      const areaDir = path.join(config.tasksDir, 'dev', 'AREA_test-area');
      expect(fs.existsSync(areaDir)).toBe(true);
    });

    it('should update an area with options pattern', async () => {
      // Create phase and area
      await createPhase({ id: 'dev', name: 'Development' }, { config });
      await createArea('update-area', {
        title: 'Area to Update',
        phase: 'dev',
        config,
      });

      // Update the area
      const result = await updateArea(
        'AREA_update-area',
        {
          title: 'Updated Area Title',
          status: '🔵 In Progress',
        },
        {
          phase: 'dev',
          config,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Updated Area Title');
      expect(result.data?.status).toBe('🔵 In Progress');
    });

    it('should delete an area with options pattern', async () => {
      // Create phase and area
      await createPhase({ id: 'dev', name: 'Development' }, { config });
      await createArea('delete-area', {
        title: 'Area to Delete',
        phase: 'dev',
        config,
      });

      // Delete it
      const deleteResult = await deleteArea('AREA_delete-area', {
        phase: 'dev',
        force: true,
        config,
      });

      expect(deleteResult.success).toBe(true);
    });

    it('should list areas with runtime config', async () => {
      // Create phase and areas
      await createPhase({ id: 'dev', name: 'Development' }, { config });
      await createArea('area-1', {
        title: 'Area One',
        phase: 'dev',
        config,
      });
      await createArea('area-2', {
        title: 'Area Two',
        phase: 'dev',
        config,
      });

      // List areas
      const result = await listAreas({ config });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      expect(result.data?.find(a => a.id === 'AREA_area-1')).toBeDefined();
      expect(result.data?.find(a => a.id === 'AREA_area-2')).toBeDefined();
    });
  });

  describe('Phase CRUD Operations', () => {
    it('should create a phase with runtime config', async () => {
      const phase: Phase = {
        id: 'test-phase',
        name: 'Test Phase',
        description: 'A test phase',
        status: '🟡 Pending',
      };

      const result = await createPhase(phase, { config });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('test-phase');
      expect(result.data?.name).toBe('Test Phase');

      // Verify directory was created
      const phaseDir = path.join(config.tasksDir, 'test-phase');
      expect(fs.existsSync(phaseDir)).toBe(true);

      // Verify .phase.toml was created
      const phaseInfoPath = path.join(phaseDir, '.phase.toml');
      expect(fs.existsSync(phaseInfoPath)).toBe(true);
    });

    it('should update a phase with runtime config', async () => {
      // Create a phase
      await createPhase(
        { id: 'update-phase', name: 'Phase to Update' },
        { config }
      );

      // Update it
      const result = await updatePhase(
        'update-phase',
        {
          name: 'Updated Phase Name',
          description: 'Updated description',
          status: '🔵 In Progress',
        },
        { config }
      );

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Updated Phase Name');
      expect(result.data?.description).toBe('Updated description');
      expect(result.data?.status).toBe('🔵 In Progress');
    });

    it('should delete a phase with runtime config', async () => {
      // Create a phase
      await createPhase(
        { id: 'delete-phase', name: 'Phase to Delete' },
        { config }
      );

      // Delete it
      const result = await deletePhase('delete-phase', {
        force: true,
        config,
      });

      expect(result.success).toBe(true);

      // Verify it's gone
      const phaseDir = path.join(config.tasksDir, 'delete-phase');
      expect(fs.existsSync(phaseDir)).toBe(false);
    });

    it('should list phases with runtime config', async () => {
      // Create a few phases
      await createPhase({ id: 'phase-1', name: 'Phase One' }, { config });
      await createPhase({ id: 'phase-2', name: 'Phase Two' }, { config });

      // List phases
      const result = await listPhases({ config });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      expect(result.data?.find(p => p.id === 'phase-1')).toBeDefined();
      expect(result.data?.find(p => p.id === 'phase-2')).toBeDefined();
    });
  });

  describe('Runtime Config Propagation', () => {
    it('should use custom runtime config for all operations', async () => {
      // Create custom config with different path
      const customDir = path.join(tempDir, 'custom-tasks');
      const customConfig: RuntimeConfig = {
        tasksDir: customDir,
        projectRoot: tempDir,
      };

      // Create the custom directory
      fs.mkdirSync(customDir, { recursive: true });

      // Create a task with custom config
      const task: Task = {
        metadata: {
          id: 'CUSTOM-001',
          title: 'Custom Config Task',
          status: '🟡 To Do',
          phase: 'custom-phase',
        },
        content: 'Task with custom config',
      };

      const result = await createTask(task, { config: customConfig });
      expect(result.success).toBe(true);

      // Verify file was created in custom location
      const filePath = path.join(customDir, 'custom-phase', 'CUSTOM-001.md');
      expect(fs.existsSync(filePath)).toBe(true);

      // Verify default location doesn't have the file
      const defaultPath = path.join(config.tasksDir, 'custom-phase', 'CUSTOM-001.md');
      expect(fs.existsSync(defaultPath)).toBe(false);
    });
  });
});