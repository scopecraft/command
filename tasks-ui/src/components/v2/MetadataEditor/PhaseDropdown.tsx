import { getPhaseValues } from '@core/metadata/schema-service';
import React from 'react';
import { getPhaseLucideIcon } from '../../../lib/schema-client';
import type { TaskPhase } from '../../../lib/types';
import { Select } from '../../ui/select';
import { useOptimisticUpdate } from './useOptimisticUpdate';

// Get phase options dynamically from schema
const getPhaseOptions = () => {
  const phaseValues = getPhaseValues();
  return phaseValues.map((phase) => {
    const IconComponent = getPhaseLucideIcon(phase.name);
    return {
      value: phase.name as TaskPhase,
      label: phase.label,
      icon: IconComponent ? <IconComponent className="h-4 w-4" /> : undefined,
    };
  });
};

export interface PhaseDropdownProps {
  value: string;
  onChange: (value: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export const PhaseDropdown: React.FC<PhaseDropdownProps> = ({
  value: initialValue,
  onChange,
  disabled = false,
  className,
}) => {
  const { value, isUpdating, update } = useOptimisticUpdate(initialValue);
  const phaseOptions = React.useMemo(() => getPhaseOptions(), []);

  const handleSelect = async (newValue: string) => {
    if (newValue !== value) {
      await update(newValue, onChange);
    }
  };

  return (
    <Select
      value={value}
      options={phaseOptions}
      onChange={handleSelect}
      disabled={disabled}
      isLoading={isUpdating}
      className={className}
    />
  );
};
