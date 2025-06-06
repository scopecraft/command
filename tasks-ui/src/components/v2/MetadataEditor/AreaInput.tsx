import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { useOptimisticUpdate } from './useOptimisticUpdate';

export interface AreaInputProps {
  value: string;
  onChange: (value: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export const AreaInput: React.FC<AreaInputProps> = ({
  value,
  onChange,
  disabled = false,
  className
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
          "text-xs bg-muted/20 border border-ring rounded px-2 py-1 min-w-[80px] outline-none",
          "focus:ring-1 focus:ring-ring",
          className
        )}
        placeholder="Area"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={handleEdit}
      disabled={disabled}
      className={cn(
        "text-xs text-left bg-muted/20 hover:bg-muted/30 rounded px-2 py-1 min-w-[80px]",
        "border border-border hover:border-muted-foreground/50",
        "transition-colors duration-150 min-h-[28px] flex items-center",
        "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {currentValue || 'Set area'}
    </button>
  );
};