import { useCommandPalette } from '../context/CommandPaletteProvider';
import { CommandPalette } from './ui/command-palette';

export function CommandPaletteWrapper() {
  const { isOpen, closeCommandPalette, createTask, isCreating, error } = useCommandPalette();

  return (
    <CommandPalette
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeCommandPalette();
      }}
      onTaskCreate={createTask}
      isLoading={isCreating}
      error={error}
    />
  );
}
