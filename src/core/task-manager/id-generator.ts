/**
 * ID Generator for concise task identifiers
 * Format: {TYPE}-{CONTEXT}-{MMDD}-{XX}
 */

import { randomBytes } from 'node:crypto';

/**
 * Task type to ID prefix mapping
 */
export const TASK_TYPE_MAPPING: Record<string, string> = {
  '🚀 Implementation': 'FEAT',
  '🐛 Bug': 'BUG',
  '🔨 Chore': 'CHORE',
  '📚 Documentation': 'DOC',
  '🧪 Test': 'TEST',
  '⚡ Performance': 'PERF',
  '🔒 Security': 'SEC',
  '🎨 Style': 'STYLE',
  '🔧 Config': 'CONFIG',
  '♻️ Refactor': 'REFACT',
  '💡 Spike': 'SPIKE',
  '✨ Feature': 'FEAT',
  '🛠 Maintenance': 'MAINT',
  '🔬 Research': 'RESEARCH',
};

/**
 * Default stop words to ignore when extracting context
 */
export const DEFAULT_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'been',
  'by',
  'for',
  'from',
  'had',
  'has',
  'have',
  'he',
  'her',
  'him',
  'his',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'just',
  'me',
  'my',
  'of',
  'on',
  'or',
  'our',
  'out',
  'over',
  'she',
  'so',
  'some',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'up',
  'very',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'who',
  'will',
  'with',
  'you',
  'your',
]);

/**
 * Characters to use for random suffix (excludes confusing characters)
 */
const SUFFIX_CHARS = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Options for ID generation
 */
export interface GenerateIdOptions {
  type?: string;
  title?: string;
  customStopWords?: Set<string>;
  maxContextLength?: number;
  today?: Date;
}

/**
 * Extract meaningful context words from a title
 * @param title The task title
 * @param stopWords Stop words to exclude
 * @param maxWords Maximum number of words to include
 * @returns Context string
 */
export function extractContext(
  title: string,
  stopWords: Set<string> = DEFAULT_STOP_WORDS,
  maxWords = 2
): string {
  if (!title) return '';

  // Split title into words after cleaning up
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars completely
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .filter((word) => !stopWords.has(word));

  // Take the first N meaningful words
  const contextWords = words.slice(0, maxWords);

  // Join without dashes, uppercase
  return contextWords.join('').toUpperCase();
}

/**
 * Generate a random alphanumeric suffix
 * @returns Two-character alphanumeric string
 */
export function generateRandomSuffix(): string {
  const bytes = randomBytes(2);
  const chars: string[] = [];

  for (const byte of bytes) {
    chars.push(SUFFIX_CHARS[byte % SUFFIX_CHARS.length]);
  }

  return chars.join('');
}

/**
 * Get task type prefix from task type string
 * @param type Task type string (e.g., "🚀 Implementation")
 * @returns Type prefix (e.g., "FEAT")
 */
export function getTypePrefix(type: string): string {
  if (!type) return 'TASK';

  // Check direct mapping
  if (TASK_TYPE_MAPPING[type]) {
    return TASK_TYPE_MAPPING[type];
  }

  // Check if type contains any of the known type names (partial match)
  const lowercaseType = type.toLowerCase();
  for (const [key, value] of Object.entries(TASK_TYPE_MAPPING)) {
    const typeName = key
      .replace(/[^a-zA-Z\s]/g, '')
      .trim()
      .toLowerCase();
    if (lowercaseType.includes(typeName)) {
      return value;
    }
  }

  // Default fallback
  return 'TASK';
}

/**
 * Generate a concise task ID
 * @param options ID generation options
 * @returns Generated task ID
 */
export function generateTaskId(options: GenerateIdOptions = {}): string {
  const {
    type = '',
    title = '',
    customStopWords,
    maxContextLength = 2,
    today = new Date(),
  } = options;

  // Get type prefix
  const typePrefix = getTypePrefix(type);

  // Extract context from title
  const context = extractContext(title, customStopWords || DEFAULT_STOP_WORDS, maxContextLength);

  // Format date as MMDD
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const dateStr = `${month}${day}`;

  // Generate random suffix
  const suffix = generateRandomSuffix();

  // Build the ID
  const parts = [typePrefix];

  if (context) {
    parts.push(context);
  }

  parts.push(dateStr);
  parts.push(suffix);

  return parts.join('-');
}

/**
 * Validate a task ID format
 * @param id Task ID to validate
 * @returns True if valid, false otherwise
 */
export function validateTaskId(id: string): boolean {
  if (!id) return false;

  // Check against new format: TYPE-CONTEXT-MMDD-XX or TYPE-MMDD-XX
  // TYPE is 1+ uppercase letters
  // CONTEXT is 1+ uppercase letters (optional)
  // MMDD is exactly 4 digits
  // XX is exactly 2 alphanumeric characters
  const newFormatWithContext = /^[A-Z]+-[A-Z]+-\d{4}-[A-Z0-9]{2}$/;
  const newFormatNoContext = /^[A-Z]+-\d{4}-[A-Z0-9]{2}$/;

  if (newFormatWithContext.test(id) || newFormatNoContext.test(id)) {
    return true;
  }

  // Also accept old timestamp format for backwards compatibility
  const oldFormatRegex = /^TASK-\d{8}T\d{6}$/;
  return oldFormatRegex.test(id);
}
