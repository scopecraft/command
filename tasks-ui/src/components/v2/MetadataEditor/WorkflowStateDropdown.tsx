import React from 'react';
import { getWorkflowStateValues } from '@core/metadata/schema-service';
import { getWorkflowStateLucideIcon } from '../../../lib/schema-client';
import { Select } from '../../ui/select';
import { useOptimisticUpdate } from './useOptimisticUpdate';

export interface WorkflowStateDropdownProps {
  value: string;
  onChange: (value: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

// Get workflow state options dynamically from schema
const getWorkflowStateOptions = () => {
  const workflowStateValues = getWorkflowStateValues();
  return workflowStateValues.map((state) => {
    const IconComponent = getWorkflowStateLucideIcon(state.name);
    return {
      value: state.name,
      label: state.label,
      icon: IconComponent ? <IconComponent className="h-4 w-4" /> : undefined
    };
  });
};

export const WorkflowStateDropdown: React.FC<WorkflowStateDropdownProps> = ({
  value,
  onChange,
  disabled = false,
  className
}) => {
  const { value: currentValue, isUpdating, update } = useOptimisticUpdate(value);
  const workflowStateOptions = React.useMemo(() => getWorkflowStateOptions(), []);

  const handleSelect = async (newValue: string) => {
    if (newValue !== currentValue) {
      await update(newValue, onChange);
    }
  };

  return (
    <Select
      value={currentValue}
      options={workflowStateOptions}
      onChange={handleSelect}
      disabled={disabled}
      isLoading={isUpdating}
      className={className || "w-auto min-w-[100px] h-6 text-xs"}
    />
  );
};