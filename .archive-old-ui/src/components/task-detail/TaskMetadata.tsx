import { useTaskContext } from '../../context/TaskContext';
import type { Task } from '../../lib/types';
import { formatDate, hasDependencies } from '../../lib/utils/format';
import { TaskMoveDropdown } from './TaskMoveDropdown';

interface TaskMetadataProps {
  task: Task;
}

export function TaskMetadata({ task }: TaskMetadataProps) {
  const { refreshTasks } = useTaskContext();
  // Define metadata fields to display
  const metadataFields = [
    { label: 'ID', value: task.id },
    { label: 'Status', value: task.status },
    { label: 'Type', value: task.type },
    { label: 'Priority', value: task.priority || '—' },
    { label: 'Assigned To', value: task.assigned_to || '—' },
    { label: 'Created', value: formatDate(task.created_date) },
    { label: 'Updated', value: formatDate(task.updated_date) },
    { label: 'Due Date', value: formatDate(task.due_date, { showRelative: true }) },
    { label: 'Phase', value: task.phase || '—' },
  ];

  // Format feature/area information
  let featureArea = null;
  if (task.subdirectory) {
    let label = 'Location';

    if (task.subdirectory.startsWith('FEATURE_')) {
      label = 'Feature';
    } else if (task.subdirectory.startsWith('AREA_')) {
      label = 'Area';
    }

    // We'll handle the display separately with the TaskMoveDropdown
    featureArea = { label, value: null };
  }

  // Additional fields that are only displayed if they have values
  const optionalFields = [
    { label: 'Parent Task', value: task.parent_task || null },
    { label: 'Previous Task', value: task.previous_task || null },
    { label: 'Next Task', value: task.next_task || null },
    featureArea,
  ].filter((field) => field && field.value !== null);

  return (
    <div className="bg-card p-4 rounded-md border border-border">
      <h2 className="text-lg font-semibold mb-4">Task Metadata</h2>

      <div className="space-y-2">
        {metadataFields.map((field) => (
          <div key={field.label} className="grid grid-cols-3 gap-2">
            <div className="text-sm font-medium text-muted-foreground">{field.label}:</div>
            <div className="text-sm col-span-2">{field.value}</div>
          </div>
        ))}

        {/* Dependencies section */}
        {hasDependencies(task.depends_on) && (
          <div className="mt-3">
            <div className="text-sm font-medium text-muted-foreground mb-1">Dependencies:</div>
            <ul className="text-sm list-disc list-inside pl-2">
              {task.depends_on?.map((depId) => (
                <li key={depId} className="text-sm">
                  {depId}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags section */}
        {task.tags && task.tags.length > 0 && (
          <div className="mt-3">
            <div className="text-sm font-medium text-muted-foreground mb-1">Tags:</div>
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <span key={tag} className="bg-accent/20 text-xs px-2 py-1 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Optional fields */}
        {(optionalFields.length > 0 || task.subdirectory) && (
          <div className="border-t border-border mt-4 pt-4 space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Additional Information</div>

            {/* Regular optional fields */}
            {optionalFields.map((field) => (
              <div key={field.label} className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium text-muted-foreground">{field.label}:</div>
                <div className="text-sm col-span-2">{field.value}</div>
              </div>
            ))}

            {/* Feature/Area location with move dropdown */}
            {task.subdirectory && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-sm font-medium text-muted-foreground">
                  {task.subdirectory.startsWith('FEATURE_')
                    ? 'Feature'
                    : task.subdirectory.startsWith('AREA_')
                      ? 'Area'
                      : 'Location'}
                  :
                </div>
                <div className="text-sm col-span-2">
                  <TaskMoveDropdown task={task} onMoveComplete={refreshTasks} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
