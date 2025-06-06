import type { Meta, StoryObj } from '@storybook/react';
import { AlertCircle, Archive, CheckCircle, Circle, Clock } from 'lucide-react';
import { useState } from 'react';
import { FilterCategory, FilterCategoryGroup, FilterPanel } from './filter-panel';
import type { FilterOption } from './filter-panel';

const meta = {
  title: 'UI/FilterPanel',
  component: FilterPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FilterPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample filter options for demonstration
const statusOptions: FilterOption<string>[] = [
  { value: 'To Do', label: 'To Do', icon: <Circle className="h-3 w-3" /> },
  { value: 'In Progress', label: 'In Progress', icon: <Clock className="h-3 w-3" /> },
  { value: 'Done', label: 'Done', icon: <CheckCircle className="h-3 w-3" /> },
  { value: 'Blocked', label: 'Blocked', icon: <AlertCircle className="h-3 w-3" /> },
  { value: 'Archived', label: 'Archived', icon: <Archive className="h-3 w-3" /> },
];

const priorityOptions: FilterOption<string>[] = [
  { value: 'Highest', label: 'Highest' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

const typeOptions: FilterOption<string>[] = [
  { value: 'feature', label: 'Feature' },
  { value: 'bug', label: 'Bug' },
  { value: 'chore', label: 'Chore' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'test', label: 'Test' },
];

// Interactive wrapper component for stories
function FilterPanelWrapper() {
  const [showFilter, setShowFilter] = useState(true);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['In Progress']);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['feature', 'bug']);

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const togglePriority = (priority: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedTypes([]);
  };

  const activeFilterCount =
    selectedStatuses.length + selectedPriorities.length + selectedTypes.length;

  return (
    <div className="p-4">
      <FilterPanel
        show={showFilter}
        activeFilterCount={activeFilterCount}
        onFilterToggle={() => setShowFilter(!showFilter)}
        onClearFilters={clearFilters}
        title="Task Filters"
      >
        <FilterCategoryGroup>
          <FilterCategory
            name="Status"
            options={statusOptions}
            selectedValues={selectedStatuses}
            onChange={toggleStatus}
          />
          <FilterCategory
            name="Priority"
            options={priorityOptions}
            selectedValues={selectedPriorities}
            onChange={togglePriority}
          />
          <FilterCategory
            name="Type"
            options={typeOptions}
            selectedValues={selectedTypes}
            onChange={toggleType}
          />
        </FilterCategoryGroup>
      </FilterPanel>
    </div>
  );
}

export const Default: Story = {
  render: () => <FilterPanelWrapper />,
};

export const NoActiveFilters: Story = {
  args: {
    show: true,
    activeFilterCount: 0,
    onFilterToggle: () => {},
    onClearFilters: () => {},
    children: (
      <FilterCategoryGroup>
        <FilterCategory
          name="Status"
          options={statusOptions}
          selectedValues={[]}
          onChange={() => {}}
        />
      </FilterCategoryGroup>
    ),
  },
};

export const ManyActiveFilters: Story = {
  args: {
    show: true,
    activeFilterCount: 7,
    filterButtonLabel: 'TASK FILTERS',
    onFilterToggle: () => {},
    onClearFilters: () => {},
    children: (
      <FilterCategoryGroup>
        <FilterCategory
          name="Status"
          options={statusOptions}
          selectedValues={['To Do', 'In Progress', 'Done']}
          onChange={() => {}}
        />
        <FilterCategory
          name="Priority"
          options={priorityOptions}
          selectedValues={['High', 'Highest']}
          onChange={() => {}}
        />
        <FilterCategory
          name="Type"
          options={typeOptions}
          selectedValues={['feature', 'bug']}
          onChange={() => {}}
        />
      </FilterCategoryGroup>
    ),
  },
};

export const CollapsedState: Story = {
  args: {
    show: false,
    activeFilterCount: 3,
    onFilterToggle: () => {},
    onClearFilters: () => {},
    children: <div>Filter content not visible when collapsed</div>,
  },
};

export const CustomTitle: Story = {
  args: {
    show: true,
    activeFilterCount: 2,
    title: 'Advanced Filters',
    onFilterToggle: () => {},
    onClearFilters: () => {},
    children: (
      <FilterCategoryGroup>
        <FilterCategory
          name="Workflow State"
          options={[
            { value: 'backlog', label: 'Backlog' },
            { value: 'current', label: 'Current' },
            { value: 'archive', label: 'Archive' },
          ]}
          selectedValues={['current', 'backlog']}
          onChange={() => {}}
        />
      </FilterCategoryGroup>
    ),
  },
};

export const SingleCategory: Story = {
  args: {
    show: true,
    activeFilterCount: 1,
    onFilterToggle: () => {},
    onClearFilters: () => {},
    children: (
      <FilterCategory
        name="Tags"
        options={[
          { value: '#security', label: '#security' },
          { value: '#backend', label: '#backend' },
          { value: '#frontend', label: '#frontend' },
          { value: '#api', label: '#api' },
          { value: '#ui', label: '#ui' },
        ]}
        selectedValues={['#backend']}
        onChange={() => {}}
      />
    ),
  },
};

export const EmptyState: Story = {
  args: {
    show: true,
    activeFilterCount: 0,
    onFilterToggle: () => {},
    onClearFilters: () => {},
    children: (
      <div className="text-center py-4 text-muted-foreground text-sm">No filters available</div>
    ),
  },
};
