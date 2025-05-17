#!/usr/bin/env node
import { program } from 'commander';
import { getTask, updateTask } from '../core/index.js';

// Debug API command for testing
program
  .command('test-api <id>')
  .description('Test different update API paths')
  .option('--status <status>', 'Task status')
  .action(async (id, options) => {
    console.log('Running API test with:', id, options);

    if (options.status) {
      // Try directly passing status
      console.log('\n== Test direct property ==');
      console.log(`Updating with { status: "${options.status}" }`);
      const result1 = await updateTask(id, { status: options.status });
      console.log('Result:', result1);

      // Get the task and verify
      const check1 = await getTask(id);
      console.log('Task after direct update:', check1.data?.metadata.status);

      // Try using metadata object
      console.log('\n== Test metadata property ==');
      console.log(`Updating with { metadata: { status: "${options.status}" } }`);
      const result2 = await updateTask(id, { metadata: { status: options.status } });
      console.log('Result:', result2);

      // Get the task and verify
      const check2 = await getTask(id);
      console.log('Task after metadata update:', check2.data?.metadata.status);
    }
  });

program.parse(process.argv);
