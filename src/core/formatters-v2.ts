/**
 * Formatters for displaying v2 tasks in various formats
 */
import type * as v2 from './v2/types.js';

export type OutputFormat = 'table' | 'json' | 'minimal' | 'workflow' | 'default' | 'markdown' | 'full';

// Emoji mappings for presentation layer
const STATUS_EMOJIS: Record<v2.TaskStatus, string> = {
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

  // Table format
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