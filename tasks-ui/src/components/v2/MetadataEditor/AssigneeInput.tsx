import { User } from 'lucide-react';
import React from 'react';
import { cn } from '../../../lib/utils';
import { useOptimisticUpdate } from './useOptimisticUpdate';

export interface AssigneeInputProps {
  value?: string;
  onChange: (value: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const AssigneeInput: React.FC<AssigneeInputProps> = ({
  value: initialValue = '',
  onChange,
  disabled = false,
  className,
  placeholder = 'Unassigned',
}) => {
  const { value, isUpdating, update } = useOptimisticUpdate(initialValue);
  const [isEditing, setIsEditing] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    setIsEditing(false);
    if (localValue !== value) {
      await update(localValue, onChange);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLocalValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => !disabled && setIsEditing(true)}
        disabled={disabled || isUpdating}
        className={cn(
          'flex items-center gap-2 px-2 py-1 rounded transition-all',
          'bg-muted/20 border border-border',
          'hover:bg-muted/30 hover:border-muted-foreground/50',
          'focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring',
          'text-xs min-h-[28px]',
          disabled && 'opacity-50 cursor-not-allowed',
          isUpdating && 'opacity-70',
          !value && 'text-muted-foreground',
          className
        )}
      >
        <User className="h-3 w-3" />
        <span className="flex-1 text-left">{value || placeholder}</span>
        {isUpdating && (
          <div className="ml-2 w-3 h-3 border-2 border-atlas-light border-t-transparent rounded-full animate-spin" />
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-1.5 rounded-md',
          'bg-terminal-dark border border-atlas-light',
          'text-cream placeholder-gray-400',
          'font-jetbrains-mono text-sm',
          'focus:outline-none focus:border-atlas-light',
          className
        )}
      />
    </div>
  );
};
