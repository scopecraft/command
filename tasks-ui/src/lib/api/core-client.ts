// MOCK implementation of core library
// In a real implementation, we would directly import from the core library
// import { listTasks, getTask, createTask, updateTask, deleteTask } from '../../../../src/core/task-manager';
// import { listPhases, getPhase, createPhase } from '../../../../src/core/task-manager';
// import { parseTask, formatTask } from '../../../../src/core/task-parser';
// import { listTemplates } from '../../../../src/core/template-manager';
// import { OperationResult, Task, Phase, Template } from '../../../../src/core/types';

import type { OperationResult, Task, Phase, Template } from '../types';

// Mock data
const mockTasks: Task[] = [
  {
    id: 'TASK-001',
    title: 'Implement Task List View',
    type: '📋 Task',
    status: '🟡 To Do',
    priority: '🔼 High',
    created_date: '2025-05-12',
    updated_date: '2025-05-12',
    content: '# Implement Task List View\n\nCreate a table view for displaying and filtering tasks.'
  },
  {
    id: 'TASK-002',
    title: 'Create Task Detail View',
    type: '📋 Task',
    status: '🔵 In Progress',
    priority: '🔼 High',
    created_date: '2025-05-12',
    updated_date: '2025-05-12',
    content: '# Create Task Detail View\n\nImplement a detailed view for viewing task information and content.'
  },
  {
    id: 'TASK-003',
    title: 'Implement Task Form',
    type: '📋 Task',
    status: '🟡 To Do',
    priority: '▶️ Medium',
    created_date: '2025-05-12',
    updated_date: '2025-05-12',
    content: '# Implement Task Form\n\nCreate a form for adding and editing tasks.'
  }
];

const mockPhases: Phase[] = [
  {
    id: 'phase-1',
    name: 'Planning',
    status: '🟢 Done',
    order: 1
  },
  {
    id: 'phase-2',
    name: 'Implementation',
    status: '🔵 In Progress',
    order: 2
  },
  {
    id: 'phase-3',
    name: 'Testing',
    status: '🟡 To Do',
    order: 3
  }
];

const mockTemplates: Template[] = [
  {
    id: 'template-1',
    name: 'Task',
    type: '📋 Task'
  },
  {
    id: 'template-2',
    name: 'Feature',
    type: '🌟 Feature'
  },
  {
    id: 'template-3',
    name: 'Bug',
    type: '🐛 Bug'
  }
];

// Mock implementation of core functions
export async function fetchTasks(): Promise<OperationResult<Task[]>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    success: true,
    data: mockTasks
  };
}

export async function fetchTask(id: string): Promise<OperationResult<Task>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  const task = mockTasks.find(task => task.id === id);
  
  if (task) {
    return {
      success: true,
      data: { ...task }
    };
  } else {
    return {
      success: false,
      message: `Task with ID ${id} not found`
    };
  }
}

export async function saveTask(task: Task): Promise<OperationResult<Task>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  if (task.id) {
    // Update existing task
    const index = mockTasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      mockTasks[index] = { ...task };
      return {
        success: true,
        data: { ...task }
      };
    } else {
      return {
        success: false,
        message: `Task with ID ${task.id} not found`
      };
    }
  } else {
    // Create new task
    const newTask = {
      ...task,
      id: `TASK-${String(mockTasks.length + 1).padStart(3, '0')}`,
      created_date: new Date().toISOString().split('T')[0],
      updated_date: new Date().toISOString().split('T')[0]
    };
    mockTasks.push(newTask);
    return {
      success: true,
      data: { ...newTask }
    };
  }
}

export async function removeTask(id: string): Promise<OperationResult<void>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockTasks.findIndex(task => task.id === id);
  if (index !== -1) {
    mockTasks.splice(index, 1);
    return {
      success: true
    };
  } else {
    return {
      success: false,
      message: `Task with ID ${id} not found`
    };
  }
}

export async function fetchPhases(): Promise<OperationResult<Phase[]>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  return {
    success: true,
    data: mockPhases
  };
}

export async function fetchPhase(id: string): Promise<OperationResult<Phase>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  const phase = mockPhases.find(phase => phase.id === id);
  
  if (phase) {
    return {
      success: true,
      data: { ...phase }
    };
  } else {
    return {
      success: false,
      message: `Phase with ID ${id} not found`
    };
  }
}

export async function savePhase(phase: Phase): Promise<OperationResult<Phase>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  if (phase.id) {
    // Update existing phase
    const index = mockPhases.findIndex(p => p.id === phase.id);
    if (index !== -1) {
      mockPhases[index] = { ...phase };
      return {
        success: true,
        data: { ...phase }
      };
    } else {
      return {
        success: false,
        message: `Phase with ID ${phase.id} not found`
      };
    }
  } else {
    // Create new phase
    const newPhase = {
      ...phase,
      id: `phase-${mockPhases.length + 1}`,
      order: mockPhases.length + 1
    };
    mockPhases.push(newPhase);
    return {
      success: true,
      data: { ...newPhase }
    };
  }
}

export async function fetchTemplates(): Promise<OperationResult<Template[]>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    success: true,
    data: mockTemplates
  };
}

export async function parseTaskContent(content: string): Promise<OperationResult<{ metadata: Record<string, any>; content: string }>> {
  // Simple mock implementation to parse TOML frontmatter
  try {
    const parts = content.split('+++');
    if (parts.length >= 3) {
      const frontmatter = parts[1].trim();
      const taskContent = parts.slice(2).join('+++').trim();
      
      // Very simple parsing logic (not actually parsing TOML)
      const metadata: Record<string, any> = {};
      frontmatter.split('\n').forEach(line => {
        const [key, value] = line.split('=').map(part => part.trim());
        if (key && value) {
          metadata[key] = value.replace(/"/g, '');
        }
      });
      
      return {
        success: true,
        data: {
          metadata,
          content: taskContent
        }
      };
    } else {
      return {
        success: false,
        message: 'Invalid task content format'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to parse task content: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export async function formatTaskContent(metadata: Record<string, any>, content: string): Promise<OperationResult<string>> {
  // Simple mock implementation to format TOML frontmatter
  try {
    let frontmatter = '+++\n';
    Object.entries(metadata).forEach(([key, value]) => {
      frontmatter += `${key} = "${value}"\n`;
    });
    frontmatter += '+++\n\n';
    
    return {
      success: true,
      data: `${frontmatter}${content}`
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to format task content: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}