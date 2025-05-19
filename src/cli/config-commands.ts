/**
 * Configuration management commands
 */

import { describe, it } from 'node:test';
import chalk from 'chalk';
import { projectConfig } from '../core/project-config.js';
import type { OutputFormat } from '../core/types.js';

/**
 * Display current configuration
 */
export async function showConfig(format: OutputFormat = 'default'): Promise<void> {
  const config = projectConfig.getConfig();
  const configPath = projectConfig.getProjectConfigPath();

  if (format === 'json') {
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  console.log(chalk.bold('\nProject Configuration:'));
  console.log(chalk.gray(`Config path: ${configPath}`));
  console.log('');
  console.log(chalk.cyan('ID Format:'), config.idFormat || 'timestamp');
  console.log(chalk.cyan('Max Context Length:'), config.maxContextLength || 2);

  if (config.customStopWords && config.customStopWords.length > 0) {
    console.log(chalk.cyan('Custom Stop Words:'), config.customStopWords.join(', '));
  }
}

/**
 * Set ID format configuration
 */
export async function setIdFormat(format: 'concise' | 'timestamp'): Promise<void> {
  const validFormats = ['concise', 'timestamp'];

  if (!validFormats.includes(format)) {
    console.error(chalk.red(`Invalid format. Use one of: ${validFormats.join(', ')}`));
    return;
  }

  projectConfig.updateConfig({ idFormat: format });
  console.log(chalk.green(`✔ ID format set to: ${format}`));

  if (format === 'concise') {
    console.log(chalk.yellow('\nNote: New tasks will use the concise format.'));
    console.log(chalk.yellow('Existing tasks with timestamp IDs will continue to work.'));
    console.log(chalk.gray('Example: FEAT-USERAUTH-0518-K3'));
  } else {
    console.log(chalk.yellow('\nNote: New tasks will use the timestamp format.'));
    console.log(chalk.gray('Example: TASK-20250518T203045'));
  }
}

/**
 * Set custom stop words for context extraction
 */
export async function setStopWords(words: string): Promise<void> {
  const stopWords = words
    .split(',')
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  projectConfig.updateConfig({ customStopWords: stopWords });
  console.log(chalk.green(`✔ Custom stop words set: ${stopWords.join(', ')}`));
}

/**
 * Set maximum context length for ID generation
 */
export async function setMaxContextLength(length: string): Promise<void> {
  const maxLength = Number.parseInt(length, 10);

  if (isNaN(maxLength) || maxLength < 1 || maxLength > 5) {
    console.error(chalk.red('Context length must be between 1 and 5'));
    return;
  }

  projectConfig.updateConfig({ maxContextLength: maxLength });
  console.log(chalk.green(`✔ Max context length set to: ${maxLength}`));
}

/**
 * Migrate existing tasks to new ID format (dry run by default)
 */
export async function migrateIds(dryRun = true): Promise<void> {
  console.log(
    chalk.bold(`\n${dryRun ? 'Dry run: ' : ''}Migrating task IDs to concise format...\n`)
  );

  // TO DO: Implement migration logic
  console.log(chalk.yellow('Migration functionality coming soon...'));
}
