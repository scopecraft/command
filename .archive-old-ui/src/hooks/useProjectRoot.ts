import { useCallback } from 'react';
import { useLocation, useParams } from 'wouter';

/**
 * Hook to manage project root from route parameters
 * Enables switching between different git worktrees without restarting the server
 */
export function useProjectRoot() {
  const params = useParams();
  const [, navigate] = useLocation();

  // Get rootId from params or null if not present
  const rootId = params?.rootId || null;

  /**
   * Switch to a different project root while maintaining the current path
   * @param newRootId The ID of the project root to switch to, or null for default
   */
  const switchProjectRoot = useCallback(
    (newRootId: string | null) => {
      // Get the current path without the rootId segment
      const currentPath = window.location.pathname;
      // Extract the path without the rootId segment
      const pathWithoutRoot = currentPath.replace(/^\/[^\/]+/, '');

      if (newRootId) {
        // Navigate to same path but with new rootId
        navigate(`/${newRootId}${pathWithoutRoot}`);
      } else {
        // Navigate to default path without rootId
        navigate(pathWithoutRoot || '/');
      }
    },
    [navigate]
  );

  /**
   * Generate a URL that preserves the current project root
   * @param path The path to navigate to
   * @returns The path with current rootId prefixed if available
   */
  const getProjectRootUrl = useCallback(
    (path: string) => {
      if (!rootId) return path;

      // Strip any leading root ID from the path to avoid duplication
      const cleanPath = path.replace(/^\/[^\/]+/, '');
      // Ensure path starts with a slash
      const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

      return `/${rootId}${normalizedPath}`;
    },
    [rootId]
  );

  return {
    rootId,
    switchProjectRoot,
    getProjectRootUrl,
  };
}
