import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import type { Toast as ToastType } from '../../lib/types';

// Import the ToastItem component directly from the file
// Note: In a real scenario, we'd export ToastItem from Toast.tsx
const ToastItemStory = ({ toast, onClose }: { toast: ToastType; onClose: () => void }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose();
    }, toast.duration || 5000);
    return () => clearTimeout(timeout);
  }, [toast, onClose]);

  const getIconByType = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
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
      className={`p-4 rounded-md border shadow-md backdrop-blur-sm min-w-64 max-w-md ${getColorByType()}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5 text-xl">{getIconByType()}</div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{toast.title}</h4>
          <p className="text-xs text-muted-foreground">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-full p-0.5 opacity-70 hover:opacity-100"
          aria-label="Close toast"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Interactive wrapper for demonstrating toasts
const ToastDemo = () => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = (type: ToastType['type'], title: string, message: string) => {
    const newToast: ToastType = {
      id: Date.now().toString(),
      type,
      title,
      message,
      duration: 5000,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => addToast('success', 'Success!', 'Task has been saved successfully.')}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          Show Success
        </button>
        <button
          onClick={() => addToast('error', 'Error', 'Failed to save task. Please try again.')}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Show Error
        </button>
        <button
          onClick={() => addToast('warning', 'Warning', 'This action cannot be undone.')}
          className="px-3 py-1 bg-yellow-500 text-white rounded"
        >
          Show Warning
        </button>
        <button
          onClick={() => addToast('info', 'Info', 'New updates are available.')}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Show Info
        </button>
      </div>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItemStory key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
};

const meta = {
  title: 'UI/Toast',
  component: ToastItemStory,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToastItemStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: () => <ToastDemo />,
};

export const Success: Story = {
  args: {
    toast: {
      id: '1',
      type: 'success',
      title: 'Task Saved',
      message: 'Your changes have been saved successfully.',
      duration: 5000,
    },
    onClose: () => console.log('Toast closed'),
  },
};

export const Error: Story = {
  args: {
    toast: {
      id: '2',
      type: 'error',
      title: 'Error Occurred',
      message: 'Failed to update task. Please check your connection and try again.',
      duration: 5000,
    },
    onClose: () => console.log('Toast closed'),
  },
};

export const Warning: Story = {
  args: {
    toast: {
      id: '3',
      type: 'warning',
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Are you sure you want to leave?',
      duration: 5000,
    },
    onClose: () => console.log('Toast closed'),
  },
};

export const Info: Story = {
  args: {
    toast: {
      id: '4',
      type: 'info',
      title: 'Tip',
      message: 'Press Ctrl+S to quickly save your changes.',
      duration: 5000,
    },
    onClose: () => console.log('Toast closed'),
  },
};

export const LongContent: Story = {
  args: {
    toast: {
      id: '5',
      type: 'error',
      title: 'Multiple Errors Found',
      message:
        'The following errors were encountered: Invalid task type, missing required fields (priority, assignee), duplicate task ID detected in the system. Please review and correct these issues before proceeding.',
      duration: 10000,
    },
    onClose: () => console.log('Toast closed'),
  },
};

export const ShortContent: Story = {
  args: {
    toast: {
      id: '6',
      type: 'success',
      title: 'Done!',
      message: 'All set.',
      duration: 3000,
    },
    onClose: () => console.log('Toast closed'),
  },
};