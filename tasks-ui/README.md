# TaskUI - React Task Management Interface

A terminal-inspired UI for managing Markdown-Driven Task Management (MDTM) files. This project provides a clean, modern interface for working with tasks stored in the MDTM format.

## Overview

TaskUI is a local-only React application that connects to the Scopecraft Command core library to provide a visual interface for managing tasks. The interface features a terminal-inspired design with dark mode, tabular task views, and full task management capabilities.

## Technical Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **CSS**: Tailwind CSS v4
- **Components**: shadcn/ui with terminal-inspired theme
- **State Management**: React Context API
- **Routing**: wouter (lightweight client-side routing)
- **Form Handling**: Native React forms
- **Data Integration**: Direct integration with core library
- **Styling**: Tailwind CSS with custom terminal-inspired theme

## Project Structure

```
src/
├── components/
│   ├── ui/              # Basic UI components from shadcn/ui
│   ├── layout/          # Application layout components
│   ├── task-list/       # Task list and related components
│   ├── task-detail/     # Task detail view components
│   ├── task-form/       # Task creation/editing form components
│   ├── pages/           # Page-level components
├── hooks/               # Custom React hooks
├── context/             # React Context components
├── lib/
│   ├── api/             # API integration with core library
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── routes.ts        # Application routes
├── App.tsx              # Main application component
├── main.tsx             # Entry point
└── index.css            # Global CSS
```

## Key Features

- **Terminal-Inspired Theme**: Dark mode with terminal-like aesthetics
- **Task List View**: Tabular display of tasks with sorting and filtering
- **Task Form**: Creation and editing of tasks with form validation
- **Task Detail View**: Display of task metadata and content
- **Phase Navigation**: Sidebar navigation for task phases
- **URL-Based Routing**: Clean URLs with browser history support
- **Core Library Integration**: Direct integration with existing functionality

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- A project initialized with Scopecraft Command

### Installation

```bash
# Navigate to tasks-ui directory
cd tasks-ui

# Install dependencies
bun install
```

### Development

```bash
# Start development server
bun run dev

# Start with specific port
bun run dev -- --port 3000

# Start with network access
bun run dev -- --host
```

### Building

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

## Integration with Core Library

TaskUI directly integrates with the core library of Scopecraft Command. This integration is handled through the API client in `src/lib/api/core-client.ts`. The client provides a clean interface to the core functionality while preserving type safety.

For development purposes, a mock implementation is provided that simulates the behavior of the core library. This allows development of the UI without requiring the core library to be present.

## Routing

TaskUI uses wouter for lightweight client-side routing. The routes are defined in `src/lib/routes.ts`:

- `/` - Home page
- `/tasks` - Task list view
- `/tasks/create` - Task creation form
- `/tasks/:id` - Task detail view
- `/tasks/:id/edit` - Task edit form

## State Management

State is managed through React Context providers:

- **TaskContext**: Manages task-related state and operations
- **PhaseContext**: Manages phase-related state and operations  
- **UIContext**: Manages UI state like sidebar visibility and dark mode

## Styling

Styling is handled through Tailwind CSS with a custom terminal-inspired theme. The theme is defined in `tailwind.config.js` and uses CSS variables for flexibility.

The main visual characteristics include:

- Dark background with light text
- Monospace font
- Terminal-like interface elements
- Minimal animations
- High contrast for readability

## Adding New Features

When adding new features:

1. Identify the appropriate component directory
2. Create new components following existing patterns
3. Update context providers if needed
4. Add new routes if required
5. Update existing components to integrate the new feature

## Project Commands

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Run linter
bun run lint

# Preview production build
bun run preview
```