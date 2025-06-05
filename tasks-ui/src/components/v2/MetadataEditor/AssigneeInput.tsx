import React from 'react';
import { User } from 'lucide-react';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { cn } from '../../../lib/utils';

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
  placeholder = 'Unassigned'
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
          "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all",
          "bg-terminal-dark border border-gray-800",
          "hover:border-atlas-light focus:outline-none focus:border-atlas-light",
          "font-jetbrains-mono text-sm",
          disabled && "opacity-50 cursor-not-allowed",
          isUpdating && "opacity-70",
          !value && "text-gray-400",
          className
        )}
      >
        <User className="h-3 w-3" />
        <span className="text-cream">{value || placeholder}</span>
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
          "w-full px-3 py-1.5 rounded-md",
          "bg-terminal-dark border border-atlas-light",
          "text-cream placeholder-gray-400",
          "font-jetbrains-mono text-sm",
          "focus:outline-none focus:border-atlas-light",
          className
        )}
      />
    </div>
  );
};