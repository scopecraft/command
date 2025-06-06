import React from 'react';
import { getStatusValues } from '@core/metadata/schema-service';
import { getStatusLucideIcon } from '../../../lib/schema-client';
import type { TaskStatus } from '../../../lib/types';
import { Select } from '../../ui/select';
import { useOptimisticUpdate } from './useOptimisticUpdate';

// Get status options dynamically from schema
const getStatusOptions = () => {
  const statusValues = getStatusValues();
  return statusValues.map((status) => {
    const IconComponent = getStatusLucideIcon(status.name);
    return {
      value: status.name as TaskStatus,
      label: status.label,
      icon: IconComponent ? <IconComponent className="h-4 w-4" /> : undefined
    };
  });
};

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
  const statusOptions = React.useMemo(() => getStatusOptions(), []);
  
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