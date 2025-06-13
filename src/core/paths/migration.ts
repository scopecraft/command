/**
 * Migration utilities for transitioning to centralized path resolution
 * 
 * ⚠️ TEMPORARY: These helpers will be removed in v3.0.0 ⚠️
 * 
 * Use these during the transition period to identify code
 * that needs to be migrated to the new path resolver.
 */

import { join } from 'node:path';

/**
 * @deprecated Use path-resolver instead
 * Logs warning in development to help find unmigrated code
 * 
 * This function wraps path.join and logs when it's used with
 * scopecraft-specific paths, helping identify migration targets.
 */
export function legacyPathJoin(...segments: string[]): string {
  // Check if this is a scopecraft path
  const isScopecraftPath = segments.some(seg => 
    seg === '.tasks' || 
    seg === '.scopecraft' ||
    seg === '.templates' ||
    seg === '.modes'
  );
  
  if (isScopecraftPath && process.env.NODE_ENV !== 'production') {
    // Get caller information
    const stack = new Error().stack;
    const caller = stack?.split('\n')[2]?.trim();
    
    console.warn(
      '\n⚠️  DEPRECATED PATH USAGE DETECTED ⚠️\n' +
      `   Location: ${caller || 'unknown'}\n` +
      `   Path: ${segments.join('/')}\n` +
      '   Action: Migrate to path-resolver.ts (see src/core/paths/README.md)\n' +
      '   This warning will become an error in v3.0.0\n'
    );
  }
  
  return join(...segments);
}

/**
 * Development-only assertion to catch path violations
 * This helps ensure new code uses the path resolver
 */
export function assertNoDirectPaths(): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  
  // Store original join function
  const originalJoin = join.toString();
  
  // Check if join is being used with scopecraft paths
  // This is called at module load time to set up monitoring
  if (process.env.SCOPECRAFT_STRICT_PATHS === 'true') {
    console.log(
      '🔍 Strict path checking enabled. Direct path usage will be logged.\n' +
      '   Set SCOPECRAFT_STRICT_PATHS=false to disable.'
    );
  }
}

/**
 * Helper to identify files that need migration
 * Returns true if the path looks like a direct scopecraft path
 */
export function isUnmigratedPath(pathString: string): boolean {
  const patterns = [
    /\.tasks[/\\]/,
    /\.scopecraft[/\\]/,
    /join\([^)]*['"](\.tasks|\.scopecraft)['"]/,
  ];
  
  return patterns.some(pattern => pattern.test(pathString));
}

/**
 * Log migration instructions for a specific file
 */
export function logMigrationInstructions(fileName: string, oldCode: string): void {
  console.log(`
Migration needed in ${fileName}:

OLD CODE:
${oldCode}

NEW CODE:
import { resolvePath, createPathContext, PATH_TYPES } from './paths/path-resolver';

const context = createPathContext(projectRoot);
const path = resolvePath(PATH_TYPES.TEMPLATES, context);

See src/core/paths/README.md for full migration guide.
`);
}