/**
 * Implementation of entity-command pattern for CLI V2
 * Organizes commands into entity groups (task, parent, area, workflow)
 */
import { Command } from 'commander';
import { ConfigurationManager } from '../core/config/index.js';
import * as v2 from '../core/index.js';
import {
  handleCreateCommand,
  handleCurrentTaskCommand,
  handleDeleteCommand,
  handleFeatureDeleteCommand,
  handleFeatureGetCommand,
  handleFeatureListCommand,
  handleFeatureUpdateCommand,
  handleGetCommand,
  handleListCommand,
  handleListTemplatesCommand,
  handleMarkCompleteNextCommand,
  handleNextTaskCommand,
  handleSearchCommand,
  handleSearchReindexCommand,
  handleTaskMoveCommand,
  handleUpdateCommand,
} from './commands.js';
import { handleDispatchCommand } from './commands/dispatch-commands.js';
import {
  handleEnvCloseCommand,
  handleEnvCreateCommand,
  handleEnvListCommand,
  handleEnvPathCommand,
} from './commands/env-commands.js';
import { handlePlanCommand } from './commands/plan-commands.js';
import { handleWorkCommand } from './commands/work-commands.js';
import { handleInitCommand } from './init.js';

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
    .option('--status <status>', 'Task status (default: "To Do")')
    .option('--priority <priority>', 'Task priority (default: "Medium")')
    .option('--assignee <assignee>', 'Assigned to')
    .option('--area <area>', 'Task area (default: "general")')
    .option('--location <location>', 'Workflow location: backlog (default), current, archive')
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
    .action(async (id: string, options: any) => {
      await handleUpdateCommand(id, { ...options, status: 'In Progress' });
    });

  taskCommand
    .command('complete <id>')
    .description('Mark a task as "Done"')
    .option('-d, --subdirectory <subdirectory>', 'Subdirectory to look in')
    .action(async (id: string, options: any) => {
      await handleUpdateCommand(id, { ...options, status: 'Done' });
    });

  taskCommand
    .command('block <id>')
    .description('Mark a task as "Blocked"')
    .option('-d, --subdirectory <subdirectory>', 'Subdirectory to look in')
    .action(async (id: string, options: any) => {
      await handleUpdateCommand(id, { ...options, status: 'Blocked' });
    });

  taskCommand
    .command('review <id>')
    .description('Mark a task as "In Review"')
    .option('-d, --subdirectory <subdirectory>', 'Subdirectory to look in')
    .action(async (id: string, options: any) => {
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
    .action(async (options: any) => {
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
    .action(async (parentId: string, options: any) => {
      try {
        const configManager = ConfigurationManager.getInstance();
        const projectRoot = configManager.getRootConfig().path;

        const result = await v2.parent(projectRoot, parentId).create(options.title, {
          type: options.type,
          customMetadata: options.assignee ? { assignee: options.assignee } : undefined,
        });

        if (!result.success) {
          console.error(`Error: ${result.error}`);
          process.exit(1);
        }

        console.log(`✓ Added subtask: ${result.data?.metadata.id}`);
        console.log(`  Parent: ${parentId}`);
        console.log(`  Path: ${result.data?.metadata.path}`);
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
    .action(async (id: string, options: any) => {
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
    .action(async (id: string, options: any) => {
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
    .action(async (options: any) => {
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
    .option('--force', 'Force re-initialization even if project already exists')
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
    .action((options: any) => handleListCommand({ ...options, backlog: true }));

  // current command
  program
    .command('current')
    .description('List all current tasks (shortcut for "task list --current")')
    .option('-s, --status <status>', 'Filter by status')
    .option('-t, --type <type>', 'Filter by type')
    .option('-a, --assignee <assignee>', 'Filter by assignee')
    .option('-f, --format <format>', 'Output format', 'table')
    .action((options: any) => handleListCommand({ ...options, current: true }));

  // archive command
  program
    .command('archive')
    .description('List all archived tasks (shortcut for "task list --archive")')
    .option('-s, --status <status>', 'Filter by status')
    .option('-t, --type <type>', 'Filter by type')
    .option('-a, --assignee <assignee>', 'Filter by assignee')
    .option('-f, --format <format>', 'Output format', 'table')
    .action((options: any) => handleListCommand({ ...options, archive: true }));
}

/**
 * Set up environment commands
 * @param program Root commander program
 */
export function setupEnvironmentCommands(program: Command): void {
  // Create env command group
  const envCommand = new Command('env')
    .description('Development environment management commands')
    .addHelpText('before', '\nENVIRONMENT MANAGEMENT COMMANDS\n============================\n')
    .addHelpText(
      'after',
      `
Environment commands manage git worktrees for task-based development.
Each task gets its own isolated environment with a dedicated branch.

Examples:
  sc env auth-feature-05A              # Create/switch to environment for task
  sc env list                          # List all active environments
  sc env close auth-feature-05A        # Close environment and cleanup
  sc env path auth-feature-05A         # Output path for shell integration

Shell Integration:
  cd "$(sc env path auth-feature-05A)" # Navigate to environment in shell
`
    );

  // env create/switch command (default action)
  envCommand
    .argument('<taskId>', 'Task ID to create/switch environment for')
    .description('Create or switch to environment for a task')
    .option('--base <branch>', 'Base branch for new environment (default: current branch)')
    .option('--force', 'Force creation even if environment exists')
    .action(handleEnvCreateCommand);

  // env list command
  envCommand
    .command('list')
    .description('List all active environments')
    .option('-f, --format <format>', 'Output format: table (default), json, minimal', 'table')
    .option('-v, --verbose', 'Show detailed information including commit hashes')
    .action(handleEnvListCommand);

  // env close command
  envCommand
    .command('close <taskId>')
    .description('Close environment and cleanup worktree')
    .option('-f, --force', 'Force close without confirmation')
    .option('--keep-branch', 'Keep the git branch after closing worktree')
    .action(handleEnvCloseCommand);

  // env path command
  envCommand
    .command('path <taskId>')
    .description('Output environment path for shell integration')
    .action(handleEnvPathCommand);

  // Add env group to root program
  program.addCommand(envCommand);
}

/**
 * Set up work command for interactive Claude sessions
 * @param program Root commander program
 */
export function setupWorkCommands(program: Command): void {
  // Create work command
  program
    .command('work')
    .alias('w')
    .description('Start interactive Claude session for a task')
    .argument(
      '[taskId]',
      'Task ID to work on (interactive selection if not provided, not needed with --session)'
    )
    .argument('[additionalPrompt...]', 'Additional prompt context')
    .option(
      '-m, --mode <mode>',
      'Claude mode (default: auto): auto|implement|explore|orchestrate|diagnose'
    )
    .option('--no-docker', 'Force interactive mode even if Docker would normally be used')
    .option('-s, --session <sessionId>', 'Resume an existing session')
    .option('--dry-run', 'Show what would be executed without running it')
    .option('--data <json>', 'Additional data to merge (JSON string)')
    .addHelpText('before', '\nINTERACTIVE WORK SESSIONS\n========================\n')
    .addHelpText(
      'after',
      `
The work command starts interactive Claude sessions with automatic environment management.

Features:
  - Interactive task selection when no taskId provided
  - Automatic worktree creation/switching
  - Claude auto-selects appropriate mode based on task context
  - Seamless ChannelCoder integration

Examples:
  sc work                              # Interactive task selection
  sc work auth-feature-05A             # Work on specific task
  sc work auth-feature-05A "focus on error handling"  # Add context
  sc work bug-123 --mode diagnose      # Override with specific mode
  sc work --session interactive-auth-feature-05A-1234  # Resume session
  sc work task-789 --dry-run           # Show what would be executed
  
  # Short alias
  sc w feature-456 "implement the UI"
  sc w --session session-name          # Resume with short alias

Claude Modes:
  - auto (default) - Claude selects the appropriate mode
  - implement - Focus on building features
  - explore - Research and investigation
  - orchestrate - Coordinate complex work
  - diagnose - Debug and troubleshoot
`
    )
    .action(handleWorkCommand);
}

/**
 * Set up plan command for exploratory planning sessions
 * @param program Root commander program
 */
export function setupPlanCommands(program: Command): void {
  // Create plan command
  program
    .command('plan')
    .alias('p')
    .description('Start exploratory planning session without creating tasks')
    .argument('<description>', 'Feature or idea description')
    .argument('[area]', 'Area/domain (defaults to "general")')
    .argument('[context...]', 'Additional context or requirements')
    .option('--dry-run', 'Show what would be executed without running it')
    .addHelpText('before', '\nEXPLORATORY PLANNING\n===================\n')
    .addHelpText(
      'after',
      `
The plan command enables quick exploratory planning sessions without requiring task creation.

Features:
  - No task creation required - plan first, create tasks later
  - Exploratory planning without workflow overhead
  - Mode prompt loading from .tasks/.modes/planning/
  - Clean composition using Unix philosophy primitives

Examples:
  sc plan "Add dark mode toggle"
  sc plan "OAuth integration" auth
  sc plan "Real-time collaboration" ui "Similar to Figma multiplayer"
  sc plan "Fix memory leak" core --dry-run

Arguments:
  - description: What you want to plan (required)
  - area: Domain/area like ui, core, cli, mcp (optional, defaults to "general")
  - context: Additional requirements or context (optional)

The planning prompt will help you:
  - Break down vague ideas into actionable tasks
  - Identify research needs and decision points  
  - Create appropriate task structures (simple, parent, or complex)
  - Consider technical approaches and constraints
`
    )
    .action(handlePlanCommand);
}

/**
 * Set up dispatch command for autonomous Claude sessions
 * @param program Root commander program
 */
export function setupDispatchCommands(program: Command): void {
  // Create dispatch command
  program
    .command('dispatch')
    .alias('d')
    .description('Run autonomous Claude session for a task')
    .argument('[taskId]', 'Task ID to dispatch (required unless using --session)')
    .option(
      '-m, --mode <mode>',
      'Claude mode (default: auto): auto|implement|explore|orchestrate|diagnose'
    )
    .option('-e, --exec <type>', 'Execution type: docker|detached|tmux (default: docker)')
    .option('-s, --session <sessionId>', 'Resume an existing session')
    .option('--dry-run', 'Show what would be executed without running it')
    .option('--data <json>', 'Additional data to merge (JSON string)')
    .addHelpText('before', '\nAUTONOMOUS EXECUTION\n===================\n')
    .addHelpText(
      'after',
      `
The dispatch command runs Claude sessions in background/autonomous mode for CI/CD and automation.

Features:
  - Requires task ID (no interactive selection)
  - Automatic environment management
  - Session tracking for monitoring UI
  - Mode prompt loading from .tasks/.modes/
  - Multiple execution types (docker, detached, tmux)
  - Session continuation support

Examples:
  sc dispatch auth-feature-05A              # Run in Docker (default)
  sc dispatch bug-123 --mode diagnose       # Specific mode in Docker
  sc dispatch feature-456 --exec detached   # Run detached (background)
  sc dispatch task-789 --exec tmux          # Run in tmux (attachable)
  sc dispatch --session detached-auth-feature-05A-1234  # Resume existing session
  sc dispatch task-456 --dry-run           # Show what would be executed
  
  # Short alias
  sc d refactor-789 --exec docker
  sc d --session session-name --exec tmux   # Resume with different exec mode

Execution Types:
  - docker (default) - Run in isolated Docker container
  - detached - Run as background process on host
  - tmux - Run in tmux session (can attach later)

Docker Execution:
  - Uses image: my-claude:authenticated
  - Mounts worktree to /workspace
  - Full isolation from host system
  - Ideal for CI/CD pipelines

Claude Modes:
  - auto (default) - Claude selects the appropriate mode
  - implement - Focus on building features
  - explore - Research and investigation
  - orchestrate - Coordinate complex work
  - diagnose - Debug and troubleshoot
`
    )
    .action(handleDispatchCommand);
}

/**
 * Set up search commands following existing pattern
 * @param program Root commander program
 */
export function setupSearchCommands(program: Command): void {
  const searchCommand = new Command('search')
    .description('Search tasks and documentation')
    .addHelpText('before', '\nSEARCH COMMANDS\n===============\n')
    .addHelpText(
      'after',
      `
Examples:
  sc search "authentication logic"                    # Basic text search
  sc search "bug fix" --type task --status todo      # Search with filters
  sc search "API design" --area core --limit 10      # Search in specific area
  sc search reindex                                   # Rebuild search index

See 'sc search <command> --help' for more information on specific commands.`
    );

  // Search query command
  searchCommand
    .command('query')
    .alias('q')
    .argument('[query]', 'Search query text')
    .option('--type <types...>', 'Filter by content type (task, doc)')
    .option('--status <statuses...>', 'Filter by task status')
    .option('--area <area>', 'Filter by task area')
    .option('--tags <tags...>', 'Filter by tags')
    .option('--limit <number>', 'Maximum results to return', '20')
    .option('--format <format>', 'Output format (table, json, detail)', 'table')
    .description('Search tasks and documentation')
    .action(async (query: string, options: any) => {
      await handleSearchCommand(query, options);
    });

  // Search reindex command
  searchCommand
    .command('reindex')
    .description('Rebuild search index')
    .action(async () => {
      await handleSearchReindexCommand();
    });

  // Make 'query' the default subcommand
  searchCommand
    .argument('[query]', 'Search query text')
    .option('--type <types...>', 'Filter by content type (task, doc)')
    .option('--status <statuses...>', 'Filter by task status')
    .option('--area <area>', 'Filter by task area')
    .option('--tags <tags...>', 'Filter by tags')
    .option('--limit <number>', 'Maximum results to return', '20')
    .option('--format <format>', 'Output format (table, json, detail)', 'table')
    .action(async (query: string, options: any) => {
      await handleSearchCommand(query, options);
    });

  program.addCommand(searchCommand);
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
  setupEnvironmentCommands(program);
  setupWorkCommands(program);
  setupDispatchCommands(program);
  setupPlanCommands(program);
  setupSearchCommands(program);
}
