// Legacy wrapper - now uses the new unified CommandCenter
// This provides backward compatibility for existing imports
import { useCommandCenter } from '../context/CommandCenterProvider';
import { CommandCenter } from './CommandCenter';

export function CommandPaletteWrapper() {
  const {
    isOpen,
    closeCommandCenter,
    searchTasks,
    createTask,
    selectResult,
    isSearching,
    isCreating,
    searchError,
    createError,
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
      // Start in create mode for backward compatibility
      initialQuery="+"
    />
  );
}
