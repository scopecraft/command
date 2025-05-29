/**
 * Field normalization utilities
 *
 * This module provides functions to normalize field values for tasks and phases.
 * It allows for more flexible input formats while ensuring standardized storage.
 */

/**
 * Standard priority values (clean text only - emojis added by formatters)
 */
export const PRIORITY_VALUES = {
  HIGHEST: 'Highest',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  DEFAULT: 'Medium',
};

/**
 * Standard task status values (clean text only - emojis added by formatters)
 */
export const TASK_STATUS_VALUES = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  BLOCKED: 'Blocked',
  REVIEW: 'Review',
  DEFAULT: 'To Do',
};

/**
 * Standard phase status values (clean text only - emojis added by formatters)
 */
export const PHASE_STATUS_VALUES = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked',
  ARCHIVED: 'Archived',
  DEFAULT: 'Pending',
};

/**
 * Priority order for sorting (highest to lowest)
 */
export const PRIORITY_ORDER: Record<string, number> = {
  [PRIORITY_VALUES.HIGHEST]: 4,
  [PRIORITY_VALUES.HIGH]: 3,
  [PRIORITY_VALUES.MEDIUM]: 2,
  [PRIORITY_VALUES.LOW]: 1,
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
  if (!input) return PRIORITY_VALUES.DEFAULT;

  // If it's already a standard value, return it
  if (Object.values(PRIORITY_VALUES).includes(input)) {
    return input;
  }

  const lowerInput = input.toLowerCase().trim();

  // Check for emoji-only input
  if (lowerInput === '🔥') return PRIORITY_VALUES.HIGHEST;
  if (lowerInput === '🔼') return PRIORITY_VALUES.HIGH;
  if (lowerInput === '▶️') return PRIORITY_VALUES.MEDIUM;
  if (lowerInput === '🔽') return PRIORITY_VALUES.LOW;

  // Check for text patterns (with or without emoji)
  if (/highest|critical|urgent|blocker/.test(lowerInput)) {
    return PRIORITY_VALUES.HIGHEST;
  }

  if (/high|important/.test(lowerInput)) {
    return PRIORITY_VALUES.HIGH;
  }

  if (/medium|normal|med|default|standard/.test(lowerInput)) {
    return PRIORITY_VALUES.MEDIUM;
  }

  if (/low|minor|trivial/.test(lowerInput)) {
    return PRIORITY_VALUES.LOW;
  }

  // Default fallback
  return PRIORITY_VALUES.DEFAULT;
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
  if (!input) return TASK_STATUS_VALUES.DEFAULT;

  // If it's already a standard value, return it
  if (Object.values(TASK_STATUS_VALUES).includes(input)) {
    return input;
  }

  const lowerInput = input.toLowerCase().trim();

  // Check for emoji-only input
  if (lowerInput === '🟡') return TASK_STATUS_VALUES.TODO;
  if (lowerInput === '🔵') return TASK_STATUS_VALUES.IN_PROGRESS;
  if (lowerInput === '🟢') return TASK_STATUS_VALUES.DONE;
  if (lowerInput === '⚪') return TASK_STATUS_VALUES.BLOCKED;
  if (lowerInput === '🟣') return TASK_STATUS_VALUES.REVIEW;

  // Check for text patterns (with or without emoji)
  if (/to[ -]?do|todo|pending|new|open|backlog/.test(lowerInput)) {
    return TASK_STATUS_VALUES.TODO;
  }

  if (/in[ -]?progress|started|ongoing|working|wip/.test(lowerInput)) {
    return TASK_STATUS_VALUES.IN_PROGRESS;
  }

  if (/done|complete|finished|completed|closed|resolved/.test(lowerInput)) {
    return TASK_STATUS_VALUES.DONE;
  }

  if (/blocked|block|hold|on[ -]?hold|waiting/.test(lowerInput)) {
    return TASK_STATUS_VALUES.BLOCKED;
  }

  if (/review|reviewing|in[ -]?review|validate|validating/.test(lowerInput)) {
    return TASK_STATUS_VALUES.REVIEW;
  }

  // Default fallback
  return TASK_STATUS_VALUES.DEFAULT;
}

/**
 * Normalizes phase status values to standard format
 *
 * Accepts various input formats:
 * - Full format with emoji: "🟡 Pending"
 * - Text only: "in progress", "Completed", etc.
 * - Emoji only: "🔵"
 * - Common variations: "planned", "active", "finished", etc.
 *
 * @param input Status value to normalize
 * @returns Standardized status value
 */
export function normalizePhaseStatus(input: string | undefined | null): string {
  if (!input) return PHASE_STATUS_VALUES.DEFAULT;

  // If it's already a standard value, return it
  if (Object.values(PHASE_STATUS_VALUES).includes(input)) {
    return input;
  }

  const lowerInput = input.toLowerCase().trim();

  // Check for emoji-only input
  if (lowerInput === '🟡') return PHASE_STATUS_VALUES.PENDING;
  if (lowerInput === '🔵') return PHASE_STATUS_VALUES.IN_PROGRESS;
  if (lowerInput === '🟢') return PHASE_STATUS_VALUES.COMPLETED;
  if (lowerInput === '⚪') return PHASE_STATUS_VALUES.BLOCKED;
  if (lowerInput === '🗄️') return PHASE_STATUS_VALUES.ARCHIVED;

  // Check for text patterns (with or without emoji)
  if (/pending|planned|to[ -]?do|backlog|upcoming/.test(lowerInput)) {
    return PHASE_STATUS_VALUES.PENDING;
  }

  if (/in[ -]?progress|started|ongoing|working|current|(\b|^)active(\b|$)/.test(lowerInput)) {
    return PHASE_STATUS_VALUES.IN_PROGRESS;
  }

  if (/completed|done|finish|closed|complete/.test(lowerInput)) {
    return PHASE_STATUS_VALUES.COMPLETED;
  }

  if (/blocked|block|hold|on[ -]?hold|waiting/.test(lowerInput)) {
    return PHASE_STATUS_VALUES.BLOCKED;
  }

  if (/archived|archive|retired|inactive/.test(lowerInput)) {
    return PHASE_STATUS_VALUES.ARCHIVED;
  }

  // Default fallback
  return PHASE_STATUS_VALUES.DEFAULT;
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
