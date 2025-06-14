import { useCommandCenter } from '../context/CommandCenterProvider';
import { CommandCenter } from './CommandCenter';

export function CommandCenterWrapper() {
  const { 
    isOpen, 
    closeCommandCenter, 
    searchTasks,
    createTask, 
    selectResult,
    isSearching, 
    isCreating, 
    searchError,
    createError 
  } = useCommandCenter();

  return (
    <CommandCenter
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeCommandCenter();
      }}
      onSearch={searchTasks}
      onTaskCreate={createTask}
      onResultSelect={selectResult}
      isSearchLoading={isSearching}
      isCreateLoading={isCreating}
      error={searchError || createError}
    />
  );
}