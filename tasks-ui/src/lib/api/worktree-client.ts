import type { OperationResult } from '../types';
import type { Worktree, WorktreeDashboardConfig, WorktreeSummary } from '../types/worktree';
import { MOCK_WORKTREES } from '../types/worktree';

const API_BASE_URL = '/api';

/**
 * Fetch all active worktrees for the current project
 */
export async function fetchWorktrees(): Promise<OperationResult<Worktree[]>> {
  try {
    // For initial implementation, use mock data
    // In a real implementation, we would call the API
    /*
    const response = await fetch(`${API_BASE_URL}/worktrees`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch worktrees: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || 'Failed to fetch worktrees',
      };
    }

    return {
      success: true,
      data: result.data,
    };
    */

    // Return mock data for development
    return {
      success: true,
      data: MOCK_WORKTREES,
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
    // For initial implementation, use mock data
    // In a real implementation, we would call the API
    /*
    const response = await fetch(`${API_BASE_URL}/worktrees?path=${encodeURIComponent(path)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch worktree: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || `Worktree with path ${path} not found`,
      };
    }
    
    return {
      success: true,
      data: result.data,
    };
    */

    // Return mock data for development
    const worktree = MOCK_WORKTREES.find((w) => w.path === path);
    
    if (!worktree) {
      return {
        success: false,
        message: `Worktree with path ${path} not found`,
      };
    }
    
    return {
      success: true,
      data: worktree,
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
    // Fetch all worktrees first
    const result = await fetchWorktrees();
    
    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || 'Failed to fetch worktrees for summary',
      };
    }
    
    // Calculate summary counts
    const worktrees = result.data;
    const summary: WorktreeSummary = {
      total: worktrees.length,
      clean: 0,
      modified: 0,
      untracked: 0,
      conflict: 0,
      unknown: 0,
    };
    
    // Count by status
    worktrees.forEach((worktree) => {
      switch (worktree.status) {
        case 'clean':
          summary.clean++;
          break;
        case 'modified':
          summary.modified++;
          break;
        case 'untracked':
          summary.untracked++;
          break;
        case 'conflict':
          summary.conflict++;
          break;
        default:
          summary.unknown++;
          break;
      }
    });
    
    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error calculating worktree summary',
      error: error instanceof Error ? error : new Error('Unknown error calculating worktree summary'),
    };
  }
}

/**
 * Get or update dashboard configuration
 */
export async function getDashboardConfig(): Promise<OperationResult<WorktreeDashboardConfig>> {
  // Use local storage for configuration in the UI
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
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error getting dashboard config',
      error: error instanceof Error ? error : new Error('Unknown error getting dashboard config'),
    };
  }
}

/**
 * Save dashboard configuration
 */
export async function saveDashboardConfig(
  config: WorktreeDashboardConfig
): Promise<OperationResult<WorktreeDashboardConfig>> {
  try {
    // Save to local storage
    localStorage.setItem('worktree-dashboard-config', JSON.stringify(config));
    
    return {
      success: true,
      data: config,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error saving dashboard config',
      error: error instanceof Error ? error : new Error('Unknown error saving dashboard config'),
    };
  }
}