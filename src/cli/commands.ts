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
  deleteArea,
  deleteFeature,
  deletePhase,
  findNextTask,
  formatFeaturesList,
  formatPhasesList,
  formatTasksList,
  getArea,
  getFeature,
  listAreas,
  listFeatures,
  listPhases,
  moveTask,
  updateArea,
  updateFeature,
  updatePhase,
  updateTask,
} from '../core/index.js';
import * as v2 from '../core/v2/index.js';

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
  location?: string;
  backlog?: boolean;
  current?: boolean;
  archive?: boolean;
}): Promise<void> {
  try {
    const { projectConfig } = await import('../core/index.js');
    const tasksDir = projectConfig.getTasksDirectory();
    const projectRoot = tasksDir.replace('/.tasks', '');
    
    // Build list options
    const listOptions: v2.TaskListOptions = {};
    
    // Handle workflow location
    if (options.backlog) {
      listOptions.workflowStates = ['backlog'];
    } else if (options.current) {
      listOptions.workflowStates = ['current'];
    } else if (options.archive) {
      listOptions.workflowStates = ['archive'];
    } else if (options.location) {
      listOptions.workflowStates = [options.location as v2.WorkflowState];
    }
    
    // Map other filters
    if (options.status) {
      // Remove emoji if present
      listOptions.status = options.status.replace(/^[^\s]+\s/, '') as v2.TaskStatus;
    }
    if (options.type) {
      listOptions.type = options.type.replace(/^[^\s]+\s/, '').toLowerCase() as v2.TaskType;
    }
    if (options.assignee) listOptions.assignee = options.assignee;
    if (options.tags) listOptions.tags = options.tags;
    if (options.subdirectory) listOptions.area = options.subdirectory;
    
    // List tasks
    const result = await v2.listTasks(projectRoot, listOptions);
    
    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
    
    const tasks = result.data || [];

    if (tasks.length === 0) {
      console.log('No tasks found matching the criteria');
      return;
    }

    // Format using v2 formatter
    const { formatTasksList: formatV2Tasks } = await import('../core/formatters-v2.js');
    console.log(formatV2Tasks(tasks, options.format || 'table'));
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
    // Use v2 for task retrieval
    const { projectConfig: pc } = await import('../core/index.js');
    const tasksDir = pc.getTasksDirectory();
    const projectRoot = tasksDir.replace('/.tasks', '');
    
    const result = await v2.getTask(projectRoot, id);

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    if (result.data) {
      const { formatTaskDetail } = await import('../core/formatters-v2.js');
      console.log(formatTaskDetail(result.data, options.format || 'default'));
    } else {
      console.log('No valid task data found');
    }
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
        title: options.title,
        status: options.status || '🟡 To Do',
        type: options.type,
        priority: options.priority || '▶️ Medium',
        created_date: today,
        updated_date: today,
        assigned_to: options.assignee || '',
      };
      
      // Only include ID if explicitly provided
      if (options.id) {
        values.id = options.id;
      }

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
        // If parsing failed due to missing ID, extract content manually
        if (error instanceof Error && error.message.includes('Missing required field: id')) {
          // Extract the markdown content from the generated template
          const frontmatterRegex = /^\+\+\+\s*\n([\s\S]*?)\n\+\+\+\s*\n([\s\S]*)$/;
          const match = taskContent.match(frontmatterRegex);
          
          let extractedContent = '';
          let extractedMetadata = {};
          
          if (match) {
            const [, tomlContent, markdownContent] = match;
            extractedContent = markdownContent.trim();
            
            // Try to parse TOML to get other metadata
            try {
              extractedMetadata = parse(tomlContent) as Record<string, any>;
            } catch {
              // If TOML parsing fails, continue with empty metadata
            }
          }
          
          task = {
            metadata: {
              id: options.id || '',
              title: options.title,
              type: options.type,
              status: options.status || extractedMetadata.status || '🟡 To Do',
              priority: options.priority || extractedMetadata.priority || '▶️ Medium',
              created_date: today,
              updated_date: today,
              assigned_to: options.assignee || extractedMetadata.assigned_to || '',
              ...extractedMetadata, // Include all other fields from template
            },
            content: extractedContent || `## ${options.title}\n\nTask description goes here.\n\n## Acceptance Criteria\n\n- [ ] Criteria 1\n`,
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

    // Use v2 for task creation
    const { projectConfig: pc } = await import('../core/index.js');
    const tasksDir = pc.getTasksDirectory();
    const projectRoot = tasksDir.replace('/.tasks', '');
    
    // Build create options
    const createOptions: v2.TaskCreateOptions = {
      title: task.metadata.title,
      type: (task.metadata.type?.replace(/^[^\s]+\s/, '').toLowerCase() || 'chore') as v2.TaskType,
      area: task.metadata.subdirectory || 'general',
      workflowState: 'backlog',
      status: 'To Do',
      instruction: task.content,
      customMetadata: {}
    };
    
    // Add optional metadata
    if (task.metadata.priority) createOptions.customMetadata!.priority = task.metadata.priority;
    if (task.metadata.assigned_to) createOptions.customMetadata!.assignee = task.metadata.assigned_to;
    if (task.metadata.tags) createOptions.customMetadata!.tags = task.metadata.tags;
    if (task.metadata.parent_task) createOptions.customMetadata!.parent = task.metadata.parent_task;
    if (task.metadata.depends_on) createOptions.customMetadata!.depends = task.metadata.depends_on;
    if (task.metadata.previous_task) createOptions.customMetadata!.previous = task.metadata.previous_task;
    if (task.metadata.next_task) createOptions.customMetadata!.next = task.metadata.next_task;
    
    const result = await v2.createTask(projectRoot, createOptions);

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
      // Update from file - TODO: implement v2 file parsing
      console.error('File-based updates not yet implemented for v2');
      process.exit(1);
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

      // Use v2 for updates
      const { projectConfig } = await import('../core/index.js');
      const tasksDir = projectConfig.getTasksDirectory();
      const projectRoot = tasksDir.replace('/.tasks', '');
      
      // Build v2 update options
      const updateOptions: v2.TaskUpdateOptions = {};
      
      if (options.title) updateOptions.title = options.title;
      
      // Build frontmatter updates
      const frontmatter: any = {};
      if (options.type) frontmatter.type = options.type.replace(/^[^\s]+\s/, '').toLowerCase();
      if (options.status) frontmatter.status = options.status.replace(/^[^\s]+\s/, '');
      if (options.priority) frontmatter.priority = options.priority;
      if (options.assignee) frontmatter.assignee = options.assignee;
      if (options.tags) frontmatter.tags = options.tags;
      if (options.parent) frontmatter.parent = options.parent;
      if (options.depends) frontmatter.depends = options.depends;
      if (options.previous) frontmatter.previous = options.previous;
      if (options.next) frontmatter.next = options.next;
      if (options.subdirectory) frontmatter.area = options.subdirectory;
      
      if (Object.keys(frontmatter).length > 0) {
        updateOptions.frontmatter = frontmatter;
      }
      
      // Handle content update
      if (options.content) {
        updateOptions.sections = {
          instruction: options.content
        };
      }
      
      const result = await v2.updateTask(projectRoot, id, updateOptions);

      if (!result.success) {
        console.error(`Error: ${result.error}`);
        process.exit(1);
      }

      console.log(`Task ${id} updated successfully`);
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
    // Use v2 for task deletion
    const { projectConfig: pc } = await import('../core/index.js');
    const tasksDir = pc.getTasksDirectory();
    const projectRoot = tasksDir.replace('/.tasks', '');
    
    const result = await v2.deleteTask(projectRoot, id);

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    console.log(`Task ${id} deleted successfully`);
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

    const result = await findNextTask(id, {});

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
    const nextTaskResult = await findNextTask(id, {});

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

    console.log(result.message || `Phase ${id} deleted successfully`);
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

      console.log(formatTasksList(alternativeResult.data || [], options.format || 'table'));
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

    // Enhanced welcome output
    console.log('\n🚀 Welcome to Scopecraft Command!\n');

    console.log(`Initializing project in: ${process.cwd()}`);
    console.log('✓ Created .tasks directory structure');
    console.log('✓ Installed 6 task templates');
    console.log('✓ Generated quick start guide\n');

    console.log('📁 Project Structure:');
    console.log(`  ${path.relative(process.cwd(), projectConfig.getTasksDirectory())}/`);
    console.log('  ├── 📋 Your tasks will live here');
    console.log(
      `  ├── ${path.relative(projectConfig.getTasksDirectory(), projectConfig.getConfigDirectory())}/ (configuration files)`
    );
    console.log(
      `  └── ${path.relative(projectConfig.getTasksDirectory(), projectConfig.getTemplatesDirectory())}/ (customizable templates)\n`
    );

    console.log('🎯 Next Steps:');
    console.log('  1. Create your first task: sc create --type feature --title "My Feature"');
    console.log('  2. View available templates: sc list-templates');
    console.log('  3. See all tasks: sc list\n');

    console.log('📚 Resources:');
    console.log(
      `  - Quick Start: ${path.relative(process.cwd(), path.join(projectConfig.getTasksDirectory(), 'QUICKSTART.md'))}`
    );
    console.log(
      `  - Templates: ${path.relative(process.cwd(), projectConfig.getTemplatesDirectory())}/`
    );
    console.log('  - Documentation: https://github.com/scopecraft/scopecraft-command\n');

    console.log('💡 Tip: Use your AI assistant to customize templates in .tasks/.templates/\n');
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
  includeTasks?: boolean;
  includeProgress?: boolean;
  includeContent?: boolean;
  includeCompleted?: boolean;
}): Promise<void> {
  try {
    const result = await listFeatures({
      phase: options.phase,
      include_tasks: options.includeTasks === true,
      include_progress: options.includeProgress !== false,
      include_content: options.includeContent === true,
      include_completed: options.includeCompleted === true,
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    if (!result.data || result.data.length === 0) {
      console.log('No features found matching the criteria');
      return;
    }

    console.log(formatFeaturesList(result.data, options.format || 'table'));
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

    const result = await updateFeature(
      id,
      {
        title: updates.title,
        description: updates.description,
        status: updates.status,
        new_id: updates.new_id,
      },
      { phase: updates.phase }
    );

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

    if (!result.data || result.data.length === 0) {
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

    const result = await updateArea(
      id,
      {
        title: updates.title,
        description: updates.description,
        status: updates.status,
        new_id: updates.new_id,
      },
      { phase: updates.phase }
    );

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
import { parse } from '@iarna/toml';
import { type TaskMetadata, parseTaskFile } from '../core/index.js';

/**
 * Handles the 'parent create' command
 */
export async function handleParentCreateCommand(options: {
  title: string;
  type?: string;
  area?: string;
  assignee?: string;
  tags?: string[];
  description?: string;
}): Promise<void> {
  try {
    const { projectConfig: pc } = await import('../core/index.js');
    const tasksDir = pc.getTasksDirectory();
    const projectRoot = tasksDir.replace('/.tasks', '');
    
    const createOptions: v2.TaskCreateOptions = {
      title: options.title,
      type: (options.type || 'feature') as v2.TaskType,
      area: options.area || 'general',
      workflowState: 'backlog',
      status: 'To Do',
      instruction: options.description || `This is a parent task that will be broken down into child tasks.`,
      customMetadata: {}
    };
    
    if (options.assignee) createOptions.customMetadata!.assignee = options.assignee;
    if (options.tags) createOptions.customMetadata!.tags = options.tags;
    
    const result = await v2.createParentTask(projectRoot, createOptions);
    
    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
    
    console.log(`Parent task ${result.data!.metadata.id} created successfully`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'parent list' command
 */
export async function handleParentListCommand(options: {
  location?: string;
  backlog?: boolean;
  current?: boolean;
  archive?: boolean;
  format?: string;
  includeSubtasks?: boolean;
}): Promise<void> {
  try {
    const { projectConfig: pc } = await import('../core/index.js');
    const tasksDir = pc.getTasksDirectory();
    const projectRoot = tasksDir.replace('/.tasks', '');
    
    // Build list options
    const listOptions: v2.TaskListOptions = {
      includeParentTasks: true
    };
    
    // Handle workflow location filters
    if (options.location) {
      listOptions.workflowStates = [options.location as v2.WorkflowState];
    } else if (options.backlog || options.current || options.archive) {
      listOptions.workflowStates = [];
      if (options.backlog) listOptions.workflowStates.push('backlog');
      if (options.current) listOptions.workflowStates.push('current');
      if (options.archive) listOptions.workflowStates.push('archive');
    }
    
    const result = await v2.listTasks(projectRoot, listOptions);
    
    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
    
    // Filter for parent tasks only
    const parentTasks = result.data!.filter(task => task.metadata.isParentTask);
    
    if (parentTasks.length === 0) {
      console.log('No parent tasks found');
      return;
    }
    
    if (options.format === 'json') {
      console.log(JSON.stringify(parentTasks, null, 2));
      return;
    }
    
    // Table format
    console.log('Parent Tasks:');
    console.log('ID                        Title                                              Status          Location');
    console.log('─'.repeat(100));
    
    for (const task of parentTasks) {
      const { STATUS_EMOJIS } = await import('../core/formatters-v2.js');
      const id = task.metadata.id.padEnd(25);
      const title = task.document.title.substring(0, 50).padEnd(50);
      const status = `${STATUS_EMOJIS[task.document.frontmatter.status]} ${task.document.frontmatter.status}`.padEnd(15);
      const location = task.metadata.location.workflowState;
      
      console.log(`${id} ${title} ${status} ${location}`);
      
      if (options.includeSubtasks) {
        // TODO: Get subtask count from parent-tasks module
        console.log(`  └─ Subtasks: (use 'sc parent get ${task.metadata.id}' for details)`);
      }
    }
    
    console.log(`\nTotal: ${parentTasks.length} parent tasks`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'parent get' command
 */
export async function handleParentGetCommand(
  id: string,
  options: {
    format?: string;
    tree?: boolean;
    timeline?: boolean;
  }
): Promise<void> {
  try {
    const { projectConfig: pc } = await import('../core/index.js');
    const tasksDir = pc.getTasksDirectory();
    const projectRoot = tasksDir.replace('/.tasks', '');
    
    const result = await v2.getParentTask(projectRoot, id);
    
    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
    
    const parentTask = result.data!;
    
    if (options.format === 'json') {
      console.log(JSON.stringify(parentTask, null, 2));
      return;
    }
    
    const { formatTaskDetail, STATUS_EMOJIS } = await import('../core/formatters-v2.js');
    
    if (options.tree) {
      // Tree view with parallel indicators
      console.log(`${parentTask.metadata.id}: ${parentTask.overview.title}`);
      
      if (parentTask.subtasks.length > 0) {
        // Group subtasks by sequence number
        const subtasksBySequence = new Map<string, typeof parentTask.subtasks>();
        for (const subtask of parentTask.subtasks) {
          const seq = subtask.metadata.sequenceNumber || '99';
          if (!subtasksBySequence.has(seq)) {
            subtasksBySequence.set(seq, []);
          }
          subtasksBySequence.get(seq)!.push(subtask);
        }
        
        // Sort sequences
        const sequences = Array.from(subtasksBySequence.keys()).sort();
        
        for (let i = 0; i < sequences.length; i++) {
          const seq = sequences[i];
          const tasks = subtasksBySequence.get(seq)!;
          const isLast = i === sequences.length - 1;
          const prefix = isLast ? '└' : '├';
          
          if (tasks.length === 1) {
            // Single task at this sequence
            const task = tasks[0];
            const status = STATUS_EMOJIS[task.document.frontmatter.status];
            const statusName = task.document.frontmatter.status === 'In Progress' ? '→' : 
                              task.document.frontmatter.status === 'Done' ? '✓' :
                              task.document.frontmatter.status === 'Blocked' ? '⧗' : '○';
            console.log(`${prefix}── ${seq}-${task.metadata.id.split('-').slice(1).join('-')} ${statusName} (${task.document.frontmatter.status})`);
          } else {
            // Multiple tasks at same sequence (parallel)
            console.log(`${prefix}─┬ [Parallel execution - sequence ${seq}]`);
            for (let j = 0; j < tasks.length; j++) {
              const task = tasks[j];
              const taskIsLast = j === tasks.length - 1;
              const taskPrefix = isLast ? '  ' : '│ ';
              const taskBranch = taskIsLast ? '└' : '├';
              const statusName = task.document.frontmatter.status === 'In Progress' ? '→' : 
                                task.document.frontmatter.status === 'Done' ? '✓' :
                                task.document.frontmatter.status === 'Blocked' ? '⧗' : '○';
              console.log(`${taskPrefix}${taskBranch} ${seq}-${task.metadata.id.split('-').slice(1).join('-')} ${statusName} (${task.document.frontmatter.status})`);
            }
          }
        }
        
        console.log('\nLegend: ✓ Done, → In Progress, ○ To Do, ⧗ Blocked');
      }
      
      if (parentTask.supportingFiles.length > 0) {
        console.log(`\nSupporting files: ${parentTask.supportingFiles.length}`);
      }
    } else {
      // Default view
      console.log('=== PARENT TASK OVERVIEW ===\n');
      console.log(formatTaskDetail({
        metadata: parentTask.metadata,
        document: parentTask.overview
      }, options.format === 'full' ? 'full' : 'default'));
      
      // Show subtasks
      if (parentTask.subtasks.length > 0) {
        console.log('\n=== SUBTASKS ===');
        console.log(`Total: ${parentTask.subtasks.length} subtasks\n`);
        
        for (const subtask of parentTask.subtasks) {
          const seq = subtask.metadata.sequenceNumber || '??';
          const status = STATUS_EMOJIS[subtask.document.frontmatter.status];
          console.log(`${seq}. ${status} ${subtask.document.title} (${subtask.metadata.id})`);
        }
      }
      
      // Show supporting files
      if (parentTask.supportingFiles.length > 0) {
        console.log('\n=== SUPPORTING FILES ===');
        for (const file of parentTask.supportingFiles) {
          console.log(`  - ${file}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'parent add-subtask' command
 */
export async function handleAddSubtaskCommand(
  parentId: string,
  options: {
    title: string;
    type?: string;
    assignee?: string;
  }
): Promise<void> {
  try {
    const { projectConfig: pc } = await import('../core/index.js');
    const tasksDir = pc.getTasksDirectory();
    const projectRoot = tasksDir.replace('/.tasks', '');
    
    const subtaskOptions: Partial<v2.TaskCreateOptions> = {
      type: options.type as v2.TaskType,
      instruction: `Complete the subtask: ${options.title}`,
      customMetadata: options.assignee ? { assignee: options.assignee } : undefined
    };
    
    const result = await v2.addSubtask(
      projectRoot,
      parentId,
      options.title,
      subtaskOptions
    );
    
    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
    
    console.log(`Subtask ${result.data!.metadata.id} added to parent task ${parentId}`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'parent move' command
 */
export async function handleParentMoveCommand(
  id: string,
  target: string
): Promise<void> {
  try {
    const { projectConfig: pc } = await import('../core/index.js');
    const tasksDir = pc.getTasksDirectory();
    const projectRoot = tasksDir.replace('/.tasks', '');
    
    // Validate target
    if (!['backlog', 'current', 'archive'].includes(target)) {
      console.error('Error: Target must be one of: backlog, current, archive');
      process.exit(1);
    }
    
    const result = await v2.moveParentTask(projectRoot, id, target as v2.WorkflowState);
    
    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
    
    console.log(`Parent task ${id} moved to ${target}`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handles the 'parent delete' command
 */
export async function handleParentDeleteCommand(
  id: string,
  options: {
    force?: boolean;
  }
): Promise<void> {
  try {
    const { projectConfig: pc } = await import('../core/index.js');
    const tasksDir = pc.getTasksDirectory();
    const projectRoot = tasksDir.replace('/.tasks', '');
    
    if (!options.force) {
      // Get parent task to show what will be deleted
      const getResult = await v2.getParentTask(projectRoot, id);
      if (getResult.success && getResult.data) {
        const parentTask = getResult.data;
        console.log(`Warning: This will delete the parent task and ${parentTask.subtasks.length} subtasks.`);
        console.log('Use --force to confirm deletion.');
        process.exit(1);
      }
    }
    
    const result = await v2.deleteParentTask(projectRoot, id);
    
    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
    
    console.log(`Parent task ${id} and all subtasks deleted successfully`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}
