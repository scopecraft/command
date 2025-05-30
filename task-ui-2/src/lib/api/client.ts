/**
 * API client for V2 MCP endpoints
 */

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

class ApiClient {
  private baseUrl = '/api';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Task endpoints
  async getTasks(
    params: {
      task_type?: string;
      location?: string | string[];
      status?: string;
      priority?: string;
      area?: string;
      assignee?: string;
      tags?: string[];
      include_content?: boolean;
      include_completed?: boolean;
      include_parent_tasks?: boolean;
      parent_id?: string;
    } = {}
  ) {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          for (const v of value) {
            searchParams.append(key, v);
          }
        } else {
          searchParams.append(key, String(value));
        }
      }
    }

    return this.request(`/tasks?${searchParams}`);
  }

  async getTask(id: string, parentId?: string) {
    const params = new URLSearchParams();
    if (parentId) params.append('parent_id', parentId);
    params.append('format', 'full'); // Always get full content for task details

    return this.request(`/tasks/${id}?${params}`);
  }

  async createTask(params: {
    title: string;
    type: string;
    location?: string;
    parent_id?: string;
    priority?: string;
    status?: string;
    area?: string;
    assignee?: string;
    tags?: string[];
  }) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async updateTask(
    id: string,
    updates: {
      title?: string;
      status?: string;
      priority?: string;
      area?: string;
      assignee?: string;
      tags?: string[];
      instruction?: string;
      tasks?: string;
      deliverable?: string;
      add_log_entry?: string;
      content?: string; // Full markdown content
    },
    parentId?: string
  ) {
    const params = new URLSearchParams();
    if (parentId) params.append('parent_id', parentId);

    return this.request(`/tasks/${id}?${params}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id: string, cascade = false) {
    const params = new URLSearchParams();
    if (cascade) params.append('cascade', 'true');

    return this.request(`/tasks/${id}?${params}`, {
      method: 'DELETE',
    });
  }

  async moveTask(params: {
    id: string;
    target_state: string;
    parent_id?: string;
    archive_date?: string;
    update_status?: boolean;
  }) {
    return this.request('/tasks/move', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Parent task endpoints
  async getParent(id: string) {
    return this.request(`/parents/${id}`);
  }

  async getParents(
    params: {
      location?: string | string[];
      area?: string;
      include_progress?: boolean;
      include_subtasks?: boolean;
    } = {}
  ) {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          for (const v of value) {
            searchParams.append(key, v);
          }
        } else {
          searchParams.append(key, String(value));
        }
      }
    }

    return this.request(`/parents?${searchParams}`);
  }

  async createParent(params: {
    title: string;
    type: string;
    location?: string;
    priority?: string;
    status?: string;
    area?: string;
    assignee?: string;
    tags?: string[];
    overview_content?: string;
    subtasks?: Array<{
      title: string;
      sequence?: string;
      parallel_with?: string;
    }>;
  }) {
    return this.request('/parents', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async performParentOperation(
    parentId: string,
    operation: {
      operation: 'resequence' | 'parallelize' | 'add_subtask';
      sequence_map?: Array<{ id: string; sequence: string }>;
      subtask_ids?: string[];
      target_sequence?: string;
      subtask?: {
        title: string;
        after?: string;
        sequence?: string;
        type?: string;
      };
    }
  ) {
    return this.request(`/parents/${parentId}`, {
      method: 'POST',
      body: JSON.stringify(operation),
    });
  }

  // Workflow endpoints
  async getCurrentWorkflow(_params = {}) {
    return this.request('/workflow/current', { method: 'GET' });
  }

  async markCompleteNext(params: { id: string }) {
    return this.request('/workflow/mark-complete-next', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const apiClient = new ApiClient();
