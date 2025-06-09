import { normalizePriority, normalizeTaskStatus } from '../core/field-normalizers.js';
import {
  getPriorityEmoji,
  getPriorityLabel,
  getPriorityName,
  getStatusEmoji,
  getStatusLabel,
  getStatusName,
  getTypeEmoji,
  getTypeLabel,
  getTypeName,
  getWorkflowStateLabel,
} from '../core/metadata/schema-service.js';
import type { TemplateInfo } from '../core/template-manager.js';
/**
 * Formatters for displaying tasks in various formats
 */
import type {
  ParentTask,
  Task,
  TaskPriority,
  TaskStatus,
  TaskType,
  WorkflowState,
} from '../core/types.js';

// ANSI color codes for terminal output
const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  RESET: '\x1b[0m',
};

/**
 * Print an error message in red
 */
export function printError(message: string): void {
  console.error(`${COLORS.RED}✗ ${message}${COLORS.RESET}`);
}

/**
 * Print a success message in green
 */
export function printSuccess(message: string): void {
  console.log(`${COLORS.GREEN}✓ ${message}${COLORS.RESET}`);
}

/**
 * Print a warning message in yellow
 */
export function printWarning(message: string): void {
  console.log(`${COLORS.YELLOW}⚠ ${message}${COLORS.RESET}`);
}

export type OutputFormat =
  | 'tree'
  | 'table'
  | 'json'
  | 'minimal'
  | 'workflow'
  | 'default'
  | 'markdown'
  | 'full';

/**
 * Format a list of tasks for display
 */
export function formatTasksList(tasks: Task[], format: OutputFormat): string {
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
function formatWorkflowView(tasks: Task[]): string {
  const taskMap = new Map<string, Task>();
  for (const task of tasks) {
    taskMap.set(task.metadata.id, task);
  }

  let output = '\nTask Workflow:\n';

  // Group by workflow state
  const byState: Record<WorkflowState, Task[]> = {
    backlog: [],
    current: [],
    archive: [],
  };

  for (const task of tasks) {
    byState[task.metadata.location.workflowState].push(task);
  }

  // Show each workflow state
  for (const state of ['current', 'backlog', 'archive'] as WorkflowState[]) {
    if (byState[state].length > 0) {
      output += `\n${getWorkflowStateLabel(state).toUpperCase()}:\n`;

      for (const task of byState[state]) {
        const statusEmoji = getStatusEmoji(getStatusName(task.document.frontmatter.status)) || '';
        const typeEmoji = getTypeEmoji(task.document.frontmatter.type) || '';
        const isParent = task.metadata.isParentTask ? '📁 ' : '';

        output += `  ${statusEmoji} ${typeEmoji} ${isParent}${task.metadata.id}: ${task.document.title}\n`;

        // Show relationships
        const meta = task.document.frontmatter;
        if (meta.parent) {
          output += `     └─ Parent: ${meta.parent}\n`;
        }
        if (meta.depends && Array.isArray(meta.depends)) {
          output += `     └─ Depends on: ${meta.depends.join(', ')}\n`;
        }
        if (meta.next) {
          output += `     └─ Next: ${meta.next}\n`;
        }
      }
    }
  }

  return output;
}

/**
 * Format tasks in a tree view showing parent/subtask hierarchy
 */
function formatTreeView(tasks: Task[]): string {
  if (tasks.length === 0) {
    return '\nCURRENT:\n  (No tasks in current workflow)\n';
  }

  // Group tasks by workflow state
  const byState: Record<WorkflowState, Task[]> = {
    backlog: [],
    current: [],
    archive: [],
  };

  for (const task of tasks) {
    byState[task.metadata.location.workflowState].push(task);
  }

  let output = '\n';
  let hasContent = false;

  // Show each workflow state
  for (const state of ['current', 'backlog', 'archive'] as WorkflowState[]) {
    const stateTasks = byState[state];
    if (stateTasks.length === 0) {
      continue;
    }

    hasContent = true;
    output += `${getWorkflowStateLabel(state).toUpperCase()}:\n`;

    // Separate parent tasks and standalone tasks
    const parentTasks = stateTasks.filter((t) => t.metadata.isParentTask);
    const standaloneTasks = stateTasks.filter(
      (t) => !t.metadata.isParentTask && !t.metadata.parentTask
    );
    const subtasks = stateTasks.filter((t) => !t.metadata.isParentTask && t.metadata.parentTask);

    // Create a map of parent ID to subtasks
    const subtasksByParent = new Map<string, Task[]>();
    for (const task of subtasks) {
      const parentId = task.metadata.parentTask;
      if (parentId) {
        if (!subtasksByParent.has(parentId)) {
          subtasksByParent.set(parentId, []);
        }
        const parentSubtasks = subtasksByParent.get(parentId);
        if (parentSubtasks) {
          parentSubtasks.push(task);
        }
      }
    }

    // Handle empty state
    if (parentTasks.length === 0 && standaloneTasks.length === 0 && subtasks.length === 0) {
      output += `  (No tasks in ${state} workflow)\n`;
      continue;
    }

    // Display parent tasks with their subtasks
    for (const [index, parent] of parentTasks.entries()) {
      const isLastParent = index === parentTasks.length - 1 && standaloneTasks.length === 0;
      const prefix = isLastParent ? '└── ' : '├── ';
      const statusSymbol = getStatusSymbol(parent.document.frontmatter.status);
      const meta = parent.document.frontmatter;

      // Build parent line
      let line = `${prefix}📁 ${statusSymbol} ${parent.document.title} [${parent.metadata.id}]`;
      line += ` • ${parent.document.frontmatter.status}`;

      // Add progress for parent tasks
      const parentSubtasks = subtasksByParent.get(parent.metadata.id) || [];
      if (parentSubtasks.length > 0) {
        const done = parentSubtasks.filter(
          (t) => normalizeTaskStatus(t.document.frontmatter.status) === 'done'
        ).length;
        line += ` • ${done}/${parentSubtasks.length} done`;
      }

      // Add metadata
      if (meta.priority && normalizePriority(meta.priority) !== 'medium') {
        const normalizedPriority = normalizePriority(meta.priority);
        line += ` • ${normalizedPriority === 'high' || normalizedPriority === 'highest' ? '↑' : '↓'} ${getPriorityLabel(meta.priority)}`;
      }
      if (meta.assignee) line += ` • @${meta.assignee}`;
      if (meta.tags && meta.tags.length > 0) {
        line += ` • ${meta.tags.map((t: string) => `#${t}`).join(' ')}`;
      }

      output += `${line}\n`;

      // Show subtasks of this parent
      if (parentSubtasks.length > 0) {
        // Sort by sequence number
        const sortedSubtasks = parentSubtasks.sort((a, b) => {
          const seqA = a.metadata.sequenceNumber || '99';
          const seqB = b.metadata.sequenceNumber || '99';
          return seqA.localeCompare(seqB);
        });

        // Group by sequence for parallel tasks
        const bySequence = new Map<string, Task[]>();
        for (const task of sortedSubtasks) {
          const seq = task.metadata.sequenceNumber || '99';
          if (!bySequence.has(seq)) {
            bySequence.set(seq, []);
          }
          const seqTasks = bySequence.get(seq);
          if (seqTasks) {
            seqTasks.push(task);
          }
        }

        const sequences = Array.from(bySequence.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        for (const [seqIndex, [seq, seqTasks]] of sequences.entries()) {
          const isLastSeq = seqIndex === sequences.length - 1;
          const seqPrefix = isLastParent ? '    ' : '│   ';

          if (seqTasks.length === 1) {
            // Single task
            const task = seqTasks[0];
            const taskPrefix = isLastSeq ? '└── ' : '├── ';
            const statusSymbol = getStatusSymbol(task.document.frontmatter.status);
            const taskMeta = task.document.frontmatter;

            let taskLine = `${seqPrefix}${taskPrefix}${statusSymbol} ${task.document.title} [${task.metadata.id}]`;
            taskLine += ` • ${getStatusLabel(task.document.frontmatter.status)}`;

            // Add metadata
            if (taskMeta.priority && normalizePriority(taskMeta.priority) !== 'medium') {
              const normalizedPriority = normalizePriority(taskMeta.priority);
              taskLine += ` • ${normalizedPriority === 'high' || normalizedPriority === 'highest' ? '↑' : '↓'} ${getPriorityLabel(taskMeta.priority)}`;
            }
            if (taskMeta.assignee) taskLine += ` • @${taskMeta.assignee}`;
            if (taskMeta.tags && taskMeta.tags.length > 0) {
              taskLine += ` • ${taskMeta.tags.map((t: string) => `#${t}`).join(' ')}`;
            }

            output += `${taskLine}\n`;
          } else {
            // Parallel tasks
            output += `${seqPrefix}├─┬ [Parallel execution - ${seq}]\n`;
            for (const [taskIndex, task] of seqTasks.entries()) {
              const isLastTask = taskIndex === seqTasks.length - 1;
              const taskPrefix = isLastTask ? '└─ ' : '├─ ';
              const statusSymbol = getStatusSymbol(task.document.frontmatter.status);
              const taskMeta = task.document.frontmatter;

              let taskLine = `${seqPrefix}│ ${taskPrefix}${statusSymbol} ${task.document.title} [${task.metadata.id}]`;
              taskLine += ` • ${getStatusLabel(task.document.frontmatter.status)}`;

              // Add metadata
              if (taskMeta.priority && normalizePriority(taskMeta.priority) !== 'medium') {
                const normalizedPriority = normalizePriority(taskMeta.priority);
                taskLine += ` • ${normalizedPriority === 'high' || normalizedPriority === 'highest' ? '↑' : '↓'} ${getPriorityLabel(taskMeta.priority)}`;
              }
              if (taskMeta.assignee) taskLine += ` • @${taskMeta.assignee}`;
              if (taskMeta.tags && taskMeta.tags.length > 0) {
                taskLine += ` • ${taskMeta.tags.map((t: string) => `#${t}`).join(' ')}`;
              }

              output += `${taskLine}\n`;
            }
          }
        }
      }
    }

    // Display standalone tasks
    for (const [index, task] of standaloneTasks.entries()) {
      const isLast = index === standaloneTasks.length - 1;
      const prefix = isLast ? '└── ' : '├── ';
      const statusSymbol = getStatusSymbol(task.document.frontmatter.status);
      const meta = task.document.frontmatter;

      let line = `${prefix}${statusSymbol} ${task.document.title} [${task.metadata.id}]`;
      line += ` • ${getStatusLabel(task.document.frontmatter.status)}`;

      // Add metadata
      if (meta.priority && normalizePriority(meta.priority) !== 'medium') {
        const normalizedPriority = normalizePriority(meta.priority);
        line += ` • ${normalizedPriority === 'high' || normalizedPriority === 'highest' ? '↑' : '↓'} ${getPriorityLabel(meta.priority)}`;
      }
      if (meta.assignee) line += ` • @${meta.assignee}`;
      if (meta.tags && meta.tags.length > 0) {
        line += ` • ${meta.tags.map((t: string) => `#${t}`).join(' ')}`;
      }

      // Check for orphaned tasks
      if (task.metadata.parentTask) {
        line += ' (⚠️ no parent)';
      }

      output += `${line}\n`;
    }

    output += '\n';
  }

  if (hasContent) {
    output += 'Legend: ✓ Done  → In Progress  ○ To Do  ⊗ Blocked  • High ↑  Low ↓\n';
  }

  return output;
}

/**
 * Get status symbol for tree view
 */
function getStatusSymbol(status: TaskStatus): string {
  // Status should already be canonical, but normalize just in case
  const normalizedStatus = normalizeTaskStatus(status);

  switch (normalizedStatus) {
    case 'done':
      return '✓';
    case 'in_progress':
      return '→';
    case 'blocked':
      return '⊗';
    case 'todo':
      return '○';
    case 'archived':
      return '⊙';
    default:
      return '○';
  }
}

/**
 * Format tasks in legacy table view
 */
function formatTableView(tasks: Task[]): string {
  const header =
    'ID                        Title                                              Status          Location      Type';

  const rows = tasks.map((task) => {
    const id = task.metadata.id.substring(0, 26).padEnd(26);
    const title = task.document.title.substring(0, 50).padEnd(50);
    const statusEmoji = getStatusEmoji(task.document.frontmatter.status) || '';
    const status = `${statusEmoji} ${getStatusLabel(task.document.frontmatter.status)}`.padEnd(16);
    const location = task.metadata.location.workflowState.padEnd(14);
    const typeEmoji = getTypeEmoji(task.document.frontmatter.type) || '';
    const type = `${typeEmoji} ${getTypeLabel(task.document.frontmatter.type)}`.padEnd(12);

    return `${id}${title}${status}${location}${type}`;
  });

  return `\nTasks:\n${header}\n${rows.join('\n')}`;
}

/**
 * Format a single task for detailed display
 */
export function formatTaskDetail(task: Task, format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(task, null, 2);
  }

  if (format === 'markdown' || format === 'full') {
    return formatTaskAsMarkdown(task);
  }

  // Default format
  const meta = task.document.frontmatter;
  // Status is stored as canonical names ("todo"), look up emoji directly
  const statusEmoji = getStatusEmoji(task.document.frontmatter.status) || '';
  // Type is stored as canonical names ("feature"), look up emoji directly
  const typeEmoji = getTypeEmoji(task.document.frontmatter.type) || '';
  // Priority is stored as canonical names ("high"), look up emoji directly
  const priorityEmoji = meta.priority ? getPriorityEmoji(meta.priority as string) || '' : '';

  let output = `\n${task.document.title}\n${'='.repeat(task.document.title.length)}\n\n`;
  output += `ID:       ${task.metadata.id}\n`;
  output += `Type:     ${typeEmoji} ${getTypeLabel(task.document.frontmatter.type)}\n`;
  output += `Status:   ${statusEmoji} ${getStatusLabel(task.document.frontmatter.status)}\n`;
  output += `Location: ${task.metadata.location.workflowState}`;

  if (task.metadata.location.archiveDate) {
    output += ` (${task.metadata.location.archiveDate})`;
  }
  output += '\n';

  if (meta.priority) {
    output += `Priority: ${priorityEmoji} ${getPriorityLabel(meta.priority as string)}\n`;
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

  if ((format as string) === 'full') {
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
function formatTaskAsMarkdown(task: Task): string {
  let output = `# ${task.document.title}\n\n`;

  // Frontmatter
  output += '---\n';
  output += `type: ${task.document.frontmatter.type}\n`;
  output += `status: ${task.document.frontmatter.status}\n`;
  output += `area: ${task.document.frontmatter.area}\n`;

  // Add custom metadata
  const meta = task.document.frontmatter;
  for (const [key, value] of Object.entries(meta)) {
    if (!['type', 'status', 'area'].includes(key)) {
      if (Array.isArray(value)) {
        output += `${key}: [${value.join(', ')}]\n`;
      } else {
        output += `${key}: ${value}\n`;
      }
    }
  }

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
export function formatTemplatesList(templates: TemplateInfo[]): string {
  let output = '\nAvailable Templates:\n';
  output += 'ID                  Title                                   Description\n';
  output += `${'─'.repeat(80)}\n`;

  for (const template of templates) {
    const id = template.id.padEnd(20);
    const title = template.name.substring(0, 40).padEnd(40);
    const description = template.type.substring(0, 20);
    output += `${id}${title}${description}\n`;
  }

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
