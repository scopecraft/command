# Scopecraft Design System

This style guide provides comprehensive styling information for building applications within the Scopecraft ecosystem. Use this guide to maintain visual consistency across all Scopecraft tools and applications.

## Typography

### Font Family
- Primary Font: **JetBrains Mono** (monospace)
- Fallback: System monospace font

```css
font-family: 'JetBrains Mono', monospace;
```

### Font Weights
- Light: 300
- Regular: 400
- Medium: 500
- Bold: 700

### Font Sizes
- Extra Small: 10px (for subtitles, metadata)
- Small: 12px (for UI elements, secondary text)
- Base: 14px (for body text, controls)
- Medium: 16px (for subheadings)
- Large: 18px (for primary UI elements)
- Extra Large: 24px (for section headings)
- Heading: 48px (for page titles)

### Line Heights
- Tight: 1.1 (for headings)
- Normal: 1.5 (for body text)
- Relaxed: 1.6 (for paragraphs)

### Text Formatting
- Uppercase for:
  - System labels
  - Navigation items
  - Section headers
  - Button text
- Sentence case for regular content

## Color Palette

### Core Colors
- `--terminal-black: #121212;` (Main background)
- `--terminal-dark: #1A1A1A;` (Secondary background)
- `--cream: #F2EFE1;` (Primary text color)

### Brand Colors
- `--atlas-navy: #0A2647;` (Primary brand color)
- `--atlas-light: #3A8BD1;` (Secondary brand color, accents)

### Component Colors
- `--registry-blue: #1A5F7A;`
- `--document-slate: #2C3333;`
- `--connection-teal: #2E8A99;`
- `--bridge-orange: #E57C23;`
- `--forge-rust: #8B4513;`
- `--lens-violet: #5B4B8A;`

### Functional Colors
- Active/Success: `#4CAF50;`
- Neutral: `rgba(255, 255, 255, 0.6);`
- Background Grid: `rgba(255, 255, 255, 0.05);`

### Opacity Variants
- High Emphasis: `rgba(255, 255, 255, 0.8);`
- Medium Emphasis: `rgba(255, 255, 255, 0.6);`
- Low Emphasis: `rgba(255, 255, 255, 0.4);`
- Hint/Disabled: `rgba(255, 255, 255, 0.3);`
- Subtle: `rgba(255, 255, 255, 0.1);`

## Spacing System

### Base Unit
- Base spacing unit: 8px

### Spacing Scale
- `2px`: Minimal spacing (borders, tiny gaps)
- `4px`: Extra small spacing (tight elements)
- `8px`: Small spacing (default padding between related elements)
- `12px`: Medium-small spacing
- `16px`: Base spacing (standard gaps between elements)
- `24px`: Medium spacing (panel padding, card spacing)
- `32px`: Large spacing (section padding)
- `48px`: Extra large spacing (major section breaks)

## Layout

### Containers
- Max width: 1200px
- Default horizontal padding: 24px

### Grid System
- Main content: 3fr
- Sidebar: 1fr
- Gap: 24px

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 641px - 1024px
- Desktop: > 1024px

## UI Elements

### Borders
- Standard border: `1px solid rgba(255, 255, 255, 0.1);`
- Accent border: `1px solid rgba(255, 255, 255, 0.3);`
- Highlight border: `3px solid var(--atlas-light);`

### Border Radius
- Small: 4px (for buttons, cards, inputs)
- Medium: 8px (for panels, larger containers)
- Large: 32px (for system bars)

### Shadows and Effects
- Background grid:
  ```css
  background-image: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 16px 16px;
  ```
- Blur effect: `backdrop-filter: blur(4px);`

### Cards & Panels
- Standard padding: 24px
- Header padding: 12px 24px
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Header background: rgba(255, 255, 255, 0.05)

### Buttons
- Primary Button:
  ```css
  background-color: var(--atlas-navy);
  color: var(--cream);
  padding: 12px 24px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 500;
  ```
  Hover: `background-color: #0e3156; transform: translateY(-2px);`

- Secondary Button (implied from design):
  ```css
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--cream);
  padding: 8px 16px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 500;
  ```
  Hover: `background-color: rgba(255, 255, 255, 0.15);`

### Navigation
- Link color: `rgba(255, 255, 255, 0.7);`
- Active/Hover link: `var(--atlas-light);`
- Active indicator: 2px underline in `var(--atlas-light)`

### Icons
- Background style: Geometric with subtle grid pattern
- Size: Proportional to text (usually 12px-32px)
- Color: Match text color or use brand colors for emphasis

## Animations

### Transitions
- Standard transition: `transition: all 0.2s ease;`
- Subtle pulse animation:
  ```css
  @keyframes pulse {
    0% { opacity: 0.3; }
    50% { opacity: 0.8; }
    100% { opacity: 0.3; }
  }
  animation: pulse 3s infinite;
  ```

## Code Blocks

### Styling
- Background: `rgba(0, 0, 0, 0.3);`
- Border: `1px solid rgba(255, 255, 255, 0.1);`
- Border-radius: 4px
- Padding: 16px
- Font-size: 13px
- Line-height: 1.6

### Syntax Highlighting
- Comments: `rgba(255, 255, 255, 0.4);`
- Keywords: `#3A8BD1;` (atlas-light)
- Strings: `#5B4B8A;` (lens-violet)
- Functions: `#E57C23;` (bridge-orange)

## System Components

### System Bars
- Background: `rgba(0, 0, 0, 0.3);`
- Border: `1px solid rgba(255, 255, 255, 0.1);`
- Border-radius: 32px
- Font-size: 12px
- Blur effect: `backdrop-filter: blur(4px);`

### Status Indicators
- Active/Operational: `#4CAF50;` (green)
- Neutral: Default text color
- Panel with status: Left border 3px solid var(--atlas-light)

### Logo Styling
- Logo icon: Square with border-radius 4px
- Background-color: var(--atlas-navy)
- Size: 32px × 32px
- Text: Two-tier (main name + subtitle)

## Responsive Design

### General Principles
- Mobile-first approach
- Stack grid items vertically on small screens
- Reduce padding and margins on mobile
- Simplify navigation on small screens

## Development Guidelines

### CSS Implementation
- Use CSS custom properties (variables) for consistent theming
- Organize CSS by component
- Use BEM or similar methodology for class naming
- Implement dark mode by default (light mode as alternate)

### React Component Guidelines
- Use composition for complex components
- Ensure all interactive elements have proper states
- Implement consistent spacing via a spacing system
- Maintain typography hierarchy

### Accessibility
- Maintain color contrast ratios (WCAG AA compliance)
- Use semantic HTML
- Ensure keyboard navigability
- Provide appropriate ARIA attributes

## Implementation Example

```jsx
import { useState } from 'react';
import './scopecraft-theme.css';

export function ScopecraftCard({ title, children, status }) {
  return (
    <div className="sc-card">
      <div className="sc-card-header">
        <h3 className="sc-card-title">{title}</h3>
        {status && (
          <div className="sc-status-indicator">
            {status}
          </div>
        )}
      </div>
      <div className="sc-card-content">
        {children}
      </div>
    </div>
  );
}

export function ScopecraftButton({ children, primary = false, onClick }) {
  return (
    <button 
      className={`sc-button ${primary ? 'sc-button-primary' : 'sc-button-secondary'}`}
      onClick={onClick}
    >
      {primary && <span className="sc-button-marker">&gt;</span>}
      {children}
    </button>
  );
}
```

```css
/* scopecraft-theme.css */
:root {
  /* Core colors */
  --terminal-black: #121212;
  --terminal-dark: #1A1A1A;
  --cream: #F2EFE1;
  
  /* Brand colors */
  --atlas-navy: #0A2647;
  --atlas-light: #3A8BD1;
  
  /* Component colors */
  --registry-blue: #1A5F7A;
  --document-slate: #2C3333;
  --connection-teal: #2E8A99;
  --bridge-orange: #E57C23;
  --forge-rust: #8B4513;
  --lens-violet: #5B4B8A;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 32px;
}

body {
  font-family: 'JetBrains Mono', monospace;
  background-color: var(--terminal-black);
  color: var(--cream);
  line-height: 1.5;
  position: relative;
}

/* Grid background pattern */
body::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 16px 16px;
  z-index: -1;
  pointer-events: none;
}

/* Card component */
.sc-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.sc-card-header {
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sc-card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--atlas-light);
  text-transform: uppercase;
  margin: 0;
}

.sc-card-content {
  padding: var(--spacing-lg);
}

/* Button component */
.sc-button {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
}

.sc-button-primary {
  background-color: var(--atlas-navy);
  color: var(--cream);
  padding: 12px 24px;
}

.sc-button-primary:hover {
  background-color: #0e3156;
  transform: translateY(-2px);
}

.sc-button-secondary {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--cream);
  padding: 8px 16px;
}

.sc-button-secondary:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.sc-button-marker {
  color: var(--atlas-light);
  margin-right: var(--spacing-sm);
}

/* Status indicator */
.sc-status-indicator {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}
```

## Integration with shadcn UI and Tailwind

When using shadcn UI components with this design system:

1. Configure your Tailwind theme in `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core colors
        background: "#121212",
        foreground: "#F2EFE1",
        
        // Brand colors
        primary: {
          DEFAULT: "#0A2647",
          foreground: "#F2EFE1",
        },
        secondary: {
          DEFAULT: "#3A8BD1",
          foreground: "#F2EFE1",
        },
        
        // Component colors
        registry: "#1A5F7A",
        document: "#2C3333",
        connection: "#2E8A99",
        bridge: "#E57C23",
        forge: "#8B4513",
        lens: "#5B4B8A",
        
        // UI colors
        muted: {
          DEFAULT: "rgba(255, 255, 255, 0.1)",
          foreground: "rgba(255, 255, 255, 0.6)",
        },
        accent: {
          DEFAULT: "#3A8BD1",
          foreground: "#F2EFE1",
        },
        border: "rgba(255, 255, 255, 0.1)",
        input: "rgba(255, 255, 255, 0.1)",
        card: {
          DEFAULT: "#1A1A1A",
          foreground: "#F2EFE1",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      fontFamily: {
        sans: ["JetBrains Mono", "monospace"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
}
```

2. Override shadcn component styles to match Scopecraft design when needed
3. Utilize Scopecraft's spacing system and color variables

## Additional Information

Refer to this style guide when developing any Scopecraft applications. If you need specific component implementations not covered here, follow the established patterns and maintain visual consistency with the overall design language.

By adhering to this style guide, you'll ensure that all Scopecraft applications have a cohesive, professional appearance that strengthens the ecosystem's identity.