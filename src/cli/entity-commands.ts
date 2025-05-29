/**
 * Implementation of entity-command pattern for CLI
 * Organizes commands into entity groups (task, phase, feature, area, workflow)
 */
import { Command } from 'commander';
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
  // handleInitCommand, // Using v2 init
  handleListCommand,
  handleListTemplatesCommand,
  handleMarkCompleteNextCommand,
  handleNextTaskCommand,
  // Phase commands removed for v2
  // handlePhaseCreateCommand,
  // handlePhaseDeleteCommand,
  // handlePhaseUpdateCommand,
  // handlePhasesCommand,
  handleTaskMoveCommand,
  handleUpdateCommand,
} from './commands.js';

/**
 * Set up task commands
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
    .description('List tasks from current and backlog (Example: sc task list --status "To Do")')
    .option('-s, --status <status>', 'Filter by status (e.g., "To Do", "Done")')
    .option('-t, --type <type>', 'Filter by type (e.g., "feature", "bug")')
    .option('-a, --assignee <assignee>', 'Filter by assignee')
    .option('-g, --tags <tags...>', 'Filter by tags')
    .option('-l, --location <location>', 'Filter by workflow location: backlog, current, archive')
    .option('--backlog', 'Show only backlog tasks')
    .option('--current', 'Show only current tasks')
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
    .option('--parent <parent>', 'Parent task ID (for subtasks)')
    .addHelpText(
      'after',
      `
Note: For subtasks, use the full path or provide --parent:
  sc task get current/parent-id/02-subtask
  sc task get 02-subtask --parent parent-id`
    )
    .action(handleGetCommand);

  // task create command
  taskCommand
    .command('create')
    .description('Create a new task (Example: sc task create --title "New feature" --type feature)')
    .option(
      '--id <id>',
      'Task ID (generated if not provided, use "_overview" for feature overview files)'
    )
    .option('--title <title>', 'Task title')
    .option('--type <type>', 'Task type (e.g., "feature", "bug")')
    .option('--status <status>', 'Task status (default: "To Do")')
    .option('--priority <priority>', 'Task priority (default: "Medium")')
    .option('--assignee <assignee>', 'Assigned to')
    .option('--location <location>', 'Workflow location: backlog (default), current, archive')
    .option('--subdirectory <subdirectory>', 'Subdirectory/area (e.g., "FEATURE_Login")')
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
    .description('Update a task (Example: sc task update TASK-123 --status "In Progress")')
    .option('--title <title>', 'Task title')
    .option('--status <status>', 'Task status')
    .option('--type <type>', 'Task type')
    .option('--priority <priority>', 'Task priority')
    .option('--assignee <assignee>', 'Assigned to')
    .option('--location <location>', 'Move to workflow location: backlog, current, archive')
    .option('--subdirectory <subdirectory>', 'Subdirectory/area to move the task')
    .option('--parent <parent>', 'Parent task ID (for subtasks, helps locate the task)')
    .option('--depends <depends...>', 'Dependencies (task IDs)')
    .option('--previous <previous>', 'Previous task in workflow')
    .option('--next <next>', 'Next task in workflow')
    .option('--tags <tags...>', 'Tags for the task')
    .option('--content <content>', 'Task content')
    .option('--file <file>', 'Update from file (JSON or TOML+Markdown)')
    .addHelpText(
      'after',
      `
Note: For subtasks, use the full path or provide --parent:
  sc task update current/parent-id/02-subtask --status "Done"
  sc task update 02-subtask --parent parent-id --status "Done"`
    )
    .action(handleUpdateCommand);

  // task delete command
  taskCommand
    .command('delete <id>')
    .description('Delete a task')
    .option('--parent <parent>', 'Parent task ID (for subtasks)')
    .addHelpText(
      'after',
      `
Note: For subtasks, use the full path or provide --parent:
  sc task delete current/parent-id/02-subtask
  sc task delete 02-subtask --parent parent-id`
    )
    .action(handleDeleteCommand);

  // task status shortcut commands
  taskCommand
    .command('start <id>')
    .description('Mark a task as "In Progress"')
    .option('--parent <parent>', 'Parent task ID (for subtasks)')
    .addHelpText(
      'after',
      `
Note: For subtasks, use the full path or provide --parent:
  sc task start current/parent-id/02-subtask
  sc task start 02-subtask --parent parent-id`
    )
    .action(async (id, options) => {
      await handleUpdateCommand(id, { status: 'In Progress', ...options });
    });

  taskCommand
    .command('complete <id>')
    .description('Mark a task as "Done"')
    .option('--parent <parent>', 'Parent task ID (for subtasks)')
    .addHelpText(
      'after',
      `
Note: For subtasks, use the full path or provide --parent:
  sc task complete current/parent-id/02-subtask
  sc task complete 02-subtask --parent parent-id`
    )
    .action(async (id, options) => {
      await handleUpdateCommand(id, { status: 'Done', ...options });
    });

  taskCommand
    .command('block <id>')
    .description('Mark a task as "Blocked"')
    .action(async (id) => {
      await handleUpdateCommand(id, { status: 'Blocked' });
    });

  taskCommand
    .command('review <id>')
    .description('Mark a task as "In Review"')
    .action(async (id) => {
      await handleUpdateCommand(id, { status: 'In Review' });
    });

  // task move command - updated for workflow transitions
  taskCommand
    .command('move <id>')
    .description('Move a task between workflow states')
    .option('--to-backlog', 'Move task to backlog')
    .option('--to-current', 'Move task to current')
    .option('--to-archive', 'Move task to archive')
    .option('--archive-date <date>', 'Archive date (YYYY-MM format)')
    .option('--update-status', 'Automatically update task status based on move')
    .action(handleTaskMoveCommand);

  // ===== SEQUENCING COMMANDS =====

  // task resequence command
  taskCommand
    .command('resequence <parentId>')
    .description('Reorder subtasks within a parent task by assigning new sequence numbers')
    .option('-i, --interactive', 'Interactive mode to reorder tasks visually')
    .option('--from <positions>', 'Current positions (comma-separated)')
    .option('--to <positions>', 'New positions (comma-separated)')
    .addHelpText(
      'after',
      `
Examples:
  # Interactive reordering
  sc task resequence auth-feature-05K --interactive
  
  # Move task from position 3 to position 1
  sc task resequence auth-feature-05K --from 3 --to 1
  
  # Reorder multiple tasks
  sc task resequence auth-feature-05K --from 1,2,3 --to 3,1,2
  
Notes:
  - Shows current order before making changes
  - Automatically adjusts other task sequences
  - Preserves parallel execution (same numbers)`
    )
    .action(async (parentId, options) => {
      const { handleTaskResequenceCommand } = await import('./commands.js');
      await handleTaskResequenceCommand(parentId, options);
    });

  // task parallelize command
  taskCommand
    .command('parallelize <subtaskIds...>')
    .description('Make multiple subtasks run in parallel by giving them the same sequence number')
    .option('--sequence <num>', 'Specific sequence number to use (default: lowest)')
    .option('--parent <id>', 'Parent task (required if subtask IDs are ambiguous)')
    .addHelpText(
      'after',
      `
Examples:
  # Make two subtasks parallel (within same parent)
  sc task parallelize 02-impl-api 03-impl-ui
  
  # Set specific parallel sequence
  sc task parallelize 02-impl-api 03-impl-ui --sequence 02
  
  # With parent specified (for clarity)
  sc task parallelize 02-impl-api 03-impl-ui --parent auth-feature-05K
  
Notes:
  - Only works on subtasks within the same parent folder
  - Shows before/after sequences
  - Core handles all ID/filename updates
  - Cannot parallelize floating tasks (they don't have sequences)`
    )
    .action(async (subtaskIds, options) => {
      const { handleTaskParallelizeCommand } = await import('./commands.js');
      await handleTaskParallelizeCommand(subtaskIds, options);
    });

  // task sequence command
  taskCommand
    .command('sequence <subtaskId> <newSequence>')
    .description('Change the sequence number of a subtask within its parent')
    .option('--force', 'Force even if sequence exists (makes parallel)')
    .option('--parent <id>', 'Parent task (required if subtask ID is ambiguous)')
    .addHelpText(
      'after',
      `
Examples:
  # Change subtask from sequence 03 to 01
  sc task sequence 03-write-tests 01
  
  # Force parallel execution with existing 02
  sc task sequence 04-deploy 02 --force
  
  # With parent specified
  sc task sequence 03-write-tests 01 --parent auth-feature-05K
  
Notes:
  - Only works on subtasks within parent folders
  - Automatically shifts other subtasks if needed
  - Use --force to create parallel tasks
  - Shows impact on other subtask sequences
  - Core handles all ID/filename transformations`
    )
    .action(async (subtaskId, newSequence, options) => {
      const { handleTaskSequenceCommand } = await import('./commands.js');
      await handleTaskSequenceCommand(subtaskId, newSequence, options);
    });

  // ===== TASK CONVERSION COMMANDS =====

  // task promote command
  taskCommand
    .command('promote <taskId>')
    .description('Convert a simple task into a parent task with subtasks')
    .option('--subtasks <titles>', 'Initial subtasks to create (comma-separated)')
    .option('--keep-original', 'Keep original task as first subtask')
    .addHelpText(
      'after',
      `
Examples:
  # Basic promotion
  sc task promote implement-auth-05K
  
  # Promote with initial subtasks
  sc task promote implement-auth-05K --subtasks "Design UI,Build API,Write tests"
  
  # Keep original as subtask
  sc task promote implement-auth-05K --keep-original
  
Results:
  - Creates: implement-auth-05K/
    - _overview.md (from original task)
    - 01-design-ui-05A.task.md (if --subtasks)
    - 02-build-api-05B.task.md
    - 03-write-tests-05C.task.md
  
Notes:
  - Preserves task metadata and content
  - Generates new IDs for subtasks
  - Updates any task references`
    )
    .action(async (taskId, options) => {
      const { handleTaskPromoteCommand } = await import('./commands.js');
      await handleTaskPromoteCommand(taskId, options);
    });

  // task extract command
  taskCommand
    .command('extract <subtaskId>')
    .description('Extract a subtask from its parent to become a standalone task')
    .option('--target <location>', 'Target workflow location (backlog/current/archive)', 'backlog')
    .option('--parent <id>', 'Parent task (required if subtask ID is ambiguous)')
    .addHelpText(
      'after',
      `
Examples:
  # Extract subtask to backlog
  sc task extract auth-feature/02-impl-api
  
  # Extract to current workflow
  sc task extract 02-impl-api --target current
  
  # With parent specified
  sc task extract 02-impl-api --parent auth-feature-05K
  
Results:
  - From: auth-feature/02-impl-api-05K.task.md
  - To: backlog/impl-api-05K.task.md (keeps suffix, removes sequence)
  
Notes:
  - Preserves task content and metadata
  - Removes sequence prefix from ID
  - Updates parent task if referenced`
    )
    .action(async (subtaskId, options) => {
      const { handleTaskExtractCommand } = await import('./commands.js');
      await handleTaskExtractCommand(subtaskId, options);
    });

  // task adopt command
  taskCommand
    .command('adopt <parentId> <taskId>')
    .description('Move a standalone task into a parent as a subtask')
    .option('--sequence <num>', 'Specific sequence (default: next available)')
    .option('--after <task-id>', 'Place after specific subtask')
    .option('--before <task-id>', 'Place before specific subtask')
    .addHelpText(
      'after',
      `
Examples:
  # Adopt task as next subtask
  sc task adopt auth-feature-05K login-ui-05M
  
  # Adopt at specific position
  sc task adopt auth-feature-05K login-ui-05M --sequence 02
  
  # Insert after existing subtask
  sc task adopt auth-feature-05K login-ui-05M --after 01-design
  
Results:
  - From: backlog/login-ui-05M.task.md
  - To: backlog/auth-feature-05K/03-login-ui-05M.task.md
  
Notes:
  - Adds sequence prefix to task ID
  - Adjusts other sequences if needed
  - Maintains original task suffix`
    )
    .action(async (parentId, taskId, options) => {
      const { handleTaskAdoptCommand } = await import('./commands.js');
      await handleTaskAdoptCommand(parentId, taskId, options);
    });

  // Add task group to root program
  program.addCommand(taskCommand);

  // Add only the most essential top-level commands for convenience
  program
    .command('list')
    .description('List tasks from current and backlog workflows (default)')
    .option('-s, --status <status>', 'Filter by status (e.g., "To Do", "Done")')
    .option('-t, --type <type>', 'Filter by type (e.g., "feature", "bug")')
    .option('-a, --assignee <assignee>', 'Filter by assignee')
    .option('-g, --tags <tags...>', 'Filter by tags')
    .option('--backlog', 'Show only backlog tasks')
    .option('--current', 'Show only current tasks')
    .option('--archive', 'Show only archived tasks')
    .option('--all', 'Show all workflow locations (current, backlog, archive)')
    .option(
      '-f, --format <format>',
      'Output format: tree (default), table, json, minimal, workflow',
      'tree'
    )
    .action(handleListCommand);

  program
    .command('get <id>')
    .description('Get a task by ID')
    .option('-f, --format <format>', 'Output format: default, json, markdown, full', 'default')
    .action(handleGetCommand);
}

/**
 * Set up parent task commands (replacement for features)
 * @param program Root commander program
 */
export function setupParentCommands(program: Command): void {
  // Create parent command group
  const parentCommand = new Command('parent')
    .description('Parent task management commands (folder-based tasks with subtasks)')
    .addHelpText('before', '\nPARENT TASK COMMANDS\n==================\n')
    .addHelpText(
      'after',
      `
Parent tasks are folder-based tasks that can contain subtasks.
They replace the old "feature" concept and provide better organization.

Examples:
  sc parent create --title "User Authentication" --type feature
  sc parent list
  sc parent add-subtask AUTH-TASK --title "Implement login form"
`
    );

  // parent create command
  parentCommand
    .command('create')
    .description('Create a new parent task (folder with _overview.md)')
    .requiredOption('--title <title>', 'Parent task title')
    .option('--type <type>', 'Task type', 'feature')
    .option('--area <area>', 'Area (e.g., "auth", "api")', 'general')
    .option('--assignee <assignee>', 'Assigned to')
    .option('--tags <tags...>', 'Tags for the parent task')
    .option('--description <description>', 'Parent task description')
    .action(async (options) => {
      const { handleParentCreateCommand } = await import('./commands.js');
      await handleParentCreateCommand(options);
    });

  // parent list command
  parentCommand
    .command('list')
    .description('List all parent tasks')
    .option('--location <location>', 'Filter by workflow location: backlog, current, archive')
    .option('--backlog', 'Show only backlog parent tasks')
    .option('--current', 'Show only current parent tasks')
    .option('--archive', 'Show only archived parent tasks')
    .option('-f, --format <format>', 'Output format: table, json', 'table')
    .option('--include-subtasks', 'Include subtask count and details')
    .action(async (options) => {
      const { handleParentListCommand } = await import('./commands.js');
      await handleParentListCommand(options);
    });

  // parent get command (also aliased as 'show')
  parentCommand
    .command('get <id>')
    .alias('show')
    .description('Get details of a parent task including all subtasks')
    .option('-f, --format <format>', 'Output format: default, json, full', 'default')
    .option('--tree', 'Show as tree with parallel indicators')
    .option('--timeline', 'Show execution timeline')
    .action(async (id, options) => {
      const { handleParentGetCommand } = await import('./commands.js');
      await handleParentGetCommand(id, options);
    });

  // parent add-subtask command (enhanced)
  parentCommand
    .command('add-subtask <parentId>')
    .description('Add a subtask to a parent task')
    .requiredOption('--title <title>', 'Subtask title')
    .option('--type <type>', 'Task type (inherits from parent if not specified)')
    .option('--assignee <assignee>', 'Assigned to')
    .option('--sequence <num>', 'Specific sequence (default: next)')
    .option('--parallel-with <id>', 'Make parallel with existing subtask')
    .option('--after <id>', 'Insert after specific subtask')
    .option('--before <id>', 'Insert before specific subtask')
    .addHelpText(
      'after',
      `
Examples:
  # Add as next sequence
  sc parent add-subtask auth-05K --title "Add OAuth support"
  
  # Insert at specific position
  sc parent add-subtask auth-05K --title "Security review" --sequence 02
  
  # Create parallel task
  sc parent add-subtask auth-05K --title "Update docs" --parallel-with 03-impl
  
  # Insert after existing task
  sc parent add-subtask auth-05K --title "Integration tests" --after 02-impl`
    )
    .action(async (parentId, options) => {
      const { handleAddSubtaskCommand } = await import('./commands.js');
      await handleAddSubtaskCommand(parentId, options);
    });

  // parent move command
  parentCommand
    .command('move <id> <target>')
    .description('Move a parent task to a different workflow state')
    .action(async (id, target) => {
      const { handleParentMoveCommand } = await import('./commands.js');
      await handleParentMoveCommand(id, target);
    });

  // parent delete command
  parentCommand
    .command('delete <id>')
    .description('Delete a parent task and all its subtasks')
    .option('-f, --force', 'Force deletion without confirmation')
    .action(async (id, options) => {
      const { handleParentDeleteCommand } = await import('./commands.js');
      await handleParentDeleteCommand(id, options);
    });

  // Add parent group to root program
  program.addCommand(parentCommand);
}

/**
 * Set up phase commands - DEPRECATED in v2
 * @param program Root commander program
 */
// @ts-ignore - Function kept for reference but not used
function setupPhaseCommands_DEPRECATED(program: Command): void {
  // Create phase command group
  const phaseCommand = new Command('phase')
    .description('Phase management commands')
    .addHelpText('before', '\nPHASE MANAGEMENT COMMANDS\n======================\n')
    .addHelpText(
      'after',
      `
Note: You can use the global --root-dir option to specify an alternative tasks directory:
  sc --root-dir ./e2e_test/worktree-test phase list
`
    );

  // phase list command
  phaseCommand
    .command('list')
    .description('List all phases (Example: sc phase list --format json)')
    .option('-f, --format <format>', 'Output format: table, json', 'table')
    .action(handlePhasesCommand);

  // phase create command
  phaseCommand
    .command('create')
    .description(
      'Create a new phase (Example: sc phase create --id "release-v2" --name "Release 2.0")'
    )
    .requiredOption('--id <id>', 'Phase ID')
    .requiredOption('--name <n>', 'Phase name')
    .option('--description <description>', 'Phase description')
    .option('--status <status>', 'Phase status (default: "🟡 Pending")')
    .option('--order <order>', 'Phase order (number)', Number.parseInt)
    .action(handlePhaseCreateCommand);

  // phase update command
  phaseCommand
    .command('update <id>')
    .description('Update an existing phase')
    .option('--new-id <newId>', 'New phase ID (use this to rename the phase)')
    .option('--name <n>', 'New phase name')
    .option('--description <description>', 'New phase description')
    .option('--status <status>', 'New phase status')
    .option('--order <order>', 'New phase order (number)', Number.parseInt)
    .action(handlePhaseUpdateCommand);

  // phase delete command
  phaseCommand
    .command('delete <id>')
    .description('Delete a phase')
    .option('-f, --force', 'Force deletion of phase with tasks')
    .action(handlePhaseDeleteCommand);

  // phase status shortcut commands
  phaseCommand
    .command('start <id>')
    .description('Mark a phase as "In Progress"')
    .action(async (id) => {
      await handlePhaseUpdateCommand(id, { status: '🔵 In Progress' });
    });

  phaseCommand
    .command('complete <id>')
    .description('Mark a phase as "Completed"')
    .action(async (id) => {
      await handlePhaseUpdateCommand(id, { status: '🟢 Completed' });
    });

  phaseCommand
    .command('block <id>')
    .description('Mark a phase as "Blocked"')
    .action(async (id) => {
      await handlePhaseUpdateCommand(id, { status: '⚪ Blocked' });
    });

  phaseCommand
    .command('pending <id>')
    .description('Mark a phase as "Pending"')
    .action(async (id) => {
      await handlePhaseUpdateCommand(id, { status: '🟡 Pending' });
    });

  // Add phase group to root program
  program.addCommand(phaseCommand);

  // Add phases command for phases listing at top level
  program
    .command('phases')
    .description('List all phases')
    .option('-f, --format <format>', 'Output format: table, json', 'table')
    .action(handlePhasesCommand);
}

/**
 * Set up feature and area commands
 * @param program Root commander program
 */
export function setupFeatureAreaCommands(program: Command): void {
  // Create feature command group
  const featureCommand = new Command('feature')
    .description('Feature management commands')
    .addHelpText('before', '\nFEATURE MANAGEMENT COMMANDS\n========================\n')
    .addHelpText(
      'after',
      `
Note: You can use the global --root-dir option to specify an alternative tasks directory:
  sc --root-dir ./e2e_test/worktree-test feature list
`
    );

  // feature create command (creates an overview file in a FEATURE_ subdirectory)
  featureCommand
    .command('create')
    .description(
      'Create a new feature (Example: sc feature create --name "Authentication" --title "User Auth" --phase "release-v1")'
    )
    .requiredOption('--name <name>', 'Feature name (will be prefixed with FEATURE_)')
    .requiredOption('--title <title>', 'Feature title')
    .requiredOption('--phase <phase>', 'Phase to create the feature in')
    .option('--description <description>', 'Feature description')
    .option('--type <type>', 'Feature type (default: "feature")')
    .option('--status <status>', 'Feature status (default: "To Do")')
    .option('--priority <priority>', 'Feature priority (default: "Medium")')
    .option('--assignee <assignee>', 'Assigned to')
    .option('--tags <tags...>', 'Tags for the feature')
    .action(async (options) => {
      const subdirectory = `FEATURE_${options.name.replace(/\s+/g, '')}`;

      try {
        // Create feature overview file
        const _result = await handleCreateCommand({
          id: '_overview',
          title: options.title,
          type: options.type || 'feature',
          status: options.status || 'To Do',
          priority: options.priority || 'Medium',
          assignee: options.assignee,
          phase: options.phase,
          subdirectory,
          tags: options.tags,
          content: options.description
            ? `# ${options.title}\n\n${options.description}\n\n## Tasks\n\n- [ ] Task 1`
            : `# ${options.title}\n\nOverview of this feature.\n\n## Tasks\n\n- [ ] Task 1`,
        });

        // The message will be printed by handleCreateCommand
        console.log(`Feature '${options.name}' created successfully with overview file.`);
      } catch (_error) {
        // Error will be handled by handleCreateCommand
      }
    });

  // feature list command (lists all FEATURE_ subdirectories)
  featureCommand
    .command('list')
    .description('List all features (FEATURE_ subdirectories)')
    .option('-p, --phase <phase>', 'Filter by phase')
    .option('-f, --format <format>', 'Output format: table, json', 'table')
    .option('-t, --include-tasks', 'Include tasks in output')
    .option('-r, --include-progress', 'Include progress calculations')
    .option('-c, --include-content', 'Include content (descriptions and overview) in output')
    .option('-d, --include-completed', 'Include completed features in output')
    .action(handleFeatureListCommand);

  // feature get command
  featureCommand
    .command('get <id>')
    .description('Get details of a feature')
    .option('-p, --phase <phase>', 'Phase to look in')
    .option('-f, --format <format>', 'Output format: default, json', 'default')
    .action(handleFeatureGetCommand);

  // feature update command
  featureCommand
    .command('update <id>')
    .description('Update a feature')
    .option('--title <title>', 'New feature title')
    .option('--description <description>', 'New feature description')
    .option('--status <status>', 'New feature status')
    .option('--new-id <newId>', 'New feature ID (will rename directory)')
    .option('-p, --phase <phase>', 'Phase to look in')
    .action(handleFeatureUpdateCommand);

  // feature delete command
  featureCommand
    .command('delete <id>')
    .description('Delete a feature')
    .option('-p, --phase <phase>', 'Phase to look in')
    .option('-f, --force', 'Force deletion even if feature contains tasks')
    .action(handleFeatureDeleteCommand);

  // Add feature group to root program
  program.addCommand(featureCommand);

  // Create area command group
  const areaCommand = new Command('area')
    .description('Area management commands')
    .addHelpText('before', '\nAREA MANAGEMENT COMMANDS\n=====================\n')
    .addHelpText(
      'after',
      `
Note: You can use the global --root-dir option to specify an alternative tasks directory:
  sc --root-dir ./e2e_test/worktree-test area list
`
    );

  // area create command (creates an overview file in an AREA_ subdirectory)
  areaCommand
    .command('create')
    .description('Create a new area (creates overview file in AREA_ subdirectory)')
    .requiredOption('--name <name>', 'Area name (will be prefixed with AREA_)')
    .requiredOption('--title <title>', 'Area title')
    .requiredOption('--phase <phase>', 'Phase to create the area in')
    .option('--description <description>', 'Area description')
    .option('--type <type>', 'Area type (default: "chore")')
    .option('--status <status>', 'Area status (default: "To Do")')
    .option('--priority <priority>', 'Area priority (default: "Medium")')
    .option('--assignee <assignee>', 'Assigned to')
    .option('--tags <tags...>', 'Tags for the area')
    .action(async (options) => {
      const subdirectory = `AREA_${options.name.replace(/\s+/g, '')}`;

      try {
        // Create area overview file
        const _result = await handleCreateCommand({
          id: '_overview',
          title: options.title,
          type: options.type || 'chore',
          status: options.status || 'To Do',
          priority: options.priority || 'Medium',
          assignee: options.assignee,
          phase: options.phase,
          subdirectory,
          tags: options.tags,
          content: options.description
            ? `# ${options.title}\n\n${options.description}\n\n## Tasks\n\n- [ ] Task 1`
            : `# ${options.title}\n\nOverview of this cross-cutting area.\n\n## Tasks\n\n- [ ] Task 1`,
        });

        // The message will be printed by handleCreateCommand
        console.log(`Area '${options.name}' created successfully with overview file.`);
      } catch (_error) {
        // Error will be handled by handleCreateCommand
      }
    });

  // area list command (lists all AREA_ subdirectories)
  areaCommand
    .command('list')
    .description('List all areas (AREA_ subdirectories)')
    .option('-p, --phase <phase>', 'Filter by phase')
    .option('-f, --format <format>', 'Output format: table, json', 'table')
    .option('-t, --include-tasks', 'Include tasks in output')
    .option('-r, --include-progress', 'Include progress calculations')
    .action(handleAreaListCommand);

  // area get command
  areaCommand
    .command('get <id>')
    .description('Get details of an area')
    .option('-p, --phase <phase>', 'Phase to look in')
    .option('-f, --format <format>', 'Output format: default, json', 'default')
    .action(handleAreaGetCommand);

  // area update command
  areaCommand
    .command('update <id>')
    .description('Update an area')
    .option('--title <title>', 'New area title')
    .option('--description <description>', 'New area description')
    .option('--status <status>', 'New area status')
    .option('--new-id <newId>', 'New area ID (will rename directory)')
    .option('-p, --phase <phase>', 'Phase to look in')
    .action(handleAreaUpdateCommand);

  // area delete command
  areaCommand
    .command('delete <id>')
    .description('Delete an area')
    .option('-p, --phase <phase>', 'Phase to look in')
    .option('-f, --force', 'Force deletion even if area contains tasks')
    .action(handleAreaDeleteCommand);

  // Add area group to root program
  program.addCommand(areaCommand);
}

/**
 * Set up workflow commands
 * @param program Root commander program
 */
export function setupWorkflowCommands(program: Command): void {
  // Create workflow command group
  const workflowCommand = new Command('workflow')
    .description('Workflow management commands')
    .addHelpText('before', '\nWORKFLOW MANAGEMENT COMMANDS\n=========================\n')
    .addHelpText(
      'after',
      `
Note: You can use the global --root-dir option to specify an alternative tasks directory:
  sc --root-dir ./e2e_test/worktree-test workflow next
  sc --root-dir ./e2e_test/worktree-test workflow current
`
    );

  // workflow next command
  workflowCommand
    .command('next [id]')
    .description('Find the next task to work on (Example: sc workflow next)')
    .option('-f, --format <format>', 'Output format: default, json, markdown, full', 'default')
    .action(handleNextTaskCommand);

  // workflow current command
  workflowCommand
    .command('current')
    .description('Show tasks currently in progress')
    .option('-f, --format <format>', 'Output format: table, json, minimal, workflow', 'table')
    .action(handleCurrentTaskCommand);

  // workflow mark-complete-next command
  workflowCommand
    .command('mark-complete-next <id>')
    .description('Mark a task as done and show the next task')
    .option('-f, --format <format>', 'Output format: default, json, markdown, full', 'default')
    .action(handleMarkCompleteNextCommand);

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
    .addHelpText('before', '\nTEMPLATE MANAGEMENT COMMANDS\n=========================\n')
    .addHelpText(
      'after',
      `
Note: You can use the global --root-dir option to specify an alternative tasks directory:
  sc --root-dir ./e2e_test/worktree-test template list
`
    );

  // template list command
  templateCommand
    .command('list')
    .description('List available task templates')
    .action(handleListTemplatesCommand);

  // Add template group to root program
  program.addCommand(templateCommand);
}

/**
 * Set up initialization commands
 * @param program Root commander program
 */
export function setupInitCommands(program: Command): void {
  // Dynamically import v2 init handler
  program
    .command('init')
    .description('Initialize task directory structure')
    .option('--mode <mode>', 'Force project mode (roo or standalone)')
    .option('--root-dir <path>', 'Initialize in specific directory instead of current directory')
    .option('--v1', 'Use v1 structure (phases) instead of v2 (workflow)')
    .action(async (options) => {
      const { handleInitV2Command } = await import('./init-v2.js');
      await handleInitV2Command({ ...options, v2: !options.v1 });
    });
}

/**
 * Set up all entity commands
 * @param program Root commander program
 */
export function setupEntityCommands(program: Command): void {
  setupTaskCommands(program);
  setupParentCommands(program);
  // Phase and Feature/Area commands removed for v2
  setupWorkflowCommands(program);
  setupTemplateCommands(program);
  setupInitCommands(program);
}
