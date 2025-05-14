import fs from 'fs';
import path from 'path';
import { parse as parseToml, stringify as stringifyToml } from '@iarna/toml';
import {
  Task,
  Feature,
  FeatureFilterOptions,
  FeatureUpdateOptions,
  OperationResult
} from '../types.js';
import { parseTaskFile, formatTaskFile } from '../task-parser.js';
import { projectConfig } from '../project-config.js';
import { getTasksDirectory, ensureDirectoryExists } from './directory-utils.js';
import { listTasks, getTask, createTask, updateTask, deleteTask } from './task-crud.js';
import { updateRelationships } from './task-relationships.js';

/**
 * Lists all features with optional filtering
 * @param options Filter options
 * @returns Operation result with array of features
 */
export async function listFeatures(options: FeatureFilterOptions = {}): Promise<OperationResult<Feature[]>> {
  try {
    const tasksDir = getTasksDirectory();
    
    if (!fs.existsSync(tasksDir)) {
      return {
        success: false,
        error: `Tasks directory not found: ${tasksDir}`
      };
    }
    
    const features: Feature[] = [];
    
    // Get all subdirectories in all phases that start with FEATURE_
    const phases = fs.readdirSync(tasksDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // Filter by phase if specified
    const targetPhases = options.phase ? [options.phase] : phases;
    
    for (const phase of targetPhases) {
      const phaseDir = path.join(tasksDir, phase);
      
      if (!fs.existsSync(phaseDir)) continue;
      
      const subdirs = fs.readdirSync(phaseDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('FEATURE_'))
        .map(dirent => dirent.name);
      
      for (const subdir of subdirs) {
        const featureDir = path.join(phaseDir, subdir);
        
        // Check for _overview.md file
        const overviewPath = path.join(featureDir, '_overview.md');
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
            // If overview file can't be parsed, still add the feature but without details
            console.error(`Error parsing overview file ${overviewPath}: ${error}`);
          }
        }
        
        // Get count of tasks in the feature directory
        const taskFiles = fs.readdirSync(featureDir)
          .filter(file => file.endsWith('.md') && file !== '_overview.md');
        
        const featureName = subdir.replace(/^FEATURE_/, '');
        
        // List tasks in the feature directory if requested
        let taskObjects: Task[] = [];
        let taskIds: string[] = [];
        
        // Get all tasks for this feature
        const tasksResult = await listTasks({ 
          phase, 
          subdirectory: subdir,
          include_content: options.include_content || false,
          include_completed: options.include_completed || false
        });
        
        if (tasksResult.success && tasksResult.data) {
          taskObjects = tasksResult.data;
          taskIds = taskObjects.map(task => task.metadata.id);
        }
        
        // Calculate progress if requested
        let progress = 0;
        if (options.include_progress) {
          const allTasksResult = await listTasks({ 
            phase, 
            subdirectory: subdir,
            include_completed: true 
          });
          
          if (allTasksResult.success && allTasksResult.data) {
            const allTasks = allTasksResult.data;
            const totalTasks = allTasks.length;
            
            if (totalTasks > 0) {
              const completedTasks = allTasks.filter(task => {
                const status = task.metadata.status || '';
                return status.includes('Done') || status.includes('🟢') || 
                      status.includes('Completed') || status.includes('Complete');
              }).length;
              
              progress = Math.round((completedTasks / totalTasks) * 100);
            }
          }
        }
        
        // Determine feature status based on tasks
        let status = '';
        if (overviewTask?.metadata.status) {
          status = overviewTask.metadata.status;
        } else {
          // If no overview status, derive from tasks
          const tasksInProgress = taskObjects.some(task => 
            (task.metadata.status || '').includes('In Progress') || 
            (task.metadata.status || '').includes('🔵')
          );
          
          const tasksBlocked = taskObjects.some(task => 
            (task.metadata.status || '').includes('Blocked') || 
            (task.metadata.status || '').includes('⚪')
          );
          
          const tasksCompleted = taskObjects.every(task => {
            const taskStatus = task.metadata.status || '';
            return taskStatus.includes('Done') || taskStatus.includes('🟢') || 
                  taskStatus.includes('Completed') || taskStatus.includes('Complete');
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
        
        // Create the feature object
        const feature: Feature = {
          id: subdir,
          name: featureName,
          title: overviewTask?.metadata.title || featureName,
          description: overviewTask?.content || '',
          phase,
          task_count: taskFiles.length,
          progress,
          status,
          tasks: taskIds
        };
        
        // Add the overview task if available
        if (overviewTask) {
          feature.overview = overviewTask;
        }
        
        // Apply type filter if specified
        if (options.type && overviewTask && overviewTask.metadata.type !== options.type) {
          continue;
        }
        
        // Apply status filter if specified
        if (options.status && feature.status !== options.status) {
          continue;
        }
        
        features.push(feature);
      }
    }
    
    // Sort features by name
    features.sort((a, b) => a.name.localeCompare(b.name));
    
    return {
      success: true,
      data: features,
      message: `Found ${features.length} features`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error listing features: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Gets a feature by ID
 * @param id Feature ID (e.g., "FEATURE_Authentication")
 * @param phase Optional phase to look in
 * @returns Operation result with feature if found
 */
export async function getFeature(id: string, phase?: string): Promise<OperationResult<Feature>> {
  try {
    const features = await listFeatures({
      phase,
      include_tasks: true,
      include_content: true,
      include_progress: true
    });
    
    if (!features.success) {
      return {
        success: false,
        error: features.error
      };
    }
    
    // Add FEATURE_ prefix if not present
    const featureId = id.startsWith('FEATURE_') ? id : `FEATURE_${id}`;
    
    const feature = features.data?.find(f => f.id === featureId);
    
    if (!feature) {
      return {
        success: false,
        error: `Feature ${id} not found`
      };
    }
    
    return {
      success: true,
      data: feature,
      message: `Feature ${id} found`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error getting feature: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Creates a new feature
 * @param name Feature name (will be prefixed with FEATURE_ if not already)
 * @param title Feature title
 * @param phase Phase to create the feature in
 * @param type Feature type (default: "🌟 Feature")
 * @param description Optional description
 * @param assignee Optional assignee
 * @returns Operation result with the created feature
 */
export async function createFeature(
  name: string,
  title: string,
  phase: string,
  type: string = '🌟 Feature',
  description?: string,
  assignee?: string,
  tags?: string[]
): Promise<OperationResult<Feature>> {
  try {
    const tasksDir = getTasksDirectory();
    
    if (!fs.existsSync(tasksDir)) {
      fs.mkdirSync(tasksDir, { recursive: true });
    }
    
    // Add FEATURE_ prefix if not already present
    const featureId = name.startsWith('FEATURE_') ? name : `FEATURE_${name}`;
    
    // Check if feature already exists
    const existingFeature = await getFeature(featureId, phase);
    if (existingFeature.success) {
      return {
        success: false,
        error: `Feature ${featureId} already exists in phase ${phase}`
      };
    }
    
    // Create the feature directory
    const featureDir = path.join(tasksDir, phase, featureId);
    ensureDirectoryExists(featureDir);
    
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
        subdirectory: featureId,
        is_overview: true
      },
      content: description || `# ${title}\n\n## Description\n\nFeature overview for ${name.replace(/^FEATURE_/, '')}`
    };
    
    if (assignee) {
      overviewTask.metadata.assigned_to = assignee;
    }
    
    if (tags && tags.length > 0) {
      overviewTask.metadata.tags = tags;
    }
    
    // Save the overview file
    const overviewPath = path.join(featureDir, '_overview.md');
    const fileContent = formatTaskFile(overviewTask);
    fs.writeFileSync(overviewPath, fileContent);
    
    // Return the created feature
    const feature: Feature = {
      id: featureId,
      name: name.replace(/^FEATURE_/, ''),
      title,
      description: overviewTask.content,
      phase,
      task_count: 0,
      progress: 0,
      status: '🟡 To Do',
      tasks: []
    };
    
    return {
      success: true,
      data: feature,
      message: `Feature ${featureId} created successfully`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error creating feature: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Updates a feature
 * @param id Feature ID
 * @param updates Updates to apply
 * @param phase Phase where the feature is located
 * @returns Operation result with updated feature
 */
export async function updateFeature(
  id: string,
  updates: FeatureUpdateOptions,
  phase?: string
): Promise<OperationResult<Feature>> {
  try {
    // Get the feature
    const featureResult = await getFeature(id, phase);
    if (!featureResult.success || !featureResult.data) {
      return {
        success: false,
        error: featureResult.error || `Feature ${id} not found`
      };
    }
    
    const feature = featureResult.data;
    
    // Add FEATURE_ prefix if not already present
    const featureId = id.startsWith('FEATURE_') ? id : `FEATURE_${id}`;
    
    // Build the path to the overview file
    const tasksDir = getTasksDirectory();
    const featureDir = path.join(tasksDir, feature.phase, featureId);
    const overviewPath = path.join(featureDir, '_overview.md');
    
    // Check if overview file exists
    if (!fs.existsSync(overviewPath)) {
      // Create overview file if it doesn't exist
      const overviewTask: Task = {
        metadata: {
          id: '_overview',
          title: feature.title,
          type: '🌟 Feature',
          status: feature.status,
          created_date: new Date().toISOString().split('T')[0],
          updated_date: new Date().toISOString().split('T')[0],
          phase: feature.phase,
          subdirectory: featureId,
          is_overview: true
        },
        content: feature.description || `# ${feature.title}\n\n## Description\n\nFeature overview for ${feature.name}`
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
        error: `Error reading overview file: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      const newName = updates.name.startsWith('FEATURE_') ? updates.name : `FEATURE_${updates.name}`;
      
      if (newName !== featureId) {
        // Get the new directory path
        const newFeatureDir = path.join(tasksDir, feature.phase, newName);
        
        // Ensure parent directory exists
        const parentDir = path.dirname(newFeatureDir);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }
        
        // Rename the directory
        fs.renameSync(featureDir, newFeatureDir);
        
        // Update all tasks in the feature to have the new subdirectory
        const tasksResult = await listTasks({
          phase: feature.phase,
          subdirectory: featureId,
          include_content: true,
          include_completed: true
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
            const newPath = path.join(newFeatureDir, fileName);
            const updatedContent = formatTaskFile(task);
            fs.writeFileSync(newPath, updatedContent);
            
            // Delete the old file if it's not the same as the new one
            if (oldPath !== newPath && fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          }
        }
        
        // Update the feature ID
        feature.id = newName;
        feature.name = updates.name.replace(/^FEATURE_/, '');
      }
    }
    
    // Update other feature properties
    if (updates.title) {
      feature.title = updates.title;
    }
    
    if (updates.status) {
      feature.status = updates.status;
    }
    
    if (updates.description) {
      feature.description = updates.description;
    }
    
    // Refresh the feature data
    const updatedFeature = await getFeature(feature.id, feature.phase);
    
    return {
      success: updatedFeature.success,
      data: updatedFeature.data,
      message: `Feature ${id} updated successfully`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error updating feature: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Deletes a feature
 * @param id Feature ID
 * @param phase Optional phase to look in
 * @param force Whether to force delete even if tasks exist
 * @returns Operation result
 */
export async function deleteFeature(id: string, phase?: string, force: boolean = false): Promise<OperationResult<void>> {
  try {
    // Get the feature
    const featureResult = await getFeature(id, phase);
    if (!featureResult.success || !featureResult.data) {
      return {
        success: false,
        error: featureResult.error || `Feature ${id} not found`
      };
    }
    
    const feature = featureResult.data;
    
    // Add FEATURE_ prefix if not already present
    const featureId = id.startsWith('FEATURE_') ? id : `FEATURE_${id}`;
    
    // Build the path to the feature directory
    const tasksDir = getTasksDirectory();
    const featureDir = path.join(tasksDir, feature.phase, featureId);
    
    // Check if feature directory exists
    if (!fs.existsSync(featureDir)) {
      return {
        success: false,
        error: `Feature directory not found: ${featureDir}`
      };
    }
    
    // Check if the feature has tasks
    const files = fs.readdirSync(featureDir);
    const taskFiles = files.filter(file => file.endsWith('.md') && file !== '_overview.md');
    
    if (taskFiles.length > 0 && !force) {
      return {
        success: false,
        error: `Feature ${id} has ${taskFiles.length} tasks. Use force=true to delete anyway.`
      };
    }
    
    // Delete all files in the feature directory
    for (const file of files) {
      const filePath = path.join(featureDir, file);
      fs.unlinkSync(filePath);
    }
    
    // Delete the feature directory
    fs.rmdirSync(featureDir);
    
    return {
      success: true,
      message: `Feature ${id} deleted successfully`
    };
  } catch (error) {
    return {
      success: false,
      error: `Error deleting feature: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}