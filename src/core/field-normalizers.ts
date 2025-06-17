/**
 * Field normalization utilities
 *
 * This module provides functions to normalize field values for tasks and phases.
 * It allows for more flexible input formats while ensuring standardized storage.
 *
 * Uses schema-driven normalization with alias support for maximum flexibility.
 */

import { buildNormalizerMap, createNormalizer } from './metadata/normalizer-builder.js';
import {
  getPhaseValues,
  getPriorityEmoji,
  getPriorityLabel,
  getPriorityName,
  getPriorityValues,
  getStatusEmoji,
  getStatusLabel,
  getStatusName,
  getStatusValues,
  getTypeLabel,
  getTypeName,
  getTypeValues,
  getWorkflowStateValues,
} from './metadata/schema-service.js';

/**
 * Lazy-loaded normalizer maps built from schema
 * These are created once on first use for optimal performance
 */
let priorityNormalizer: Map<string, string> | null = null;
let typeNormalizer: Map<string, string> | null = null;
let statusNormalizer: Map<string, string> | null = null;
let workflowStateNormalizer: Map<string, string> | null = null;
let phaseNormalizer: Map<string, string> | null = null;

/**
 * Priority order for sorting (highest to lowest)
 * TODO: This should also come from schema eventually
 */
export const PRIORITY_ORDER: Record<string, number> = {
  highest: 4,
  high: 3,
  medium: 2,
  low: 1,
  '': 0,
};

/**
 * Normalizes priority values to standard format
 *
 * Accepts various input formats based on schema aliases:
 * - Canonical names: "highest", "high", "medium", "low"
 * - Labels: "Highest", "High", "Medium", "Low"
 * - Emojis: "🔥", "🔼", "▶️", "🔽"
 * - Aliases: "critical", "urgent", "important", "normal", "minor", etc.
 *
 * @param input Priority value to normalize
 * @returns Standardized priority value (canonical name)
 */
export function normalizePriority(input: string | undefined | null): string {
  // Build normalizer map on first use
  if (!priorityNormalizer) {
    const priorityValues = getPriorityValues();
    priorityNormalizer = buildNormalizerMap(priorityValues);
  }

  // Use the schema-driven normalizer
  const priorityValues = getPriorityValues();
  const validOptions = priorityValues.map((p) => p.name);
  const normalizer = createNormalizer(priorityNormalizer, validOptions, 'medium', 'priority');

  return normalizer(input);
}

/**
 * Normalizes task type values to standard format
 *
 * Accepts various input formats based on schema aliases:
 * - Canonical names: "feature", "bug", "chore", etc.
 * - Labels: "Feature", "Bug", "Chore", etc.
 * - Emojis: "🌟", "🐛", "🔧", etc.
 * - Aliases: "feat", "fix", "docs", "test", "research", etc.
 *
 * @param input Type value to normalize
 * @returns Standardized type value (canonical name)
 */
export function normalizeTaskType(input: string | undefined | null): string {
  // Build normalizer map on first use
  if (!typeNormalizer) {
    const typeValues = getTypeValues();
    typeNormalizer = buildNormalizerMap(typeValues);
  }

  // Use the schema-driven normalizer
  const typeValues = getTypeValues();
  const validOptions = typeValues.map((t) => t.name);
  const normalizer = createNormalizer(typeNormalizer, validOptions, 'chore', 'task type');

  return normalizer(input);
}

/**
 * Normalizes task status values to standard format
 *
 * Accepts various input formats based on schema aliases:
 * - Canonical names: "todo", "in_progress", "done", etc.
 * - Labels: "To Do", "In Progress", "Done", etc.
 * - Emojis: "🟡", "🔵", "🟢", etc.
 * - Aliases: "wip", "complete", "blocked", "new", etc.
 *
 * @param input Status value to normalize
 * @returns Standardized status value (canonical name)
 */
export function normalizeTaskStatus(input: string | undefined | null): string {
  // Build normalizer map on first use
  if (!statusNormalizer) {
    const statusValues = getStatusValues();
    statusNormalizer = buildNormalizerMap(statusValues);
  }

  // Use the schema-driven normalizer
  const statusValues = getStatusValues();
  const validOptions = statusValues.map((s) => s.name);
  const normalizer = createNormalizer(statusNormalizer, validOptions, 'todo', 'status');

  return normalizer(input);
}

/**
 * Normalizes workflow state values to standard format
 *
 * Accepts various input formats based on schema aliases:
 * - Canonical names: "backlog", "current", "archive"
 * - Labels: "Backlog", "Current", "Archive"
 * - Aliases: "todo", "active", "done", etc.
 *
 * @param input Workflow state value to normalize
 * @returns Standardized workflow state value (canonical name)
 */
export function normalizeWorkflowState(input: string | undefined | null): string {
  // Build normalizer map on first use
  if (!workflowStateNormalizer) {
    const workflowStateValues = getWorkflowStateValues();
    workflowStateNormalizer = buildNormalizerMap(workflowStateValues);
  }

  // Use the schema-driven normalizer
  const workflowStateValues = getWorkflowStateValues();
  const validOptions = workflowStateValues.map((w) => w.name);
  const normalizer = createNormalizer(
    workflowStateNormalizer,
    validOptions,
    'current',
    'workflow state'
  );

  return normalizer(input);
}

/**
 * Normalizes phase values to standard format
 *
 * Accepts various input formats based on schema aliases:
 * - Canonical names: "backlog", "active", "released"
 * - Labels: "Backlog", "Active", "Released"
 * - Emojis: "📋", "🚀", "✅"
 * - Aliases: "planning", "plan", "working", "done", "completed", etc.
 *
 * @param input Phase value to normalize
 * @returns Standardized phase value (canonical name)
 */
export function normalizePhase(input: string | undefined | null): string {
  // Build normalizer map on first use
  if (!phaseNormalizer) {
    const phaseValues = getPhaseValues();
    phaseNormalizer = buildNormalizerMap(phaseValues);
  }

  // Use the schema-driven normalizer
  const phaseValues = getPhaseValues();
  const validOptions = phaseValues.map((p) => p.name);
  const normalizer = createNormalizer(phaseNormalizer, validOptions, 'backlog', 'phase');

  return normalizer(input);
}

/**
 * Detects if a task is considered complete based on its status
 * Uses schema-driven normalization to handle all possible input formats
 *
 * @param status Task status value (any format)
 * @returns True if status indicates completion
 */
export function isCompletedTaskStatus(status: string | undefined | null): boolean {
  if (!status) return false;

  try {
    const normalizedStatus = normalizeTaskStatus(status);
    return normalizedStatus === 'done' || normalizedStatus === 'archived';
  } catch {
    // If normalization fails, fall back to simple check
    return false;
  }
}

/**
 * Gets the priority order value for a given priority
 * Used for sorting tasks by priority
 *
 * @param priority Priority value (any format)
 * @returns Numeric priority order (higher = more important)
 */
export function getPriorityOrder(priority: string | undefined | null): number {
  if (!priority) return 0;

  try {
    const normalizedPriority = normalizePriority(priority);
    return PRIORITY_ORDER[normalizedPriority] || 0;
  } catch {
    // If normalization fails, return lowest priority
    return 0;
  }
}
