import type { OperationResult } from '../types';
import type { Worktree, WorktreeDashboardConfig, WorktreeSummary } from '../types/worktree';
import { MOCK_WORKTREES } from '../types/worktree';

const API_BASE_URL = '/api';

/**
 * Fetch all active worktrees for the current project
 */
export async function fetchWorktrees(): Promise<OperationResult<Worktree[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/worktrees?taskInfo=true`);

    if (!response.ok) {
      throw new Error(`Failed to fetch worktrees: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error?.message || 'Failed to fetch worktrees',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during worktree fetch',
      error: error instanceof Error ? error : new Error('Unknown error during worktree fetch'),
    };
  }
}

/**
 * Fetch a single worktree by path
 */
export async function fetchWorktree(path: string): Promise<OperationResult<Worktree>> {
  try {
    const encodedPath = encodeURIComponent(path);
    const response = await fetch(`${API_BASE_URL}/worktrees/${encodedPath}?taskInfo=true`);

    if (!response.ok) {
      throw new Error(`Failed to fetch worktree: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error?.message || `Worktree with path ${path} not found`,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : `Unknown error fetching worktree ${path}`,
      error: error instanceof Error ? error : new Error(`Unknown error fetching worktree ${path}`),
    };
  }
}

/**
 * Get a summary of all worktrees (counts by status)
 */
export async function getWorktreeSummary(): Promise<OperationResult<WorktreeSummary>> {
  try {
    const response = await fetch(`${API_BASE_URL}/worktrees/summary`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch worktree summary: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error?.message || 'Failed to fetch worktree summary',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Unknown error calculating worktree summary',
      error:
        error instanceof Error ? error : new Error('Unknown error calculating worktree summary'),
    };
  }
}

/**
 * Get or update dashboard configuration
 */
export async function getDashboardConfig(): Promise<OperationResult<WorktreeDashboardConfig>> {
  try {
    const response = await fetch(`${API_BASE_URL}/worktrees/config`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch dashboard config: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error?.message || 'Failed to fetch dashboard config',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    // Fallback to local storage or default if server config fails
    try {
      const storedConfig = localStorage.getItem('worktree-dashboard-config');

      if (storedConfig) {
        return {
          success: true,
          data: JSON.parse(storedConfig),
        };
      }

      // Return default config
      return {
        success: true,
        data: {
          refreshInterval: 30000, // 30 seconds
          showTaskInfo: true,
        },
      };
    } catch (_storageError) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error getting dashboard config',
        error: error instanceof Error ? error : new Error('Unknown error getting dashboard config'),
      };
    }
  }
}

/**
 * Save dashboard configuration
 */
export async function saveDashboardConfig(
  config: WorktreeDashboardConfig
): Promise<OperationResult<WorktreeDashboardConfig>> {
  try {
    const response = await fetch(`${API_BASE_URL}/worktrees/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`Failed to save dashboard config: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error?.message || 'Failed to save dashboard config',
      };
    }

    // Also save to local storage as a backup
    localStorage.setItem('worktree-dashboard-config', JSON.stringify(config));

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    // Fallback to just local storage if API fails
    try {
      localStorage.setItem('worktree-dashboard-config', JSON.stringify(config));

      return {
        success: true,
        data: config,
        message: `Saved to local storage only (API error: ${error instanceof Error ? error.message : 'Unknown error'})`,
      };
    } catch (_storageError) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error saving dashboard config',
        error: error instanceof Error ? error : new Error('Unknown error saving dashboard config'),
      };
    }
  }
}
