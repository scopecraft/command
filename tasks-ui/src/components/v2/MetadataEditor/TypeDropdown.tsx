import { getTypeValues } from '@core/metadata/schema-service';
import React from 'react';
import { getTypeLucideIcon } from '../../../lib/schema-client';
import { Select } from '../../ui/select';
import { useOptimisticUpdate } from './useOptimisticUpdate';

export interface TypeDropdownProps {
  value: string;
  onChange: (value: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

// Get type options dynamically from schema
const getTypeOptions = () => {
  const typeValues = getTypeValues();
  return typeValues.map((type) => {
    const IconComponent = getTypeLucideIcon(type.name);
    return {
      value: type.name,
      label: type.label,
      icon: IconComponent ? <IconComponent className="h-4 w-4" /> : undefined,
    };
  });
};

export const TypeDropdown: React.FC<TypeDropdownProps> = ({
  value,
  onChange,
  disabled = false,
  className,
}) => {
  const { value: currentValue, isUpdating, update } = useOptimisticUpdate(value);
  const typeOptions = React.useMemo(() => getTypeOptions(), []);

  const handleSelect = async (newValue: string) => {
    if (newValue !== currentValue) {
      await update(newValue, onChange);
    }
  };

  return (
    <Select
      value={currentValue}
      options={typeOptions}
      onChange={handleSelect}
      disabled={disabled}
      isLoading={isUpdating}
      className={className || 'w-auto min-w-[100px] h-6 text-xs'}
    />
  );
};
