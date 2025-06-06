import React from 'react';
import { Archive, Clock, FolderOpen } from 'lucide-react';
import { Select } from '../../ui/select';
import { useOptimisticUpdate } from './useOptimisticUpdate';

export interface WorkflowStateDropdownProps {
  value: 'backlog' | 'current' | 'archive';
  onChange: (value: 'backlog' | 'current' | 'archive') => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const WORKFLOW_STATE_OPTIONS = [
  { 
    value: 'backlog' as const, 
    label: 'Backlog',
    icon: <Clock className="w-3 h-3" />
  },
  { 
    value: 'current' as const, 
    label: 'Current',
    icon: <FolderOpen className="w-3 h-3" />
  },
  { 
    value: 'archive' as const, 
    label: 'Archive',
    icon: <Archive className="w-3 h-3" />
  },
];

export const WorkflowStateDropdown: React.FC<WorkflowStateDropdownProps> = ({
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
      options={WORKFLOW_STATE_OPTIONS}
      onChange={handleSelect}
      disabled={disabled}
      isLoading={isUpdating}
      className={className || "w-auto min-w-[100px] h-6 text-xs"}
    />
  );
};