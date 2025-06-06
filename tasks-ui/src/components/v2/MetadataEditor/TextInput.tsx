import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { useOptimisticUpdate } from './useOptimisticUpdate';

export interface TextInputProps {
  value?: string;
  onChange: (value: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

export const TextInput: React.FC<TextInputProps> = ({
  value = '',
  onChange,
  disabled = false,
  className,
  placeholder = 'Click to edit',
  icon
}) => {
  const { value: currentValue, isUpdating, update } = useOptimisticUpdate(value);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (!disabled) {
      setEditValue(currentValue);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (editValue.trim() !== currentValue) {
      await update(editValue.trim(), onChange);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(currentValue);
    setIsEditing(false);
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

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={isUpdating}
        className={cn(
          "text-xs bg-background border border-ring rounded px-2 py-1 outline-none",
          "focus:ring-1 focus:ring-ring min-h-[28px]",
          className
        )}
        placeholder={placeholder}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={handleEdit}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 text-xs text-left rounded px-2 py-1 min-h-[28px]",
        "bg-transparent border border-transparent",
        "hover:bg-muted/30 hover:border-border",
        "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring",
        "transition-all duration-150",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1">
        {currentValue || <span className="text-muted-foreground">{placeholder}</span>}
      </span>
    </button>
  );
};