/**
 * Functions for parsing and formatting task files (YAML/TOML+Markdown)
 */
import { parse as parseToml, stringify as stringifyToml } from '@iarna/toml';
import matter from 'gray-matter';
import { logger } from '../observability/logger.js';
import type { Task, TaskMetadata } from './types.js';

/**
 * Helper function to format dates consistently
 */
function formatDate(date: unknown): string | undefined {
  if (!date) return undefined;

  // If it's already a string in the correct format, return it
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  // Convert Date objects or other formats
  try {
    const d = new Date(date as string | number | Date);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {
    // Fall through
  }

  return undefined;
}

/**
 * Helper function to normalize metadata between TOML and YAML formats
 */
function normalizeMetadata(metadata: Record<string, unknown>): TaskMetadata {
  // Type assertion is safe here because we're working with parsed frontmatter
  const result = metadata as unknown as TaskMetadata;

  // Override specific fields that need normalization
  return {
    ...result,
    // Ensure dates are properly formatted
    created_date: formatDate(metadata.created_date),
    updated_date: formatDate(metadata.updated_date),
    due_date: formatDate(metadata.due_date),
    // Ensure arrays are arrays (YAML might have single values as strings)
    tags: Array.isArray(metadata.tags)
      ? (metadata.tags as string[])
      : metadata.tags
        ? [metadata.tags as string]
        : undefined,
    depends: Array.isArray(metadata.depends)
      ? (metadata.depends as string[])
      : metadata.depends
        ? [metadata.depends as string]
        : undefined,
  };
}

/**
 * Helper to remove undefined fields before serialization
 */
function removeUndefinedFields(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Extract title from markdown content
 */
function extractTitleFromContent(content: string, metadata: TaskMetadata): void {
  if (!metadata.title && content) {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      metadata.title = titleMatch[1];
    } else {
      metadata.title = 'Untitled Task';
    }
  }
}

/**
 * Parse YAML frontmatter
 */
function parseYamlFrontmatter(fileContent: string): Task {
  try {
    const parsed = matter(fileContent);
    const metadata = normalizeMetadata(parsed.data);

    // Ensure required fields
    if (!metadata.id) {
      throw new Error('Missing required field: id');
    }

    // Extract title from content if missing
    extractTitleFromContent(parsed.content, metadata);

    return {
      metadata,
      content: parsed.content.trim(),
    };
  } catch (error) {
    throw new Error(
      `Failed to parse YAML frontmatter: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parse TOML frontmatter (legacy)
 */
function parseTomlFrontmatter(fileContent: string): Task {
  logger.warn(
    'TOML frontmatter is deprecated and will be removed in a future version. Please migrate to YAML frontmatter.'
  );

  const frontmatterRegex = /^\+\+\+\s*\n([\s\S]*?)\n\+\+\+\s*\n([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);

  if (!match) {
    throw new Error('Invalid TOML frontmatter format');
  }

  const [, tomlContent, markdownContent] = match;

  try {
    const metadata = parseToml(tomlContent) as TaskMetadata;
    const normalizedMetadata = normalizeMetadata(metadata as Record<string, unknown>);

    // Ensure required fields
    if (!normalizedMetadata.id) {
      throw new Error('Missing required field: id');
    }

    // Extract title from content if missing
    extractTitleFromContent(markdownContent, normalizedMetadata);

    return {
      metadata: normalizedMetadata,
      content: markdownContent.trim(),
    };
  } catch (error) {
    throw new Error(
      `Failed to parse TOML frontmatter: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extracts frontmatter (YAML or TOML) and markdown content from a task file
 * @param fileContent The content of the task file
 * @returns An object containing metadata and markdown content
 */
export function parseTaskFile(fileContent: string): Task {
  // Try YAML first (new format)
  if (fileContent.startsWith('---')) {
    return parseYamlFrontmatter(fileContent);
  }

  // Fallback to TOML (legacy format - deprecated)
  if (fileContent.startsWith('+++')) {
    return parseTomlFrontmatter(fileContent);
  }

  throw new Error('No valid frontmatter found. Expected YAML (---) or TOML (+++) delimiters.');
}

/**
 * Combines metadata and markdown content into a task file format (YAML)
 * @param task Task object with metadata and content
 * @returns Formatted string ready to write to file
 */
export function formatTaskFile(task: Task): string {
  // Clean up metadata before serialization
  const cleanMetadata = removeUndefinedFields(task.metadata);

  // Use gray-matter to format with YAML frontmatter
  const formatted = matter.stringify(task.content || '', cleanMetadata);

  // Ensure proper trailing newline
  return formatted.endsWith('\n') ? formatted : `${formatted}\n`;
}
