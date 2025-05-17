/**
 * Functions for parsing and formatting task files (TOML+Markdown)
 */
import { parse as parseToml, stringify as stringifyToml } from '@iarna/toml';
import type { Task, TaskMetadata } from './types.js';

/**
 * Extracts TOML frontmatter and markdown content from a task file
 * @param fileContent The content of the task file
 * @returns An object containing metadata and markdown content
 */
export function parseTaskFile(fileContent: string): Task {
  const frontmatterRegex = /^\+\+\+\s*\n([\s\S]*?)\n\+\+\+\s*\n([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);

  if (!match) {
    throw new Error('Invalid task file format: missing or malformed TOML frontmatter');
  }

  const [, tomlContent, markdownContent] = match;

  try {
    const metadata = parseToml(tomlContent) as TaskMetadata;

    // Ensure required fields
    if (!metadata.id) {
      throw new Error('Missing required field: id');
    }

    // Extract title from content if missing
    if (!metadata.title && markdownContent) {
      const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        metadata.title = titleMatch[1];
      } else {
        metadata.title = 'Untitled Task';
      }
    }

    return {
      metadata,
      content: markdownContent.trim(),
    };
  } catch (error) {
    throw new Error(
      `Failed to parse TOML frontmatter: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Combines TOML metadata and markdown content into a task file format
 * @param task Task object with metadata and content
 * @returns Formatted string ready to write to file
 */
export function formatTaskFile(task: Task): string {
  const tomlContent = stringifyToml(task.metadata);
  return `+++\n${tomlContent}+++\n\n${task.content}\n`;
}

/**
 * Generates a unique task ID
 * @param prefix Optional prefix for the ID (default: "TASK")
 * @returns A unique task ID
 */
export function generateTaskId(prefix = 'TASK'): string {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');

  return `${prefix}-${timestamp}`;
}
