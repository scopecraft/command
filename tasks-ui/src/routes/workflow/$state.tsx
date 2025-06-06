import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/workflow/$state')({
  beforeLoad: ({ params }) => {
    const { state } = params;

    // Redirect to tasks page with workflow filter
    throw redirect({
      to: '/tasks',
      search: {
        workflow: state,
      },
    });
  },
});
