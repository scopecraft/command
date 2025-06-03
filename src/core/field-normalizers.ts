/**
 * Field normalization utilities
 *
 * This module provides functions to normalize field values for tasks and phases.
 * It allows for more flexible input formats while ensuring standardized storage.
 */

import {
  getPriorityEmoji,
  getPriorityLabel,
  getPriorityName,
  getPriorityValues,
  getStatusEmoji,
  getStatusLabel,
  getStatusName,
  getStatusValues,
} from './metadata/schema-service.js';

/**
 * Priority order for sorting (highest to lowest)
 */
export const PRIORITY_ORDER: Record<string, number> = {
  Highest: 4,
  High: 3,
  Medium: 2,
  Low: 1,
  '': 0,
};

/**
 * Normalizes priority values to standard format
 *
 * Accepts various input formats:
 * - Full format with emoji: "🔥 Highest"
 * - Text only: "high", "Low", "MEDIUM"
 * - Emoji only: "🔼"
 * - Common synonyms: "critical", "important", etc.
 *
 * @param input Priority value to normalize
 * @returns Standardized priority value
 */
export function normalizePriority(input: string | undefined | null): string {
  if (!input) return 'medium';

  // Check if it's already a canonical name
  const priorityValues = getPriorityValues();
  if (priorityValues.some((p) => p.name === input)) {
    return input;
  }

  // Check if it's a label, convert to canonical name
  const byLabel = priorityValues.find((p) => p.label === input);
  if (byLabel) {
    return byLabel.name;
  }

  const lowerInput = input.toLowerCase().trim();

  // Check for emoji-only input by comparing against schema emojis
  for (const priority of priorityValues) {
    if (priority.emoji && lowerInput === priority.emoji) {
      return priority.name;
    }
  }

  // Check for text patterns (with or without emoji)
  if (/highest|critical|urgent|blocker/.test(lowerInput)) {
    return 'highest';
  }

  if (/high|important/.test(lowerInput)) {
    return 'high';
  }

  if (/medium|normal|med|default|standard/.test(lowerInput)) {
    return 'medium';
  }

  if (/low|minor|trivial/.test(lowerInput)) {
    return 'low';
  }

  // Default fallback
  return 'medium';
}

/**
 * Normalizes task status values to standard format
 *
 * Accepts various input formats:
 * - Full format with emoji: "🟡 To Do"
 * - Text only: "in progress", "Done", "TO DO"
 * - Emoji only: "🔵"
 * - Common variations: "todo", "wip", "completed", etc.
 *
 * @param input Status value to normalize
 * @returns Standardized status value
 */
export function normalizeTaskStatus(input: string | undefined | null): string {
  if (!input) return 'todo';

  // Check if it's already a canonical name
  const statusValues = getStatusValues();
  if (statusValues.some((s) => s.name === input)) {
    return input;
  }

  // Check if it's a label, convert to canonical name
  const byLabel = statusValues.find((s) => s.label === input);
  if (byLabel) {
    return byLabel.name;
  }

  const lowerInput = input.toLowerCase().trim();

  // Check for emoji-only input by comparing against schema emojis
  for (const status of statusValues) {
    if (status.emoji && lowerInput === status.emoji) {
      return status.name;
    }
  }

  // Check for text patterns (with or without emoji)
  if (/to[ -]?do|todo|pending|new|open|backlog/.test(lowerInput)) {
    return 'todo';
  }

  if (/in[ -]?progress|started|ongoing|working|wip/.test(lowerInput)) {
    return 'in_progress';
  }

  if (/done|complete|finished|completed|closed|resolved/.test(lowerInput)) {
    return 'done';
  }

  if (/blocked|block|hold|on[ -]?hold|waiting/.test(lowerInput)) {
    return 'blocked';
  }

  if (/archived|archive/.test(lowerInput)) {
    return 'archived';
  }

  // Default fallback
  return 'todo';
}

/**
 * Detects if a task is considered complete based on its status
 * This matches the logic used in task-crud.ts for filtering completed tasks
 *
 * @param status Task status value
 * @returns True if status indicates completion
 */
export function isCompletedTaskStatus(status: string | undefined | null): boolean {
  if (!status) return false;

  const normalizedStatus = status.toLowerCase();
  return (
    normalizedStatus.includes('done') ||
    normalizedStatus.includes('🟢') ||
    normalizedStatus.includes('completed') ||
    normalizedStatus.includes('complete')
  );
}

/**
 * Gets the priority order value for a given priority
 * Used for sorting tasks by priority
 *
 * @param priority Priority value
 * @returns Numeric priority order (higher = more important)
 */
export function getPriorityOrder(priority: string | undefined | null): number {
  if (!priority) return 0;

  const normalizedPriority = normalizePriority(priority);
  return PRIORITY_ORDER[normalizedPriority] || 0;
}
