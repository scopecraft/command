import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from './button';
import { ConfirmationDialog } from './confirmation-dialog';

const meta: Meta<typeof ConfirmationDialog> = {
  title: 'UI/ConfirmationDialog',
  component: ConfirmationDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConfirmationDialog>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Confirmation Dialog</Button>
        <ConfirmationDialog
          open={open}
          onOpenChange={setOpen}
          title="Are you sure?"
          description="This action cannot be undone."
          onConfirm={() => {
            console.log('Confirmed');
            setOpen(false);
          }}
        />
      </>
    );
  },
};

export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete Item
        </Button>
        <ConfirmationDialog
          open={open}
          onOpenChange={setOpen}
          title="Delete Task"
          description="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Delete"
          confirmVariant="destructive"
          onConfirm={() => {
            console.log('Deleted');
            setOpen(false);
          }}
        />
      </>
    );
  },
};

export const WithLoadingState: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
      setIsLoading(true);
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
      setOpen(false);
    };

    return (
      <>
        <Button onClick={() => setOpen(true)}>Delete with Loading</Button>
        <ConfirmationDialog
          open={open}
          onOpenChange={setOpen}
          title="Delete Task"
          description="Are you sure you want to delete this task?"
          confirmText="Delete"
          confirmVariant="destructive"
          onConfirm={handleConfirm}
          isLoading={isLoading}
        />
      </>
    );
  },
};

export const WithCustomContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [cascade, setCascade] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Delete Parent Task</Button>
        <ConfirmationDialog
          open={open}
          onOpenChange={setOpen}
          title="Delete Parent Task"
          description="This is a parent task with subtasks. How would you like to proceed?"
          confirmText="Delete"
          confirmVariant="destructive"
          onConfirm={() => {
            console.log('Deleted with cascade:', cascade);
            setOpen(false);
          }}
        >
          <div className="space-y-4">
            <div className="rounded-lg border p-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={cascade}
                  onChange={(e) => setCascade(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Delete all subtasks as well</span>
              </label>
              {cascade && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Warning: This will permanently delete all 5 subtasks
                </p>
              )}
            </div>
          </div>
        </ConfirmationDialog>
      </>
    );
  },
};

export const CustomTexts: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Custom Texts</Button>
        <ConfirmationDialog
          open={open}
          onOpenChange={setOpen}
          title="Remove Access?"
          description="This user will no longer have access to the system."
          confirmText="Yes, Remove Access"
          cancelText="No, Keep Access"
          confirmVariant="destructive"
          onConfirm={() => {
            console.log('Access removed');
            setOpen(false);
          }}
        />
      </>
    );
  },
};
