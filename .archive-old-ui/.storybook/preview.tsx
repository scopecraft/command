import React from 'react'
import type { Preview, Renderer } from '@storybook/react-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import '../src/index.css' // Import Tailwind CSS

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
    (Story) => (
      <div className="min-h-screen bg-background text-foreground p-4">
        <Story />
      </div>
    ),
  ]
};

export default preview;