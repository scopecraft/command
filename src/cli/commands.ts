/**
 * CLI command handlers
 * Bridging between CLI options and core task manager
 */
import {
  Area,
  Feature,
  type Phase,
  type Task,
  createArea,
  createFeature,
  createPhase,
  createTask,
  deleteArea,
  deleteFeature,
  deletePhase,
  deleteTask,
  findNextTask,
  formatPhasesList,
  formatTaskDetail,
  formatTasksList,
  getArea,
  getFeature,
  getTask,
  listAreas,
  listFeatures,
  listPhases,
  listTasks,
  moveTask,
  updateArea,
  updateFeature,
  updatePhase,
  updateTask,
} from '../core/index.js';

/**
 * Handles the 'list' command
 */
export async function handleListCommand(options: {
  status?: string;
  type?: string;
  assignee?: string;
  tags?: string[];
  phase?: string;
  subdirectory?: string;
  overview?: boolean;
  format?: 'table' | 'json' | 'minimal' | 'workflow';
}): Promise<void> {
  try {
    // Runtime config is handled internally by CRUD functions
    
    const result = await listTasks({
      status: options.status,
      type: options.type,
      assignee: options.assignee,
      tags: options.tags,
      phase: options.phase,
      subdirectory: options.subdirectory,
      is_overview: options.overview,
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    if (result.data && result.data.length === 0) {
      console.log('No tasks found matching the criteria');
      return;
    }

    console.log(formatTasksList(result.data!, options.format || 'table'));
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'get' command
 */
export async function handleGetCommand(
  id: string,
  options: {
    format?: 'default' | 'json' | 'markdown' | 'full';
    phase?: string;
    subdirectory?: string;
  }
): Promise<void> {
  try {
    // Runtime config is handled internally by CRUD functions
    
    const result = await getTask(id, { 
      phase: options.phase, 
      subdirectory: options.subdirectory,
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    console.log(formatTaskDetail(result.data!, options.format || 'default'));
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'create' command
 */
export async function handleCreateCommand(options: {
  id?: string;
  title: string;
  type: string;
  status?: string;
  priority?: string;
  assignee?: string;
  phase?: string;
  subdirectory?: string;
  parent?: string;
  depends?: string[];
  previous?: string;
  next?: string;
  tags?: string[];
  content?: string;
  file?: string;
  template?: string;
}): Promise<void> {
  try {
    // Runtime config is handled internally by CRUD functions
    
    let task: Task;

    if (options.file) {
      // Create from file
      if (!fs.existsSync(options.file)) {
        throw new Error(`File not found: ${options.file}`);
      }

      const fileContent = fs.readFileSync(options.file, 'utf-8');

      try {
        task = JSON.parse(fileContent) as Task;
      } catch {
        try {
          // Try parsing as TOML+Markdown
          task = parseTaskFile(fileContent);
        } catch (error) {
          throw new Error(
            `Invalid file format: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // Override with options
      if (options.id) task.metadata.id = options.id;
      if (options.title) task.metadata.title = options.title;
      if (options.type) task.metadata.type = options.type;
      if (options.status) task.metadata.status = options.status;
      if (options.priority) task.metadata.priority = options.priority;
      if (options.assignee) task.metadata.assigned_to = options.assignee;
      if (options.phase) task.metadata.phase = options.phase;
      if (options.subdirectory) task.metadata.subdirectory = options.subdirectory;
      if (options.parent) task.metadata.parent_task = options.parent;
      if (options.depends) task.metadata.depends_on = options.depends;
      if (options.previous) task.metadata.previous_task = options.previous;
      if (options.next) task.metadata.next_task = options.next;
      if (options.content) task.content = options.content;
    } else if (options.template) {
      // Create from template
      const { getTemplate, applyTemplate } = await import('../core/index.js');

      // Get the template content
      const templateContent = getTemplate(options.template);

      if (!templateContent) {
        throw new Error(
          `Template '${options.template}' not found. Use 'list-templates' command to see available templates.`
        );
      }

      const today = new Date().toISOString().split('T')[0];

      // Prepare values to apply to template
      const values: Record<string, any> = {
        id: options.id || '', // Let task-crud generate the ID
        title: options.title,
        status: options.status || '🟡 To Do',
        type: options.type,
        priority: options.priority || '▶️ Medium',
        created_date: today,
        updated_date: today,
        assigned_to: options.assignee || '',
      };

      // Add optional relationship fields
      if (options.phase) values.phase = options.phase;
      if (options.subdirectory) values.subdirectory = options.subdirectory;
      if (options.parent) values.parent_task = options.parent;
      if (options.depends) values.depends_on = options.depends;
      if (options.previous) values.previous_task = options.previous;
      if (options.next) values.next_task = options.next;
      if (options.tags) values.tags = options.tags;
      if (options.content) values.content = options.content;

      // Apply template
      const taskContent = applyTemplate(templateContent, values);

      try {
        // Parse the generated content into a task
        task = parseTaskFile(taskContent);
      } catch (error) {
        // If parsing failed due to missing ID, create task manually
        if (error instanceof Error && error.message.includes('Missing required field: id')) {
          task = {
            metadata: {
              id: options.id || '',
              title: options.title,
              type: options.type,
              status: options.status || '🟡 To Do',
              priority: options.priority || '▶️ Medium',
              created_date: today,
              updated_date: today,
              assigned_to: options.assignee || '',
            },
            content:
              options.content ||
              `## ${options.title}\n\nTask description goes here.\n\n## Acceptance Criteria\n\n- [ ] Criteria 1\n`,
          };

          // Add optional relationship fields
          if (options.phase) task.metadata.phase = options.phase;
          if (options.subdirectory) task.metadata.subdirectory = options.subdirectory;
          if (options.parent) task.metadata.parent_task = options.parent;
          if (options.depends) task.metadata.depends_on = options.depends;
          if (options.previous) task.metadata.previous_task = options.previous;
          if (options.next) task.metadata.next_task = options.next;
          if (options.tags) task.metadata.tags = options.tags;
        } else {
          // Re-throw other errors
          throw error;
        }
      }

      // Ensure core metadata is correct (in case template didn't apply everything)
      task.metadata.id = options.id || task.metadata.id || '';
      task.metadata.title = options.title;
      task.metadata.created_date = today;
      task.metadata.updated_date = today;
    } else {
      // Create from scratch
      const today = new Date().toISOString().split('T')[0];

      // Use provided ID or let task-crud generate it
      const id = options.id || '';

      // Handle special case for _overview.md files
      const isOverview = id === '_overview' || id.endsWith('/_overview');

      task = {
        metadata: {
          id,
          title: options.title,
          type: options.type,
          status: options.status || '🟡 To Do',
          priority: options.priority || '▶️ Medium',
          created_date: today,
          updated_date: today,
          assigned_to: options.assignee || '',
          is_overview: isOverview,
        },
        content:
          options.content ||
          `## ${options.title}\n\n${isOverview ? 'Overview of this feature.\n\n## Tasks\n\n- [ ] Task 1\n' : 'Task description goes here.\n\n## Acceptance Criteria\n\n- [ ] Criteria 1\n'}`,
      };

      // Add optional relationship fields
      if (options.phase) task.metadata.phase = options.phase;
      if (options.subdirectory) task.metadata.subdirectory = options.subdirectory;
      if (options.parent) task.metadata.parent_task = options.parent;
      if (options.depends) task.metadata.depends_on = options.depends;
      if (options.previous) task.metadata.previous_task = options.previous;
      if (options.next) task.metadata.next_task = options.next;
      if (options.tags) task.metadata.tags = options.tags;
    }

    // Validate required fields
    if (!task.metadata.title) {
      throw new Error('Task title is required');
    }

    if (!task.metadata.type) {
      throw new Error('Task type is required');
    }

    // Extract subdirectory from metadata for the createTask call
    const subdirectory = task.metadata.subdirectory;

    // Use new options pattern
    const result = await createTask(task, { subdirectory });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    if (result.message) {
      console.log(result.message);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'update' command
 */
export async function handleUpdateCommand(
  id: string,
  options: {
    title?: string;
    status?: string;
    type?: string;
    priority?: string;
    assignee?: string;
    phase?: string;
    subdirectory?: string;
    parent?: string;
    depends?: string[];
    previous?: string;
    next?: string;
    tags?: string[];
    content?: string;
    file?: string;
    searchPhase?: string;
    searchSubdirectory?: string;
  }
): Promise<void> {
  try {
    // Runtime config is handled internally by CRUD functions
    
    if (options.file) {
      // Update from file
      if (!fs.existsSync(options.file)) {
        throw new Error(`File not found: ${options.file}`);
      }

      const fileContent = fs.readFileSync(options.file, 'utf-8');

      try {
        // Try parsing as JSON
        const fileTask = JSON.parse(fileContent) as Task;

        // Ensure ID matches
        if (fileTask.metadata.id !== id) {
          throw new Error(
            `Task ID in file (${fileTask.metadata.id}) does not match the specified ID (${id})`
          );
        }

        const result = await updateTask(
          id,
          {
            metadata: fileTask.metadata,
            content: fileTask.content,
          },
          {
            phase: options.searchPhase,
            subdirectory: options.searchSubdirectory,
          }
        );

        if (!result.success) {
          console.error(`Error: ${result.error}`);
          process.exit(1);
        }

        console.log(result.message);
      } catch (_parseError) {
        // Not valid JSON, try as TOML+Markdown
        try {
          const task = parseTaskFile(fileContent);
          if (task.metadata.id !== id) {
            throw new Error(
              `Task ID in file (${task.metadata.id}) does not match the specified ID (${id})`
            );
          }

          const result = await updateTask(
            id,
            {
              metadata: task.metadata,
              content: task.content,
            },
            {
              phase: options.searchPhase,
              subdirectory: options.searchSubdirectory,
            }
          );

          if (!result.success) {
            console.error(`Error: ${result.error}`);
            process.exit(1);
          }

          console.log(result.message);
        } catch (_error) {
          // If all parsing fails, just use as content
          const result = await updateTask(
            id,
            { content: fileContent },
            {
              phase: options.searchPhase,
              subdirectory: options.searchSubdirectory,
            }
          );

          if (!result.success) {
            console.error(`Error: ${result.error}`);
            process.exit(1);
          }

          console.log(result.message);
        }
      }
    } else {
      // Update from options
      const updates: { metadata?: Partial<TaskMetadata>; content?: string } = {};

      if (
        options.title ||
        options.status ||
        options.type ||
        options.priority ||
        options.assignee ||
        options.phase ||
        options.subdirectory ||
        options.parent ||
        options.depends ||
        options.previous ||
        options.next ||
        options.tags
      ) {
        updates.metadata = {};

        if (options.title) updates.metadata.title = options.title;
        if (options.status) updates.metadata.status = options.status;
        if (options.type) updates.metadata.type = options.type;
        if (options.priority) updates.metadata.priority = options.priority;
        if (options.assignee) updates.metadata.assigned_to = options.assignee;
        if (options.phase) updates.metadata.phase = options.phase;
        if (options.subdirectory) updates.metadata.subdirectory = options.subdirectory;
        if (options.parent) updates.metadata.parent_task = options.parent;
        if (options.depends) updates.metadata.depends_on = options.depends;
        if (options.previous) updates.metadata.previous_task = options.previous;
        if (options.next) updates.metadata.next_task = options.next;
        if (options.tags) updates.metadata.tags = options.tags;
      }

      if (options.content) {
        updates.content = options.content;
      }

      if (Object.keys(updates).length === 0) {
        console.log('No updates specified');
        return;
      }

      const result = await updateTask(id, updates, { 
        phase: options.searchPhase, 
        subdirectory: options.searchSubdirectory,
      });

      if (!result.success) {
        console.error(`Error: ${result.error}`);
        process.exit(1);
      }

      console.log(result.message);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'delete' command
 */
export async function handleDeleteCommand(
  id: string,
  options: {
    phase?: string;
    subdirectory?: string;
  }
): Promise<void> {
  try {
    // Runtime config is handled internally by CRUD functions
    
    const result = await deleteTask(id, { 
      phase: options.phase, 
      subdirectory: options.subdirectory,
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    console.log(result.message);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'next-task' command
 */
export async function handleNextTaskCommand(
  id?: string,
  options: {
    format?: 'default' | 'json' | 'markdown' | 'full';
  } = {}
): Promise<void> {
  try {
    // Runtime config is handled internally by CRUD functions
    
    const result = await findNextTask(id);

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    if (!result.data) {
      console.log(`No next task found${id ? ` after ${id}` : ''}.`);
      return;
    }

    console.log('Next task to work on:');
    console.log(formatTaskDetail(result.data, options.format || 'default'));
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'mark-complete-next' command
 */
export async function handleMarkCompleteNextCommand(
  id: string,
  options: {
    format?: 'default' | 'json' | 'markdown' | 'full';
  } = {}
): Promise<void> {
  try {
    // Runtime config is handled internally by CRUD functions
    
    // Get the next task before marking current as complete
    const nextTaskResult = await findNextTask(id);

    // Mark current task as complete
    const updateResult = await updateTask(id, { metadata: { status: '🟢 Done' } });

    if (!updateResult.success) {
      console.error(`Error: ${updateResult.error}`);
      process.exit(1);
    }

    console.log(updateResult.message);

    // Show next task if found
    if (nextTaskResult.success && nextTaskResult.data) {
      console.log('\nNext task to work on:');
      console.log(formatTaskDetail(nextTaskResult.data, options.format || 'default'));
    } else if (nextTaskResult.success) {
      console.log(`No next task found after ${id}.`);
    } else {
      console.error(`Error finding next task: ${nextTaskResult.error}`);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'phases' command
 */
export async function handlePhasesCommand(
  options: {
    format?: 'table' | 'json';
  } = {}
): Promise<void> {
  try {
    const result = await listPhases({});

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    console.log(formatPhasesList(result.data!, options.format || 'table'));
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'phase-create' command
 */
export async function handlePhaseCreateCommand(options: {
  id: string;
  name: string;
  description?: string;
  status?: string;
  order?: number;
}): Promise<void> {
  try {
    const phase: Phase = {
      id: options.id,
      name: options.name,
      description: options.description,
      status: options.status || '🟡 Pending',
      order: options.order,
      tasks: [],
    };

    const result = await createPhase(phase, {});

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    console.log(result.message || `Phase ${result.data?.id} created successfully`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'phase-update' command
 */
export async function handlePhaseUpdateCommand(
  id: string,
  options: {
    newId?: string;
    name?: string;
    description?: string;
    status?: string;
    order?: number;
  }
): Promise<void> {
  try {
    // Prepare updates object
    const updates: Partial<Phase> = {};

    // Handle ID change through newId option
    if (options.newId) {
      updates.id = options.newId;
    }

    // Add other optional updates
    if (options.name) updates.name = options.name;
    if (options.description !== undefined) updates.description = options.description;
    if (options.status) updates.status = options.status;
    if (options.order !== undefined) updates.order = options.order;

    // Verify we have at least one update
    if (Object.keys(updates).length === 0) {
      console.log('No updates specified');
      return;
    }

    const result = await updatePhase(id, updates, {});

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    console.log(result.message || `Phase ${id} updated successfully`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'phase-delete' command
 */
export async function handlePhaseDeleteCommand(
  id: string,
  options: {
    force?: boolean;
  }
): Promise<void> {
  try {
    const result = await deletePhase(id, { force: options.force });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    console.log(result.message);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'current-task' command
 */
export async function handleCurrentTaskCommand(
  options: {
    format?: 'table' | 'json' | 'minimal' | 'workflow';
  } = {}
): Promise<void> {
  try {
    // Runtime config is handled internally by CRUD functions
    
    const inProgressResult = await listTasks({ status: '🔵 In Progress' });

    if (!inProgressResult.success) {
      console.error(`Error: ${inProgressResult.error}`);
      process.exit(1);
    }

    if (inProgressResult.data && inProgressResult.data.length === 0) {
      // Try alternative status text
      const alternativeResult = await listTasks({ status: 'In Progress' });

      if (!alternativeResult.success) {
        console.error(`Error: ${alternativeResult.error}`);
        process.exit(1);
      }

      if (alternativeResult.data && alternativeResult.data.length === 0) {
        console.log('No tasks currently in progress');
        return;
      }

      console.log(formatTasksList(alternativeResult.data, options.format || 'table'));
    } else {
      console.log(formatTasksList(inProgressResult.data!, options.format || 'table'));
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'init' command to initialize project structure
 */
export async function handleInitCommand(_options: {
  mode?: string;
}): Promise<void> {
  try {
    // Import projectConfig here to avoid circular dependencies
    const { projectConfig, initializeTemplates } = await import('../core/index.js');

    // Initialize project structure
    projectConfig.initializeProjectStructure();

    // Initialize templates
    initializeTemplates();

    console.log('Project initialized');
    console.log(`Tasks directory: ${projectConfig.getTasksDirectory()}`);
    console.log(`Configuration directory: ${projectConfig.getConfigDirectory()}`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'list-templates' command
 */
export async function handleListTemplatesCommand(): Promise<void> {
  try {
    const { listTemplates } = await import('../core/index.js');

    const templates = listTemplates();

    if (templates.length === 0) {
      console.log('No templates found. Run "sc init" to set up templates.');
      return;
    }

    console.log('Available templates:');
    console.log('-----------------');

    for (const template of templates) {
      console.log(`${template.id} - ${template.description}`);
    }

    console.log('\nUse with: sc create --template <template-id> --title "Task Title" ...');
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

// Import here to avoid circular dependencies
import fs from 'node:fs';

/**
 * Handles the 'feature list' command
 */
export async function handleFeatureListCommand(options: {
  phase?: string;
  format?: string;
  include_tasks?: boolean;
  include_progress?: boolean;
}): Promise<void> {
  try {
    const result = await listFeatures({
      phase: options.phase,
      include_tasks: options.include_tasks === true,
      include_progress: options.include_progress !== false,
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    if (result.data.length === 0) {
      console.log('No features found matching the criteria');
      return;
    }

    // Format output based on options
    if (options.format === 'json') {
      console.log(JSON.stringify(result.data, null, 2));
      return;
    }

    console.log(`Found ${result.data.length} features:`);
    console.log('-----------------');

    for (const feature of result.data) {
      console.log(`${feature.id} - ${feature.title}`);
      if (feature.description) console.log(`  Description: ${feature.description}`);
      if (feature.status) console.log(`  Status: ${feature.status}`);
      if (feature.progress !== undefined) console.log(`  Progress: ${feature.progress}%`);
      if (feature.phase) console.log(`  Phase: ${feature.phase}`);
      if (options.include_tasks && feature.tasks) {
        console.log(`  Tasks: ${feature.tasks.length}`);
        feature.tasks.forEach((taskId) => console.log(`    - ${taskId}`));
      }
      console.log(); // Empty line between features
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'feature get' command
 */
export async function handleFeatureGetCommand(
  id: string,
  options: {
    phase?: string;
    format?: string;
  }
): Promise<void> {
  try {
    if (!id) {
      console.error('Error: Feature ID is required');
      process.exit(1);
    }

    const result = await getFeature(id, { phase: options.phase });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    const feature = result.data;

    if (!feature) {
      console.error('Error: Feature not found');
      process.exit(1);
    }

    // Format output based on options
    if (options.format === 'json') {
      console.log(JSON.stringify(feature, null, 2));
      return;
    }

    console.log(`Feature: ${feature.id}`);
    console.log('-----------------');
    console.log(`Title: ${feature.title}`);
    if (feature.description) console.log(`Description: ${feature.description}`);
    if (feature.status) console.log(`Status: ${feature.status}`);
    if (feature.progress !== undefined) console.log(`Progress: ${feature.progress}%`);
    if (feature.phase) console.log(`Phase: ${feature.phase}`);
    if (feature.tasks) {
      console.log(`Tasks: ${feature.tasks.length}`);
      feature.tasks.forEach((taskId) => console.log(`  - ${taskId}`));
    }

    // Show overview content if available
    if (feature.overview?.content) {
      console.log('\nOverview:');
      console.log('-----------------');
      console.log(feature.overview.content);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'feature delete' command
 */
export async function handleFeatureDeleteCommand(
  id: string,
  options: {
    phase?: string;
    force?: boolean;
  }
): Promise<void> {
  try {
    if (!id) {
      console.error('Error: Feature ID is required');
      process.exit(1);
    }

    const result = await deleteFeature(id, { phase: options.phase, force: options.force });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    console.log(result.message || `Feature ${id} deleted successfully`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'feature update' command
 */
export async function handleFeatureUpdateCommand(
  id: string,
  updates: {
    title?: string;
    description?: string;
    status?: string;
    new_id?: string;
    phase?: string;
  }
): Promise<void> {
  try {
    if (!id) {
      console.error('Error: Feature ID is required');
      process.exit(1);
    }

    const result = await updateFeature(id, {
      title: updates.title,
      description: updates.description,
      status: updates.status,
      newId: updates.new_id,
    }, { phase: updates.phase });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    console.log(result.message || `Feature ${id} updated successfully`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'area list' command
 */
export async function handleAreaListCommand(options: {
  phase?: string;
  format?: string;
  include_tasks?: boolean;
  include_progress?: boolean;
}): Promise<void> {
  try {
    const result = await listAreas({
      phase: options.phase,
      include_tasks: options.include_tasks === true,
      include_progress: options.include_progress !== false,
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    if (result.data.length === 0) {
      console.log('No areas found matching the criteria');
      return;
    }

    // Format output based on options
    if (options.format === 'json') {
      console.log(JSON.stringify(result.data, null, 2));
      return;
    }

    console.log(`Found ${result.data.length} areas:`);
    console.log('-----------------');

    for (const area of result.data) {
      console.log(`${area.id} - ${area.title}`);
      if (area.description) console.log(`  Description: ${area.description}`);
      if (area.status) console.log(`  Status: ${area.status}`);
      if (area.progress !== undefined) console.log(`  Progress: ${area.progress}%`);
      if (area.phase) console.log(`  Phase: ${area.phase}`);
      if (options.include_tasks && area.tasks) {
        console.log(`  Tasks: ${area.tasks.length}`);
        area.tasks.forEach((taskId) => console.log(`    - ${taskId}`));
      }
      console.log(); // Empty line between areas
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'area get' command
 */
export async function handleAreaGetCommand(
  id: string,
  options: {
    phase?: string;
    format?: string;
  }
): Promise<void> {
  try {
    if (!id) {
      console.error('Error: Area ID is required');
      process.exit(1);
    }

    const result = await getArea(id, { phase: options.phase });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    const area = result.data;

    if (!area) {
      console.error('Error: Area not found');
      process.exit(1);
    }

    // Format output based on options
    if (options.format === 'json') {
      console.log(JSON.stringify(area, null, 2));
      return;
    }

    console.log(`Area: ${area.id}`);
    console.log('-----------------');
    console.log(`Title: ${area.title}`);
    if (area.description) console.log(`Description: ${area.description}`);
    if (area.status) console.log(`Status: ${area.status}`);
    if (area.progress !== undefined) console.log(`Progress: ${area.progress}%`);
    if (area.phase) console.log(`Phase: ${area.phase}`);
    if (area.tasks) {
      console.log(`Tasks: ${area.tasks.length}`);
      area.tasks.forEach((taskId) => console.log(`  - ${taskId}`));
    }

    // Show overview content if available
    if (area.overview?.content) {
      console.log('\nOverview:');
      console.log('-----------------');
      console.log(area.overview.content);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'area delete' command
 */
export async function handleAreaDeleteCommand(
  id: string,
  options: {
    phase?: string;
    force?: boolean;
  }
): Promise<void> {
  try {
    if (!id) {
      console.error('Error: Area ID is required');
      process.exit(1);
    }

    const result = await deleteArea(id, { phase: options.phase, force: options.force });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    console.log(result.message || `Area ${id} deleted successfully`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'area update' command
 */
export async function handleAreaUpdateCommand(
  id: string,
  updates: {
    title?: string;
    description?: string;
    status?: string;
    new_id?: string;
    phase?: string;
  }
): Promise<void> {
  try {
    if (!id) {
      console.error('Error: Area ID is required');
      process.exit(1);
    }

    const result = await updateArea(id, {
      title: updates.title,
      description: updates.description,
      status: updates.status,
      newId: updates.new_id,
    }, { phase: updates.phase });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    console.log(result.message || `Area ${id} updated successfully`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'task move' command
 */
export async function handleTaskMoveCommand(
  id: string,
  options: {
    phase?: string;
    subdirectory?: string;
    search_phase?: string;
    search_subdirectory?: string;
  }
): Promise<void> {
  try {
    if (!id) {
      console.error('Error: Task ID is required');
      process.exit(1);
    }

    if (!options.subdirectory) {
      console.error('Error: Target subdirectory is required');
      process.exit(1);
    }

    const result = await moveTask(id, {
      targetSubdirectory: options.subdirectory,
      targetPhase: options.phase,
      searchPhase: options.search_phase,
      searchSubdirectory: options.search_subdirectory,
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    console.log(result.message || `Task ${id} moved successfully to ${options.subdirectory}`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}
import path from 'node:path';
import { type TaskMetadata, parseTaskFile } from '../core/index.js';
