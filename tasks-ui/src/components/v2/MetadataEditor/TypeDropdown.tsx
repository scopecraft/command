import React from 'react';
import { Select } from '../../ui/select';
import { TaskTypeIcon } from '../TaskTypeIcon';
import { useOptimisticUpdate } from './useOptimisticUpdate';

export interface TypeDropdownProps {
  value: 'feature' | 'bug' | 'chore' | 'documentation' | 'test' | 'spike' | 'idea';
  onChange: (value: 'feature' | 'bug' | 'chore' | 'documentation' | 'test' | 'spike' | 'idea') => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const TYPE_OPTIONS = [
  { 
    value: 'feature' as const, 
    label: 'Feature',
    icon: <TaskTypeIcon type="feature" size="sm" />
  },
  { 
    value: 'bug' as const, 
    label: 'Bug',
    icon: <TaskTypeIcon type="bug" size="sm" />
  },
  { 
    value: 'chore' as const, 
    label: 'Chore',
    icon: <TaskTypeIcon type="chore" size="sm" />
  },
  { 
    value: 'documentation' as const, 
    label: 'Documentation',
    icon: <TaskTypeIcon type="documentation" size="sm" />
  },
  { 
    value: 'test' as const, 
    label: 'Test',
    icon: <TaskTypeIcon type="test" size="sm" />
  },
  { 
    value: 'spike' as const, 
    label: 'Spike',
    icon: <TaskTypeIcon type="spike" size="sm" />
  },
  { 
    value: 'idea' as const, 
    label: 'Idea',
    icon: <TaskTypeIcon type="idea" size="sm" />
  },
];

export const TypeDropdown: React.FC<TypeDropdownProps> = ({
  value,
  onChange,
  disabled = false,
  className
}) => {
  const { value: currentValue, isUpdating, update } = useOptimisticUpdate(value);

  const handleSelect = async (newValue: string) => {
    const typedValue = newValue as typeof value;
    if (typedValue !== currentValue) {
      await update(typedValue, onChange);
    }
  };

  return (
    <Select
      value={currentValue}
      options={TYPE_OPTIONS}
      onChange={handleSelect}
      disabled={disabled}
      isLoading={isUpdating}
      className={className || "w-auto min-w-[100px] h-6 text-xs"}
    />
  );
};