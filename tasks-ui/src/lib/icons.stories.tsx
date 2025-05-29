import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { 
  StatusIcon, 
  TaskTypeIcon, 
  PriorityIcon, 
  WorkflowStateIcon,
  createStatusFilterOptions,
  createTaskTypeFilterOptions,
  createPriorityFilterOptions,
  createWorkflowFilterOptions
} from './icons';
import { FilterPanel, FilterCategory, FilterCategoryGroup } from '../components/ui/filter-panel';

const meta: Meta = {
  title: 'Design System/Shared Icons',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Shared icon system using Lucide icons that can be used across filters, badges, and components.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const IconShowcase: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-mono font-bold mb-4">Icon System Overview</h2>
        <p className="text-muted-foreground font-mono text-sm mb-6">
          Consistent Lucide icons across all components, replacing the mixed emoji/symbol system.
        </p>
      </div>

      {/* Status Icons */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-mono font-semibold mb-4">Status Icons</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { status: 'todo', label: 'To Do' },
            { status: 'in_progress', label: 'In Progress' },
            { status: 'done', label: 'Done' },
            { status: 'blocked', label: 'Blocked' },
            { status: 'archived', label: 'Archived' },
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center gap-2">
              <StatusIcon status={status as any} size="md" />
              <span className="font-mono text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Task Type Icons */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-mono font-semibold mb-4">Task Type Icons</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { type: 'parent_task', label: 'Parent Task' },
            { type: 'task', label: 'Task' },
            { type: 'feature', label: 'Feature' },
            { type: 'bug', label: 'Bug' },
            { type: 'chore', label: 'Chore' },
            { type: 'documentation', label: 'Documentation' },
            { type: 'test', label: 'Test' },
            { type: 'spike', label: 'Spike' },
            { type: 'enhancement', label: 'Enhancement' },
          ].map(({ type, label }) => (
            <div key={type} className="flex items-center gap-2">
              <TaskTypeIcon type={type as any} size="md" />
              <span className="font-mono text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Icons */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-mono font-semibold mb-4">Priority Icons</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { priority: 'highest', label: 'Highest' },
            { priority: 'high', label: 'High' },
            { priority: 'medium', label: 'Medium (No Icon)' },
            { priority: 'low', label: 'Low' },
          ].map(({ priority, label }) => (
            <div key={priority} className="flex items-center gap-2">
              {priority !== 'medium' ? (
                <PriorityIcon priority={priority} size="md" />
              ) : (
                <div className="w-4 h-4" /> // Empty space for medium
              )}
              <span className="font-mono text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow State Icons */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-mono font-semibold mb-4">Workflow State Icons</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { workflow: 'backlog', label: 'Backlog' },
            { workflow: 'current', label: 'Current' },
            { workflow: 'archive', label: 'Archive' },
          ].map(({ workflow, label }) => (
            <div key={workflow} className="flex items-center gap-2">
              <WorkflowStateIcon workflow={workflow as any} size="md" />
              <span className="font-mono text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Size Variants */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-mono font-semibold mb-4">Size Variants</h3>
        <div className="space-y-4">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} className="flex items-center gap-4">
              <span className="font-mono text-sm w-8">{size}:</span>
              <StatusIcon status="in_progress" size={size} />
              <TaskTypeIcon type="feature" size={size} />
              <PriorityIcon priority="high" size={size} />
              <WorkflowStateIcon workflow="current" size={size} />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const FilterIntegration: Story = {
  render: () => {
    const [showFilter, setShowFilter] = useState(true);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['in_progress']);
    const [selectedTypes, setSelectedTypes] = useState<string[]>(['feature', 'bug']);
    const [selectedPriorities, setSelectedPriorities] = useState<string[]>(['high']);
    const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>(['current']);

    const toggleStatus = (status: string) => {
      setSelectedStatuses(prev =>
        prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
      );
    };

    const toggleType = (type: string) => {
      setSelectedTypes(prev =>
        prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
      );
    };

    const togglePriority = (priority: string) => {
      setSelectedPriorities(prev =>
        prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
      );
    };

    const toggleWorkflow = (workflow: string) => {
      setSelectedWorkflows(prev =>
        prev.includes(workflow) ? prev.filter(w => w !== workflow) : [...prev, workflow]
      );
    };

    const clearFilters = () => {
      setSelectedStatuses([]);
      setSelectedTypes([]);
      setSelectedPriorities([]);
      setSelectedWorkflows([]);
    };

    const activeFilterCount = 
      selectedStatuses.length + 
      selectedTypes.length + 
      selectedPriorities.length + 
      selectedWorkflows.length;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-mono font-bold mb-4">Filter Panel Integration</h2>
          <p className="text-muted-foreground font-mono text-sm mb-6">
            The shared icon system works seamlessly with the existing FilterPanel component.
          </p>
        </div>

        <FilterPanel
          show={showFilter}
          activeFilterCount={activeFilterCount}
          onFilterToggle={() => setShowFilter(!showFilter)}
          onClearFilters={clearFilters}
          title="V2 Task Filters"
        >
          <FilterCategoryGroup>
            <FilterCategory
              name="Status"
              options={createStatusFilterOptions()}
              selectedValues={selectedStatuses}
              onChange={toggleStatus}
            />
            <FilterCategory
              name="Type"
              options={createTaskTypeFilterOptions()}
              selectedValues={selectedTypes}
              onChange={toggleType}
            />
            <FilterCategory
              name="Priority"
              options={createPriorityFilterOptions()}
              selectedValues={selectedPriorities}
              onChange={togglePriority}
            />
            <FilterCategory
              name="Workflow"
              options={createWorkflowFilterOptions()}
              selectedValues={selectedWorkflows}
              onChange={toggleWorkflow}
            />
          </FilterCategoryGroup>
        </FilterPanel>

        {/* Selected Filters Display */}
        {activeFilterCount > 0 && (
          <div className="bg-muted/50 border rounded-lg p-4">
            <h3 className="font-mono font-medium mb-3">Selected Filters</h3>
            <div className="flex flex-wrap gap-2">
              {selectedStatuses.map(status => (
                <div key={status} className="flex items-center gap-1 bg-background border rounded px-2 py-1">
                  <StatusIcon status={status as any} size="sm" />
                  <span className="font-mono text-xs">{status}</span>
                </div>
              ))}
              {selectedTypes.map(type => (
                <div key={type} className="flex items-center gap-1 bg-background border rounded px-2 py-1">
                  <TaskTypeIcon type={type as any} size="sm" />
                  <span className="font-mono text-xs">{type}</span>
                </div>
              ))}
              {selectedPriorities.map(priority => (
                <div key={priority} className="flex items-center gap-1 bg-background border rounded px-2 py-1">
                  <PriorityIcon priority={priority} size="sm" />
                  <span className="font-mono text-xs">{priority}</span>
                </div>
              ))}
              {selectedWorkflows.map(workflow => (
                <div key={workflow} className="flex items-center gap-1 bg-background border rounded px-2 py-1">
                  <WorkflowStateIcon workflow={workflow as any} size="sm" />
                  <span className="font-mono text-xs">{workflow}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const BeforeAfterComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-mono font-bold mb-4">Before vs After</h2>
        <p className="text-muted-foreground font-mono text-sm mb-6">
          Comparison of the old mixed icon system vs the new unified Lucide icon system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Before */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-mono font-semibold mb-4 text-red-600">Before: Mixed Icons</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-mono text-sm font-medium mb-2">Task Types (Emoji)</h4>
              <div className="flex gap-3">
                <span title="Parent Task">📁</span>
                <span title="Bug">🐛</span>
                <span title="Feature">🌟</span>
                <span title="Chore">🔧</span>
                <span title="Documentation">📚</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-mono text-sm font-medium mb-2">Status (CLI Symbols)</h4>
              <div className="flex gap-3 font-mono">
                <span title="To Do">○</span>
                <span title="In Progress">→</span>
                <span title="Done">✓</span>
                <span title="Blocked">⊗</span>
                <span title="Archived">⊙</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-mono text-sm font-medium mb-2">Priority (Mixed)</h4>
              <div className="flex gap-3">
                <span title="Highest">🔥</span>
                <span title="High">↑</span>
                <span title="Low">↓</span>
              </div>
            </div>
          </div>
        </div>

        {/* After */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-mono font-semibold mb-4 text-green-600">After: Unified Lucide Icons</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-mono text-sm font-medium mb-2">Task Types</h4>
              <div className="flex gap-3">
                <TaskTypeIcon type="parent_task" size="md" />
                <TaskTypeIcon type="bug" size="md" />
                <TaskTypeIcon type="feature" size="md" />
                <TaskTypeIcon type="chore" size="md" />
                <TaskTypeIcon type="documentation" size="md" />
              </div>
            </div>
            
            <div>
              <h4 className="font-mono text-sm font-medium mb-2">Status</h4>
              <div className="flex gap-3">
                <StatusIcon status="todo" size="md" />
                <StatusIcon status="in_progress" size="md" />
                <StatusIcon status="done" size="md" />
                <StatusIcon status="blocked" size="md" />
                <StatusIcon status="archived" size="md" />
              </div>
            </div>
            
            <div>
              <h4 className="font-mono text-sm font-medium mb-2">Priority</h4>
              <div className="flex gap-3">
                <PriorityIcon priority="highest" size="md" />
                <PriorityIcon priority="high" size="md" />
                <PriorityIcon priority="low" size="md" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-mono font-medium text-blue-900 dark:text-blue-100 mb-2">Benefits</h4>
        <ul className="font-mono text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>✓ Consistent visual language across all components</li>
          <li>✓ Better accessibility with proper semantic icons</li>
          <li>✓ Easier to customize colors and sizes</li>
          <li>✓ Shared between filters and V2 components</li>
          <li>✓ Matches the existing filter panel design</li>
          <li>✓ Professional, clean appearance</li>
        </ul>
      </div>
    </div>
  ),
};