import React from 'react';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { cn } from '../../../lib/utils';

export interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => Promise<void>;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  suggestions?: string[];
}

export const TagInput: React.FC<TagInputProps> = ({
  value: initialValue = [],
  onChange,
  disabled = false,
  className,
  placeholder = 'Add tag...',
  suggestions = ['frontend', 'backend', 'api', 'ui', 'bug', 'feature', 'security', 'performance']
}) => {
  const { value, isUpdating, update } = useOptimisticUpdate(initialValue);
  const [isAdding, setIsAdding] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const filteredSuggestions = suggestions.filter(
    s => !value.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase())
  );
  
  React.useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);
  
  const handleAddTag = async (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      await update([...value, trimmedTag], onChange);
    }
    setInputValue('');
    setIsAdding(false);
    setShowSuggestions(false);
  };
  
  const handleRemoveTag = async (tagToRemove: string) => {
    await update(value.filter(t => t !== tagToRemove), onChange);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsAdding(false);
      setInputValue('');
      setShowSuggestions(false);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      e.preventDefault();
      handleRemoveTag(value[value.length - 1]);
    }
  };
  
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 px-2 py-1 rounded transition-all",
          "bg-transparent border border-transparent min-h-[28px]",
          "hover:bg-muted/30 hover:border-border",
          "focus-within:bg-transparent focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
          isAdding && "bg-transparent border-ring ring-1 ring-ring",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && !isAdding && setIsAdding(true)}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded",
              "bg-muted/50 text-foreground text-xs",
              "transition-colors hover:bg-muted/70"
            )}
          >
            #{tag}
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTag(tag);
                }}
                className="hover:text-forge-rust transition-colors"
              >
                ×
              </button>
            )}
          </span>
        ))}
        
        {isAdding ? (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setTimeout(() => {
                setIsAdding(false);
                setInputValue('');
                setShowSuggestions(false);
              }, 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "flex-1 min-w-[100px] bg-transparent outline-none",
              "text-cream placeholder-gray-400",
              "font-jetbrains-mono text-sm"
            )}
          />
        ) : (
          !disabled && value.length === 0 && (
            <span className="text-gray-400 text-sm font-jetbrains-mono">
              {placeholder}
            </span>
          )
        )}
        
        {!disabled && !isAdding && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAdding(true);
            }}
            className="text-gray-400 hover:text-cream transition-colors"
          >
            +
          </button>
        )}
        
        {isUpdating && (
          <div className="ml-2 w-3 h-3 border-2 border-atlas-light border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      
      {showSuggestions && filteredSuggestions.length > 0 && isAdding && (
        <div className="absolute z-50 mt-1 w-full bg-terminal-dark border border-gray-800 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onMouseDown={(e) => {
                e.preventDefault();
                handleAddTag(suggestion);
              }}
              className={cn(
                "w-full px-3 py-2 text-left transition-colors",
                "hover:bg-atlas-navy hover:text-cream",
                "font-jetbrains-mono text-sm"
              )}
            >
              #{suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};