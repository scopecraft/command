import { useCallback, useState } from 'react';

/**
 * Hook for managing optimistic updates with rollback on error
 * @param initialValue - The initial value
 * @returns Object with current value, loading state, and update function
 */
export function useOptimisticUpdate<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (newValue: T, updateFn: (value: T) => Promise<void>) => {
      const previousValue = value;
      setValue(newValue); // Optimistic update
      setIsUpdating(true);
      setError(null);

      try {
        await updateFn(newValue);
      } catch (err) {
        setValue(previousValue); // Rollback on error
        setError(err instanceof Error ? err : new Error('Update failed'));
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [value]
  );

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue]);

  return {
    value,
    isUpdating,
    error,
    update,
    reset,
  };
}
