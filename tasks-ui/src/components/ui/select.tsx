import React from 'react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  isLoading?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  value,
  options,
  onChange,
  disabled = false,
  className,
  placeholder = 'Select...',
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  const handleSelect = (newValue: string) => {
    setIsOpen(false);
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md transition-all',
          '[background-color:hsl(var(--background))] border border-gray-800',
          'hover:border-atlas-light focus:outline-none focus:border-atlas-light',
          'font-jetbrains-mono text-sm uppercase',
          disabled && 'opacity-50 cursor-not-allowed',
          isLoading && 'opacity-70',
          className
        )}
      >
        {selectedOption?.icon && selectedOption.icon}
        <span className="text-cream">{displayLabel}</span>
        {!disabled && (
          <svg
            className={cn('w-4 h-4 ml-auto transition-transform', isOpen && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        {isLoading && (
          <div className="ml-2 w-3 h-3 border-2 border-atlas-light border-t-transparent rounded-full animate-spin" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full [background-color:hsl(var(--background))] border border-gray-800 rounded-md shadow-lg">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors',
                'hover:bg-atlas-navy hover:text-cream',
                'font-jetbrains-mono text-sm uppercase',
                value === option.value && 'bg-atlas-navy/50'
              )}
            >
              {option.icon && option.icon}
              <span>{option.label}</span>
              {value === option.value && (
                <svg
                  className="w-4 h-4 ml-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
