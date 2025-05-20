# Filter Panel Component Usage Guide

The `FilterPanel` component provides a reusable, generic filtering system that can be applied to any data collection in the application. This document demonstrates how to use it effectively.

## Basic Usage

```tsx
import { useState } from 'react';
import { 
  FilterPanel, 
  FilterCategory, 
  FilterCategoryGroup,
  FilterOption 
} from '../components/ui/filter-panel';

// Define your filter options
type StatusFilter = 'active' | 'pending' | 'completed';
const statusOptions: FilterOption<StatusFilter>[] = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

function MyFilterableComponent() {
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<StatusFilter[]>([]);
  
  // Filter handlers
  const toggleFilters = () => setShowFilters(!showFilters);
  const clearFilters = () => setSelectedStatuses([]);
  const handleStatusChange = (status: StatusFilter) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };
  
  // Active filter count
  const activeFilterCount = selectedStatuses.length;
  
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1>My List</h1>
        
        <FilterPanel
          show={showFilters}
          activeFilterCount={activeFilterCount}
          onFilterToggle={toggleFilters}
          onClearFilters={clearFilters}
          title="Filter Items"
        >
          <FilterCategoryGroup>
            <FilterCategory
              name="Status"
              options={statusOptions}
              selectedValues={selectedStatuses}
              onChange={handleStatusChange}
            />
          </FilterCategoryGroup>
        </FilterPanel>
      </div>
      
      {/* Your filtered content here */}
    </div>
  );
}
```

## Advanced Usage with Custom Renderers

You can customize how filter options are displayed by using the `render` property:

```tsx
import { Tag } from 'lucide-react';

// Define filter options with custom renderers
const priorityOptions: FilterOption<Priority>[] = [
  { 
    value: 'high', 
    render: (isSelected) => (
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full bg-red-500 mr-2 ${isSelected ? 'ring-2 ring-red-300' : ''}`} />
        <span>High</span>
      </div>
    )
  },
  // Other priority options...
];

// In your component:
<FilterCategory
  name="Priority"
  options={priorityOptions}
  selectedValues={selectedPriorities}
  onChange={handlePriorityChange}
/>
```

## Using with Icons

The component supports icons in filter options:

```tsx
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const statusOptions: FilterOption<StatusType>[] = [
  { value: 'pending', label: 'Pending', icon: <Clock className="h-4 w-4 mr-1.5" /> },
  { value: 'warning', label: 'Warning', icon: <AlertTriangle className="h-4 w-4 mr-1.5" /> },
  { value: 'complete', label: 'Complete', icon: <CheckCircle className="h-4 w-4 mr-1.5" /> },
];
```

## Integration with Existing Components

You can integrate with existing badge or indicator components:

```tsx
import { StatusBadge } from '../components/status-badge';

const statusOptions: FilterOption<Status>[] = [
  { 
    value: 'active',
    render: (isSelected) => <StatusBadge status="active" className={isSelected ? 'ring-2' : ''} />
  },
  // Other status options...
];
```

## Multiple Filter Categories

The component supports multiple filter categories:

```tsx
<FilterPanel
  show={showFilters}
  activeFilterCount={totalActiveFilters}
  onFilterToggle={toggleFilters}
  onClearFilters={clearAllFilters}
>
  <FilterCategoryGroup>
    <FilterCategory
      name="Status"
      options={statusOptions}
      selectedValues={selectedStatuses}
      onChange={handleStatusChange}
    />
    
    <FilterCategory
      name="Priority"
      options={priorityOptions}
      selectedValues={selectedPriorities}
      onChange={handlePriorityChange}
    />
    
    <FilterCategory
      name="Assignee"
      options={assigneeOptions}
      selectedValues={selectedAssignees}
      onChange={handleAssigneeChange}
    />
  </FilterCategoryGroup>
</FilterPanel>
```

## Using Only the Toggle Button

If you need only the filter toggle button without the panel:

```tsx
import { FilterToggleButton } from '../components/ui/filter-panel';

<FilterToggleButton
  onClick={handleFilterToggle}
  activeFilterCount={3}
  label="FILTER TASKS"
/>
```

## Styling Customization

All components accept className props for custom styling:

```tsx
<FilterPanel
  className="bg-slate-100 dark:bg-slate-800"
  filterButtonClassName="bg-blue-50 hover:bg-blue-100"
  // other props...
>
  <FilterCategoryGroup className="gap-4">
    {/* categories */}
  </FilterCategoryGroup>
</FilterPanel>
```

## Best Practices

1. Always maintain filter state at the parent component level
2. Provide clear labels for filter categories
3. Use icons and custom renderers to make filters more intuitive
4. Consider mobile responsiveness when designing filter layouts
5. Include a "Clear Filters" option for user convenience
6. Provide visual feedback on which filters are currently active