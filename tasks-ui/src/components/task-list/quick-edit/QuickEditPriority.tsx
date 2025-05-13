import { cn } from '../../../lib/utils';

// List of available priorities (could come from a configuration)
const PRIORITIES = [
  '🔥 Highest',
  '🔼 High',
  '▶️ Medium',
  '🔽 Low',
];

interface QuickEditPriorityProps {
  value: string;
  onChange: (value: string) => void;
}

export function QuickEditPriority({ value, onChange }: QuickEditPriorityProps) {
  return (
    <div className="flex flex-col space-y-1">
      {PRIORITIES.map((priority) => (
        <button
          key={priority}
          type="button"
          className={cn(
            'text-xs text-left py-1 px-2 rounded-sm hover:bg-accent transition-colors',
            value === priority && 'bg-accent/50'
          )}
          onClick={() => onChange(priority)}
        >
          {priority}
        </button>
      ))}
    </div>
  );
}