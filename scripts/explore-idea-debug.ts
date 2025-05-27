#!/usr/bin/env bun

import { claude } from 'channelcoder';

// Get command line args
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: bun run scripts/explore-idea-debug.ts "Title" "Description"');
  process.exit(1);
}

const title = args[0];
const description = args.slice(1).join(' ');

console.log('🔍 Debug Mode - Showing Claude command\n');
console.log(`Title: ${title}`);
console.log(`Description: ${description}\n`);

// Use claude with dryRun to see the command
const result = await claude('scripts/prompts/explore-idea.md', {
  dryRun: true,
  data: {
    ideaTitle: title,
    ideaDescription: description,
  },
});

console.log('\n📋 Generated Command:');
console.log(result);