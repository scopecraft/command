/**
 * CLI command handlers
 * Bridging between CLI options and core task manager
 */
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  findNextTask,
  listPhases,
  createPhase,
  Task,
  Phase,
  formatTasksList,
  formatTaskDetail,
  formatPhasesList,
  generateTaskId
} from '../core/index.js';

/**
 * Handles the 'list' command
 */
export async function handleListCommand(options: {
  status?: string,
  type?: string,
  assignee?: string,
  tags?: string[],
  phase?: string,
  subdirectory?: string,
  overview?: boolean,
  format?: 'table' | 'json' | 'minimal' | 'workflow'
}): Promise<void> {
  try {
    const result = await listTasks({
      status: options.status,
      type: options.type,
      assignee: options.assignee,
      tags: options.tags,
      phase: options.phase,
      subdirectory: options.subdirectory,
      is_overview: options.overview
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
export async function handleGetCommand(id: string, options: {
  format?: 'default' | 'json' | 'markdown' | 'full',
  phase?: string,
  subdirectory?: string
}): Promise<void> {
  try {
    const result = await getTask(id, options.phase, options.subdirectory);

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
  id?: string,
  title: string,
  type: string,
  status?: string,
  priority?: string,
  assignee?: string,
  phase?: string,
  subdirectory?: string,
  parent?: string,
  depends?: string[],
  previous?: string,
  next?: string,
  tags?: string[],
  content?: string,
  file?: string,
  template?: string
}): Promise<void> {
  try {
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
          throw new Error(`Invalid file format: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        throw new Error(`Template '${options.template}' not found. Use 'list-templates' command to see available templates.`);
      }

      const today = new Date().toISOString().split('T')[0];

      // Generate ID if not provided
      const id = options.id || generateTaskId();

      // Prepare values to apply to template
      const values: Record<string, any> = {
        id,
        title: options.title,
        status: options.status || '🟡 To Do',
        type: options.type,
        priority: options.priority || '▶️ Medium',
        created_date: today,
        updated_date: today,
        assigned_to: options.assignee || ''
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
              id: id,
              title: options.title,
              type: options.type,
              status: options.status || '🟡 To Do',
              priority: options.priority || '▶️ Medium',
              created_date: today,
              updated_date: today,
              assigned_to: options.assignee || ''
            },
            content: options.content || `## ${options.title}\n\nTask description goes here.\n\n## Acceptance Criteria\n\n- [ ] Criteria 1\n`
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
      task.metadata.id = id;
      task.metadata.title = options.title;
      task.metadata.created_date = today;
      task.metadata.updated_date = today;

    } else {
      // Create from scratch
      const today = new Date().toISOString().split('T')[0];

      // Generate ID if not provided
      const id = options.id || generateTaskId();

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
          is_overview: isOverview
        },
        content: options.content || `## ${options.title}\n\n${isOverview ? 'Overview of this feature.\n\n## Tasks\n\n- [ ] Task 1\n' : 'Task description goes here.\n\n## Acceptance Criteria\n\n- [ ] Criteria 1\n'}`
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

    const result = await createTask(task, subdirectory);

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
 * Handles the 'update' command
 */
export async function handleUpdateCommand(id: string, options: {
  title?: string,
  status?: string,
  type?: string,
  priority?: string,
  assignee?: string,
  phase?: string,
  subdirectory?: string,
  parent?: string,
  depends?: string[],
  previous?: string,
  next?: string,
  tags?: string[],
  content?: string,
  file?: string,
  searchPhase?: string,
  searchSubdirectory?: string
}): Promise<void> {
  try {
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
          throw new Error(`Task ID in file (${fileTask.metadata.id}) does not match the specified ID (${id})`);
        }

        const result = await updateTask(id, {
          metadata: fileTask.metadata,
          content: fileTask.content
        }, options.searchPhase, options.searchSubdirectory);

        if (!result.success) {
          console.error(`Error: ${result.error}`);
          process.exit(1);
        }

        console.log(result.message);

      } catch (parseError) {
        // Not valid JSON, try as TOML+Markdown
        try {
          const task = parseTaskFile(fileContent);
          if (task.metadata.id !== id) {
            throw new Error(`Task ID in file (${task.metadata.id}) does not match the specified ID (${id})`);
          }

          const result = await updateTask(id, {
            metadata: task.metadata,
            content: task.content
          }, options.searchPhase, options.searchSubdirectory);

          if (!result.success) {
            console.error(`Error: ${result.error}`);
            process.exit(1);
          }

          console.log(result.message);
        } catch (error) {
          // If all parsing fails, just use as content
          const result = await updateTask(id, { content: fileContent }, options.searchPhase, options.searchSubdirectory);

          if (!result.success) {
            console.error(`Error: ${result.error}`);
            process.exit(1);
          }

          console.log(result.message);
        }
      }

    } else {
      // Update from options
      const updates: { metadata?: Partial<TaskMetadata>, content?: string } = {};

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

      const result = await updateTask(id, updates, options.searchPhase, options.searchSubdirectory);

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
export async function handleDeleteCommand(id: string, options: {
  phase?: string,
  subdirectory?: string
}): Promise<void> {
  try {
    const result = await deleteTask(id, options.phase, options.subdirectory);

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
export async function handleNextTaskCommand(id?: string, options: { 
  format?: 'default' | 'json' | 'markdown' | 'full'
} = {}): Promise<void> {
  try {
    const result = await findNextTask(id);
    
    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
    
    if (!result.data) {
      console.log(`No next task found${id ? ` after ${id}` : ''}.`);
      return;
    }
    
    console.log(`Next task to work on:`);
    console.log(formatTaskDetail(result.data, options.format || 'default'));
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'mark-complete-next' command
 */
export async function handleMarkCompleteNextCommand(id: string, options: { 
  format?: 'default' | 'json' | 'markdown' | 'full'
} = {}): Promise<void> {
  try {
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
      console.log(`\nNext task to work on:`);
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
export async function handlePhasesCommand(options: { 
  format?: 'table' | 'json'
} = {}): Promise<void> {
  try {
    const result = await listPhases();
    
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
  id: string,
  name: string,
  description?: string,
  status?: string,
  order?: number
}): Promise<void> {
  try {
    const phase: Phase = {
      id: options.id,
      name: options.name,
      description: options.description,
      status: options.status || '🟡 Pending',
      order: options.order,
      tasks: []
    };
    
    const result = await createPhase(phase);
    
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
export async function handleCurrentTaskCommand(options: {
  format?: 'table' | 'json' | 'minimal' | 'workflow'
} = {}): Promise<void> {
  try {
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
export async function handleInitCommand(options: {
  mode?: string
}): Promise<void> {
  try {
    // Import projectConfig here to avoid circular dependencies
    const { projectConfig, ProjectMode, initializeTemplates } = await import('../core/index.js');

    // Force mode if specified
    if (options.mode) {
      if (options.mode === 'roo') {
        projectConfig.setMode(ProjectMode.ROO_COMMANDER);
      } else if (options.mode === 'standalone') {
        projectConfig.setMode(ProjectMode.STANDALONE);
      } else {
        throw new Error(`Invalid mode: ${options.mode}. Must be 'roo' or 'standalone'`);
      }
    }

    // Initialize project structure
    projectConfig.initializeProjectStructure();
    
    // Initialize templates
    initializeTemplates();

    console.log(`Project initialized in ${projectConfig.getMode()} mode`);
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
import fs from 'fs';
import path from 'path';
import { parseTaskFile, TaskMetadata } from '../core/index.js';