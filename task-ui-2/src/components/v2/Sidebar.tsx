import React from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { 
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { TaskTypeIcon as SharedTaskIcon } from '../../lib/icons';

interface SidebarProps {
  className?: string;
  onNavigate?: (path: string) => void;
}

interface RecentTask {
  id: string;
  title: string;
  type: 'bug' | 'feature' | 'task' | 'parent_task';
}

interface CollapsedSections {
  navigation?: boolean;
  workflow?: boolean;
  recent?: boolean;
}

// Mock recent tasks
const mockRecentTasks: RecentTask[] = [
  { id: 'bug-001', title: 'Fix login timeout bug', type: 'bug' },
  { id: 'parent-001', title: 'User Authentication System', type: 'parent_task' },
  { id: 'task-001', title: 'Implement OAuth2 endpoints', type: 'task' },
  { id: 'feature-001', title: 'Add dark mode toggle', type: 'feature' },
  { id: 'parent-002', title: 'Payment Integration', type: 'parent_task' },
];

type SectionHeaderProps = {
  title: string;
  section: keyof CollapsedSections;
  isCollapsed: boolean;
  onToggle: () => void;
  actionButton?: React.ReactNode;
};

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

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const [activeItem, setActiveItem] = React.useState('tasks-all');
  const [collapsedSections, setCollapsedSections] = React.useState<CollapsedSections>({
    navigation: false,
    workflow: false,
    recent: false,
  });

  const toggleSection = (section: keyof CollapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleItemClick = (itemId: string, path: string) => {
    setActiveItem(itemId);
    onNavigate?.(path);
  };

  return (
    <aside className={cn("w-64 h-full bg-card border-r border-border flex flex-col", className)}>
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
          {/* Tasks Section */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase mb-1">Tasks</h3>
            <ul className="space-y-1">
              <li>
                <Button 
                  variant={activeItem === 'tasks-todo' ? 'secondary' : 'ghost'} 
                  className={cn(
                    "w-full justify-start text-left normal-case",
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
                    "w-full justify-start text-left normal-case",
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
                    "w-full justify-start text-left normal-case",
                    activeItem === 'tasks-all' && 'bg-accent'
                  )}
                  onClick={() => handleItemClick('tasks-all', '/tasks')}
                >
                  <span className="truncate">All</span>
                </Button>
              </li>
            </ul>
          </div>

          {/* Parent Tasks Section */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase mb-1">Parent Tasks</h3>
            <ul className="space-y-1">
              <li>
                <Button 
                  variant={activeItem === 'parents-todo' ? 'secondary' : 'ghost'} 
                  className={cn(
                    "w-full justify-start text-left normal-case",
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
                    "w-full justify-start text-left normal-case",
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
                    "w-full justify-start text-left normal-case",
                    activeItem === 'parents-all' && 'bg-accent'
                  )}
                  onClick={() => handleItemClick('parents-all', '/parents')}
                >
                  <span className="truncate">All</span>
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <SectionHeader
        title="Workflow"
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
        <ul className="space-y-1">
          <li>
            <Button 
              variant={activeItem === 'workflow-backlog' ? 'secondary' : 'ghost'} 
              className={cn(
                "w-full justify-start text-left normal-case",
                activeItem === 'workflow-backlog' && 'bg-accent'
              )}
              onClick={() => handleItemClick('workflow-backlog', '/workflow/backlog')}
            >
              <span className="truncate flex-1">Backlog</span>
              <span className="text-xs text-muted-foreground">12</span>
            </Button>
          </li>
          <li>
            <Button 
              variant={activeItem === 'workflow-current' ? 'secondary' : 'ghost'} 
              className={cn(
                "w-full justify-start text-left normal-case",
                activeItem === 'workflow-current' && 'bg-accent'
              )}
              onClick={() => handleItemClick('workflow-current', '/workflow/current')}
            >
              <span className="truncate flex-1">Current</span>
              <span className="text-xs text-muted-foreground">5</span>
            </Button>
          </li>
          <li>
            <Button 
              variant={activeItem === 'workflow-archive' ? 'secondary' : 'ghost'} 
              className={cn(
                "w-full justify-start text-left normal-case",
                activeItem === 'workflow-archive' && 'bg-accent'
              )}
              onClick={() => handleItemClick('workflow-archive', '/workflow/archive')}
            >
              <span className="truncate flex-1">Archive</span>
              <span className="text-xs text-muted-foreground">48</span>
            </Button>
          </li>
        </ul>
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
        <ul className="space-y-1">
          {mockRecentTasks.map((task) => {
            return (
              <li key={task.id}>
                <Button
                  variant={activeItem === task.id ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-left normal-case',
                    activeItem === task.id && 'bg-accent'
                  )}
                  onClick={() => handleItemClick(task.id, `/task/${task.id}`)}
                >
                  <SharedTaskIcon type={task.type} size="md" className="mr-2 text-muted-foreground" />
                  <span className="truncate">{task.title}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border">
        <Button
          variant="atlas"
          className="w-full"
          onClick={() => onNavigate?.('/task/new')}
        >
          + New Task
        </Button>
      </div>
    </aside>
  );
}