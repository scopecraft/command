import { useEffect } from 'react';
import { useUIContext } from '../../context/UIContext';
import type { Toast as ToastType } from '../../lib/types';
import { cn } from '../../lib/utils';

export function ToastContainer() {
  const { ui, removeToast } = useUIContext();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {ui.toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: ToastType;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  useEffect(() => {
    // Auto-close toast after duration
    const timeout = setTimeout(() => {
      onClose();
    }, toast.duration || 5000);

    return () => clearTimeout(timeout);
  }, [toast, onClose]);

  const getIconByType = () => {
    switch (toast.type) {
      case 'success':
        return <SuccessIcon className="h-5 w-5" />;
      case 'error':
        return <ErrorIcon className="h-5 w-5" />;
      case 'warning':
        return <WarningIcon className="h-5 w-5" />;
      case 'info':
        return <InfoIcon className="h-5 w-5" />;
    }
  };

  const getColorByType = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-500 bg-green-500/10';
      case 'error':
        return 'border-red-500 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'info':
        return 'border-blue-500 bg-blue-500/10';
    }
  };

  return (
    <div
      className={cn(
        'p-4 rounded-md border shadow-md backdrop-blur-sm min-w-64 max-w-md animate-in fade-in-50 slide-in-from-bottom-5',
        getColorByType()
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{getIconByType()}</div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{toast.title}</h4>
          <p className="text-xs text-muted-foreground">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-full p-0.5 opacity-70 hover:opacity-100"
          aria-label="Close toast"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Simple icons
function SuccessIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('text-green-500', className)}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('text-red-500', className)}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('text-yellow-500', className)}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('text-blue-500', className)}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
