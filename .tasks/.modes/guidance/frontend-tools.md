# Frontend Tools Guidance

## When This Applies
When working on frontend tasks involving build tools, development environment, testing, or frontend infrastructure.

## Key Considerations

### Development Environment
- Is the dev server running smoothly?
- Are hot module replacement (HMR) and fast refresh working?
- Do we have proper TypeScript checking in place?
- Are linting and formatting automated?

### Build and Bundle
- What's the bundle size impact?
- Are we code-splitting effectively?
- Is tree-shaking working for unused code?
- Are assets optimized (images, fonts)?

### Testing Strategy
- Unit tests for logic and utilities
- Component tests for UI behavior
- Integration tests for user flows
- Visual regression tests for UI consistency

### Developer Experience
- Clear error messages and stack traces
- Fast feedback loops (test, lint, build)
- Good IDE support and autocomplete
- Helpful documentation and examples

## Investigation Approaches

### Understanding the Toolchain
- **Library Documentation**: Use Context7 for any package or tool you encounter - essential for understanding configuration, APIs, and usage patterns
- **Configuration Analysis**: Use Read to examine config files like `vite.config.ts`, `package.json`, `tsconfig.json`
- **Pattern Discovery**: Use Grep to find usage patterns, build scripts, and import conventions

## Common Investigation Areas

### Configuration Questions
- How is the build tool configured?
- What are the development vs production settings?
- How are imports and aliases set up?
- What testing framework is being used?

### Performance Questions
- How is code splitting implemented?
- What's the bundle size and composition?
- Are there performance bottlenecks in the build?
- How are assets optimized?

### Development Workflow Questions
- What's the local development setup?
- How does hot reload work?
- What linting and formatting rules are in place?
- How are tests run and organized?

## Common Frontend Tooling Tasks

### Setting Up New Tools
1. Check compatibility with existing stack
2. Review configuration options
3. Test in development environment
4. Verify production builds work
5. Update CI/CD pipelines
6. Document for team

### Performance Optimization
- Analyze bundle with `vite-bundle-visualizer`
- Identify large dependencies
- Implement code splitting
- Optimize asset loading
- Configure caching strategies

### Developer Workflow
- Set up path aliases for cleaner imports
- Configure hot reload boundaries
- Implement proper error boundaries
- Set up development proxy for API calls
- Configure environment variables

## Scopecraft-Specific Setup

### Expected Tools
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint . --ext ts,tsx",
    "type-check": "tsc --noEmit"
  }
}
```

### Import Organization
```typescript
// 1. External imports
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal absolute imports
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// 3. Relative imports
import { localHelper } from './helpers';
import styles from './Component.module.css';

// 4. Type imports
import type { ComponentProps } from './types';
```

### File Organization
```
src/
  components/
    ui/           # Shadcn UI components
    features/     # Feature-specific components
    layouts/      # Layout components
  hooks/          # Custom React hooks
  lib/            # Utilities and helpers
  routes/         # TanStack Router pages
  styles/         # Global styles
  types/          # TypeScript types
```

## Debugging Frontend Issues

### Common Issues and Solutions
- **Blank page**: Check console for errors, verify routes
- **Styles not applying**: Check Tailwind config, class names
- **State not updating**: Verify state updates are immutable
- **Build failures**: Check TypeScript errors, missing deps
- **Test failures**: Update snapshots, check async handling

### Debugging Tools
- React DevTools for component inspection
- Network tab for API debugging  
- Performance tab for render analysis
- Console for error messages
- Source maps for debugging minified code