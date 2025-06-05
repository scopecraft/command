import React from 'react'
import type { Preview, Renderer, Decorator } from '@storybook/react-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import { RouterProvider, createRouter, createRootRoute } from '@tanstack/react-router'
import '../src/styles.css'

// Router decorator that creates a fresh router for each story
const RouterDecorator: Decorator = (Story) => {
  const rootRoute = createRootRoute({ component: () => <Story /> });
  const routeTree = rootRoute;
  const router = createRouter({ routeTree });
  return <RouterProvider router={router} />;
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    layout: 'padded',
  },
  decorators: [
    withThemeByClassName<Renderer>({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    RouterDecorator,
    (Story) => (
      <div className="min-h-screen bg-background text-foreground p-4">
        <Story />
      </div>
    ),
  ]
};

export default preview;