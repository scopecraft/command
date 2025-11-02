/**
 * Task Parser
 *
 * Parses and serializes task documents with the section-based format
 */

import matter from 'gray-matter';
import type { TaskDocument, TaskFrontmatter, TaskSections, ValidationError } from './types.js';

// Required sections as per spec
const REQUIRED_SECTIONS = ['instruction', 'tasks', 'deliverable', 'log'] as const;

// Section delimiter pattern
const SECTION_PATTERN = /^## (.+)$/gm;

const LEGACY_FRONTMATTER_PATTERN = /(---\s*[\s\S]*?\s*---)/m;

/**
 * Find the frontmatter and the content, extract and reconstruct.
 */
function reconstructDocument(input: string) {
  const dataMatch = input.match(LEGACY_FRONTMATTER_PATTERN)
  const data = dataMatch ? dataMatch[1].trim() : null;
  const content = input.replace(LEGACY_FRONTMATTER_PATTERN, '').trim()
  return [data, content].filter(Boolean).join('\n\n');
}

/**
 * Parse a task document from markdown content
 * 
 * supports legacy format where frontmatter is not at the top of the file
 */
export function parseTaskDocument(content: string): TaskDocument {
  const parsed = matter(reconstructDocument(content));
  
  const firstLine = parsed.content.trim().split('\n')[0] || '';
  const titleMatch = firstLine.match(/^# (?<title>.+)$/);
  
  if (!titleMatch?.groups.title) {
    throw new Error("Task document content must start with # Title");
  }
  
  // Validate and cast frontmatter
  const frontmatter = parsed.data as TaskFrontmatter;
  if (!frontmatter.type || !frontmatter.status || !frontmatter.area) {
    throw new Error('Frontmatter must contain type, status, and area fields');
  }

  // Parse sections from content after frontmatter
  const title = titleMatch.groups.title.trim();
  const sections = parseSections(parsed.content);

  return {
    title,
    frontmatter,
    sections,
  };
}

/**
 * Parse sections from body content (after frontmatter)
 */
function parseSections(content: string): TaskSections {
  // Initialize with empty required sections
  const sections: TaskSections = {
    instruction: '',
    tasks: '',
    deliverable: '',
    log: '',
  };

  // Remove title line if present (it's after frontmatter in gray-matter output)
  const lines = content.split('\n');
  let bodyContent = content;
  if (lines[0]?.match(/^# .+$/)) {
    bodyContent = lines.slice(1).join('\n');
  }

  // Find all section headers
  const sectionMatches = Array.from(bodyContent.matchAll(SECTION_PATTERN));

  if (sectionMatches.length === 0) {
    // No sections found, treat entire content as instruction
    sections.instruction = bodyContent.trim();
    return sections;
  }

  // Process each section
  for (let i = 0; i < sectionMatches.length; i++) {
    const match = sectionMatches[i];
    const sectionName = match[1].trim();
    const sectionKey = sectionName.toLowerCase();

    // Find section content (between this header and next, or end)
    const startIndex = match.index! + match[0].length;
    const endIndex = sectionMatches[i + 1]?.index ?? bodyContent.length;

    const sectionContent = bodyContent.substring(startIndex, endIndex).trim();

    sections[sectionKey] = sectionContent;
  }

  return sections;
}

/**
 * Serialize a task document to markdown
 */
export function serializeTaskDocument(task: TaskDocument): string {
  const lines: string[] = [];

  // Title
  lines.push(`# ${task.title}`);
  lines.push('');

  // Create content with frontmatter using gray-matter
  const frontmatterContent = matter.stringify('', task.frontmatter);

  // Extract just the frontmatter part
  const frontmatterLines = frontmatterContent.split('\n').slice(0, -1); // Remove empty content line
  lines.push(...frontmatterLines);
  lines.push('');

  // Sections - maintain order and proper capitalization
  const sectionOrder = [
    { key: 'instruction', name: 'Instruction' },
    { key: 'tasks', name: 'Tasks' },
    { key: 'deliverable', name: 'Deliverable' },
    { key: 'log', name: 'Log' },
  ];

  // Add required sections first
  for (const { key, name } of sectionOrder) {
    lines.push(`## ${name}`);
    const content = task.sections[key];
    if (content?.trim()) {
      lines.push(content);
    }
    lines.push('');
  }

  // Add any custom sections
  for (const [key, content] of Object.entries(task.sections)) {
    if (!sectionOrder.some((s) => s.key === key)) {
      // Capitalize first letter of custom section
      const name = key.charAt(0).toUpperCase() + key.slice(1);
      lines.push(`## ${name}`);
      if (content?.trim()) {
        lines.push(content);
      }
      lines.push('');
    }
  }

  return `${lines.join('\n').trimEnd()}\n`;
}

/**
 * Serialize task content for display purposes (sections only)
 * This is used for UI/API responses where metadata should not be included
 */
export function serializeTaskContent(task: TaskDocument): string {
  const lines: string[] = [];

  // Skip title and frontmatter - only return sections content

  // Sections - maintain order and proper capitalization
  const sectionOrder = [
    { key: 'instruction', name: 'Instruction' },
    { key: 'tasks', name: 'Tasks' },
    { key: 'deliverable', name: 'Deliverable' },
    { key: 'log', name: 'Log' },
  ];

  // Add required sections first
  for (const { key, name } of sectionOrder) {
    lines.push(`## ${name}`);
    const content = task.sections[key];
    if (content?.trim()) {
      lines.push(content);
    }
    lines.push('');
  }

  // Add any custom sections
  for (const [key, content] of Object.entries(task.sections)) {
    if (!sectionOrder.some((s) => s.key === key)) {
      // Capitalize first letter of custom section
      const name = key.charAt(0).toUpperCase() + key.slice(1);
      lines.push(`## ${name}`);
      if (content?.trim()) {
        lines.push(content);
      }
      lines.push('');
    }
  }

  return `${lines.join('\n').trimEnd()}\n`;
}

/**
 * Validate a task document
 */
export function validateTaskDocument(task: TaskDocument): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate title
  if (!task.title || task.title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Task must have a title',
      severity: 'error',
    });
  }

  // Validate required frontmatter fields
  if (!task.frontmatter.type) {
    errors.push({
      field: 'frontmatter.type',
      message: 'Task must have a type',
      severity: 'error',
    });
  }

  if (!task.frontmatter.status) {
    errors.push({
      field: 'frontmatter.status',
      message: 'Task must have a status',
      severity: 'error',
    });
  }

  if (!task.frontmatter.area) {
    errors.push({
      field: 'frontmatter.area',
      message: 'Task must have an area',
      severity: 'error',
    });
  }

  // Check for required sections (they can be empty but must exist)
  for (const section of REQUIRED_SECTIONS) {
    if (!(section in task.sections)) {
      errors.push({
        field: `sections.${section}`,
        message: `Missing required section: ${section}`,
        severity: 'error',
      });
    }
  }

  return errors;
}

/**
 * Update a specific section while preserving others
 */
export function updateSection(content: string, sectionName: string, newContent: string): string {
  const task = parseTaskDocument(content);
  task.sections[sectionName.toLowerCase()] = newContent;
  return serializeTaskDocument(task);
}

/**
 * Extract a specific section from task content
 */
export function extractSection(content: string, sectionName: string): string | null {
  try {
    const task = parseTaskDocument(content);
    return task.sections[sectionName.toLowerCase()] || null;
  } catch {
    return null;
  }
}

/**
 * Ensure all required sections exist (for new tasks)
 */
export function ensureRequiredSections(sections: Partial<TaskSections>): TaskSections {
  const result: TaskSections = {
    instruction: '',
    tasks: '',
    deliverable: '',
    log: '',
    ...sections,
  };

  // Leave log empty for now - to be implemented later

  return result;
}

/**
 * Format timestamp for log entries
 */
export function formatLogTimestamp(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Parse checklist items from tasks section
 */
export function parseTasksSection(tasksContent: string): Array<{
  text: string;
  completed: boolean;
}> {
  const lines = tasksContent.split('\n');
  const tasks: Array<{ text: string; completed: boolean }> = [];

  for (const line of lines) {
    const uncheckedMatch = line.match(/^- \[ \] (.+)$/);
    if (uncheckedMatch) {
      tasks.push({
        text: uncheckedMatch[1].trim(),
        completed: false,
      });
      continue;
    }

    const checkedMatch = line.match(/^- \[x\] (.+)$/i);
    if (checkedMatch) {
      tasks.push({
        text: checkedMatch[1].trim(),
        completed: true,
      });
    }
  }

  return tasks;
}

/**
 * Format tasks array into checklist format
 */
export function formatTasksSection(tasks: Array<{ text: string; completed?: boolean }>): string {
  return tasks.map((task) => `- [${task.completed ? 'x' : ' '}] ${task.text}`).join('\n');
}

/**
 * Add a log entry to the log section
 */
export function addLogEntry(content: string, entry: string, timestamp: Date = new Date()): string {
  const task = parseTaskDocument(content);
  const formattedTimestamp = formatLogTimestamp(timestamp);

  const newEntry = `- ${formattedTimestamp}: ${entry}`;

  if (task.sections.log) {
    task.sections.log = `${task.sections.log.trim()}\n${newEntry}`;
  } else {
    task.sections.log = newEntry;
  }

  return serializeTaskDocument(task);
}
