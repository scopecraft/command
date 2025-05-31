/**
 * Implementation of entity-command pattern for CLI V2
 * Organizes commands into entity groups (task, parent, area, workflow)
 */
import { Command } from 'commander';
import { ConfigurationManager } from '../core/config/index.js';
import * as v2 from '../core/v2/index.js';
import {
  handleAreaDeleteCommand,
  handleAreaGetCommand,
  handleAreaListCommand,
  handleAreaUpdateCommand,
  handleCreateCommand,
  handleCurrentTaskCommand,
  handleDeleteCommand,
  handleFeatureDeleteCommand,
  handleFeatureGetCommand,
  handleFeatureListCommand,
  handleFeatureUpdateCommand,
  handleGetCommand,
  handleInitCommand,
  handleListCommand,
  handleListTemplatesCommand,
  handleMarkCompleteNextCommand,
  handleNextTaskCommand,
  handleTaskMoveCommand,
  handleUpdateCommand,
} from './commands.js';

/**
 * Set up task commands for V2
 * @param program Root commander program
 */
export function setupTaskCommands(program: Command): void {
  // Create task command group
  const taskCommand = new Command('task')
    .description('Task management commands')
    .addHelpText('before', '\nTASK MANAGEMENT COMMANDS\n======================\n')
    .addHelpText(
      'after',
      `
Note: You can use the global --root-dir option to specify an alternative tasks directory:
  sc --root-dir ./e2e_test/worktree-test task list
  sc --root-dir /path/to/project task create --title "Task in other project"
`
    );

  // task list command
  taskCommand
    .command('list')
    .description('List all tasks (Example: sc task list --status "To Do" --current)')
    .option('-s, --status <status>', 'Filter by status (e.g., "To Do", "Done")')
    .option('-t, --type <type>', 'Filter by type (e.g., "feature", "bug")')
    .option('-a, --assignee <assignee>', 'Filter by assignee')
    .option('-g, --tags <tags...>', 'Filter by tags')
    .option('-d, --subdirectory <subdirectory>', 'Filter by subdirectory/area')
    .option('-l, --location <location>', 'Filter by workflow location: backlog, current, archive')
    .option('--backlog', 'Show only backlog tasks')
    .option('--current', 'Show only current tasks (default)')
    .option('--archive', 'Show only archived tasks')
    .option('--all', 'Show all workflow locations')
    .option(
      '-f, --format <format>',
      'Output format: tree (default), table, json, minimal, workflow',
      'tree'
    )
    .action(handleListCommand);

  // task get command
  taskCommand
    .command('get <id>')
    .description('Get a task by ID')
    .option('-f, --format <format>', 'Output format: default, json, markdown, full', 'default')
    .option('-d, --subdirectory <subdirectory>', 'Subdirectory to look in')
    .option('--content-only', 'Show only section content without title and metadata')
    .action(handleGetCommand);

  // task create command
  taskCommand
    .command('create')
    .description('Create a new task (Example: sc task create --title "New feature" --type feature)')
    .option(
      '--id <id>',
      'Task ID (generated if not provided, use "_overview" for parent task overview files)'
    )
    .option('--title <title>', 'Task title')
    .option('--type <type>', 'Task type (e.g., "feature", "bug")')
    .option('--status <status>', 'Task status (default: "To Do")')
    .option('--priority <priority>', 'Task priority (default: "Medium")')
    .option('--assignee <assignee>', 'Assigned to')
    .option('--location <location>', 'Workflow location: backlog (default), current, archive')
    .option('--subdirectory <subdirectory>', 'Subdirectory (e.g., "FEATURE_Login")')
    .option('--parent <parent>', 'Parent task ID')
    .option('--depends <depends...>', 'Dependencies (task IDs)')
    .option('--previous <previous>', 'Previous task in workflow')
    .option('--next <next>', 'Next task in workflow')
    .option('--tags <tags...>', 'Tags for the task')
    .option('--content <content>', 'Task content')
    .option('--file <file>', 'Create from file (JSON or TOML+Markdown)')
    .option('--template <template>', 'Use a predefined template (feature, bug, etc.)')
    .requiredOption('--title <title>', 'Task title is required')
    .requiredOption('--type <type>', 'Task type is required')
    .action(handleCreateCommand);

  // task update command
  taskCommand
    .command('update <id>')
    .description('Update a task')
    .option('--title <title>', 'New task title')
    .option('--type <type>', 'New task type')
    .option('--status <status>', 'New task status')
    .option('--priority <priority>', 'New task priority')
    .option('--assignee <assignee>', 'New assignee')
    .option('--location <location>', 'Move to workflow location: backlog, current, archive')
    .option('--subdirectory <subdirectory>', 'Move to subdirectory')
    .option('--parent <parent>', 'New parent task ID')
    .option('--depends <depends...>', 'New dependencies (task IDs)')
    .option('--previous <previous>', 'New previous task in workflow')
    .option('--next <next>', 'New next task in workflow')
    .option('--tags <tags...>', 'New tags for the task')
    .option('--content <content>', 'New task content')
    .option('--file <file>', 'Update from file (JSON or TOML+Markdown)')
    .option('-d, --subdirectory <subdirectory>', 'Subdirectory to look in')
    .action(handleUpdateCommand);

  // task delete command
  taskCommand
    .command('delete <id>')
    .description('Delete a task')
    .option('-f, --force', 'Force deletion without confirmation')
    .option('-d, --subdirectory <subdirectory>', 'Subdirectory to look in')
    .action(handleDeleteCommand);

  // task move command - updated for workflow transitions
  taskCommand
    .command('move <id>')
    .description('Move a task between workflow states')
    .option('--to-backlog', 'Move task to backlog')
    .option('--to-current', 'Move task to current')
    .option('--to-archive', 'Move task to archive')
    .option('--archive-date <date>', 'Archive date (YYYY-MM format)')
    .option('--update-status', 'Automatically update task status based on move')
    .option('--subdirectory <subdirectory>', 'Target subdirectory')
    .option('--search-subdirectory <searchSubdirectory>', 'Source subdirectory to search')
    .action(handleTaskMoveCommand);

  // Status shortcut commands
  taskCommand
    .command('start <id>')
    .description('Mark a task as "In Progress"')
    .option('-d, --subdirectory <subdirectory>', 'Subdirectory to look in')
    .action(async (id, options) => {
      await handleUpdateCommand(id, { ...options, status: 'In Progress' });
    });

  taskCommand
    .command('complete <id>')
    .description('Mark a task as "Done"')
    .option('-d, --subdirectory <subdirectory>', 'Subdirectory to look in')
    .action(async (id, options) => {
      await handleUpdateCommand(id, { ...options, status: 'Done' });
    });

  taskCommand
    .command('block <id>')
    .description('Mark a task as "Blocked"')
    .option('-d, --subdirectory <subdirectory>', 'Subdirectory to look in')
    .action(async (id, options) => {
      await handleUpdateCommand(id, { ...options, status: 'Blocked' });
    });

  taskCommand
    .command('review <id>')
    .description('Mark a task as "In Review"')
    .option('-d, --subdirectory <subdirectory>', 'Subdirectory to look in')
    .action(async (id, options) => {
      await handleUpdateCommand(id, { ...options, status: 'In Review' });
    });

  // Add task group to root program
  program.addCommand(taskCommand);

  // Add top-level shortcuts
  program
    .command('list')
    .description('List all tasks (shortcut for "task list")')
    .option('-s, --status <status>', 'Filter by status')
    .option('-t, --type <type>', 'Filter by type')
    .option('-a, --assignee <assignee>', 'Filter by assignee')
    .option('-g, --tags <tags...>', 'Filter by tags')
    .option('-d, --subdirectory <subdirectory>', 'Filter by subdirectory/area')
    .option('-l, --location <location>', 'Filter by workflow location')
    .option('--backlog', 'Show only backlog tasks')
    .option('--current', 'Show only current tasks (default)')
    .option('--archive', 'Show only archived tasks')
    .option('--all', 'Show all workflow locations')
    .option('-f, --format <format>', 'Output format', 'tree')
    .action(handleListCommand);

  program
    .command('get <id>')
    .description('Get a task by ID (shortcut for "task get")')
    .option('-f, --format <format>', 'Output format', 'default')
    .option('-d, --subdirectory <subdirectory>', 'Subdirectory to look in')
    .action(handleGetCommand);
}

/**
 * Set up parent (formerly feature) and area commands
 * @param program Root commander program
 */
export function setupParentAreaCommands(program: Command): void {
  // Create parent command group (replaces feature)
  const parentCommand = new Command('parent')
    .description('Parent task management commands')
    .addHelpText('before', '\nPARENT TASK MANAGEMENT COMMANDS\n============================\n')
    .addHelpText(
      'after',
      `
Note: Parent tasks are folder-based tasks that contain subtasks.
You can use the global --root-dir option to specify an alternative tasks directory.
`
    );

  // parent create command
  parentCommand
    .command('create')
    .description(
      'Create a new parent task (Example: sc parent create --name "Authentication" --title "User Auth")'
    )
    .requiredOption('--name <name>', 'Parent task name (will be used as folder name)')
    .requiredOption('--title <title>', 'Parent task title')
    .option('--description <description>', 'Parent task description')
    .option('--type <type>', 'Task type (default: "feature")')
    .option('--status <status>', 'Task status (default: "To Do")')
    .option('--priority <priority>', 'Task priority (default: "Medium")')
    .option('--assignee <assignee>', 'Assigned to')
    .option('--location <location>', 'Workflow location: backlog (default), current')
    .option('--tags <tags...>', 'Tags for the parent task')
    .action(async (options) => {
      // Will be implemented with v2 createParentTask
      console.log('Creating parent task:', options);
    });

  // parent list command
  parentCommand
    .command('list')
    .description('List all parent tasks')
    .option('-l, --location <location>', 'Filter by workflow location')
    .option('--backlog', 'Show only backlog parent tasks')
    .option('--current', 'Show only current parent tasks')
    .option('--archive', 'Show only archived parent tasks')
    .option('-f, --format <format>', 'Output format: table, json', 'table')
    .option('-t, --include-tasks', 'Include subtasks in output')
    .option('-r, --include-progress', 'Include progress calculations')
    .option('-c, --include-content', 'Include content in output')
    .option('-d, --include-completed', 'Include completed parent tasks')
    .action(handleFeatureListCommand);

  // parent get command
  parentCommand
    .command('get <id>')
    .description('Get details of a parent task')
    .option('-f, --format <format>', 'Output format: default, json', 'default')
    .action(handleFeatureGetCommand);

  // parent update command
  parentCommand
    .command('update <id>')
    .description('Update a parent task')
    .option('--title <title>', 'New title')
    .option('--description <description>', 'New description')
    .option('--status <status>', 'New status')
    .option('--new-id <newId>', 'New ID (will rename folder)')
    .action(handleFeatureUpdateCommand);

  // parent delete command
  parentCommand
    .command('delete <id>')
    .description('Delete a parent task')
    .option('-f, --force', 'Force deletion even if parent contains tasks')
    .action(handleFeatureDeleteCommand);

  // parent add-subtask command
  parentCommand
    .command('add-subtask <parentId>')
    .description('Add a subtask to a parent task')
    .requiredOption('--title <title>', 'Subtask title')
    .option('--type <type>', 'Subtask type')
    .option('--assignee <assignee>', 'Assigned to')
    .action(async (parentId, options) => {
      try {
        const configManager = ConfigurationManager.getInstance();
        const projectRoot = configManager.getProjectRoot();

        const result = await v2.addSubtask(projectRoot, parentId, options.title, {
          type: options.type,
          assignee: options.assignee,
        });

        if (!result.success) {
          console.error(`Error: ${result.error}`);
          process.exit(1);
        }

        console.log(`✓ Added subtask: ${result.data!.metadata.id}`);
        console.log(`  Parent: ${parentId}`);
        console.log(`  Path: ${result.data!.metadata.path}`);
      } catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  // Add parent group to root program
  program.addCommand(parentCommand);

  // Keep feature as deprecated alias
  const featureCommand = new Command('feature')
    .description('[DEPRECATED] Use "parent" commands instead')
    .addHelpText('before', '\n⚠️  DEPRECATED: "feature" commands are now "parent" commands\n');

  // Redirect all feature commands to parent
  featureCommand
    .command('create')
    .description('[DEPRECATED] Use "parent create" instead')
    .action(() => {
      console.error('⚠️  The "feature" command is deprecated. Use "parent create" instead.');
      process.exit(1);
    });

  program.addCommand(featureCommand);

  // Create area command group
  const areaCommand = new Command('area')
    .description('Cross-cutting area management')
    .addHelpText('before', '\nAREA MANAGEMENT COMMANDS\n=====================\n');

  // area create command
  areaCommand
    .command('create')
    .description('Create a new area')
    .requiredOption('--name <name>', 'Area name (will be prefixed with AREA_)')
    .requiredOption('--title <title>', 'Area title')
    .option('--description <description>', 'Area description')
    .option('--type <type>', 'Area type')
    .option('--status <status>', 'Area status (default: "To Do")')
    .option('--priority <priority>', 'Area priority (default: "Medium")')
    .option('--assignee <assignee>', 'Assigned to')
    .option('--tags <tags...>', 'Tags for the area')
    .action(async (options) => {
      const subdirectory = `AREA_${options.name.replace(/\s+/g, '')}`;

      try {
        await handleCreateCommand({
          id: '_overview',
          title: options.title,
          type: options.type || 'feature',
          status: options.status || 'To Do',
          priority: options.priority || 'Medium',
          assignee: options.assignee,
          location: 'backlog',
          subdirectory,
          tags: options.tags,
          content: options.description
            ? `# ${options.title}\n\n${options.description}\n\n## Tasks\n\n- [ ] Task 1`
            : `# ${options.title}\n\nOverview of this area.\n\n## Tasks\n\n- [ ] Task 1`,
        });

        console.log(`Area '${options.name}' created successfully.`);
      } catch (_error) {
        // Error handled by handleCreateCommand
      }
    });

  // area list command
  areaCommand
    .command('list')
    .description('List all areas')
    .option('-f, --format <format>', 'Output format: table, json', 'table')
    .option('-t, --include-tasks', 'Include tasks in output')
    .option('-r, --include-progress', 'Include progress calculations')
    .action(handleAreaListCommand);

  // area get command
  areaCommand
    .command('get <id>')
    .description('Get details of an area')
    .option('-f, --format <format>', 'Output format: default, json', 'default')
    .action(handleAreaGetCommand);

  // area update command
  areaCommand
    .command('update <id>')
    .description('Update an area')
    .option('--title <title>', 'New title')
    .option('--description <description>', 'New description')
    .option('--status <status>', 'New status')
    .option('--new-id <newId>', 'New ID (will rename directory)')
    .action(handleAreaUpdateCommand);

  // area delete command
  areaCommand
    .command('delete <id>')
    .description('Delete an area')
    .option('-f, --force', 'Force deletion even if area contains tasks')
    .action(handleAreaDeleteCommand);

  // Add area group to root program
  program.addCommand(areaCommand);
}

/**
 * Set up workflow commands with v2 additions
 * @param program Root commander program
 */
export function setupWorkflowCommands(program: Command): void {
  // Create workflow command group
  const workflowCommand = new Command('workflow')
    .description('Task workflow and sequence management')
    .addHelpText('before', '\nWORKFLOW MANAGEMENT COMMANDS\n=========================\n');

  // workflow next command
  workflowCommand
    .command('next [id]')
    .description('Find the next task to work on')
    .option('-f, --format <format>', 'Output format: default, json, markdown, full', 'default')
    .action(handleNextTaskCommand);

  // workflow current command
  workflowCommand
    .command('current')
    .description('Show all tasks currently in progress')
    .option('-f, --format <format>', 'Output format: table, json, minimal, workflow', 'table')
    .action(handleCurrentTaskCommand);

  // workflow mark-complete-next command
  workflowCommand
    .command('mark-complete-next <id>')
    .description('Mark a task as done and show the next task')
    .option('-f, --format <format>', 'Output format: default, json, markdown, full', 'default')
    .action(handleMarkCompleteNextCommand);

  // NEW: workflow promote command
  workflowCommand
    .command('promote <id>')
    .description('Promote a task from backlog to current')
    .option('--update-status', 'Also mark task as "In Progress"')
    .action(async (id, options) => {
      await handleTaskMoveCommand(id, {
        toCurrent: true,
        updateStatus: options.updateStatus,
      });
    });

  // NEW: workflow archive command
  workflowCommand
    .command('archive <id>')
    .description('Archive a completed task')
    .option('--date <date>', 'Archive date (YYYY-MM format, defaults to current month)')
    .action(async (id, options) => {
      await handleTaskMoveCommand(id, {
        toArchive: true,
        archiveDate: options.date,
      });
    });

  // NEW: workflow status command
  workflowCommand
    .command('status')
    .description('Show workflow overview with task counts')
    .option('-f, --format <format>', 'Output format: table, json', 'table')
    .action(async (options) => {
      // Will be implemented to show counts per workflow state
      console.log('Workflow status:', options);
    });

  // Add workflow group to root program
  program.addCommand(workflowCommand);
}

/**
 * Set up template commands
 * @param program Root commander program
 */
export function setupTemplateCommands(program: Command): void {
  // Create template command group
  const templateCommand = new Command('template')
    .description('Template management commands')
    .addHelpText('before', '\nTEMPLATE MANAGEMENT COMMANDS\n=========================\n');

  // template list command
  templateCommand
    .command('list')
    .description('List available task templates')
    .action(handleListTemplatesCommand);

  // Add template group to root program
  program.addCommand(templateCommand);
}

/**
 * Set up initialization commands with v2 support
 * @param program Root commander program
 */
export function setupInitCommands(program: Command): void {
  // Init command (directly on root program)
  program
    .command('init')
    .description('Initialize task directory structure with workflow folders')
    .option('--mode <mode>', 'Force project mode (roo or standalone)')
    .option('--root-dir <path>', 'Initialize in specific directory instead of current directory')
    .action(handleInitCommand);
}

/**
 * Set up shortcut commands for workflow states
 * @param program Root commander program
 */
export function setupWorkflowShortcuts(program: Command): void {
  // backlog command
  program
    .command('backlog')
    .description('List all backlog tasks (shortcut for "task list --backlog")')
    .option('-s, --status <status>', 'Filter by status')
    .option('-t, --type <type>', 'Filter by type')
    .option('-a, --assignee <assignee>', 'Filter by assignee')
    .option('-f, --format <format>', 'Output format', 'table')
    .action((options) => handleListCommand({ ...options, backlog: true }));

  // current command
  program
    .command('current')
    .description('List all current tasks (shortcut for "task list --current")')
    .option('-s, --status <status>', 'Filter by status')
    .option('-t, --type <type>', 'Filter by type')
    .option('-a, --assignee <assignee>', 'Filter by assignee')
    .option('-f, --format <format>', 'Output format', 'table')
    .action((options) => handleListCommand({ ...options, current: true }));

  // archive command
  program
    .command('archive')
    .description('List all archived tasks (shortcut for "task list --archive")')
    .option('-s, --status <status>', 'Filter by status')
    .option('-t, --type <type>', 'Filter by type')
    .option('-a, --assignee <assignee>', 'Filter by assignee')
    .option('-f, --format <format>', 'Output format', 'table')
    .action((options) => handleListCommand({ ...options, archive: true }));
}

/**
 * Set up all entity commands for v2
 * @param program Root commander program
 */
export function setupEntityCommands(program: Command): void {
  setupTaskCommands(program);
  setupParentAreaCommands(program);
  setupWorkflowCommands(program);
  setupTemplateCommands(program);
  setupInitCommands(program);
  setupWorkflowShortcuts(program);
}
