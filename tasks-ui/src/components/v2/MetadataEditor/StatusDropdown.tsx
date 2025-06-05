import React from 'react';
import { StatusIcon } from '../../../lib/icons';
import type { TaskStatus } from '../../../lib/types';
import { Select } from '../../ui/select';
import { useOptimisticUpdate } from './useOptimisticUpdate';

// Status options with proper types and icons
const statusOptions = [
  { 
    value: 'todo' as TaskStatus, 
    label: 'To Do',
    icon: <StatusIcon status="todo" size="sm" />
  },
  { 
    value: 'in_progress' as TaskStatus, 
    label: 'In Progress',
    icon: <StatusIcon status="in_progress" size="sm" />
  },
  { 
    value: 'done' as TaskStatus, 
    label: 'Done',
    icon: <StatusIcon status="done" size="sm" />
  },
  { 
    value: 'blocked' as TaskStatus, 
    label: 'Blocked',
    icon: <StatusIcon status="blocked" size="sm" />
  }
];

export interface StatusDropdownProps {
  value: string;
  onChange: (value: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({
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
      options={statusOptions}
      onChange={handleSelect}
      disabled={disabled}
      isLoading={isUpdating}
      className={className}
    />
  );
};