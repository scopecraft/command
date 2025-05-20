#!/usr/bin/env node
import { program } from 'commander';
import { updateTask } from '../core/task-manager/task-crud.js';

// Direct debug command for testing
program
  .command('debug-update <id>')
  .description('Debug update a task')
  .option('--status <status>', 'Task status')
  .action(async (id, options) => {
    console.log('Running debug update with:', id, options);

    // Create updates object
    const updates: Record<string, string> = {};

    if (options.status) {
      console.log('Setting status to:', options.status);
      updates.status = options.status;
    }

    const result = await updateTask(id, updates);

    if (result.success) {
      console.log('Success:', result.message);
      console.log('Updated task:', JSON.stringify(result.data, null, 2));
    } else {
      console.error('Error:', result.error);
    }
  });

program.parse(process.argv);
