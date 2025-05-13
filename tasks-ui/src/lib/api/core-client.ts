// Browser-compatible API client for React UI
import type { 
  OperationResult, 
  Task, 
  Phase, 
  Template, 
  TaskListFilter
} from '../types';

const API_BASE_URL = '/api';

/**
 * Fetch all tasks from the API
 */
export async function fetchTasks(filter?: TaskListFilter): Promise<OperationResult<Task[]>> {
  try {
    // Build query parameters from the filter
    const params = new URLSearchParams();
    if (filter) {
      if (filter.status) params.append('status', filter.status);
      if (filter.type) params.append('type', filter.type);
      if (filter.phase) params.append('phase', filter.phase);
      if (filter.assignedTo) params.append('assignee', filter.assignedTo);
      if (filter.subdirectory) params.append('subdirectory', filter.subdirectory);
      if (filter.tag) params.append('tags', filter.tag);
    }
    
    // Always include content and completed tasks for UI
    params.append('include_content', 'true');
    params.append('include_completed', 'true');
    
    const response = await fetch(`${API_BASE_URL}/tasks?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || 'Failed to fetch tasks'
      };
    }
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during task fetch',
      error: error instanceof Error ? error : new Error('Unknown error during task fetch')
    };
  }
}

/**
 * Fetch a single task by ID
 */
export async function fetchTask(id: string): Promise<OperationResult<Task>> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${encodeURIComponent(id)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch task: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || `Task with ID ${id} not found`
      };
    }
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : `Unknown error fetching task ${id}`,
      error: error instanceof Error ? error : new Error(`Unknown error fetching task ${id}`)
    };
  }
}

/**
 * Save a task (create or update)
 */
export async function saveTask(task: Task): Promise<OperationResult<Task>> {
  try {
    // Set current date for updates
    task.updated_date = new Date().toISOString().split('T')[0];
    
    let response;
    
    if (task.id) {
      // Update existing task
      response = await fetch(`${API_BASE_URL}/tasks/${encodeURIComponent(task.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metadata: {
            title: task.title,
            status: task.status,
            type: task.type,
            priority: task.priority,
            updated_date: task.updated_date,
            assigned_to: task.assigned_to,
            parent_task: task.parent_task,
            subtasks: task.subtasks,
            depends_on: task.depends_on,
            previous_task: task.previous_task,
            next_task: task.next_task,
            phase: task.phase,
            subdirectory: task.subdirectory,
            tags: task.tags
          },
          content: task.content
        })
      });
    } else {
      // Create new task
      // Ensure created_date is set
      if (!task.created_date) {
        task.created_date = new Date().toISOString().split('T')[0];
      }
      
      response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: task.title,
          type: task.type,
          status: task.status,
          priority: task.priority,
          created_date: task.created_date,
          updated_date: task.updated_date,
          assignee: task.assigned_to,
          parent: task.parent_task,
          depends: task.depends_on,
          previous: task.previous_task,
          next: task.next_task,
          phase: task.phase,
          subdirectory: task.subdirectory,
          tags: task.tags,
          content: task.content
        })
      });
    }
    
    if (!response.ok) {
      throw new Error(`Failed to save task: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || 'Failed to save task'
      };
    }
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error saving task',
      error: error instanceof Error ? error : new Error('Unknown error saving task')
    };
  }
}

/**
 * Remove a task by ID
 */
export async function removeTask(id: string): Promise<OperationResult<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      return {
        success: false,
        message: result.message || result.error || `Failed to delete task ${id}`
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : `Unknown error deleting task ${id}`,
      error: error instanceof Error ? error : new Error(`Unknown error deleting task ${id}`)
    };
  }
}

/**
 * Fetch all phases from the API
 */
export async function fetchPhases(): Promise<OperationResult<Phase[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/phases`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch phases: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || 'Failed to fetch phases'
      };
    }
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during phase fetch',
      error: error instanceof Error ? error : new Error('Unknown error during phase fetch')
    };
  }
}

/**
 * Fetch a single phase by ID
 */
export async function fetchPhase(id: string): Promise<OperationResult<Phase>> {
  try {
    // There's no direct /phases/:id endpoint, so we'll fetch all phases and filter
    const result = await fetchPhases();
    
    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || 'Failed to fetch phases'
      };
    }
    
    // Find the phase by ID
    const phase = result.data.find(p => p.id === id);
    
    if (!phase) {
      return {
        success: false,
        message: `Phase with ID ${id} not found`
      };
    }
    
    return {
      success: true,
      data: phase
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : `Unknown error fetching phase ${id}`,
      error: error instanceof Error ? error : new Error(`Unknown error fetching phase ${id}`)
    };
  }
}

/**
 * Save a phase (create or update)
 */
export async function savePhase(phase: Phase): Promise<OperationResult<Phase>> {
  try {
    // Create new phase - we don't have an update phase endpoint directly
    const response = await fetch(`${API_BASE_URL}/phases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: phase.id,
        name: phase.name,
        description: phase.description,
        status: phase.status,
        order: phase.order
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save phase: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || 'Failed to save phase'
      };
    }
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error saving phase',
      error: error instanceof Error ? error : new Error('Unknown error saving phase')
    };
  }
}

/**
 * Fetch the next task to work on
 */
export async function fetchNextTask(currentTaskId?: string): Promise<OperationResult<Task>> {
  try {
    const params = new URLSearchParams();
    if (currentTaskId) {
      params.append('id', currentTaskId);
    }
    
    const response = await fetch(`${API_BASE_URL}/tasks/next?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch next task: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || 'Failed to fetch next task'
      };
    }
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error fetching next task',
      error: error instanceof Error ? error : new Error('Unknown error fetching next task')
    };
  }
}

/**
 * Mark a task as complete and get the next task
 */
export async function completeAndGetNext(id: string): Promise<OperationResult<{updated: Task, next: Task | null}>> {
  try {
    const response = await fetch(`${API_BASE_URL}/workflow/mark-complete-next`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to complete task: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || `Failed to complete task ${id}`
      };
    }
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : `Unknown error completing task ${id}`,
      error: error instanceof Error ? error : new Error(`Unknown error completing task ${id}`)
    };
  }
}

/**
 * Parse task content from Markdown with TOML frontmatter
 * This function must be implemented on the server-side since it uses Node.js libraries
 * We'll skip this in the client implementation
 */
export async function parseTaskContent(content: string): Promise<OperationResult<{ metadata: Record<string, any>; content: string }>> {
  return {
    success: false,
    message: 'parseTaskContent is not implemented in browser client - use server API instead'
  };
}

/**
 * Format task content to Markdown with TOML frontmatter
 * This function must be implemented on the server-side since it uses Node.js libraries
 * We'll skip this in the client implementation
 */
export async function formatTaskContent(metadata: Record<string, any>, content: string): Promise<OperationResult<string>> {
  return {
    success: false,
    message: 'formatTaskContent is not implemented in browser client - use server API instead'
  };
}

/**
 * Fetch templates is not directly supported by the current API
 * This would need a new endpoint to be added
 */
export async function fetchTemplates(): Promise<OperationResult<Template[]>> {
  return {
    success: false,
    message: 'Template fetching is not implemented in the API yet'
  };
}