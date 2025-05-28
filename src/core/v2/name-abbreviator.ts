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
  'authentication': 'auth',
  'authorization': 'authz',
  'administrator': 'admin',
  'administration': 'admin',
  'application': 'app',
  'applications': 'apps',
  'configuration': 'config',
  'configurations': 'configs',
  'database': 'db',
  'databases': 'dbs',
  'development': 'dev',
  'documentation': 'docs',
  'document': 'doc',
  'documents': 'docs',
  'environment': 'env',
  'environments': 'envs',
  'implementation': 'impl',
  'implementations': 'impls',
  'infrastructure': 'infra',
  'integration': 'intg',
  'integrations': 'intgs',
  'kubernetes': 'k8s',
  'management': 'mgmt',
  'manager': 'mgr',
  'performance': 'perf',
  'production': 'prod',
  'repository': 'repo',
  'repositories': 'repos',
  'security': 'sec',
  'deployment': 'deploy',
  'deployments': 'deploys',
  
  // Common UI/UX terms
  'interface': 'ui',
  'user-interface': 'ui',
  'experience': 'ux',
  'user-experience': 'ux',
  'component': 'comp',
  'components': 'comps',
  'navigation': 'nav',
  'dashboard': 'dash',
  'notification': 'notif',
  'notifications': 'notifs',
  
  // API related
  'application-programming-interface': 'api',
  'representational-state-transfer': 'rest',
  'javascript-object-notation': 'json',
  'extensible-markup-language': 'xml',
  
  // Common actions
  'initialize': 'init',
  'generate': 'gen',
  'validate': 'val',
  'validation': 'val',
  'calculate': 'calc',
  'calculation': 'calc',
  'synchronize': 'sync',
  'synchronization': 'sync',
  'optimize': 'opt',
  'optimization': 'opt',
  
  // Common suffixes/patterns
  'service': 'svc',
  'services': 'svcs',
  'utility': 'util',
  'utilities': 'utils',
  'function': 'fn',
  'functions': 'fns',
  'parameter': 'param',
  'parameters': 'params',
  'message': 'msg',
  'messages': 'msgs',
  'request': 'req',
  'response': 'res',
  'temporary': 'tmp',
  'directory': 'dir',
  'directories': 'dirs'
};

/**
 * Known acronyms that should be detected from hyphenated phrases
 */
const KNOWN_ACRONYMS: Set<string> = new Set([
  'api', 'ui', 'ux', 'db', 'id', 'url', 'uri', 'http', 'https',
  'sql', 'nosql', 'css', 'html', 'xml', 'json', 'jwt', 'oauth',
  'sso', 'ci', 'cd', 'cli', 'gui', 'os', 'io', 'cpu', 'gpu',
  'ram', 'ssd', 'hdd', 'vm', 'vpc', 'cdn', 'dns', 'tcp', 'udp',
  'ip', 'ftp', 'ssh', 'ssl', 'tls', 'md', 'pdf', 'csv', 'rtf'
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
  
  // Default: truncate to 6 chars
  return word.slice(0, 6);
}

/**
 * Check if a hyphenated phrase forms a known acronym
 */
function tryAcronym(phrase: string): string | null {
  const words = phrase.split('-');
  if (words.length < 2 || words.length > 4) {
    return null;
  }
  
  const acronym = words.map(w => w[0]).join('').toLowerCase();
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
 * Main function to intelligently abbreviate a task name
 * @param title The full task title
 * @param maxLength Maximum length for the result (default 30)
 * @returns Abbreviated name suitable for task IDs
 */
export function abbreviateTaskName(title: string, maxLength: number = 30): string {
  // Clean and prepare the title
  const cleaned = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens
  
  // If already short enough, return as-is
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  
  // Try full phrase acronym first
  const fullAcronym = tryAcronym(cleaned);
  if (fullAcronym && fullAcronym.length <= maxLength) {
    return fullAcronym;
  }
  
  // Split into words and process each
  const words = cleaned.split('-');
  const abbreviated = words.map(word => {
    // Check if this word + neighbors form an acronym
    const wordIndex = words.indexOf(word);
    if (wordIndex < words.length - 1) {
      const phrase = words.slice(wordIndex, wordIndex + 2).join('-');
      const acronym = tryAcronym(phrase);
      if (acronym) {
        // Mark next word as processed
        words[wordIndex + 1] = '';
        return acronym;
      }
    }
    
    // Skip if already processed
    if (word === '') return '';
    
    // Abbreviate individual word
    return abbreviateWord(word);
  }).filter(w => w !== ''); // Remove empty entries
  
  // Join abbreviated words
  let result = abbreviated.join('-');
  
  // If still too long, progressively shorten
  if (result.length > maxLength) {
    // Try removing less important words (usually middle ones)
    const essential = [abbreviated[0], abbreviated[abbreviated.length - 1]].filter(Boolean);
    const middle = abbreviated.slice(1, -1);
    
    // Keep first and last, abbreviate middle more aggressively
    result = essential[0] || '';
    for (const word of middle) {
      const shortened = word.slice(0, 3);
      if (result.length + shortened.length + 1 < maxLength) {
        result += '-' + shortened;
      }
    }
    if (essential[1] && result.length + essential[1].length + 1 <= maxLength) {
      result += '-' + essential[1];
    }
  }
  
  // Final truncation if needed
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
    { original: 'implement user authentication', abbreviated: abbreviateTaskName('implement user authentication') },
    { original: 'fix database connection bug', abbreviated: abbreviateTaskName('fix database connection bug') },
    { original: 'update user interface components', abbreviated: abbreviateTaskName('update user interface components') },
    { original: 'configure deployment pipeline', abbreviated: abbreviateTaskName('configure deployment pipeline') },
    { original: 'add application programming interface endpoints', abbreviated: abbreviateTaskName('add application programming interface endpoints') },
    { original: 'optimize performance metrics', abbreviated: abbreviateTaskName('optimize performance metrics') },
    { original: 'implement oauth authentication with google', abbreviated: abbreviateTaskName('implement oauth authentication with google') },
    { original: 'setup continuous integration continuous deployment', abbreviated: abbreviateTaskName('setup continuous integration continuous deployment') },
  ];
}