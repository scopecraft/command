import { ChevronDown, ChevronRight } from 'lucide-react';
import React from 'react';
import { useRecentTasks, useWorkflowCounts } from '../../lib/api/hooks';
import { TaskTypeIcon as SharedTaskIcon } from '../../lib/icons';
import type { Task, TaskType } from '../../lib/types';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface SidebarProps {
  className?: string;
  onNavigate?: (path: string) => void;
}

interface CollapsedSections {
  navigation?: boolean;
  workflow?: boolean;
  recent?: boolean;
}

type SectionHeaderProps = {
  title: string;
  section: keyof CollapsedSections;
  isCollapsed: boolean;
  onToggle: () => void;
  actionButton?: React.ReactNode;
};

// Convert task structure to display type for TaskTypeIcon
function getDisplayType(task: Pick<Task, 'taskStructure' | 'type'>): TaskType | 'parent_task' {
  if (task.taskStructure === 'parent') return 'parent_task';
  return task.type || 'feature';
}

function SectionHeader({
  title,
  section,
  isCollapsed,
  onToggle,
  actionButton,
}: SectionHeaderProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="p-4 border-b border-border flex justify-between items-center">
      <button
        type="button"
        className="flex items-center cursor-pointer gap-2 bg-transparent border-0 p-0 text-left"
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={!isCollapsed}
        aria-controls={`${section}-content`}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-[var(--atlas-light)]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[var(--atlas-light)]" />
        )}
        <h2 className="text-sm font-medium text-[var(--atlas-light)] uppercase">{title}</h2>
      </button>
      {actionButton}
    </div>
  );
}

// Navigation sections components
function TasksSection({
  activeItem,
  handleItemClick,
}: { activeItem: string; handleItemClick: (id: string, path: string) => void }) {
  return (
    <div>
      <h3 className="text-xs font-medium text-muted-foreground uppercase mb-1">Tasks</h3>
      <ul className="space-y-1">
        <li>
          <Button
            variant={activeItem === 'tasks-todo' ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start text-left normal-case',
              activeItem === 'tasks-todo' && 'bg-accent'
            )}
            onClick={() => handleItemClick('tasks-todo', '/tasks?status=todo')}
          >
            <span className="truncate">To Do</span>
          </Button>
        </li>
        <li>
          <Button
            variant={activeItem === 'tasks-progress' ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start text-left normal-case',
              activeItem === 'tasks-progress' && 'bg-accent'
            )}
            onClick={() => handleItemClick('tasks-progress', '/tasks?status=in_progress')}
          >
            <span className="truncate">In Progress</span>
          </Button>
        </li>
        <li>
          <Button
            variant={activeItem === 'tasks-all' ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start text-left normal-case',
              activeItem === 'tasks-all' && 'bg-accent'
            )}
            onClick={() => handleItemClick('tasks-all', '/tasks')}
          >
            <span className="truncate">All</span>
          </Button>
        </li>
      </ul>
    </div>
  );
}

function ParentTasksSection({
  activeItem,
  handleItemClick,
}: { activeItem: string; handleItemClick: (id: string, path: string) => void }) {
  return (
    <div>
      <h3 className="text-xs font-medium text-muted-foreground uppercase mb-1">Parent Tasks</h3>
      <ul className="space-y-1">
        <li>
          <Button
            variant={activeItem === 'parents-todo' ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start text-left normal-case',
              activeItem === 'parents-todo' && 'bg-accent'
            )}
            onClick={() => handleItemClick('parents-todo', '/parents?status=todo')}
          >
            <span className="truncate">To Do</span>
          </Button>
        </li>
        <li>
          <Button
            variant={activeItem === 'parents-progress' ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start text-left normal-case',
              activeItem === 'parents-progress' && 'bg-accent'
            )}
            onClick={() => handleItemClick('parents-progress', '/parents?status=in_progress')}
          >
            <span className="truncate">In Progress</span>
          </Button>
        </li>
        <li>
          <Button
            variant={activeItem === 'parents-all' ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start text-left normal-case',
              activeItem === 'parents-all' && 'bg-accent'
            )}
            onClick={() => handleItemClick('parents-all', '/parents')}
          >
            <span className="truncate">All</span>
          </Button>
        </li>
      </ul>
    </div>
  );
}

function PhaseSection({
  activeItem,
  handleItemClick,
  phaseCounts,
}: {
  activeItem: string;
  handleItemClick: (id: string, path: string) => void;
  phaseCounts?: { backlog: number; active: number; released: number; archive: number };
}) {
  return (
    <ul className="space-y-1">
      <li>
        <Button
          variant={activeItem === 'phase-backlog' ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start text-left normal-case',
            activeItem === 'phase-backlog' && 'bg-accent'
          )}
          onClick={() => handleItemClick('phase-backlog', '/tasks?phase=backlog')}
        >
          <span className="truncate flex-1">Backlog</span>
          {phaseCounts && (
            <span className="text-xs text-muted-foreground">{phaseCounts.backlog}</span>
          )}
        </Button>
      </li>
      <li>
        <Button
          variant={activeItem === 'phase-active' ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start text-left normal-case',
            activeItem === 'phase-active' && 'bg-accent'
          )}
          onClick={() => handleItemClick('phase-active', '/tasks?phase=active')}
        >
          <span className="truncate flex-1">Active</span>
          {phaseCounts && (
            <span className="text-xs text-muted-foreground">{phaseCounts.active}</span>
          )}
        </Button>
      </li>
      <li>
        <Button
          variant={activeItem === 'phase-released' ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start text-left normal-case',
            activeItem === 'phase-released' && 'bg-accent'
          )}
          onClick={() => handleItemClick('phase-released', '/tasks?phase=released')}
        >
          <span className="truncate flex-1">Released</span>
          {phaseCounts && (
            <span className="text-xs text-muted-foreground">{phaseCounts.released}</span>
          )}
        </Button>
      </li>
    </ul>
  );
}

function RecentTasksSection({
  activeItem,
  handleItemClick,
  recentTasks,
}: {
  activeItem: string;
  handleItemClick: (id: string, path: string) => void;
  recentTasks: Task[];
}) {
  return (
    <ul className="space-y-1">
      {recentTasks.length === 0 ? (
        <li className="text-sm text-muted-foreground p-2">No recent tasks</li>
      ) : (
        recentTasks.map((task) => {
          // Data is normalized from MCP API
          const taskType = getDisplayType(task);
          const path =
            task.taskStructure === 'parent' ? `/parents/${task.id}` : `/tasks/${task.id}`;

          return (
            <li key={`recent-task-${task.id}`}>
              <Button
                variant={activeItem === task.id ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start text-left normal-case',
                  activeItem === task.id && 'bg-accent'
                )}
                onClick={() => handleItemClick(task.id, path)}
              >
                <SharedTaskIcon type={taskType} size="md" className="mr-2 text-muted-foreground" />
                <span className="truncate">{task.title}</span>
              </Button>
            </li>
          );
        })
      )}
    </ul>
  );
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const [activeItem, setActiveItem] = React.useState('tasks-all');
  const [collapsedSections, setCollapsedSections] = React.useState<CollapsedSections>({
    navigation: false,
    workflow: false,
    recent: false,
  });

  // Fetch recent tasks
  const { data: recentTasks = [] } = useRecentTasks(5);

  // Fetch phase counts
  const { data: phaseCounts } = useWorkflowCounts();

  const toggleSection = (section: keyof CollapsedSections) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleItemClick = (itemId: string, path: string) => {
    setActiveItem(itemId);
    onNavigate?.(path);
  };

  return (
    <aside className={cn('w-64 h-full bg-card border-r border-border flex flex-col', className)}>
      {/* Tasks Section */}
      <SectionHeader
        title="Tasks"
        section="navigation"
        isCollapsed={collapsedSections.navigation}
        onToggle={() => toggleSection('navigation')}
      />
      <div
        id="navigation-content"
        className={cn(
          'p-2 border-b border-border overflow-hidden',
          collapsedSections.navigation && 'h-0 p-0 border-b-0'
        )}
      >
        <div className="space-y-3">
          <TasksSection activeItem={activeItem} handleItemClick={handleItemClick} />
          <ParentTasksSection activeItem={activeItem} handleItemClick={handleItemClick} />
        </div>
      </div>

      {/* Phase Section */}
      <SectionHeader
        title="Phase"
        section="workflow"
        isCollapsed={collapsedSections.workflow}
        onToggle={() => toggleSection('workflow')}
      />
      <div
        id="workflow-content"
        className={cn(
          'p-2 border-b border-border overflow-hidden',
          collapsedSections.workflow && 'h-0 p-0 border-b-0'
        )}
      >
        <PhaseSection
          activeItem={activeItem}
          handleItemClick={handleItemClick}
          phaseCounts={phaseCounts}
        />
      </div>

      {/* Recent Section */}
      <SectionHeader
        title="Recent"
        section="recent"
        isCollapsed={collapsedSections.recent}
        onToggle={() => toggleSection('recent')}
      />
      <div
        id="recent-content"
        className={cn(
          'flex-1 overflow-y-auto p-2',
          collapsedSections.recent && 'h-0 p-0 overflow-hidden flex-none'
        )}
      >
        <RecentTasksSection
          activeItem={activeItem}
          handleItemClick={handleItemClick}
          recentTasks={recentTasks}
        />
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="flex justify-center mb-3">
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors cursor-pointer"
            onClick={() => handleItemClick('archive', '/workflow/archive')}
          >
            Archive
          </button>
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => handleItemClick('assistant', '/assistant')}
        >
          🤖 Claude Assistant
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => handleItemClick('autonomous', '/autonomous')}
        >
          🚀 Autonomous Monitor
        </Button>
      </div>
    </aside>
  );
}
