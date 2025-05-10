/**
 * Formatters for displaying tasks and phases in various formats
 */
import { Task, Phase, OutputFormat } from './types.js';

/**
 * Format a list of tasks for display
 * @param tasks List of tasks to format
 * @param format Output format
 * @returns Formatted string
 */
export function formatTasksList(tasks: Task[], format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(tasks, null, 2);
  }
  
  if (format === 'minimal') {
    return tasks.map(task => `${task.metadata.id}\t${task.metadata.title}`).join('\n');
  }
  
  if (format === 'workflow') {
    // Build a workflow/dependency graph representation
    const taskMap = new Map<string, Task>();
    tasks.forEach(task => taskMap.set(task.metadata.id, task));
    
    let output = "\nTask Workflow:\n";
    
    // First, find tasks with no dependencies
    const startTasks = tasks.filter(task => 
      (!task.metadata.depends_on || task.metadata.depends_on.length === 0) && 
      !task.metadata.previous_task
    );
    
    const visitedTasks = new Set<string>();
    
    // Recursive function to print workflow
    const printWorkflow = (task: Task, depth: number = 0): void => {
      if (visitedTasks.has(task.metadata.id)) return;
      visitedTasks.add(task.metadata.id);
      
      const indent = '  '.repeat(depth);
      const statusEmoji = task.metadata.status?.split(' ')[0] || '❓';
      const title = task.metadata.title;
      output += `${indent}${statusEmoji} ${task.metadata.id}: ${title}\n`;
      
      // First, follow explicit next_task links
      if (task.metadata.next_task && taskMap.has(task.metadata.next_task)) {
        printWorkflow(taskMap.get(task.metadata.next_task)!, depth + 1);
      }
      
      // Then, check for tasks that depend on this one
      tasks.forEach(t => {
        if (t.metadata.depends_on?.includes(task.metadata.id) && !visitedTasks.has(t.metadata.id)) {
          printWorkflow(t, depth + 1);
        }
      });
      
      // Finally, check for subtasks
      if (task.metadata.subtasks) {
        task.metadata.subtasks.forEach(subtaskId => {
          if (taskMap.has(subtaskId) && !visitedTasks.has(subtaskId)) {
            printWorkflow(taskMap.get(subtaskId)!, depth + 1);
          }
        });
      }
    };
    
    // Start printing from the start tasks
    startTasks.forEach(task => printWorkflow(task));
    
    // Add any tasks that weren't reached through dependencies
    tasks.forEach(task => {
      if (!visitedTasks.has(task.metadata.id)) {
        output += `⚠️  Isolated Task ${task.metadata.id}: ${task.metadata.title}\n`;
      }
    });
    
    return output;
  }
  
  // Default table format
  const header = `ID                  | Phase          | Title                           | Status        | Type          | Assigned\n` +
                 `--------------------|---------------|--------------------------------|---------------|---------------|------------------`;
  
  const rows = tasks.map(task => {
    const id = task.metadata.id.padEnd(20);
    const phase = (task.metadata.phase || '').padEnd(15);
    const title = (task.metadata.title || '').substring(0, 30).padEnd(30);
    const status = (task.metadata.status || '').padEnd(15);
    const type = (task.metadata.type || '').padEnd(15);
    const assignee = task.metadata.assigned_to || '';
    
    return `${id}| ${phase}| ${title}| ${status}| ${type}| ${assignee}`;
  });
  
  return `\nTasks:\n${header}\n${rows.join('\n')}\n\nTotal: ${tasks.length} tasks\n`;
}

/**
 * Format a list of phases for display
 * @param phases List of phases to format
 * @param format Output format
 * @returns Formatted string
 */
export function formatPhasesList(phases: Phase[], format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(phases, null, 2);
  }
  
  // Default table format
  const header = `ID               | Name              | Status        | Tasks  | Description\n` +
                 `-----------------|-------------------|---------------|--------|---------------------------`;
  
  const rows = phases.map(phase => {
    const id = phase.id.padEnd(17);
    const name = phase.name.substring(0, 18).padEnd(18);
    const status = (phase.status || '').padEnd(15);
    const taskCount = (phase.tasks.length.toString()).padEnd(8);
    const description = phase.description || '';
    
    return `${id}| ${name}| ${status}| ${taskCount}| ${description}`;
  });
  
  return `\nPhases:\n${header}\n${rows.join('\n')}\n\nTotal: ${phases.length} phases\n`;
}

/**
 * Format a task for display
 * @param task Task to format
 * @param format Output format
 * @returns Formatted string
 */
export function formatTaskDetail(task: Task, format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(task, null, 2);
  }
  
  if (format === 'markdown') {
    // This requires the formatTaskFile function from task-parser
    // For simplicity, just return the raw content - in real code, import and use formatTaskFile
    return `+++\n${JSON.stringify(task.metadata, null, 2)}\n+++\n\n${task.content}`;
  }
  
  // Check if we're displaying full details
  const isFullFormat = format === 'full';
  
  // Default format (human readable)
  let output = `\nTask ${task.metadata.id}:\n` +
               `${'─'.repeat(80)}\n`;
  
  // Core fields always included
  output += `Title           : ${task.metadata.title}\n`;
  output += `Status          : ${task.metadata.status || ''}\n`;
  output += `Type            : ${task.metadata.type || ''}\n`;
  output += `Priority        : ${task.metadata.priority || ''}\n`;
  output += `Assigned To     : ${task.metadata.assigned_to || ''}\n`;
  
  // Show dates
  output += `Created         : ${task.metadata.created_date || ''}\n`;
  output += `Updated         : ${task.metadata.updated_date || ''}\n`;
  
  // Show relationship fields
  if (task.metadata.phase) {
    output += `Phase           : ${task.metadata.phase}\n`;
  }
  
  if (task.metadata.parent_task) {
    output += `Parent Task     : ${task.metadata.parent_task}\n`;
  }
  
  if (task.metadata.depends_on && task.metadata.depends_on.length > 0) {
    output += `Depends On      : ${task.metadata.depends_on.join(', ')}\n`;
  }
  
  if (task.metadata.previous_task) {
    output += `Previous Task   : ${task.metadata.previous_task}\n`;
  }
  
  if (task.metadata.next_task) {
    output += `Next Task       : ${task.metadata.next_task}\n`;
  }
  
  if (task.metadata.subtasks && task.metadata.subtasks.length > 0) {
    output += `Subtasks        : ${task.metadata.subtasks.join(', ')}\n`;
  }
  
  // Other metadata fields only in full format
  if (isFullFormat) {
    const otherFields = Object.entries(task.metadata)
      .filter(([key]) => !['id', 'title', 'status', 'type', 'priority', 'assigned_to', 
                          'created_date', 'updated_date', 'phase', 'parent_task',
                          'depends_on', 'previous_task', 'next_task', 'subtasks'].includes(key))
      .map(([key, value]) => `${key.padEnd(15)}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
      .join('\n');
    
    if (otherFields) {
      output += '\nOther Metadata:\n';
      output += otherFields + '\n';
    }
  }
  
  output += `${'─'.repeat(80)}\n`;
  output += `Content:\n${task.content}\n`;
  
  return output;
}