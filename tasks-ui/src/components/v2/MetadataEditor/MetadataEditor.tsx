import type React from 'react';
import { User } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { TextInput } from './TextInput';
import { PriorityDropdown } from './PriorityDropdown';
import { StatusDropdown } from './StatusDropdown';
import { TagInput } from './TagInput';
import { TypeDropdown } from './TypeDropdown';
import { WorkflowStateDropdown } from './WorkflowStateDropdown';

export interface TaskMetadata {
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority: 'highest' | 'high' | 'medium' | 'low';
  type: 'feature' | 'bug' | 'chore' | 'documentation' | 'test' | 'spike' | 'idea';
  area: string;
  workflowState: 'backlog' | 'current' | 'archive';
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
  layout = 'horizontal',
}) => {
  const handleFieldUpdate = (field: keyof TaskMetadata) => async (value: any) => {
    await onUpdate(field, value);
  };

  if (layout === 'horizontal') {
    return (
      <div className={cn("w-fit", className)}>
        {/* 3-column grid with fixed spacing */}
        <div className="grid grid-cols-[auto_160px_auto_120px_auto_140px] gap-x-4 gap-y-2 items-center">
          {/* Row 1 */}
          <label className="text-xs text-muted-foreground">Status</label>
          <StatusDropdown
            value={metadata.status}
            onChange={handleFieldUpdate('status')}
            disabled={disabled}
          />
          
          <label className="text-xs text-muted-foreground">Priority</label>
          <PriorityDropdown
            value={metadata.priority}
            onChange={handleFieldUpdate('priority')}
            disabled={disabled}
          />

          <label className="text-xs text-muted-foreground">Type</label>
          <TypeDropdown
            value={metadata.type}
            onChange={handleFieldUpdate('type')}
            disabled={disabled}
          />

          {/* Row 2 */}
          <label className="text-xs text-muted-foreground">Workflow</label>
          <WorkflowStateDropdown
            value={metadata.workflowState}
            onChange={handleFieldUpdate('workflowState')}
            disabled={disabled}
          />

          <label className="text-xs text-muted-foreground">Area</label>
          <TextInput 
            value={metadata.area} 
            onChange={handleFieldUpdate('area')} 
            disabled={disabled}
            placeholder="Set area"
          />
          
          <label className="text-xs text-muted-foreground">Assignee</label>
          <TextInput
            value={metadata.assignee}
            onChange={handleFieldUpdate('assignee')}
            disabled={disabled}
            placeholder="Unassigned"
            icon={<User className="w-3 h-3" />}
          />
        </div>

        {/* Tags row - separate grid */}
        <div className="grid grid-cols-[auto_1fr] gap-x-4 mt-2 items-center">
          <label className="text-xs text-muted-foreground">Tags</label>
          <TagInput
            value={metadata.tags}
            onChange={handleFieldUpdate('tags')}
            disabled={disabled}
            className="max-w-[500px]"
          />
        </div>
      </div>
    );
  }

  // Vertical layout
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Status</label>
        <StatusDropdown
          value={metadata.status}
          onChange={handleFieldUpdate('status')}
          disabled={disabled}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Priority</label>
        <PriorityDropdown
          value={metadata.priority}
          onChange={handleFieldUpdate('priority')}
          disabled={disabled}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Type</label>
        <TypeDropdown
          value={metadata.type}
          onChange={handleFieldUpdate('type')}
          disabled={disabled}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Workflow</label>
        <WorkflowStateDropdown
          value={metadata.workflowState}
          onChange={handleFieldUpdate('workflowState')}
          disabled={disabled}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Area</label>
        <TextInput 
          value={metadata.area} 
          onChange={handleFieldUpdate('area')} 
          disabled={disabled}
          placeholder="Set area"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Assignee</label>
        <TextInput
          value={metadata.assignee}
          onChange={handleFieldUpdate('assignee')}
          disabled={disabled}
          placeholder="Unassigned"
          icon={<User className="w-3 h-3" />}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Tags</label>
        <TagInput
          value={metadata.tags}
          onChange={handleFieldUpdate('tags')}
          disabled={disabled}
        />
      </div>
    </div>
  );
};