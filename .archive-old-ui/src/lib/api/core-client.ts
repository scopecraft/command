// Browser-compatible API client for React UI
import type {
  Area,
  Feature,
  OperationResult,
  Phase,
  Task,
  TaskListFilter,
  Template,
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
      if (filter.feature) params.append('feature', filter.feature);
      if (filter.area) params.append('area', filter.area);
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
        message: result.message || result.error || 'Failed to fetch tasks',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during task fetch',
      error: error instanceof Error ? error : new Error('Unknown error during task fetch'),
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
        message: result.message || result.error || `Task with ID ${id} not found`,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : `Unknown error fetching task ${id}`,
      error: error instanceof Error ? error : new Error(`Unknown error fetching task ${id}`),
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
          'Content-Type': 'application/json',
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
            tags: task.tags,
          },
          content: task.content,
        }),
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
          'Content-Type': 'application/json',
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
          content: task.content,
        }),
      });
    }

    if (!response.ok) {
      throw new Error(`Failed to save task: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || 'Failed to save task',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error saving task',
      error: error instanceof Error ? error : new Error('Unknown error saving task'),
    };
  }
}

/**
 * Remove a task by ID
 */
export async function removeTask(id: string): Promise<OperationResult<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || result.error || `Failed to delete task ${id}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : `Unknown error deleting task ${id}`,
      error: error instanceof Error ? error : new Error(`Unknown error deleting task ${id}`),
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
        message: result.message || result.error || 'Failed to fetch phases',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during phase fetch',
      error: error instanceof Error ? error : new Error('Unknown error during phase fetch'),
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
        message: result.message || 'Failed to fetch phases',
      };
    }

    // Find the phase by ID
    const phase = result.data.find((p) => p.id === id);

    if (!phase) {
      return {
        success: false,
        message: `Phase with ID ${id} not found`,
      };
    }

    return {
      success: true,
      data: phase,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : `Unknown error fetching phase ${id}`,
      error: error instanceof Error ? error : new Error(`Unknown error fetching phase ${id}`),
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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: phase.id,
        name: phase.name,
        description: phase.description,
        status: phase.status,
        order: phase.order,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save phase: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || 'Failed to save phase',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error saving phase',
      error: error instanceof Error ? error : new Error('Unknown error saving phase'),
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
        message: result.message || result.error || 'Failed to fetch next task',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error fetching next task',
      error: error instanceof Error ? error : new Error('Unknown error fetching next task'),
    };
  }
}

/**
 * Mark a task as complete and get the next task
 */
export async function completeAndGetNext(
  id: string
): Promise<OperationResult<{ updated: Task; next: Task | null }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/workflow/mark-complete-next`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error(`Failed to complete task: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || `Failed to complete task ${id}`,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : `Unknown error completing task ${id}`,
      error: error instanceof Error ? error : new Error(`Unknown error completing task ${id}`),
    };
  }
}

/**
 * Parse task content from Markdown with TOML frontmatter
 * This function must be implemented on the server-side since it uses Node.js libraries
 * We'll skip this in the client implementation
 */
export async function parseTaskContent(
  _content: string
): Promise<OperationResult<{ metadata: Record<string, any>; content: string }>> {
  return {
    success: false,
    message: 'parseTaskContent is not implemented in browser client - use server API instead',
  };
}

/**
 * Format task content to Markdown with TOML frontmatter
 * This function must be implemented on the server-side since it uses Node.js libraries
 * We'll skip this in the client implementation
 */
export async function formatTaskContent(
  _metadata: Record<string, any>,
  _content: string
): Promise<OperationResult<string>> {
  return {
    success: false,
    message: 'formatTaskContent is not implemented in browser client - use server API instead',
  };
}

/**
 * Fetch templates is not directly supported by the current API
 * This would need a new endpoint to be added
 */
export async function fetchTemplates(): Promise<OperationResult<Template[]>> {
  return {
    success: false,
    message: 'Template fetching is not implemented in the API yet',
  };
}

/**
 * Fetch all features from the API
 */
export async function fetchFeatures(
  phase?: string,
  includeProgress = true,
  includeTasks = false
): Promise<OperationResult<Feature[]>> {
  try {
    // Build query parameters
    const params = new URLSearchParams();

    if (phase) {
      params.append('phase', phase);
    }

    params.append('include_progress', includeProgress.toString());
    params.append('include_tasks', includeTasks.toString());

    const response = await fetch(`${API_BASE_URL}/features?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch features: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || 'Failed to fetch features',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during feature fetch',
      error: error instanceof Error ? error : new Error('Unknown error during feature fetch'),
    };
  }
}

/**
 * Fetch a single feature by ID
 */
export async function fetchFeature(id: string, phase?: string): Promise<OperationResult<Feature>> {
  try {
    const params = new URLSearchParams();
    if (phase) {
      params.append('phase', phase);
    }

    const response = await fetch(`${API_BASE_URL}/features/${encodeURIComponent(id)}?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch feature: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || `Feature with ID ${id} not found`,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : `Unknown error fetching feature ${id}`,
      error: error instanceof Error ? error : new Error(`Unknown error fetching feature ${id}`),
    };
  }
}

/**
 * Create or update a feature
 */
export async function saveFeature(feature: Feature): Promise<OperationResult<Feature>> {
  try {
    const isNew = !feature.id.startsWith('FEATURE_');

    // Build the request body
    const requestBody = {
      name: feature.name,
      title: feature.title,
      description: feature.description,
      phase: feature.phase,
      status: feature.status,
      tags: feature.tags,
      assignee: feature.assigned_to,
    };

    let response;

    if (isNew) {
      // Create new feature
      response = await fetch(`${API_BASE_URL}/features`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    } else {
      // Update existing feature
      response = await fetch(`${API_BASE_URL}/features/${encodeURIComponent(feature.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: requestBody,
        }),
      });
    }

    if (!response.ok) {
      throw new Error(`Failed to save feature: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || 'Failed to save feature',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error saving feature',
      error: error instanceof Error ? error : new Error('Unknown error saving feature'),
    };
  }
}

/**
 * Delete a feature by ID
 */
export async function removeFeature(id: string, force = false): Promise<OperationResult<void>> {
  try {
    const params = new URLSearchParams();
    if (force) {
      params.append('force', 'true');
    }

    const response = await fetch(`${API_BASE_URL}/features/${encodeURIComponent(id)}?${params}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete feature: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || result.error || `Failed to delete feature ${id}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : `Unknown error deleting feature ${id}`,
      error: error instanceof Error ? error : new Error(`Unknown error deleting feature ${id}`),
    };
  }
}

/**
 * Fetch all areas from the API
 */
export async function fetchAreas(
  phase?: string,
  includeProgress = true,
  includeTasks = false
): Promise<OperationResult<Area[]>> {
  try {
    // Build query parameters
    const params = new URLSearchParams();

    if (phase) {
      params.append('phase', phase);
    }

    params.append('include_progress', includeProgress.toString());
    params.append('include_tasks', includeTasks.toString());

    const response = await fetch(`${API_BASE_URL}/areas?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch areas: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || 'Failed to fetch areas',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during area fetch',
      error: error instanceof Error ? error : new Error('Unknown error during area fetch'),
    };
  }
}

/**
 * Fetch a single area by ID
 */
export async function fetchArea(id: string, phase?: string): Promise<OperationResult<Area>> {
  try {
    const params = new URLSearchParams();
    if (phase) {
      params.append('phase', phase);
    }

    const response = await fetch(`${API_BASE_URL}/areas/${encodeURIComponent(id)}?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch area: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || `Area with ID ${id} not found`,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : `Unknown error fetching area ${id}`,
      error: error instanceof Error ? error : new Error(`Unknown error fetching area ${id}`),
    };
  }
}

/**
 * Create or update an area
 */
export async function saveArea(area: Area): Promise<OperationResult<Area>> {
  try {
    const isNew = !area.id.startsWith('AREA_');

    // Build the request body
    const requestBody = {
      name: area.name,
      title: area.title,
      description: area.description,
      phase: area.phase,
      status: area.status,
      tags: area.tags,
      assignee: area.assigned_to,
    };

    let response;

    if (isNew) {
      // Create new area
      response = await fetch(`${API_BASE_URL}/areas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    } else {
      // Update existing area
      response = await fetch(`${API_BASE_URL}/areas/${encodeURIComponent(area.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: requestBody,
        }),
      });
    }

    if (!response.ok) {
      throw new Error(`Failed to save area: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || 'Failed to save area',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error saving area',
      error: error instanceof Error ? error : new Error('Unknown error saving area'),
    };
  }
}

/**
 * Delete an area by ID
 */
export async function removeArea(id: string, force = false): Promise<OperationResult<void>> {
  try {
    const params = new URLSearchParams();
    if (force) {
      params.append('force', 'true');
    }

    const response = await fetch(`${API_BASE_URL}/areas/${encodeURIComponent(id)}?${params}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete area: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        message: result.message || result.error || `Failed to delete area ${id}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : `Unknown error deleting area ${id}`,
      error: error instanceof Error ? error : new Error(`Unknown error deleting area ${id}`),
    };
  }
}

/**
 * Move a task to a different feature or area
 */
export async function moveTask(
  taskId: string,
  options: {
    targetFeature?: string;
    targetArea?: string;
    targetPhase?: string;
  }
): Promise<OperationResult<Task>> {
  try {
    // Determine the target subdirectory
    let targetSubdirectory = '';
    if (options.targetFeature) {
      targetSubdirectory = `FEATURE_${options.targetFeature}`;
    } else if (options.targetArea) {
      targetSubdirectory = `AREA_${options.targetArea}`;
    }

    // Build request body
    const requestBody = {
      id: taskId,
      target_subdirectory: targetSubdirectory,
    };

    // Add target phase if specified
    if (options.targetPhase) {
      requestBody.target_phase = options.targetPhase;
    }

    const response = await fetch(`${API_BASE_URL}/tasks/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Failed to move task: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || result.error || 'Failed to move task',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error moving task',
      error: error instanceof Error ? error : new Error('Unknown error moving task'),
    };
  }
}
