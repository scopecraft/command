/**
 * Name Abbreviation Utility
 *
 * Intelligently abbreviates task names using multiple strategies:
 * 1. Known abbreviations (e.g., authentication → auth)
 * 2. Acronym detection (e.g., user-interface → ui)
 * 3. Smart vowel removal for long words
 * 4. Preserves short words as-is
 */

/**
 * Common abbreviations dictionary
 * Add more as needed for your domain
 */
const COMMON_ABBREVIATIONS: Record<string, string> = {
  // Technical terms
  authentication: 'auth',
  authorization: 'authz',
  administrator: 'admin',
  administration: 'admin',
  application: 'app',
  applications: 'apps',
  configuration: 'config',
  configurations: 'configs',
  database: 'db',
  databases: 'dbs',
  development: 'dev',
  documentation: 'docs',
  document: 'doc',
  documents: 'docs',
  environment: 'env',
  environments: 'envs',
  implementation: 'impl',
  implementations: 'impls',
  infrastructure: 'infra',
  integration: 'intg',
  integrations: 'intgs',
  kubernetes: 'k8s',
  management: 'mgmt',
  manager: 'mgr',
  performance: 'perf',
  production: 'prod',
  repository: 'repo',
  repositories: 'repos',
  security: 'sec',
  deployment: 'deploy',
  deployments: 'deploys',

  // Common UI/UX terms
  interface: 'ui',
  'user-interface': 'ui',
  experience: 'ux',
  'user-experience': 'ux',
  component: 'comp',
  components: 'comps',
  navigation: 'nav',
  dashboard: 'dash',
  notification: 'notif',
  notifications: 'notifs',

  // API related
  'application-programming-interface': 'api',
  'representational-state-transfer': 'rest',
  'javascript-object-notation': 'json',
  'extensible-markup-language': 'xml',

  // Common actions
  initialize: 'init',
  generate: 'gen',
  validate: 'val',
  validation: 'val',
  calculate: 'calc',
  calculation: 'calc',
  synchronize: 'sync',
  synchronization: 'sync',
  optimize: 'opt',
  optimization: 'opt',
  implement: 'impl',
  implements: 'impl',
  redesign: 'reds',
  refactor: 'refc',
  create: 'cret',
  update: 'updt',
  improve: 'impr',
  template: 'temp',
  templates: 'temp',
  discovery: 'disc',
  editing: 'edit',
  autonomous: 'auto',

  // Common suffixes/patterns
  service: 'svc',
  services: 'svcs',
  utility: 'util',
  utilities: 'utils',
  function: 'fn',
  functions: 'fns',
  parameter: 'param',
  parameters: 'params',
  message: 'msg',
  messages: 'msgs',
  request: 'req',
  response: 'res',
  temporary: 'tmp',
  directory: 'dir',
  directories: 'dirs',
};

/**
 * Known acronyms that should be detected from hyphenated phrases
 */
const KNOWN_ACRONYMS: Set<string> = new Set([
  'api',
  'ui',
  'ux',
  'db',
  'id',
  'url',
  'uri',
  'http',
  'https',
  'sql',
  'nosql',
  'css',
  'html',
  'xml',
  'json',
  'jwt',
  'oauth',
  'sso',
  'ci',
  'cd',
  'cli',
  'gui',
  'os',
  'io',
  'cpu',
  'gpu',
  'ram',
  'ssd',
  'hdd',
  'vm',
  'vpc',
  'cdn',
  'dns',
  'tcp',
  'udp',
  'ip',
  'ftp',
  'ssh',
  'ssl',
  'tls',
  'md',
  'pdf',
  'csv',
  'rtf',
]);

/**
 * Abbreviate a single word using various strategies
 */
function abbreviateWord(word: string): string {
  // Don't abbreviate very short words
  if (word.length <= 4) {
    return word;
  }

  // Check common abbreviations first
  const lower = word.toLowerCase();
  if (COMMON_ABBREVIATIONS[lower]) {
    return COMMON_ABBREVIATIONS[lower];
  }

  // For longer words, intelligent vowel removal
  if (word.length > 8) {
    // Keep first letter, remove middle vowels, keep some end
    const first = word[0];
    const middle = word.slice(1, -2).replace(/[aeiou]/g, '');
    const end = word.slice(-2);
    const abbreviated = first + middle + end;

    // Ensure we actually shortened it
    if (abbreviated.length < word.length && abbreviated.length >= 3) {
      return abbreviated;
    }
  }

  // Default: smart truncation - keep first 3 + first consonant after
  const first3 = word.slice(0, 3);

  // Find first consonant after position 3
  for (let i = 3; i < word.length; i++) {
    const char = word[i];
    if (/[bcdfghjklmnpqrstvwxyz]/i.test(char)) {
      return first3 + char;
    }
  }

  // If no consonant found, just use first 4 chars
  return word.slice(0, 4);
}

/**
 * Check if a hyphenated phrase forms a known acronym
 */
function tryAcronym(phrase: string): string | null {
  const words = phrase.split('-');
  if (words.length < 2 || words.length > 4) {
    return null;
  }

  const acronym = words
    .map((w) => w[0])
    .join('')
    .toLowerCase();
  if (KNOWN_ACRONYMS.has(acronym)) {
    return acronym;
  }

  // Check if the phrase itself is a known abbreviation
  if (COMMON_ABBREVIATIONS[phrase]) {
    return COMMON_ABBREVIATIONS[phrase];
  }

  return null;
}

/**
 * Words to skip during ID generation (filler words)
 */
const FILLER_WORDS: Set<string> = new Set([
  'for',
  'with',
  'and',
  'the',
  'to',
  'in',
  'of',
  'at',
  'by',
  'from',
  'up',
  'on',
  'as',
  'is',
  'was',
  'are',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'must',
  'can',
  'into',
  'over',
  'under',
  'out',
  'off',
  'about',
  'all',
  'an',
  'any',
  'each',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'nor',
  'not',
  'only',
  'own',
  'same',
  'so',
  'than',
  'too',
  'very',
  'just',
  'now',
  'solution',
  'solutions',
  'support',
  'system',
  'systems',
]);

/**
 * Score words by importance for smart selection
 */
function scoreWordImportance(word: string, position: number): number {
  let score = 0;

  // First word gets highest priority
  if (position === 0) score += 5;

  // Core verbs/actions get very high scores
  const actionWords = new Set([
    'implement',
    'create',
    'build',
    'add',
    'remove',
    'fix',
    'update',
    'refactor',
    'design',
    'test',
    'deploy',
    'configure',
    'optimize',
    'migrate',
    'integrate',
    'setup',
    'install',
    'delete',
    'improve',
    'enhance',
    'develop',
    'redesign',
  ]);
  if (actionWords.has(word)) score += 6;

  // Core domain objects get high scores
  const coreWords = new Set([
    'task',
    'tasks',
    'user',
    'users',
    'auth',
    'api',
    'ui',
    'database',
    'security',
    'performance',
    'search',
    'document',
    'documents',
    'template',
    'templates',
    'workflow',
    'component',
    'interface',
    'data',
    'file',
    'files',
    'config',
    'server',
    'client',
    'admin',
    'dashboard',
    'report',
    'notification',
    'editing',
    'edit',
  ]);
  if (coreWords.has(word)) score += 4;

  // Technology/tool words
  const techWords = new Set([
    'git',
    'cli',
    'mcp',
    'api',
    'json',
    'xml',
    'html',
    'css',
    'js',
    'ts',
    'node',
    'npm',
    'docker',
    'kubernetes',
  ]);
  if (techWords.has(word)) score += 3;

  // Version numbers and qualifiers
  if (word.match(/v\d+|version/)) score += 2;

  // Nouns often end with common suffixes
  if (
    word.endsWith('tion') ||
    word.endsWith('sion') ||
    word.endsWith('ment') ||
    word.endsWith('ance') ||
    word.endsWith('ence') ||
    word.endsWith('ity') ||
    word.endsWith('ty')
  ) {
    score += 2;
  }

  // Penalize very generic words even if not in filler list
  const genericWords = new Set([
    'core',
    'new',
    'old',
    'main',
    'base',
    'basic',
    'simple',
    'complex',
    'general',
    'specific',
    'custom',
    'default',
    'standard',
    'common',
    'special',
  ]);
  if (genericWords.has(word)) score -= 1;

  // Longer words might be more specific/important
  if (word.length > 6) score += 1;

  return score;
}

/**
 * Select the most important words from a title
 */
function selectImportantWords(words: string[], maxWords = 4): string[] {
  // Filter out filler words first
  const meaningfulWords = words.filter((word) => !FILLER_WORDS.has(word.toLowerCase()));

  // If we already have few enough words, return them
  if (meaningfulWords.length <= maxWords) {
    return meaningfulWords;
  }

  // Score and sort words by importance
  const scoredWords = meaningfulWords.map((word, index) => ({
    word,
    score: scoreWordImportance(word.toLowerCase(), index),
    originalIndex: index,
  }));

  // Sort by score (descending), then by original position (ascending) for stability
  scoredWords.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.originalIndex - b.originalIndex;
  });

  // Take top words and sort back to original order
  const selectedWords = scoredWords
    .slice(0, maxWords)
    .sort((a, b) => a.originalIndex - b.originalIndex)
    .map((item) => item.word);

  return selectedWords;
}

/**
 * Abbreviate a word with preference for keeping it readable (4+ chars when possible)
 */
function abbreviateWordSmart(word: string): string {
  // Don't abbreviate short words
  if (word.length <= 4) {
    return word;
  }

  // Check common abbreviations first
  const lower = word.toLowerCase();
  if (COMMON_ABBREVIATIONS[lower]) {
    return COMMON_ABBREVIATIONS[lower];
  }

  // For words 5-7 chars, try to keep at 4+ chars
  if (word.length <= 7) {
    // Try intelligent truncation while keeping readability
    if (word.length === 5) return word.slice(0, 4);
    if (word.length === 6) return word.slice(0, 4);
    if (word.length === 7) return word.slice(0, 4);
  }

  // For longer words, use more aggressive abbreviation
  return abbreviateWord(word);
}

/**
 * Main function to intelligently abbreviate a task name
 * @param title The full task title
 * @param maxLength Maximum length for the result (default 30)
 * @returns Abbreviated name suitable for task IDs
 */
export function abbreviateTaskName(title: string, maxLength = 30): string {
  // Clean and prepare the title
  const cleaned = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // If already short enough, return as-is
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Try full phrase acronym first
  const fullAcronym = tryAcronym(cleaned);
  if (fullAcronym && fullAcronym.length <= maxLength) {
    return fullAcronym;
  }

  // Split into words
  const words = cleaned.split('-');

  // Select only the most important words (3-4 max)
  const selectedWords = selectImportantWords(words, 4);

  // Abbreviate selected words with preference for readability
  const abbreviated = selectedWords.map((word) => abbreviateWordSmart(word));

  // Join abbreviated words
  let result = abbreviated.join('-');

  // If still too long, try with more aggressive abbreviation
  if (result.length > maxLength) {
    // Reduce to 3 words max and abbreviate more aggressively
    const topWords = selectImportantWords(words, 3);
    const moreAbbreviated = topWords.map((word) => {
      if (word.length <= 4) return word;
      if (COMMON_ABBREVIATIONS[word.toLowerCase()]) {
        return COMMON_ABBREVIATIONS[word.toLowerCase()];
      }
      return word.slice(0, 4);
    });
    result = moreAbbreviated.join('-');
  }

  // Final truncation if still needed
  return result.slice(0, maxLength);
}

/**
 * Validate that an abbreviated name is reasonable
 * (not too short, has some vowels, etc.)
 */
export function isReasonableAbbreviation(abbreviated: string, original: string): boolean {
  // Must be at least 3 chars
  if (abbreviated.length < 3) {
    return false;
  }

  // Must be shorter than original (unless original was already short)
  if (original.length > 10 && abbreviated.length >= original.length) {
    return false;
  }

  // Should have at least one vowel or number
  if (!/[aeiou0-9]/i.test(abbreviated)) {
    return false;
  }

  return true;
}

/**
 * Get examples of how a title would be abbreviated
 * Useful for testing and debugging
 */
export function getAbbreviationExamples(): Array<{ original: string; abbreviated: string }> {
  return [
    {
      original: 'implement user authentication',
      abbreviated: abbreviateTaskName('implement user authentication'),
    },
    {
      original: 'fix database connection bug',
      abbreviated: abbreviateTaskName('fix database connection bug'),
    },
    {
      original: 'update user interface components',
      abbreviated: abbreviateTaskName('update user interface components'),
    },
    {
      original: 'configure deployment pipeline',
      abbreviated: abbreviateTaskName('configure deployment pipeline'),
    },
    {
      original: 'add application programming interface endpoints',
      abbreviated: abbreviateTaskName('add application programming interface endpoints'),
    },
    {
      original: 'optimize performance metrics',
      abbreviated: abbreviateTaskName('optimize performance metrics'),
    },
    {
      original: 'implement oauth authentication with google',
      abbreviated: abbreviateTaskName('implement oauth authentication with google'),
    },
    {
      original: 'setup continuous integration continuous deployment',
      abbreviated: abbreviateTaskName('setup continuous integration continuous deployment'),
    },
  ];
}
