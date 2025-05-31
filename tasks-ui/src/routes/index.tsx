import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Redirect to tasks page
    throw redirect({
      to: '/tasks',
    });
  },
});
