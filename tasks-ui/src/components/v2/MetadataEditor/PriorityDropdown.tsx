import React from 'react';
import { PriorityIcon } from '../../../lib/icons';
import { Select } from '../../ui/select';
import { useOptimisticUpdate } from './useOptimisticUpdate';

// Priority options with proper icons
const priorityOptions = [
  { 
    value: 'highest', 
    label: 'Highest',
    icon: <PriorityIcon priority="highest" size="sm" />
  },
  { 
    value: 'high', 
    label: 'High',
    icon: <PriorityIcon priority="high" size="sm" />
  },
  { 
    value: 'medium', 
    label: 'Medium',
    icon: <PriorityIcon priority="medium" size="sm" />
  },
  { 
    value: 'low', 
    label: 'Low',
    icon: <PriorityIcon priority="low" size="sm" />
  }
];

export interface PriorityDropdownProps {
  value: string;
  onChange: (value: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export const PriorityDropdown: React.FC<PriorityDropdownProps> = ({
  value: initialValue,
  onChange,
  disabled = false,
  className
}) => {
  const { value, isUpdating, update } = useOptimisticUpdate(initialValue);
  
  const handleSelect = async (newValue: string) => {
    if (newValue !== value) {
      await update(newValue, onChange);
    }
  };
  
  return (
    <Select
      value={value}
      options={priorityOptions}
      onChange={handleSelect}
      disabled={disabled}
      isLoading={isUpdating}
      className={className}
    />
  );
};