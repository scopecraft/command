import { Search, X } from 'lucide-react';
import React from 'react';
import { cn } from '../../lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
  autoFocus?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 text-sm',
  md: 'h-9 text-sm',
  lg: 'h-10 text-base',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  onClear,
  autoFocus = false,
  size = 'md',
}: SearchInputProps) {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search
        className={cn('absolute left-3 text-muted-foreground pointer-events-none', iconSizes[size])}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'flex w-full rounded-md border border-input bg-background pl-10 pr-10 text-sm ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          sizeClasses[size]
        )}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            'absolute right-3 text-muted-foreground hover:text-foreground transition-colors',
            'flex items-center justify-center rounded-sm',
            'hover:bg-muted p-1'
          )}
          aria-label="Clear search"
        >
          <X className={iconSizes[size]} />
        </button>
      )}
    </div>
  );
}
