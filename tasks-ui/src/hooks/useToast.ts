import { useCallback } from 'react';
import { useUIContext } from '../context/UIContext';
import type { Toast } from '../lib/types';

export function useToast() {
  const { addToast } = useUIContext();

  const toast = useCallback(
    (props: Omit<Toast, 'id'>) => {
      addToast(props);
    },
    [addToast]
  );

  // Predefined toast types for convenience

  const success = useCallback(
    (message: string, title = 'Success', duration?: number) => {
      toast({
        type: 'success',
        title,
        message,
        duration,
      });
    },
    [toast]
  );

  const error = useCallback(
    (message: string, title = 'Error', duration?: number) => {
      toast({
        type: 'error',
        title,
        message,
        duration,
      });
    },
    [toast]
  );

  const info = useCallback(
    (message: string, title = 'Info', duration?: number) => {
      toast({
        type: 'info',
        title,
        message,
        duration,
      });
    },
    [toast]
  );

  const warning = useCallback(
    (message: string, title = 'Warning', duration?: number) => {
      toast({
        type: 'warning',
        title,
        message,
        duration,
      });
    },
    [toast]
  );

  return {
    toast,
    success,
    error,
    info,
    warning,
  };
}
