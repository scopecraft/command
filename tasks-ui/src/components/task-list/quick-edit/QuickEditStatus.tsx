import { useState } from 'react';
import { cn } from '../../../lib/utils';

// List of available statuses (could come from a configuration)
const STATUSES = [
  '🟡 To Do',
  '🔵 In Progress',
  '🟣 Blocked',
  '🔶 In Review',
  '🟢 Done',
];

interface QuickEditStatusProps {
  value: string;
  onChange: (value: string) => void;
}

export function QuickEditStatus({ value, onChange }: QuickEditStatusProps) {
  return (
    <div className="flex flex-col space-y-1">
      {STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          className={cn(
            'text-xs text-left py-1 px-2 rounded-sm hover:bg-accent transition-colors',
            value === status && 'bg-accent/50'
          )}
          onClick={() => onChange(status)}
        >
          {status}
        </button>
      ))}
    </div>
  );
}