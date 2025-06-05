import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-onboarding",
    "@storybook/addon-docs",
    "@storybook/addon-themes"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  async viteFinal(config) {
    // Add custom Vite configuration for Storybook
    return mergeConfig(config, {
      define: {
        // Define a global flag to indicate we're in Storybook
        'import.meta.env.STORYBOOK': JSON.stringify(true),
      },
    });
  },
};
export default config;