/**
 * Command handlers for CLI
 * Uses the core with workflow-based task management
 */

import { ConfigurationManager } from '../core/config/configuration-manager.js';
import * as core from '../core/index.js';
import type { OutputFormat } from './formatters.js';
import {
  formatProgress,
  formatTaskDetail,
  formatTasksList,
  formatTemplatesList,
} from './formatters.js';

/**
 * Handle init command with project structure
 */
export async function handleInitCommand(options: {
  mode?: string;
  rootDir?: string;
}): Promise<void> {
  try {
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = options.rootDir || process.cwd();

    // Check if already initialized
    const statusMessage = core.getInitStatus(projectRoot);
    if (statusMessage.includes('already initialized')) {
      console.log(`✓ ${statusMessage}`);
      return;
    }

    // Initialize v2 structure
    core.initializeProjectStructure(projectRoot);

    console.log('✓ Initialized Scopecraft v2 project structure:');
    console.log('  .tasks/backlog/     - Tasks waiting to be worked on');
    console.log('  .tasks/current/     - Tasks actively being worked on');
    console.log('  .tasks/archive/     - Completed tasks organized by date');
    console.log('  .tasks/.templates/  - Task templates');
    console.log('\nNext steps:');
    console.log('  sc task create --title "My first task" --type feature');
    console.log('  sc task list');
    console.log('  sc workflow next');

    // Update config if needed
    if (options.rootDir) {
      configManager.setRootFromCLI(options.rootDir);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handle list command with v2
 */
export async function handleListCommand(options: {
  status?: string;
  type?: core.TaskType;
  assignee?: string;
  tags?: string[];
  subdirectory?: string;
  location?: string;
  backlog?: boolean;
  current?: boolean;
  archive?: boolean;
  overview?: boolean;
  format?: string;
}): Promise<void> {
  try {
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = configManager.getRootConfig().path;

    // Build filter options
    const listOptions: core.TaskListOptions = {};

    // Handle workflow location filters
    if (options.backlog) {
      listOptions.workflowStates = ['backlog'];
    } else if (options.current) {
      listOptions.workflowStates = ['current'];
    } else if (options.archive) {
      listOptions.workflowStates = ['archive'];
    } else if (options.location) {
      listOptions.workflowStates = [options.location as core.WorkflowState];
    }

    // Add other filters
    if (options.status) listOptions.status = options.status as core.TaskStatus;
    if (options.type) listOptions.type = options.type;
    if (options.assignee) listOptions.assignee = options.assignee;
    if (options.tags) listOptions.tags = options.tags;
    if (options.subdirectory) listOptions.subdirectory = options.subdirectory;
    if (options.overview) listOptions.onlyParentOverviews = true;

    // List tasks
    const result = await core.list(projectRoot, listOptions);

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    // Format and display
    const format = (options.format || 'table') as OutputFormat;
    console.log(formatTasksList(result.data || [], format));

    // Show summary
    if (format === 'table' && result.data && result.data.length > 0) {
      const byStatus = result.data.reduce(
        (acc, task) => {
          const status = task.document.frontmatter.status;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      console.log(`\nTotal: ${result.data.length} tasks`);
      Object.entries(byStatus).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handle get command with v2
 */
export async function handleGetCommand(
  id: string,
  options: {
    format?: string;
    subdirectory?: string;
    contentOnly?: boolean;
  }
): Promise<void> {
  try {
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = configManager.getRootConfig().path;

    // Get task
    const result = await core.get(projectRoot, id);

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    // Format and display
    if (options.contentOnly) {
      // Display only section content without metadata
      if (result.data?.document) {
        const contentOnly = core.serializeTaskContent(result.data.document);
        console.log(contentOnly);
      }
    } else {
      const format = (options.format || 'default') as OutputFormat;
      if (result.data) {
        console.log(formatTaskDetail(result.data, format));
      }
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handle create command with v2
 */
export async function handleCreateCommand(options: {
  id?: string;
  title: string;
  type: string;
  status?: string;
  priority?: string;
  assignee?: string;
  location?: string;
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
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = configManager.getRootConfig().path;

    // Build create options
    const createOptions: core.TaskCreateOptions = {
      title: options.title,
      type: options.type as core.TaskType,
      area: options.subdirectory || 'general',
      workflowState: (options.location as core.WorkflowState) || 'backlog',
      status: (options.status as core.TaskStatus) || 'To Do',
      template: options.template,
      instruction: options.content,
      customMetadata: {},
    };

    // Add optional metadata (but not parent, which is handled separately)
    if (options.priority) {
      // Pass raw priority - core will normalize it
      createOptions.customMetadata!.priority = options.priority;
    }
    if (options.assignee) createOptions.customMetadata!.assignee = options.assignee;
    if (options.tags) createOptions.tags = options.tags; // Pass directly to core
    if (options.depends) createOptions.customMetadata!.depends = options.depends;
    if (options.previous) createOptions.customMetadata!.previous = options.previous;
    if (options.next) createOptions.customMetadata!.next = options.next;

    // Handle file input
    if (options.file) {
      // TODO: Implement file parsing
      console.error('File input not yet implemented in v2');
      process.exit(1);
    }

    // Create task - use parent builder if parent is specified
    let result;
    if (options.parent) {
      // Use parent builder for subtask creation
      result = await core.parent(projectRoot, options.parent).create(options.title, createOptions);
    } else {
      // Regular task creation
      result = await core.create(projectRoot, createOptions);
    }

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      if (result.validationErrors) {
        result.validationErrors.forEach((err) => {
          console.error(`  - ${err.field}: ${err.message}`);
        });
      }
      process.exit(1);
    }

    console.log(`✓ Created task: ${result.data?.metadata.id}`);
    console.log(
      `  Location: ${result.data?.metadata.location.workflowState}/${result.data?.metadata.filename}`
    );

    // Show next steps
    if (result.data?.metadata.location.workflowState === 'backlog') {
      console.log('\nNext steps:');
      console.log(`  sc workflow promote ${result.data?.metadata.id}  # Move to current`);
      console.log(`  sc task start ${result.data?.metadata.id}        # Mark as in progress`);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handle update command with v2
 */
export async function handleUpdateCommand(
  id: string,
  options: {
    title?: string;
    type?: string;
    status?: string;
    priority?: string;
    assignee?: string;
    location?: string;
    subdirectory?: string;
    parent?: string;
    depends?: string[];
    previous?: string;
    next?: string;
    tags?: string[];
    content?: string;
    file?: string;
  }
): Promise<void> {
  try {
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = configManager.getRootConfig().path;

    // Build update options
    const updateOptions: core.TaskUpdateOptions = {};

    if (options.title) updateOptions.title = options.title;

    // Build frontmatter updates
    const frontmatter: any = {};
    if (options.type) frontmatter.type = options.type;
    if (options.status) frontmatter.status = options.status;
    if (options.subdirectory) frontmatter.area = options.subdirectory;
    if (options.priority) frontmatter.priority = options.priority;
    if (options.assignee) frontmatter.assignee = options.assignee;
    if (options.tags) frontmatter.tags = options.tags;
    if (options.parent) frontmatter.parent = options.parent;
    if (options.depends) frontmatter.depends = options.depends;
    if (options.previous) frontmatter.previous = options.previous;
    if (options.next) frontmatter.next = options.next;

    if (Object.keys(frontmatter).length > 0) {
      updateOptions.frontmatter = frontmatter;
    }

    // Handle content update
    if (options.content) {
      updateOptions.sections = {
        instruction: options.content,
      };
    }

    // Handle file input
    if (options.file) {
      // TODO: Implement file parsing
      console.error('File input not yet implemented in v2');
      process.exit(1);
    }

    // Update task
    const result = await core.update(projectRoot, id, updateOptions);

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      if (result.validationErrors) {
        result.validationErrors.forEach((err) => {
          console.error(`  - ${err.field}: ${err.message}`);
        });
      }
      process.exit(1);
    }

    console.log(`✓ Updated task: ${result.data?.metadata.id}`);

    // Handle location moves
    if (options.location) {
      const moveResult = await core.move(projectRoot, id, {
        targetState: options.location as core.WorkflowState,
        updateStatus: true,
      });

      if (moveResult.success) {
        console.log(`✓ Moved to ${options.location}`);
      } else {
        console.error(`Warning: Failed to move task: ${moveResult.error}`);
      }
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handle delete command with v2
 */
export async function handleDeleteCommand(
  id: string,
  options: {
    force?: boolean;
    subdirectory?: string;
  }
): Promise<void> {
  try {
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = configManager.getRootConfig().path;

    // Confirm deletion if not forced
    if (!options.force) {
      const result = await core.get(projectRoot, id);
      if (result.success && result.data) {
        console.log(`About to delete: ${result.data.document.title}`);
        console.log('Use --force to skip this confirmation.');

        // In a real implementation, we'd prompt for confirmation
        // For now, we'll just exit
        console.log('Deletion cancelled (use --force to delete)');
        return;
      }
    }

    // Delete task
    const result = await core.del(projectRoot, id);

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    console.log(`✓ Deleted task: ${id}`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handle task move command with v2
 */
export async function handleTaskMoveCommand(
  id: string,
  options: {
    toBacklog?: boolean;
    toCurrent?: boolean;
    toArchive?: boolean;
    archiveDate?: string;
    updateStatus?: boolean;
    subdirectory?: string;
    searchSubdirectory?: string;
  }
): Promise<void> {
  try {
    const { projectConfig } = await import('../core/index.js');
    const tasksDir = projectConfig.getTasksDirectory();
    const projectRoot = tasksDir.replace('/.tasks', '');

    // Determine target state
    let targetState: core.WorkflowState;
    if (options.toBacklog) {
      targetState = 'backlog';
    } else if (options.toCurrent) {
      targetState = 'current';
    } else if (options.toArchive) {
      targetState = 'archive';
    } else {
      console.error(
        'Error: Must specify target location (--to-backlog, --to-current, or --to-archive)'
      );
      process.exit(1);
    }

    // Move task
    const result = await core.move(projectRoot, id, {
      targetState,
      archiveDate: options.archiveDate,
      updateStatus: options.updateStatus,
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    console.log(`✓ Moved task to ${targetState}`);

    if (options.updateStatus && result.data) {
      console.log(`  Status: ${result.data.document.frontmatter.status}`);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handle workflow next command with v2
 */
export async function handleNextTaskCommand(
  _id?: string,
  options: {
    format?: string;
  } = {}
): Promise<void> {
  try {
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = configManager.getRootConfig().path;

    // List current tasks with "To Do" status
    const result = await core.list(projectRoot, {
      workflowStates: ['current'],
      status: 'todo',
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    const tasks = result.data || [];

    if (tasks.length === 0) {
      // Check backlog
      const backlogResult = await core.list(projectRoot, {
        workflowStates: ['backlog'],
        status: 'todo',
      });

      if (backlogResult.success && backlogResult.data && backlogResult.data.length > 0) {
        console.log('No tasks in current. Consider promoting from backlog:');
        const format = (options.format || 'default') as OutputFormat;
        console.log(formatTaskDetail(backlogResult.data[0], format));
        console.log(`\nPromote with: sc workflow promote ${backlogResult.data[0].metadata.id}`);
      } else {
        console.log('No tasks available to work on.');
      }
      return;
    }

    // Find highest priority task
    const priorityOrder = ['High', 'Medium', 'Low'];
    tasks.sort((a, b) => {
      const aPriority = a.document.frontmatter.priority || 'Medium';
      const bPriority = b.document.frontmatter.priority || 'Medium';
      return priorityOrder.indexOf(aPriority) - priorityOrder.indexOf(bPriority);
    });

    const nextTask = tasks[0];
    const format = (options.format || 'default') as OutputFormat;
    console.log('Next task to work on:');
    console.log(formatTaskDetail(nextTask, format));
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handle workflow current command with v2
 */
export async function handleCurrentTaskCommand(options: {
  format?: string;
}): Promise<void> {
  try {
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = configManager.getRootConfig().path;

    // List tasks in progress
    const result = await core.list(projectRoot, {
      status: 'in_progress',
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    const tasks = result.data || [];

    if (tasks.length === 0) {
      console.log('No tasks currently in progress.');
      return;
    }

    // Format and display
    const format = (options.format || 'table') as OutputFormat;
    console.log('Tasks in progress:');
    console.log(formatTasksList(tasks, format));
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handle mark complete and next command with v2
 */
export async function handleMarkCompleteNextCommand(
  id: string,
  options: {
    format?: string;
  }
): Promise<void> {
  try {
    // Mark as complete
    await handleUpdateCommand(id, { status: 'Done' });

    // Move to archive if in current
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = configManager.getRootConfig().path;

    const task = await core.get(projectRoot, id);
    if (task.success && task.data && task.data.metadata.location.workflowState === 'current') {
      await handleTaskMoveCommand(id, { toArchive: true });
    }

    // Show next task
    await handleNextTaskCommand(undefined, options);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handle template list command with v2
 */
export async function handleListTemplatesCommand(): Promise<void> {
  try {
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = configManager.getRootConfig().path;

    // List templates
    const templates = await core.listTemplates(projectRoot);

    if (templates.length === 0) {
      console.log('No templates found.');
      console.log('\nTemplates should be placed in .tasks/.templates/');
      return;
    }

    // Format and display
    console.log(formatTemplatesList(templates));
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

// Feature/Area commands will be implemented when we add parent task support
export async function handleFeatureListCommand(_options: unknown): Promise<void> {
  console.log('Parent task listing not yet implemented in v2');
}

export async function handleFeatureGetCommand(_id: string, _options: unknown): Promise<void> {
  console.log('Parent task get not yet implemented in v2');
}

export async function handleFeatureUpdateCommand(_id: string, _options: unknown): Promise<void> {
  console.log('Parent task update not yet implemented in v2');
}

export async function handleFeatureDeleteCommand(_id: string, _options: unknown): Promise<void> {
  console.log('Parent task delete not yet implemented in v2');
}

export async function handleAreaListCommand(_options: unknown): Promise<void> {
  console.log('Area listing will use parent tasks in v2');
}

export async function handleAreaGetCommand(_id: string, _options: unknown): Promise<void> {
  console.log('Area get will use parent tasks in v2');
}

export async function handleAreaUpdateCommand(_id: string, _options: unknown): Promise<void> {
  console.log('Area update will use parent tasks in v2');
}

export async function handleAreaDeleteCommand(_id: string, _options: unknown): Promise<void> {
  console.log('Area delete will use parent tasks in v2');
}

/**
 * Handle search command
 */
export async function handleSearchCommand(
  query: string,
  options: {
    type?: string[];
    status?: string[];
    area?: string;
    tags?: string[];
    limit?: string;
    format?: string;
  }
): Promise<void> {
  try {
    // 1. Get project root (following existing pattern)
    const configManager = ConfigurationManager.getInstance();
    const rootConfig = configManager.getRootConfig();
    if (!rootConfig.path) {
      console.error('Error: No project root configured. Run "sc init" first.');
      process.exit(1);
    }
    const projectRoot = rootConfig.path;

    // 2. Initialize search service
    const { getSearchService } = await import('../core/search/index.js');
    const searchService = getSearchService(projectRoot);
    const initResult = await searchService.initialize();

    if (!initResult.success) {
      console.error(`Error initializing search: ${initResult.error}`);
      process.exit(1);
    }

    // 3. Build search query (following existing option parsing)
    const searchQuery = {
      query: query?.trim() || undefined,
      types: options.type as ('task' | 'doc')[] | undefined,
      filters: {
        status: options.status,
        area: options.area ? [options.area] : undefined,
        tags: options.tags,
      },
      limit: Number.parseInt(options.limit || '20', 10),
    };

    // 4. Execute search
    const result = await searchService.search(searchQuery);

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    const results = result.data!;

    if (results.totalCount === 0) {
      console.log('No results found.');
      return;
    }

    // 5. Format and display (following existing formatter pattern)
    const format = (options.format || 'table') as OutputFormat;
    const { formatSearchResults } = await import('./formatters.js');
    console.log(formatSearchResults(results, format));

    // 6. Show summary (following existing pattern)
    console.log(`\nFound ${results.totalCount} results in ${results.queryTime}ms`);
  } catch (error) {
    // 7. Error handling (following existing pattern)
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handle search reindex command
 */
export async function handleSearchReindexCommand(): Promise<void> {
  try {
    const configManager = ConfigurationManager.getInstance();
    const rootConfig = configManager.getRootConfig();
    if (!rootConfig.path) {
      console.error('Error: No project root configured. Run "sc init" first.');
      process.exit(1);
    }
    const projectRoot = rootConfig.path;

    const { getSearchService } = await import('../core/search/index.js');
    const searchService = getSearchService(projectRoot);
    console.log('Rebuilding search index...');

    const result = await searchService.indexProject();

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    console.log('✓ Search index rebuilt successfully');
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}
