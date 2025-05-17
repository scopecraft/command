import fs from 'node:fs';
import path from 'node:path';
import { parse as parseToml, stringify as stringifyToml } from '@iarna/toml';
import { projectConfig } from '../project-config.js';
import { formatTaskFile, parseTaskFile } from '../task-parser.js';
import type {
  Area,
  AreaFilterOptions,
  AreaUpdateOptions,
  OperationResult,
  Task,
} from '../types.js';
import { ensureDirectoryExists, getTasksDirectory } from './directory-utils.js';
import { createTask, deleteTask, getTask, listTasks, updateTask } from './task-crud.js';
import { updateRelationships } from './task-relationships.js';

/**
 * Lists all areas with optional filtering
 * @param options Filter options
 * @returns Operation result with array of areas
 */
export async function listAreas(options: AreaFilterOptions = {}): Promise<OperationResult<Area[]>> {
  try {
    const tasksDir = getTasksDirectory();

    if (!fs.existsSync(tasksDir)) {
      return {
        success: false,
        error: `Tasks directory not found: ${tasksDir}`,
      };
    }

    const areas: Area[] = [];

    // Get all subdirectories in all phases that start with AREA_
    const phases = fs
      .readdirSync(tasksDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    // Filter by phase if specified
    const targetPhases = options.phase ? [options.phase] : phases;

    for (const phase of targetPhases) {
      const phaseDir = path.join(tasksDir, phase);

      if (!fs.existsSync(phaseDir)) continue;

      const subdirs = fs
        .readdirSync(phaseDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory() && dirent.name.startsWith('AREA_'))
        .map((dirent) => dirent.name);

      for (const subdir of subdirs) {
        const areaDir = path.join(phaseDir, subdir);

        // Check for _overview.md file
        const overviewPath = path.join(areaDir, '_overview.md');
        let overviewTask: Task | null = null;

        if (fs.existsSync(overviewPath)) {
          try {
            const content = fs.readFileSync(overviewPath, 'utf-8');
            overviewTask = parseTaskFile(content);
            overviewTask.filePath = overviewPath;

            // Extract phase and subdirectory from file path if not in metadata
            const pathInfo = projectConfig.parseTaskPath(overviewPath);
            if (pathInfo.phase && !overviewTask.metadata.phase) {
              overviewTask.metadata.phase = pathInfo.phase;
            }
            if (pathInfo.subdirectory && !overviewTask.metadata.subdirectory) {
              overviewTask.metadata.subdirectory = pathInfo.subdirectory;
            }

            // Mark as overview file
            overviewTask.metadata.is_overview = true;
          } catch (error) {
            // If overview file can't be parsed, still add the area but without details
            console.error(`Error parsing overview file ${overviewPath}: ${error}`);
          }
        }

        // Get count of tasks in the area directory
        const taskFiles = fs
          .readdirSync(areaDir)
          .filter((file) => file.endsWith('.md') && file !== '_overview.md');

        const areaName = subdir.replace(/^AREA_/, '');

        // List tasks in the area directory if requested
        let taskObjects: Task[] = [];
        let taskIds: string[] = [];

        // Get all tasks for this area
        const tasksResult = await listTasks({
          phase,
          subdirectory: subdir,
          include_content: options.include_content || false,
          include_completed: options.include_completed || false,
        });

        if (tasksResult.success && tasksResult.data) {
          taskObjects = tasksResult.data;
          taskIds = taskObjects.map((task) => task.metadata.id);
        }

        // Calculate progress if requested
        let progress = 0;
        if (options.include_progress) {
          const allTasksResult = await listTasks({
            phase,
            subdirectory: subdir,
            include_completed: true,
          });

          if (allTasksResult.success && allTasksResult.data) {
            const allTasks = allTasksResult.data;
            const totalTasks = allTasks.length;

            if (totalTasks > 0) {
              const completedTasks = allTasks.filter((task) => {
                const status = task.metadata.status || '';
                return (
                  status.includes('Done') ||
                  status.includes('🟢') ||
                  status.includes('Completed') ||
                  status.includes('Complete')
                );
              }).length;

              progress = Math.round((completedTasks / totalTasks) * 100);
            }
          }
        }

        // Determine area status based on tasks
        let status = '';
        if (overviewTask?.metadata.status) {
          status = overviewTask.metadata.status;
        } else {
          // If no overview status, derive from tasks
          const tasksInProgress = taskObjects.some(
            (task) =>
              (task.metadata.status || '').includes('In Progress') ||
              (task.metadata.status || '').includes('🔵')
          );

          const tasksBlocked = taskObjects.some(
            (task) =>
              (task.metadata.status || '').includes('Blocked') ||
              (task.metadata.status || '').includes('⚪')
          );

          const tasksCompleted = taskObjects.every((task) => {
            const taskStatus = task.metadata.status || '';
            return (
              taskStatus.includes('Done') ||
              taskStatus.includes('🟢') ||
              taskStatus.includes('Completed') ||
              taskStatus.includes('Complete')
            );
          });

          if (taskObjects.length === 0) {
            status = '🟡 To Do';
          } else if (tasksBlocked) {
            status = '⚪ Blocked';
          } else if (tasksCompleted) {
            status = '🟢 Done';
          } else if (tasksInProgress) {
            status = '🔵 In Progress';
          } else {
            status = '🟡 To Do';
          }
        }

        // Create the area object
        const area: Area = {
          id: subdir,
          name: areaName,
          title: overviewTask?.metadata.title || areaName,
          description: overviewTask?.content || '',
          phase,
          task_count: taskFiles.length,
          progress,
          status,
          tasks: taskIds,
        };

        // Fix: Make sure description isn't using the status value
        if (area.description === '🟡 To Do' || area.description === status) {
          // Try to get a better description
          if (overviewTask?.metadata.assigned_to && overviewTask.metadata.assigned_to.length > 10) {
            // This is likely a description that was incorrectly set as assigned_to
            area.description = overviewTask.metadata.assigned_to;
          }
        }

        // Add the overview task if available
        if (overviewTask) {
          area.overview = overviewTask;
        }

        // Apply type filter if specified
        if (options.type && overviewTask && overviewTask.metadata.type !== options.type) {
          continue;
        }

        // Apply status filter if specified
        if (options.status && area.status !== options.status) {
          continue;
        }

        areas.push(area);
      }
    }

    // Sort areas by name
    areas.sort((a, b) => a.name.localeCompare(b.name));

    return {
      success: true,
      data: areas,
      message: `Found ${areas.length} areas`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error listing areas: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Gets an area by ID
 * @param id Area ID (e.g., "AREA_Refactoring")
 * @param phase Optional phase to look in
 * @returns Operation result with area if found
 */
export async function getArea(id: string, phase?: string): Promise<OperationResult<Area>> {
  try {
    const areas = await listAreas({
      phase,
      include_tasks: true,
      include_content: true,
      include_progress: true,
    });

    if (!areas.success) {
      return {
        success: false,
        error: areas.error,
      };
    }

    // Add AREA_ prefix if not present
    const areaId = id.startsWith('AREA_') ? id : `AREA_${id}`;

    const area = areas.data?.find((a) => a.id === areaId);

    if (!area) {
      return {
        success: false,
        error: `Area ${id} not found`,
      };
    }

    return {
      success: true,
      data: area,
      message: `Area ${id} found`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error getting area: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Creates a new area
 * @param name Area name (will be prefixed with AREA_ if not already)
 * @param title Area title
 * @param phase Phase to create the area in
 * @param type Area type (default: "🌟 Feature")
 * @param description Optional description
 * @param assignee Optional assignee
 * @returns Operation result with the created area
 */
export async function createArea(
  name: string,
  title: string,
  phase: string,
  type = '🌟 Feature',
  description?: string,
  assignee?: string,
  tags?: string[]
): Promise<OperationResult<Area>> {
  try {
    const tasksDir = getTasksDirectory();

    if (!fs.existsSync(tasksDir)) {
      fs.mkdirSync(tasksDir, { recursive: true });
    }

    // Add AREA_ prefix if not already present
    const areaId = name.startsWith('AREA_') ? name : `AREA_${name}`;

    // Check if area already exists
    const existingArea = await getArea(areaId, phase);
    if (existingArea.success) {
      return {
        success: false,
        error: `Area ${areaId} already exists in phase ${phase}`,
      };
    }

    // Create the area directory
    const areaDir = path.join(tasksDir, phase, areaId);
    ensureDirectoryExists(areaDir);

    // Create the overview file
    const overviewTask: Task = {
      metadata: {
        id: '_overview',
        title,
        type,
        status: '🟡 To Do',
        created_date: new Date().toISOString().split('T')[0],
        updated_date: new Date().toISOString().split('T')[0],
        phase,
        subdirectory: areaId,
        is_overview: true,
      },
      content:
        description ||
        `# ${title}\n\n## Description\n\nArea overview for ${name.replace(/^AREA_/, '')}`,
    };

    // Important: Only set assigned_to if explicitly provided
    if (assignee) {
      overviewTask.metadata.assigned_to = assignee;
    } else {
      // Make sure we explicitly set it to empty string to avoid description being
      // incorrectly used as assigned_to
      overviewTask.metadata.assigned_to = '';
    }

    if (tags && tags.length > 0) {
      overviewTask.metadata.tags = tags;
    }

    // Save the overview file
    const overviewPath = path.join(areaDir, '_overview.md');

    // Fix for the description/content issue - ensure content is properly set
    if (description && overviewTask.metadata.assigned_to === description) {
      // If description was erroneously set as assigned_to, fix it
      overviewTask.metadata.assigned_to = assignee || '';
    }

    // Make sure content is more than just the status
    if (
      overviewTask.content === '🟡 To Do' ||
      overviewTask.content === overviewTask.metadata.status
    ) {
      overviewTask.content =
        description ||
        `# ${title}\n\n## Description\n\nArea overview for ${name.replace(/^AREA_/, '')}`;
    }

    const fileContent = formatTaskFile(overviewTask);
    fs.writeFileSync(overviewPath, fileContent);

    // Return the created area
    const area: Area = {
      id: areaId,
      name: name.replace(/^AREA_/, ''),
      title,
      description: overviewTask.content,
      phase,
      task_count: 0,
      progress: 0,
      status: '🟡 To Do',
      tasks: [],
    };

    return {
      success: true,
      data: area,
      message: `Area ${areaId} created successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error creating area: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Updates an area
 * @param id Area ID
 * @param updates Updates to apply
 * @param phase Phase where the area is located
 * @returns Operation result with updated area
 */
export async function updateArea(
  id: string,
  updates: AreaUpdateOptions,
  phase?: string
): Promise<OperationResult<Area>> {
  try {
    // Get the area
    const areaResult = await getArea(id, phase);
    if (!areaResult.success || !areaResult.data) {
      return {
        success: false,
        error: areaResult.error || `Area ${id} not found`,
      };
    }

    const area = areaResult.data;

    // Add AREA_ prefix if not already present
    const areaId = id.startsWith('AREA_') ? id : `AREA_${id}`;

    // Build the path to the overview file
    const tasksDir = getTasksDirectory();
    const areaDir = path.join(tasksDir, area.phase, areaId);
    const overviewPath = path.join(areaDir, '_overview.md');

    // Check if overview file exists
    if (!fs.existsSync(overviewPath)) {
      // Create overview file if it doesn't exist
      const overviewTask: Task = {
        metadata: {
          id: '_overview',
          title: area.title,
          type: '🌟 Feature',
          status: area.status,
          created_date: new Date().toISOString().split('T')[0],
          updated_date: new Date().toISOString().split('T')[0],
          phase: area.phase,
          subdirectory: areaId,
          is_overview: true,
        },
        content:
          area.description || `# ${area.title}\n\n## Description\n\nArea overview for ${area.name}`,
      };

      const fileContent = formatTaskFile(overviewTask);
      fs.writeFileSync(overviewPath, fileContent);
    }

    // Get the current overview task
    let overviewTask: Task;
    try {
      const content = fs.readFileSync(overviewPath, 'utf-8');
      overviewTask = parseTaskFile(content);
      overviewTask.filePath = overviewPath;
    } catch (error) {
      return {
        success: false,
        error: `Error reading overview file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }

    // Make the updates
    if (updates.title) {
      overviewTask.metadata.title = updates.title;
    }

    if (updates.status) {
      overviewTask.metadata.status = updates.status;
    }

    if (updates.description) {
      overviewTask.content = updates.description;
    }

    // Update task file
    const fileContent = formatTaskFile(overviewTask);
    fs.writeFileSync(overviewPath, fileContent);

    // If name is being updated, rename the directory
    if (updates.name) {
      const newName = updates.name.startsWith('AREA_') ? updates.name : `AREA_${updates.name}`;

      if (newName !== areaId) {
        // Get the new directory path
        const newAreaDir = path.join(tasksDir, area.phase, newName);

        // Ensure parent directory exists
        const parentDir = path.dirname(newAreaDir);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }

        // Rename the directory
        fs.renameSync(areaDir, newAreaDir);

        // Update all tasks in the area to have the new subdirectory
        const tasksResult = await listTasks({
          phase: area.phase,
          subdirectory: areaId,
          include_content: true,
          include_completed: true,
        });

        if (tasksResult.success && tasksResult.data) {
          for (const task of tasksResult.data) {
            // Update the task file path and subdirectory
            const oldPath = task.filePath;
            if (!oldPath) continue;

            // Update the task metadata
            task.metadata.subdirectory = newName;

            // Write the updated task file to the new location
            const fileName = path.basename(oldPath);
            const newPath = path.join(newAreaDir, fileName);
            const updatedContent = formatTaskFile(task);
            fs.writeFileSync(newPath, updatedContent);

            // Delete the old file if it's not the same as the new one
            if (oldPath !== newPath && fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          }
        }

        // Update the area ID
        area.id = newName;
        area.name = updates.name.replace(/^AREA_/, '');
      }
    }

    // Update other area properties
    if (updates.title) {
      area.title = updates.title;
    }

    if (updates.status) {
      area.status = updates.status;
    }

    if (updates.description) {
      area.description = updates.description;
    }

    // Refresh the area data
    const updatedArea = await getArea(area.id, area.phase);

    return {
      success: updatedArea.success,
      data: updatedArea.data,
      message: `Area ${id} updated successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error updating area: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Deletes an area
 * @param id Area ID
 * @param phase Optional phase to look in
 * @param force Whether to force delete even if tasks exist
 * @returns Operation result
 */
export async function deleteArea(
  id: string,
  phase?: string,
  force = false
): Promise<OperationResult<void>> {
  try {
    // Get the area
    const areaResult = await getArea(id, phase);
    if (!areaResult.success || !areaResult.data) {
      return {
        success: false,
        error: areaResult.error || `Area ${id} not found`,
      };
    }

    const area = areaResult.data;

    // Add AREA_ prefix if not already present
    const areaId = id.startsWith('AREA_') ? id : `AREA_${id}`;

    // Build the path to the area directory
    const tasksDir = getTasksDirectory();
    const areaDir = path.join(tasksDir, area.phase, areaId);

    // Check if area directory exists
    if (!fs.existsSync(areaDir)) {
      return {
        success: false,
        error: `Area directory not found: ${areaDir}`,
      };
    }

    // Check if the area has tasks
    const files = fs.readdirSync(areaDir);
    const taskFiles = files.filter((file) => file.endsWith('.md') && file !== '_overview.md');

    if (taskFiles.length > 0 && !force) {
      return {
        success: false,
        error: `Area ${id} has ${taskFiles.length} tasks. Use force=true to delete anyway.`,
      };
    }

    // Delete all files in the area directory
    for (const file of files) {
      const filePath = path.join(areaDir, file);
      fs.unlinkSync(filePath);
    }

    // Delete the area directory
    fs.rmdirSync(areaDir);

    return {
      success: true,
      message: `Area ${id} deleted successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error deleting area: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
