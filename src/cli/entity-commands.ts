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
  handleInitCommand,
  handleListCommand,
  handleListTemplatesCommand,
  handleMarkCompleteNextCommand,
  handleNextTaskCommand,
  handlePhaseCreateCommand,
  handlePhaseDeleteCommand,
  handlePhaseUpdateCommand,
  handlePhasesCommand,
  handleTaskMoveCommand,
  handleUpdateCommand,
} from './commands.js';
import {
  migrateIds,
  setIdFormat,
  setMaxContextLength,
  setStopWords,
  showConfig,
} from './config-commands.js';

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
    .description('List all tasks (Example: sc task list --status "🟡 To Do" --phase "release-v1")')
    .option('-s, --status <status>', 'Filter by status (e.g., "🟡 To Do", "🟢 Done")')
    .option('-t, --type <type>', 'Filter by type (e.g., "🌟 Feature", "🐛 Bug")')
    .option('-a, --assignee <assignee>', 'Filter by assignee')
    .option('-g, --tags <tags...>', 'Filter by tags')
    .option('-p, --phase <phase>', 'Filter by phase')
    .option('-d, --subdirectory <subdirectory>', 'Filter by subdirectory (e.g., "FEATURE_Login")')
    .option('-o, --overview', 'Show only overview files (_overview.md)')
    .option('-f, --format <format>', 'Output format: table, json, minimal, workflow', 'table')
    .action(handleListCommand);

  // task get command
  taskCommand
    .command('get <id>')
    .description('Get a task by ID')
    .option('-f, --format <format>', 'Output format: default, json, markdown, full', 'default')
    .option('-p, --phase <phase>', 'Phase to look in')
    .option('-d, --subdirectory <subdirectory>', 'Subdirectory to look in')
    .action(handleGetCommand);

  // task create command
  taskCommand
    .command('create')
    .description(
      'Create a new task (Example: sc task create --title "New feature" --type "🌟 Feature" --phase "release-v1")'
    )
    .option(
      '--id <id>',
      'Task ID (generated if not provided, use "_overview" for feature overview files)'
    )
    .option('--title <title>', 'Task title')
    .option('--type <type>', 'Task type (e.g., "🌟 Feature", "🐛 Bug")')
    .option('--status <status>', 'Task status (default: "🟡 To Do")')
    .option('--priority <priority>', 'Task priority (default: "▶️ Medium")')
    .option('--assignee <assignee>', 'Assigned to')
    .option('--phase <phase>', 'Phase ID or name')
    .option('--subdirectory <subdirectory>', 'Subdirectory within phase (e.g., "FEATURE_Login")')
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
    .description('Update a task (Example: sc task update TASK-123 --status "🔵 In Progress")')
    .option('--title <title>', 'Task title')
    .option('--status <status>', 'Task status')
    .option('--type <type>', 'Task type')
    .option('--priority <priority>', 'Task priority')
    .option('--assignee <assignee>', 'Assigned to')
    .option('--phase <phase>', 'Phase ID or name (where to move the task)')
    .option('--subdirectory <subdirectory>', 'Subdirectory within phase (where to move the task)')
    .option('--search-phase <searchPhase>', 'Phase to search for the task')
    .option('--search-subdirectory <searchSubdirectory>', 'Subdirectory to search for the task')
    .option('--parent <parent>', 'Parent task ID')
    .option('--depends <depends...>', 'Dependencies (task IDs)')
    .option('--previous <previous>', 'Previous task in workflow')
    .option('--next <next>', 'Next task in workflow')
    .option('--tags <tags...>', 'Tags for the task')
    .option('--content <content>', 'Task content')
    .option('--file <file>', 'Update from file (JSON or TOML+Markdown)')
    .action(handleUpdateCommand);

  // task delete command
  taskCommand
    .command('delete <id>')
    .description('Delete a task')
    .option('-p, --phase <phase>', 'Phase to look in')
    .option('-d, --subdirectory <subdirectory>', 'Subdirectory to look in')
    .action(handleDeleteCommand);

  // task status shortcut commands
  taskCommand
    .command('start <id>')
    .description('Mark a task as "In Progress"')
    .action(async (id) => {
      await handleUpdateCommand(id, { status: '🔵 In Progress' });
    });

  taskCommand
    .command('complete <id>')
    .description('Mark a task as "Done"')
    .action(async (id) => {
      await handleUpdateCommand(id, { status: '🟢 Done' });
    });

  taskCommand
    .command('block <id>')
    .description('Mark a task as "Blocked"')
    .action(async (id) => {
      await handleUpdateCommand(id, { status: '⚪ Blocked' });
    });

  taskCommand
    .command('review <id>')
    .description('Mark a task as "In Review"')
    .action(async (id) => {
      await handleUpdateCommand(id, { status: '🟣 Review' });
    });

  // task move command
  taskCommand
    .command('move <id>')
    .description(
      'Move a task to a different feature or area subdirectory (Example: sc task move TASK-123 --subdirectory "FEATURE_NewFeature")'
    )
    .requiredOption('--subdirectory <subdirectory>', 'Target subdirectory to move the task to')
    .option('--phase <phase>', 'Target phase (if moving between phases)')
    .option('--search-phase <searchPhase>', 'Source phase to search for the task')
    .option(
      '--search-subdirectory <searchSubdirectory>',
      'Source subdirectory to search for the task'
    )
    .action(handleTaskMoveCommand);

  // Add task group to root program
  program.addCommand(taskCommand);

  // Add only the most essential top-level commands for convenience
  program
    .command('list')
    .description('List all tasks')
    .option('-s, --status <status>', 'Filter by status (e.g., "🟡 To Do", "🟢 Done")')
    .option('-t, --type <type>', 'Filter by type (e.g., "🌟 Feature", "🐛 Bug")')
    .option('-a, --assignee <assignee>', 'Filter by assignee')
    .option('-g, --tags <tags...>', 'Filter by tags')
    .option('-p, --phase <phase>', 'Filter by phase')
    .option('-d, --subdirectory <subdirectory>', 'Filter by subdirectory (e.g., "FEATURE_Login")')
    .option('-o, --overview', 'Show only overview files (_overview.md)')
    .option('-f, --format <format>', 'Output format: table, json, minimal, workflow', 'table')
    .action(handleListCommand);

  program
    .command('get <id>')
    .description('Get a task by ID')
    .option('-f, --format <format>', 'Output format: default, json, markdown, full', 'default')
    .option('-p, --phase <phase>', 'Phase to look in')
    .option('-d, --subdirectory <subdirectory>', 'Subdirectory to look in')
    .action(handleGetCommand);
}

/**
 * Set up phase commands
 * @param program Root commander program
 */
export function setupPhaseCommands(program: Command): void {
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
    .option('--type <type>', 'Feature type (default: "🌟 Feature")')
    .option('--status <status>', 'Feature status (default: "🟡 To Do")')
    .option('--priority <priority>', 'Feature priority (default: "▶️ Medium")')
    .option('--assignee <assignee>', 'Assigned to')
    .option('--tags <tags...>', 'Tags for the feature')
    .action(async (options) => {
      const subdirectory = `FEATURE_${options.name.replace(/\s+/g, '')}`;

      try {
        // Create feature overview file
        const _result = await handleCreateCommand({
          id: '_overview',
          title: options.title,
          type: options.type || '🌟 Feature',
          status: options.status || '🟡 To Do',
          priority: options.priority || '▶️ Medium',
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
    .option('--type <type>', 'Area type (default: "🧹 Chore")')
    .option('--status <status>', 'Area status (default: "🟡 To Do")')
    .option('--priority <priority>', 'Area priority (default: "▶️ Medium")')
    .option('--assignee <assignee>', 'Assigned to')
    .option('--tags <tags...>', 'Tags for the area')
    .action(async (options) => {
      const subdirectory = `AREA_${options.name.replace(/\s+/g, '')}`;

      try {
        // Create area overview file
        const _result = await handleCreateCommand({
          id: '_overview',
          title: options.title,
          type: options.type || '🧹 Chore',
          status: options.status || '🟡 To Do',
          priority: options.priority || '▶️ Medium',
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
  // Init command (directly on root program)
  program
    .command('init')
    .description('Initialize task directory structure')
    .option('--mode <mode>', 'Force project mode (roo or standalone)')
    .option('--root-dir <path>', 'Initialize in specific directory instead of current directory')
    .action(handleInitCommand);
}

/**
 * Set up configuration commands
 * @param program Root commander program
 */
export function setupConfigCommands(program: Command): void {
  // Create config command group
  const configCommand = new Command('config')
    .description('Configuration management commands')
    .addHelpText('before', '\nCONFIGURATION COMMANDS\n====================\n')
    .addHelpText(
      'after',
      `
Note: The --root-dir option affects which project's configuration is shown or modified:
  sc --root-dir ./e2e_test/worktree-test config show
`
    );

  // config show command
  configCommand
    .command('show')
    .description('Show current configuration')
    .option('-f, --format <format>', 'Output format: default, json', 'default')
    .action((options) => showConfig(options.format));

  // config id-format command
  configCommand
    .command('id-format <format>')
    .description('Set task ID format (concise or timestamp)')
    .action(setIdFormat);

  // config stop-words command
  configCommand
    .command('stop-words <words>')
    .description('Set custom stop words for context extraction (comma-separated)')
    .action(setStopWords);

  // config context-length command
  configCommand
    .command('context-length <length>')
    .description('Set maximum context length for ID generation (1-5)')
    .action(setMaxContextLength);

  // config migrate-ids command
  configCommand
    .command('migrate-ids')
    .description('Migrate existing task IDs to new format')
    .option('--dry-run', 'Preview changes without modifying files', true)
    .option('--apply', 'Apply changes to files')
    .action((options) => migrateIds(options.dryRun && !options.apply));

  // Add config group to root program
  program.addCommand(configCommand);
}

/**
 * Set up all entity commands
 * @param program Root commander program
 */
export function setupEntityCommands(program: Command): void {
  setupTaskCommands(program);
  setupPhaseCommands(program);
  setupFeatureAreaCommands(program);
  setupWorkflowCommands(program);
  setupTemplateCommands(program);
  setupConfigCommands(program);
  setupInitCommands(program);
}
