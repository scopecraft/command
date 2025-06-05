import React from 'react';
import { StatusDropdown } from './StatusDropdown';
import { PriorityDropdown } from './PriorityDropdown';
import { AssigneeInput } from './AssigneeInput';
import { TagInput } from './TagInput';
import { cn } from '../../../lib/utils';

export interface TaskMetadata {
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority: 'highest' | 'high' | 'medium' | 'low';
  assignee?: string;
  tags: string[];
}

export interface MetadataEditorProps {
  taskId: string;
  metadata: TaskMetadata;
  onUpdate: (field: keyof TaskMetadata, value: any) => Promise<void>;
  className?: string;
  disabled?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  taskId,
  metadata,
  onUpdate,
  className,
  disabled = false,
  layout = 'horizontal'
}) => {
  const handleFieldUpdate = (field: keyof TaskMetadata) => async (value: any) => {
    await onUpdate(field, value);
  };
  
  const containerClass = cn(
    "gap-4",
    layout === 'horizontal' ? "flex flex-wrap items-center" : "flex flex-col",
    className
  );
  
  const fieldGroupClass = layout === 'horizontal' 
    ? "flex items-center gap-2" 
    : "flex flex-col gap-1";
  
  return (
    <div className={containerClass}>
      <div className={fieldGroupClass}>
        <label className="text-xs uppercase text-gray-400 font-jetbrains-mono">
          Status
        </label>
        <StatusDropdown
          value={metadata.status}
          onChange={handleFieldUpdate('status')}
          disabled={disabled}
        />
      </div>
      
      <div className={fieldGroupClass}>
        <label className="text-xs uppercase text-gray-400 font-jetbrains-mono">
          Priority
        </label>
        <PriorityDropdown
          value={metadata.priority}
          onChange={handleFieldUpdate('priority')}
          disabled={disabled}
        />
      </div>
      
      <div className={fieldGroupClass}>
        <label className="text-xs uppercase text-gray-400 font-jetbrains-mono">
          Assignee
        </label>
        <AssigneeInput
          value={metadata.assignee}
          onChange={handleFieldUpdate('assignee')}
          disabled={disabled}
        />
      </div>
      
      <div className={cn(fieldGroupClass, layout === 'horizontal' && "flex-1")}>
        <label className="text-xs uppercase text-gray-400 font-jetbrains-mono">
          Tags
        </label>
        <TagInput
          value={metadata.tags}
          onChange={handleFieldUpdate('tags')}
          disabled={disabled}
          className={layout === 'horizontal' ? "flex-1" : ""}
        />
      </div>
    </div>
  );
};