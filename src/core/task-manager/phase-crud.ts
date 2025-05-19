import fs from 'node:fs';
import path from 'node:path';
import { parse as parseToml, stringify as stringifyToml } from '@iarna/toml';
import { ProjectConfig } from '../project-config.js';
import type { OperationResult, Phase, Task } from '../types.js';
import { ensureDirectoryExists, getAllFiles, getTasksDirectory } from './index.js';
import { listTasks } from './task-crud.js';

/**
 * Lists all phases
 * @returns Operation result with array of phases
 */
export async function listPhases(): Promise<OperationResult<Phase[]>> {
  try {
    const tasksDir = getTasksDirectory();
    if (!fs.existsSync(tasksDir)) {
      return {
        success: false,
        error: `Tasks directory not found: ${tasksDir}`,
      };
    }

    // Get all directories in tasks folder (except system dirs)
    const entries = fs.readdirSync(tasksDir, { withFileTypes: true });
    const phases: Phase[] = [];
    const systemDirs = ['config', 'templates']; // Directories to exclude

    for (const entry of entries) {
      if (entry.isDirectory() && !systemDirs.includes(entry.name)) {
        const phaseDir = path.join(tasksDir, entry.name);

        // Attempt to load phase info from .phase.toml if it exists
        const phaseInfoPath = path.join(phaseDir, '.phase.toml');
        let phase: Phase = {
          id: entry.name,
          name: entry.name,
          status: '🟡 Pending',
        };

        if (fs.existsSync(phaseInfoPath)) {
          try {
            const content = fs.readFileSync(phaseInfoPath, 'utf-8');
            const phaseInfo = parseToml(content) as Partial<Phase>;

            // Merge parsed info with defaults
            phase = {
              ...phase,
              ...phaseInfo,
            };
          } catch (error) {
            console.warn(
              `Error parsing phase info for ${entry.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }

        // Count tasks in this phase
        try {
          const taskFiles = fs.readdirSync(phaseDir).filter((f) => f.endsWith('.md'));
          phase.task_count = taskFiles.length;
        } catch (error) {
          console.warn(
            `Error counting tasks for ${entry.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }

        phases.push(phase);
      }
    }

    // Sort phases by order if set, otherwise alphabetically
    phases.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return (a.id || '').localeCompare(b.id || '');
    });

    return {
      success: true,
      data: phases,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error listing phases: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Creates a new phase
 * @param phase Phase object to create
 * @returns Operation result with created phase
 */
export async function createPhase(phase: Phase): Promise<OperationResult<Phase>> {
  try {
    const tasksDir = getTasksDirectory();

    if (!fs.existsSync(tasksDir)) {
      // Create tasks directory if it doesn't exist
      fs.mkdirSync(tasksDir, { recursive: true });
    }

    const phaseDir = path.join(tasksDir, phase.id);

    if (fs.existsSync(phaseDir)) {
      return {
        success: false,
        error: `Phase directory already exists: ${phaseDir}`,
      };
    }

    // Create phase directory
    fs.mkdirSync(phaseDir, { recursive: true });

    // Create .phase.toml file with phase info
    const phaseInfoPath = path.join(phaseDir, '.phase.toml');
    const phaseInfo = {
      id: phase.id,
      name: phase.name || phase.id,
      description: phase.description || '',
      status: phase.status || '🟡 Pending',
      order: phase.order,
    };

    const phaseInfoContent = stringifyToml(phaseInfo);
    fs.writeFileSync(phaseInfoPath, phaseInfoContent);

    return {
      success: true,
      data: phaseInfo as Phase,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error creating phase: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Updates a phase
 * @param id Phase ID
 * @param updates Updates to apply
 * @returns Operation result with updated phase
 */
export async function updatePhase(
  id: string,
  updates: Partial<Phase>
): Promise<OperationResult<Phase>> {
  try {
    const tasksDir = getTasksDirectory();
    const phaseDir = path.join(tasksDir, id);

    if (!fs.existsSync(phaseDir)) {
      return {
        success: false,
        error: `Phase not found: ${id}`,
      };
    }

    // Check for ID change
    const newId = updates.id;
    const needsDirectoryRename = newId && newId !== id;

    // Read existing phase info
    const phaseInfoPath = path.join(phaseDir, '.phase.toml');
    let phaseInfo: Phase = {
      id,
      name: id,
      status: '🟡 Pending',
    };

    if (fs.existsSync(phaseInfoPath)) {
      try {
        const content = fs.readFileSync(phaseInfoPath, 'utf-8');
        const parsedInfo = parseToml(content) as Partial<Phase>;

        // Merge parsed info with defaults
        phaseInfo = {
          ...phaseInfo,
          ...parsedInfo,
        };
      } catch (error) {
        return {
          success: false,
          error: `Error parsing phase info: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }

    // Update phase info
    const updatedPhaseInfo: Phase = {
      ...phaseInfo,
      ...updates,
    };

    // Special case: if id is changed, we need to rename the directory
    if (needsDirectoryRename) {
      const newPhaseDir = path.join(tasksDir, newId);

      if (fs.existsSync(newPhaseDir)) {
        return {
          success: false,
          error: `Cannot rename phase: target ${newId} already exists`,
        };
      }

      // Rename directory
      fs.renameSync(phaseDir, newPhaseDir);

      // Update tasks in this phase to reference the new phase id
      const tasksResult = await listTasks({ phase: id, include_content: true });
      if (tasksResult.success && tasksResult.data) {
        for (const task of tasksResult.data) {
          try {
            // Update the phase reference in each task
            task.metadata.phase = newId;

            // Determine the new file path
            const oldPath = task.filePath;
            if (!oldPath) continue;

            const fileName = path.basename(oldPath);
            let newPath: string;

            // Handle subdirectory tasks
            if (task.metadata.subdirectory) {
              const subdir = task.metadata.subdirectory;
              const subdirPath = path.join(newPhaseDir, subdir);

              // Create subdirectory if needed
              if (!fs.existsSync(subdirPath)) {
                fs.mkdirSync(subdirPath, { recursive: true });
              }

              newPath = path.join(subdirPath, fileName);
            } else {
              newPath = path.join(newPhaseDir, fileName);
            }

            // Write the updated task
            const taskContent = formatTaskFile(task);
            fs.writeFileSync(newPath, taskContent);

            // Remove the old file if it's not the same as the new one
            if (oldPath !== newPath) {
              fs.unlinkSync(oldPath);
            }
          } catch (error) {
            console.warn(
              `Error updating task ${task.metadata.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }
      }

      // Update phase info path
      const newPhaseInfoPath = path.join(newPhaseDir, '.phase.toml');

      // Write updated phase info
      const phaseInfoContent = stringifyToml(updatedPhaseInfo);
      fs.writeFileSync(newPhaseInfoPath, phaseInfoContent);
    } else {
      // Just update the phase info file
      const phaseInfoContent = stringifyToml(updatedPhaseInfo);
      fs.writeFileSync(phaseInfoPath, phaseInfoContent);
    }

    return {
      success: true,
      data: updatedPhaseInfo,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error updating phase: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Helper function to format task file content
 * (Temporary implementation until we fix circular dependency)
 */
function formatTaskFile(task: Task): string {
  const frontmatter = stringifyToml(task.metadata);
  return `+++\n${frontmatter}+++\n\n${task.content || ''}`;
}

/**
 * Deletes a phase
 * @param id Phase ID
 * @param options Options for deletion
 * @returns Operation result
 */
export async function deletePhase(
  id: string,
  options: { force?: boolean } = {}
): Promise<OperationResult<void>> {
  try {
    const tasksDir = getTasksDirectory();
    const phaseDir = path.join(tasksDir, id);

    if (!fs.existsSync(phaseDir)) {
      return {
        success: false,
        error: `Phase not found: ${id}`,
      };
    }

    // Check if phase has tasks
    const entries = fs.readdirSync(phaseDir);
    const hasTasks = entries.some(
      (entry) => entry.endsWith('.md') || fs.statSync(path.join(phaseDir, entry)).isDirectory()
    );

    if (hasTasks && !options.force) {
      return {
        success: false,
        error: 'Phase has tasks. Use --force to delete anyway.',
      };
    }

    // Delete phase directory recursively
    fs.rmSync(phaseDir, { recursive: true, force: true });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error deleting phase: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
