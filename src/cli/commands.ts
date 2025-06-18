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
import {
  validatePhase,
  validatePriority,
  validateStatus,
  validateType,
  validateWorkflowState,
} from './validation-helpers.js';

/**
 * Handle init command with project structure
 */

/**
 * Handle list command with v2
 */
// Helper functions for handleListCommand
function buildWorkflowStateFilter(options: {
  current?: boolean;
  archive?: boolean;
  location?: string;
}): core.WorkflowState[] | undefined {
  if (options.current) return ['current'];
  if (options.archive) return ['archive'];
  if (options.location) return [options.location as core.WorkflowState];
  return undefined;
}

function buildListOptions(options: {
  status?: string;
  type?: core.TaskType;
  assignee?: string;
  tags?: string[];
  subdirectory?: string;
  location?: string;
  phase?: string;
  current?: boolean;
  archive?: boolean;
  overview?: boolean;
}): core.TaskListOptions {
  const listOptions: core.TaskListOptions = {};

  const workflowStates = buildWorkflowStateFilter(options);
  if (workflowStates) listOptions.workflowStates = workflowStates;

  if (options.status) listOptions.status = options.status as core.TaskStatus;
  if (options.type) listOptions.type = options.type;
  if (options.phase) listOptions.phase = options.phase as core.TaskPhase;
  if (options.assignee) listOptions.assignee = options.assignee;
  if (options.tags) listOptions.tags = options.tags;
  if (options.subdirectory) listOptions.subdirectory = options.subdirectory;
  if (options.overview) listOptions.onlyParentOverviews = true;

  return listOptions;
}

function displayTaskSummary(tasks: core.Task[], format: OutputFormat): void {
  if (format !== 'table' || tasks.length === 0) return;

  const byStatus = tasks.reduce(
    (acc, task) => {
      const status = task.document.frontmatter.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log(`\nTotal: ${tasks.length} tasks`);
  for (const [status, count] of Object.entries(byStatus)) {
    console.log(`  ${status}: ${count}`);
  }
}

export async function handleListCommand(options: {
  status?: string;
  type?: core.TaskType;
  assignee?: string;
  tags?: string[];
  subdirectory?: string;
  location?: string;
  phase?: string;
  current?: boolean;
  archive?: boolean;
  overview?: boolean;
  format?: string;
}): Promise<void> {
  try {
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = configManager.getRootConfig().path;

    const listOptions = buildListOptions(options);
    const result = await core.list(projectRoot, listOptions);

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    const format = (options.format || 'table') as OutputFormat;
    console.log(formatTasksList(result.data || [], format));
    displayTaskSummary(result.data || [], format);
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
// Helper functions for handleCreateCommand
function buildCreateOptions(options: {
  title: string;
  type: string;
  status?: string;
  area?: string;
  location?: string;
  phase?: string;
  content?: string;
  template?: string;
}): core.TaskCreateOptions {
  return {
    title: options.title,
    type: options.type as core.TaskType,
    area: options.area || 'general',
    workflowState: (options.location as core.WorkflowState) || 'current',
    phase: options.phase as core.TaskPhase,
    status: (options.status as core.TaskStatus) || 'To Do',
    template: options.template,
    instruction: options.content,
    customMetadata: {},
  };
}

function addOptionalMetadata(
  createOptions: core.TaskCreateOptions,
  options: {
    priority?: string;
    assignee?: string;
    tags?: string[];
    depends?: string[];
    previous?: string;
    next?: string;
  }
): void {
  if (!createOptions.customMetadata) return;

  if (options.priority) createOptions.customMetadata.priority = options.priority;
  if (options.assignee) createOptions.customMetadata.assignee = options.assignee;
  if (options.tags) createOptions.tags = options.tags;
  if (options.depends) createOptions.customMetadata.depends = options.depends;
  if (options.previous) createOptions.customMetadata.previous = options.previous;
  if (options.next) createOptions.customMetadata.next = options.next;
}

function validateFileInput(file?: string): void {
  if (file) {
    console.error('File input not yet implemented in v2');
    process.exit(1);
  }
}

function displayCreationResult(result: core.OperationResult<core.Task>): void {
  if (!result.success) {
    console.error(`Error: ${result.error}`);
    if (result.validationErrors) {
      for (const err of result.validationErrors) {
        console.error(`  - ${err.field}: ${err.message}`);
      }
    }
    process.exit(1);
  }

  console.log(`✓ Created task: ${result.data?.metadata.id}`);
  console.log(
    `  Location: ${result.data?.metadata.location.workflowState}/${result.data?.metadata.filename}`
  );

  if (result.data?.metadata.location.workflowState === 'current') {
    console.log('\nNext steps:');
    console.log(`  sc task start ${result.data?.metadata.id}        # Mark as in progress`);
  }
}

export async function handleCreateCommand(options: {
  id?: string;
  title: string;
  type: string;
  status?: string;
  priority?: string;
  assignee?: string;
  area?: string;
  location?: string;
  phase?: string;
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

    validateFileInput(options.file);

    const createOptions = buildCreateOptions(options);
    addOptionalMetadata(createOptions, options);

    const result = options.parent
      ? await core.parent(projectRoot, options.parent).create(options.title, createOptions)
      : await core.create(projectRoot, createOptions);

    displayCreationResult(result);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Handle update command with v2
 */
// Helper functions for handleUpdateCommand
function buildFrontmatterUpdates(options: {
  type?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  subdirectory?: string;
  parent?: string;
  depends?: string[];
  previous?: string;
  next?: string;
  tags?: string[];
}): Partial<core.TaskFrontmatter> | undefined {
  const frontmatter: Partial<core.TaskFrontmatter> = {};

  if (options.type) frontmatter.type = options.type as core.TaskType;
  if (options.status) frontmatter.status = options.status as core.TaskStatus;
  if (options.subdirectory) frontmatter.area = options.subdirectory;
  if (options.priority) frontmatter.priority = options.priority as core.TaskPriority;
  if (options.assignee) frontmatter.assignee = options.assignee;
  if (options.tags) frontmatter.tags = options.tags;
  if (options.parent) frontmatter.parent = options.parent;
  if (options.depends) frontmatter.depends = options.depends;
  if (options.previous) frontmatter.previous = options.previous;
  if (options.next) frontmatter.next = options.next;

  return Object.keys(frontmatter).length > 0 ? frontmatter : undefined;
}

function buildUpdateOptions(options: {
  title?: string;
  type?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  subdirectory?: string;
  parent?: string;
  depends?: string[];
  previous?: string;
  next?: string;
  tags?: string[];
  content?: string;
}): core.TaskUpdateOptions {
  const updateOptions: core.TaskUpdateOptions = {};

  if (options.title) updateOptions.title = options.title;

  const frontmatter = buildFrontmatterUpdates(options);
  if (frontmatter) updateOptions.frontmatter = frontmatter;

  if (options.content) {
    updateOptions.sections = {
      instruction: options.content,
    };
  }

  return updateOptions;
}

function displayUpdateResult(result: core.OperationResult<core.Task>): void {
  if (!result.success) {
    console.error(`Error: ${result.error}`);
    if (result.validationErrors) {
      for (const err of result.validationErrors) {
        console.error(`  - ${err.field}: ${err.message}`);
      }
    }
    process.exit(1);
  }
  console.log(`✓ Updated task: ${result.data?.metadata.id}`);
}

async function handleLocationMove(
  projectRoot: string,
  id: string,
  location: string
): Promise<void> {
  const moveResult = await core.move(projectRoot, id, {
    targetState: location as core.WorkflowState,
    updateStatus: true,
  });

  if (moveResult.success) {
    console.log(`✓ Moved to ${location}`);
  } else {
    console.error(`Warning: Failed to move task: ${moveResult.error}`);
  }
}

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

    validateFileInput(options.file);

    const updateOptions = buildUpdateOptions(options);
    const result = await core.update(projectRoot, id, updateOptions);

    displayUpdateResult(result);

    if (options.location) {
      await handleLocationMove(projectRoot, id, options.location);
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
    if (options.toCurrent) {
      targetState = 'current';
    } else if (options.toArchive) {
      targetState = 'archive';
    } else {
      console.error('Error: Must specify target location (--to-current or --to-archive)');
      process.exit(1);
      return; // TypeScript needs this to know execution stops here
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
      console.log('No tasks available to work on.');
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

    if (!result.data) {
      console.error('Error: No data returned');
      process.exit(1);
    }

    const results = result.data;

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

/**
 * Handle parent create command
 */
export async function handleParentCreateCommand(options: {
  name: string;
  title: string;
  description?: string;
  type?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  location?: string;
  phase?: string;
  tags?: string[];
}): Promise<void> {
  try {
    // Get project root
    const configManager = ConfigurationManager.getInstance();
    const rootConfig = configManager.getRootConfig();
    if (!rootConfig.path) {
      console.error('Error: No project root configured. Run "sc init" first.');
      process.exit(1);
    }
    const projectRoot = rootConfig.path;

    // Validate all metadata using schema service (following MCP pattern)
    const validatedType = validateType(options.type || 'feature');
    const validatedStatus = validateStatus(options.status);
    const validatedPriority = validatePriority(options.priority);
    const validatedWorkflowState = validateWorkflowState(options.location);
    const validatedPhase = validatePhase(options.phase);

    // Build create options (following MCP buildParentCreateOptions pattern)
    const createOptions: core.TaskCreateOptions = {
      title: options.title,
      type: validatedType as core.TaskType,
      area: 'general', // Default area for parent tasks
      status: (validatedStatus || 'todo') as core.TaskStatus,
      workflowState: (validatedWorkflowState || 'current') as core.WorkflowState,
      phase: (validatedPhase || 'backlog') as core.TaskPhase,
      instruction:
        options.description || 'This is a parent task that will be broken down into subtasks.',
      customMetadata: {
        ...(validatedPriority && { priority: validatedPriority }),
        ...(options.assignee && { assignee: options.assignee }),
      },
      tags: options.tags,
    };

    // Load project config (following MCP pattern)
    const projectConfig = undefined; // Use default config for now

    // Create parent task using core function (following MCP pattern)
    const result = await core.createParent(projectRoot, createOptions, projectConfig);

    if (!result.success || !result.data) {
      console.error(`Error: ${result.error || 'Failed to create parent task'}`);
      process.exit(1);
    }

    // Display success message (following CLI pattern)
    console.log(`✓ Parent task created successfully`);
    console.log(`  ID: ${result.data?.metadata.id}`);
    console.log(`  Title: ${result.data?.overview.title}`);
    console.log(`  Type: ${result.data?.overview.frontmatter.type}`);
    console.log(`  Status: ${result.data?.overview.frontmatter.status}`);
    if (result.data?.overview.frontmatter.phase) {
      console.log(`  Phase: ${result.data?.overview.frontmatter.phase}`);
    }
    if (result.data?.overview.frontmatter.priority) {
      console.log(`  Priority: ${result.data?.overview.frontmatter.priority}`);
    }
    if (result.data?.overview.frontmatter.assignee) {
      console.log(`  Assignee: ${result.data?.overview.frontmatter.assignee}`);
    }
    console.log(`  Workflow: ${result.data?.metadata.location.workflowState}`);
    console.log(`  Path: ${result.data?.metadata.path}`);

    console.log('\nNext steps:');
    console.log(`  sc parent add-subtask ${result.data?.metadata.id} --title "First subtask"`);
    console.log(`  sc parent get ${result.data?.metadata.id}`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}
