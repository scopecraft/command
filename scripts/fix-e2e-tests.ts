#!/usr/bin/env bun
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Find all e2e test files
const testFiles = await glob('test/e2e/*.test.ts');

for (const file of testFiles) {
  let content = readFileSync(file, 'utf-8');
  
  // Fix 1: Add main branch creation after git init
  if (content.includes('await git.init();') && !content.includes('checkoutLocalBranch')) {
    content = content.replace(
      /await git\.init\(\);\n(\s*)await git\.addConfig/g,
      `await git.init();\n$1await git.checkoutLocalBranch('main');\n$1await git.addConfig`
    );
  }
  
  // Fix 2: Ensure worktree cleanup is wrapped in try-catch
  content = content.replace(
    /const worktrees = await git\.raw\(\['worktree', 'list', '--porcelain'\]\);/g,
    `try {\n        const worktrees = await git.raw(['worktree', 'list', '--porcelain']);`
  );
  
  // Fix 3: Close the try block for worktree cleanup
  if (content.includes('try {\n        const worktrees')) {
    content = content.replace(
      /await git\.raw\(\['worktree', 'prune'\]\);\n(\s*)\}/g,
      `await git.raw(['worktree', 'prune']);\n$1} catch {\n$1  // Ignore worktree errors\n$1}`
    );
  }
  
  writeFileSync(file, content);
  console.log(`Fixed: ${file}`);
}

console.log('Done fixing e2e tests');