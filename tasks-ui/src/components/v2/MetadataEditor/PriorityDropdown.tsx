import React from 'react';
import { getPriorityValues } from '@core/metadata/schema-service';
import { getPriorityLucideIcon } from '../../../lib/schema-client';
import { Select } from '../../ui/select';
import { useOptimisticUpdate } from './useOptimisticUpdate';

// Get priority options dynamically from schema
const getPriorityOptions = () => {
  const priorityValues = getPriorityValues();
  return priorityValues.map((priority) => {
    const IconComponent = getPriorityLucideIcon(priority.name);
    return {
      value: priority.name,
      label: priority.label,
      icon: IconComponent ? <IconComponent className="h-4 w-4" /> : undefined
    };
  });
};

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
  const priorityOptions = React.useMemo(() => getPriorityOptions(), []);
  
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