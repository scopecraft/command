# TaskUI - React Task Management Interface

A terminal-inspired UI for managing Markdown-Driven Task Management (MDTM) files. This project provides a clean, modern interface for working with tasks stored in the MDTM format.

## Overview

TaskUI is a React application that connects to the Scopecraft Command core library via a RESTful API to provide a visual interface for managing tasks. The interface features a terminal-inspired design with dark mode, tabular task views, task relationship visualization, and full task management capabilities.

## Technical Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **CSS**: Tailwind CSS v4
- **Components**: shadcn/ui with terminal-inspired theme
- **State Management**: React Context API
- **Routing**: wouter (lightweight client-side routing)
- **Server**: Bun HTTP server
- **API**: RESTful API built on top of MCP core handlers
- **Task Visualization**: React Flow for relationship graphs
- **Form Handling**: Native React forms
- **Styling**: Tailwind CSS with custom terminal-inspired theme

## Project Structure

```
server.ts                 # Bun HTTP server with API endpoints
scripts/
├── import-checker.js     # Validates imports in the codebase
├── test-api.js           # Tests the API integration
src/
├── components/
│   ├── ui/               # Basic UI components from shadcn/ui
│   ├── layout/           # Application layout components
│   │   └── ErrorBoundary.tsx  # Error handling component
│   ├── task-list/        # Task list and related components
│   │   └── TaskListFallback.tsx  # Error fallback for task list
│   ├── task-detail/      # Task detail view components
│   │   └── TaskDetailFallback.tsx  # Error fallback for task detail
│   ├── task-form/        # Task creation/editing form components
│   ├── relationship-graph/  # Task relationship visualization
│   ├── pages/            # Page-level components
├── hooks/                # Custom React hooks
│   └── useToast.ts       # Toast notification hook
├── context/              # React Context components
├── lib/
│   ├── api/              # API integration
│   │   └── core-client.ts  # Fetch-based client for API
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   ├── routes.ts         # Application routes
├── App.tsx               # Main application component
├── main.tsx              # Entry point
└── index.css             # Global CSS
```

## Key Features

- **Terminal-Inspired Theme**: Dark mode with terminal-like aesthetics
- **Task List View**: Tabular display of tasks with sorting and filtering
- **Task Form**: Creation and editing of tasks with form validation
- **Task Detail View**: Display of task metadata and content
- **Relationship Graph**: Visual representation of task relationships
- **Toast Notifications**: User feedback for operations
- **Error Boundaries**: Graceful error handling
- **Phase Navigation**: Sidebar navigation for task phases
- **URL-Based Routing**: Clean URLs with browser history support
- **Core Library Integration**: Integration via RESTful API
- **Responsive Design**: Mobile-friendly layout

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

### Building and Deployment

```bash
# Build for production
bun run build

# Start the server (serves both API and UI)
bun run start

# Build and start the server in one command
bun run deploy
```

## API Integration

TaskUI integrates with the Scopecraft Command core library through a RESTful API server. This integration enables browser compatibility by handling Node.js-specific code on the server side.

### API Server

The API server is built using Bun's built-in HTTP server capabilities and directly imports handlers from the MCP core library. It provides the following endpoints:

- `GET /api/tasks` - List tasks with optional filtering
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update an existing task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/tasks/next` - Get the next recommended task
- `GET /api/phases` - List phases
- `POST /api/phases` - Create a new phase
- `GET /api/workflow/current` - Get the current workflow state
- `POST /api/workflow/mark-complete-next` - Mark a task as complete and get the next task

### API Client

The API client is a browser-compatible fetch-based client that provides the same interface as the original core-client but communicates with the API server instead of directly integrating with the core library.

### Testing API Integration

To test the API integration:

```bash
# Start the server in one terminal
bun run start

# Run the API tests in another terminal
bun run test:api
```

## Routing

TaskUI uses wouter for lightweight client-side routing. The routes are defined in `src/lib/routes.ts`:

- `/` - Home page
- `/tasks` - Task list view
- `/tasks/create` - Task creation form
- `/tasks/:id` - Task detail view
- `/tasks/:id/edit` - Task edit form
- `/graph` - Task relationship graph view

## State Management

State is managed through React Context providers:

- **TaskContext**: Manages task-related state and operations
- **PhaseContext**: Manages phase-related state and operations  
- **UIContext**: Manages UI state like sidebar visibility and dark mode

## Error Handling

Error handling is implemented at multiple levels:

- **API Client**: Consistent error handling for all API operations
- **Context Providers**: Error state management and propagation
- **Toast Notifications**: User-friendly error messages
- **Error Boundaries**: Component-level error isolation
- **Fallback Components**: Graceful UI degradation when errors occur

## Styling

Styling is handled through Tailwind CSS with a custom terminal-inspired theme. The theme is defined in `tailwind.config.js` and uses CSS variables for flexibility.

The main visual characteristics include:

- Dark background with light text
- Monospace font
- Terminal-like interface elements
- Minimal animations
- High contrast for readability
- Responsive layout for mobile and desktop

## Project Commands

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Start the server (API + static files)
bun run start

# Build and start the server
bun run deploy

# Run linter
bun run lint

# Type checking
bun run typecheck

# Check imports
bun run check-imports

# Test API integration
bun run test:api
```