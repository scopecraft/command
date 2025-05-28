/**
 * Formatters for displaying v2 tasks in various formats
 */
import type * as v2 from './v2/types.js';

export type OutputFormat = 'tree' | 'table' | 'json' | 'minimal' | 'workflow' | 'default' | 'markdown' | 'full';

// Emoji mappings for presentation layer
export const STATUS_EMOJIS: Record<v2.TaskStatus, string> = {
  'To Do': '🟡',
  'In Progress': '🔵',
  'Done': '🟢',
  'Blocked': '🔴',
  'Archived': '⚪'
};

const TYPE_EMOJIS: Record<v2.TaskType, string> = {
  'feature': '🌟',
  'bug': '🐛',
  'chore': '🔧',
  'documentation': '📚',
  'test': '🧪',
  'spike': '🔍',
  'idea': '💡'
};

const PRIORITY_EMOJIS = {
  'High': '🔼',
  'Medium': '▶️',
  'Low': '🔽'
};

/**
 * Format a list of v2 tasks for display
 */
export function formatTasksList(tasks: v2.Task[], format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(tasks, null, 2);
  }

  if (format === 'minimal') {
    return tasks.map((task) => `${task.metadata.id}\t${task.document.title}`).join('\n');
  }

  if (format === 'workflow') {
    return formatWorkflowView(tasks);
  }

  // Default to tree format
  if (format === 'tree' || !format) {
    return formatTreeView(tasks);
  }

  // Table format (legacy)
  if (format === 'table') {
    return formatTableView(tasks);
  }

  // Fallback to tree
  return formatTreeView(tasks);
}

/**
 * Format workflow view showing task relationships
 */
function formatWorkflowView(tasks: v2.Task[]): string {
  const taskMap = new Map<string, v2.Task>();
  tasks.forEach((task) => taskMap.set(task.metadata.id, task));
  
  let output = '\nTask Workflow:\n';
  
  // Group by workflow state
  const byState: Record<v2.WorkflowState, v2.Task[]> = {
    backlog: [],
    current: [],
    archive: []
  };
  
  tasks.forEach(task => {
    byState[task.metadata.location.workflowState].push(task);
  });
  
  // Show each workflow state
  (['current', 'backlog', 'archive'] as v2.WorkflowState[]).forEach(state => {
    if (byState[state].length > 0) {
      output += `\n${state.toUpperCase()}:\n`;
      
      byState[state].forEach(task => {
        const statusEmoji = STATUS_EMOJIS[task.document.frontmatter.status];
        const typeEmoji = TYPE_EMOJIS[task.document.frontmatter.type];
        const isParent = task.metadata.isParentTask ? '📁 ' : '';
        
        output += `  ${statusEmoji} ${typeEmoji} ${isParent}${task.metadata.id}: ${task.document.title}\n`;
        
        // Show relationships
        const meta = task.document.frontmatter as any;
        if (meta.parent) {
          output += `     └─ Parent: ${meta.parent}\n`;
        }
        if (meta.depends) {
          output += `     └─ Depends on: ${meta.depends.join(', ')}\n`;
        }
        if (meta.next) {
          output += `     └─ Next: ${meta.next}\n`;
        }
      });
    }
  });
  
  return output;
}

/**
 * Format tasks in a tree view showing parent/subtask hierarchy
 */
function formatTreeView(tasks: v2.Task[]): string {
  if (tasks.length === 0) {
    return '\nCURRENT:\n  (No tasks in current workflow)\n';
  }
  
  // Group tasks by workflow state
  const byState: Record<v2.WorkflowState, v2.Task[]> = {
    backlog: [],
    current: [],
    archive: []
  };
  
  tasks.forEach(task => {
    byState[task.metadata.location.workflowState].push(task);
  });
  
  let output = '\n';
  let hasContent = false;
  
  // Show each workflow state
  (['current', 'backlog', 'archive'] as v2.WorkflowState[]).forEach(state => {
    const stateTasks = byState[state];
    if (stateTasks.length === 0) return;
    
    hasContent = true;
    output += `${state.toUpperCase()}:\n`;
    
    // Separate parent tasks and standalone tasks
    const parentTasks = stateTasks.filter(t => t.metadata.isParentTask);
    const standaloneTasks = stateTasks.filter(t => !t.metadata.isParentTask && !t.metadata.parentTask);
    const subtasks = stateTasks.filter(t => !t.metadata.isParentTask && t.metadata.parentTask);
    
    // Create a map of parent ID to subtasks
    const subtasksByParent = new Map<string, v2.Task[]>();
    subtasks.forEach(task => {
      const parentId = task.metadata.parentTask!;
      if (!subtasksByParent.has(parentId)) {
        subtasksByParent.set(parentId, []);
      }
      subtasksByParent.get(parentId)!.push(task);
    });
    
    // Handle empty state
    if (parentTasks.length === 0 && standaloneTasks.length === 0 && subtasks.length === 0) {
      output += `  (No tasks in ${state} workflow)\n`;
      return;
    }
    
    // Display parent tasks with their subtasks
    parentTasks.forEach((parent, index) => {
      const isLastParent = index === parentTasks.length - 1 && standaloneTasks.length === 0;
      const prefix = isLastParent ? '└── ' : '├── ';
      const statusSymbol = getStatusSymbol(parent.document.frontmatter.status);
      const meta = parent.document.frontmatter as any;
      
      // Build parent line
      let line = `${prefix}📁 ${statusSymbol} ${parent.document.title} [${parent.metadata.id}]`;
      line += ` • ${parent.document.frontmatter.status}`;
      
      // Add progress for parent tasks
      const parentSubtasks = subtasksByParent.get(parent.metadata.id) || [];
      if (parentSubtasks.length > 0) {
        const done = parentSubtasks.filter(t => t.document.frontmatter.status === 'Done').length;
        line += ` • ${done}/${parentSubtasks.length} done`;
      }
      
      // Add metadata
      if (meta.priority && meta.priority !== 'Medium') {
        line += ` • ${meta.priority === 'High' ? '↑' : '↓'} ${meta.priority}`;
      }
      if (meta.assignee) line += ` • @${meta.assignee}`;
      if (meta.tags && meta.tags.length > 0) {
        line += ` • ${meta.tags.map((t: string) => `#${t}`).join(' ')}`;
      }
      
      output += line + '\n';
      
      // Show subtasks of this parent
      if (parentSubtasks.length > 0) {
        // Sort by sequence number
        const sortedSubtasks = parentSubtasks.sort((a, b) => {
          const seqA = a.metadata.sequenceNumber || '99';
          const seqB = b.metadata.sequenceNumber || '99';
          return seqA.localeCompare(seqB);
        });
        
        // Group by sequence for parallel tasks
        const bySequence = new Map<string, v2.Task[]>();
        sortedSubtasks.forEach(task => {
          const seq = task.metadata.sequenceNumber || '99';
          if (!bySequence.has(seq)) {
            bySequence.set(seq, []);
          }
          bySequence.get(seq)!.push(task);
        });
        
        const sequences = Array.from(bySequence.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        
        sequences.forEach(([seq, seqTasks], seqIndex) => {
          const isLastSeq = seqIndex === sequences.length - 1;
          const seqPrefix = isLastParent ? '    ' : '│   ';
          
          if (seqTasks.length === 1) {
            // Single task
            const task = seqTasks[0];
            const taskPrefix = isLastSeq ? '└── ' : '├── ';
            const statusSymbol = getStatusSymbol(task.document.frontmatter.status);
            const taskMeta = task.document.frontmatter as any;
            
            let taskLine = `${seqPrefix}${taskPrefix}${statusSymbol} ${task.document.title} [${task.metadata.id}]`;
            taskLine += ` • ${task.document.frontmatter.status}`;
            
            // Add metadata
            if (taskMeta.priority && taskMeta.priority !== 'Medium') {
              taskLine += ` • ${taskMeta.priority === 'High' ? '↑' : '↓'} ${taskMeta.priority}`;
            }
            if (taskMeta.assignee) taskLine += ` • @${taskMeta.assignee}`;
            if (taskMeta.tags && taskMeta.tags.length > 0) {
              taskLine += ` • ${taskMeta.tags.map((t: string) => `#${t}`).join(' ')}`;
            }
            
            output += taskLine + '\n';
          } else {
            // Parallel tasks
            output += `${seqPrefix}├─┬ [Parallel execution - ${seq}]\n`;
            seqTasks.forEach((task, taskIndex) => {
              const isLastTask = taskIndex === seqTasks.length - 1;
              const taskPrefix = isLastTask ? '└─ ' : '├─ ';
              const statusSymbol = getStatusSymbol(task.document.frontmatter.status);
              const taskMeta = task.document.frontmatter as any;
              
              let taskLine = `${seqPrefix}│ ${taskPrefix}${statusSymbol} ${task.document.title} [${task.metadata.id}]`;
              taskLine += ` • ${task.document.frontmatter.status}`;
              
              // Add metadata
              if (taskMeta.priority && taskMeta.priority !== 'Medium') {
                taskLine += ` • ${taskMeta.priority === 'High' ? '↑' : '↓'} ${taskMeta.priority}`;
              }
              if (taskMeta.assignee) taskLine += ` • @${taskMeta.assignee}`;
              if (taskMeta.tags && taskMeta.tags.length > 0) {
                taskLine += ` • ${taskMeta.tags.map((t: string) => `#${t}`).join(' ')}`;
              }
              
              output += taskLine + '\n';
            });
          }
        });
      }
    });
    
    // Display standalone tasks
    standaloneTasks.forEach((task, index) => {
      const isLast = index === standaloneTasks.length - 1;
      const prefix = isLast ? '└── ' : '├── ';
      const statusSymbol = getStatusSymbol(task.document.frontmatter.status);
      const meta = task.document.frontmatter as any;
      
      let line = `${prefix}${statusSymbol} ${task.document.title} [${task.metadata.id}]`;
      line += ` • ${task.document.frontmatter.status}`;
      
      // Add metadata
      if (meta.priority && meta.priority !== 'Medium') {
        line += ` • ${meta.priority === 'High' ? '↑' : '↓'} ${meta.priority}`;
      }
      if (meta.assignee) line += ` • @${meta.assignee}`;
      if (meta.tags && meta.tags.length > 0) {
        line += ` • ${meta.tags.map((t: string) => `#${t}`).join(' ')}`;
      }
      
      // Check for orphaned tasks
      if (task.metadata.parentTask) {
        line += ' (⚠️ no parent)';
      }
      
      output += line + '\n';
    });
    
    output += '\n';
  });
  
  if (hasContent) {
    output += 'Legend: ✓ Done  → In Progress  ○ To Do  ⊗ Blocked  • High ↑  Low ↓\n';
  }
  
  return output;
}

/**
 * Get status symbol for tree view
 */
function getStatusSymbol(status: v2.TaskStatus): string {
  switch(status) {
    case 'Done': return '✓';
    case 'In Progress': return '→';
    case 'Blocked': return '⊗';
    case 'To Do': return '○';
    case 'Archived': return '⊙';
    default: return '○';
  }
}

/**
 * Format tasks in legacy table view
 */
function formatTableView(tasks: v2.Task[]): string {
  const header = 'ID                        Title                                              Status          Location      Type';
  
  const rows = tasks.map((task) => {
    const id = task.metadata.id.substring(0, 26).padEnd(26);
    const title = task.document.title.substring(0, 50).padEnd(50);
    const status = `${STATUS_EMOJIS[task.document.frontmatter.status]} ${task.document.frontmatter.status}`.padEnd(16);
    const location = task.metadata.location.workflowState.padEnd(14);
    const type = `${TYPE_EMOJIS[task.document.frontmatter.type]} ${task.document.frontmatter.type}`.padEnd(12);
    
    return `${id}${title}${status}${location}${type}`;
  });
  
  return `\nTasks:\n${header}\n${rows.join('\n')}`;
}

/**
 * Format a single v2 task for detailed display
 */
export function formatTaskDetail(task: v2.Task, format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(task, null, 2);
  }
  
  if (format === 'markdown' || format === 'full') {
    return formatTaskAsMarkdown(task);
  }
  
  // Default format
  const meta = task.document.frontmatter as any;
  const statusEmoji = STATUS_EMOJIS[task.document.frontmatter.status];
  const typeEmoji = TYPE_EMOJIS[task.document.frontmatter.type];
  const priorityEmoji = meta.priority ? PRIORITY_EMOJIS[meta.priority as keyof typeof PRIORITY_EMOJIS] || '' : '';
  
  let output = `\n${task.document.title}\n${'='.repeat(task.document.title.length)}\n\n`;
  output += `ID:       ${task.metadata.id}\n`;
  output += `Type:     ${typeEmoji} ${task.document.frontmatter.type}\n`;
  output += `Status:   ${statusEmoji} ${task.document.frontmatter.status}\n`;
  output += `Location: ${task.metadata.location.workflowState}`;
  
  if (task.metadata.location.archiveDate) {
    output += ` (${task.metadata.location.archiveDate})`;
  }
  output += '\n';
  
  if (meta.priority) {
    output += `Priority: ${priorityEmoji} ${meta.priority}\n`;
  }
  if (meta.assignee) {
    output += `Assignee: ${meta.assignee}\n`;
  }
  if (meta.tags) {
    output += `Tags:     ${meta.tags.join(', ')}\n`;
  }
  
  // Show sections
  output += '\n## Instruction\n';
  output += task.document.sections.instruction || '(No instruction provided)';
  output += '\n';
  
  if (task.document.sections.tasks) {
    output += '\n## Tasks\n';
    output += task.document.sections.tasks;
    output += '\n';
  }
  
  if (format === 'full') {
    if (task.document.sections.deliverable) {
      output += '\n## Deliverable\n';
      output += task.document.sections.deliverable;
      output += '\n';
    }
    
    if (task.document.sections.log) {
      output += '\n## Log\n';
      output += task.document.sections.log;
      output += '\n';
    }
  }
  
  return output;
}

/**
 * Format task as markdown
 */
function formatTaskAsMarkdown(task: v2.Task): string {
  let output = `# ${task.document.title}\n\n`;
  
  // Frontmatter
  output += '---\n';
  output += `type: ${task.document.frontmatter.type}\n`;
  output += `status: ${task.document.frontmatter.status}\n`;
  output += `area: ${task.document.frontmatter.area}\n`;
  
  // Add custom metadata
  const meta = task.document.frontmatter as any;
  Object.entries(meta).forEach(([key, value]) => {
    if (!['type', 'status', 'area'].includes(key)) {
      if (Array.isArray(value)) {
        output += `${key}: [${value.join(', ')}]\n`;
      } else {
        output += `${key}: ${value}\n`;
      }
    }
  });
  
  output += '---\n\n';
  
  // Sections
  output += '## Instruction\n\n';
  output += task.document.sections.instruction || '(No instruction provided)';
  output += '\n\n';
  
  output += '## Tasks\n\n';
  output += task.document.sections.tasks || '- [ ] Define tasks';
  output += '\n\n';
  
  output += '## Deliverable\n\n';
  output += task.document.sections.deliverable || '(To be defined)';
  output += '\n\n';
  
  output += '## Log\n\n';
  output += task.document.sections.log || '(No log entries yet)';
  output += '\n';
  
  return output;
}

/**
 * Format template list
 */
export function formatTemplatesList(templates: v2.TemplateInfo[]): string {
  let output = '\nAvailable Templates:\n';
  output += 'ID                  Title                                   Description\n';
  output += '─'.repeat(80) + '\n';
  
  templates.forEach(template => {
    const id = template.id.padEnd(20);
    const title = template.title.substring(0, 40).padEnd(40);
    const description = template.description.substring(0, 20);
    output += `${id}${title}${description}\n`;
  });
  
  return output;
}

/**
 * Format progress percentage
 */
export function formatProgress(completed: number, total: number): string {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const filled = Math.round(percentage / 10);
  const empty = 10 - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  
  return `${bar} ${percentage}%`;
}