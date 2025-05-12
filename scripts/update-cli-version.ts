#!/usr/bin/env bun
/**
 * Script to update version numbers in CLI files
 * This ensures the CLI reports the correct version from package.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Read package.json to get the version
const packageJsonPath = path.join(rootDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

if (!version) {
  console.error('Error: No version found in package.json');
  process.exit(1);
}

console.log(`Updating CLI files to version ${version}`);

// Files to update
const filesToUpdate = [
  path.join(rootDir, 'src', 'cli', 'cli.ts'),
  path.join(rootDir, 'src', 'mcp', 'cli.ts')
];

// Find and replace version in each file
filesToUpdate.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Match the version assignment pattern
  const versionRegex = /(let|const)\s+version\s*=\s*['"]([^'"]+)['"]\s*;?\s*\/\/\s*Default/;
  
  if (versionRegex.test(content)) {
    // Replace the version
    content = content.replace(versionRegex, `$1 version = '${version}'; // Default`);
    fs.writeFileSync(filePath, content);
    console.log(`Updated version in ${path.relative(rootDir, filePath)}`);
  } else {
    console.warn(`Could not find version pattern in ${path.relative(rootDir, filePath)}`);
  }
});

console.log('Version update complete');