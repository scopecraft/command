# Scopecraft Tasks - Raycast Extension

Create intelligently classified tasks using Scopecraft's AI-powered task creation directly from Raycast.

## Features

- **AI-Powered Classification**: Automatically detects task type (feature, bug, chore, etc.)
- **Smart Area Detection**: Identifies which area of your codebase is affected (ui, cli, mcp, core)
- **Intelligent Tagging**: Generates relevant tags based on your description
- **Impact Analysis**: Analyzes potential codebase impact before creating the task
- **Optional Type Hints**: Guide the AI with optional type hints while maintaining full analysis

## Prerequisites

1. **Scopecraft CLI** installed at `/Users/davidpaquet/Projects/roo-task-cli`
2. The `task-create` command available in that directory
3. **Raycast** installed on your Mac
4. **Node.js** and **npm** installed

## Installation

1. Navigate to the extension directory:
   ```bash
   cd scopecraft-raycast
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development mode:
   ```bash
   npm run dev
   ```

## Usage

1. Open Raycast (`Cmd+Space` or your custom hotkey)
2. Type "Create Task" and select "Create Task with AI"
3. Fill in the form:
   - **Task Description**: Describe what you want to do in natural language
   - **Type Hint** (Optional): Select a hint to guide classification, or leave on Auto-detect
4. Press `Enter` or click "Create Task with AI"
5. The AI will:
   - Analyze your description
   - Auto-classify type, area, and tags
   - Perform codebase impact analysis
   - Create the task with all metadata
6. Check the autonomous monitor at http://localhost:8899/autonomous for progress

## How It Works

The extension executes the `task-create` autonomous tool which:

1. **Loads Architecture Context**: Reads area documentation to understand project structure
2. **Auto-classifies**: Determines task type, area, and generates tags
3. **Impact Analysis**: Identifies affected files and modules
4. **Task Creation**: Creates the task with all metadata in the correct location
5. **Background Execution**: Runs via channelcoder for non-blocking operation

## Development Notes

This is a prototype with a hardcoded project path. For production use, consider:

- Making the project path configurable via Raycast preferences
- Adding better error handling for missing dependencies
- Implementing real-time status monitoring
- Supporting multiple Scopecraft projects
- Adding keyboard shortcuts for quick access

## Troubleshooting

- **"Failed to Create Task" error**: Ensure the task-create command exists and is executable
- **No session name shown**: Check that the terminal output parsing matches your system
- **Can't find command**: Make sure you're in development mode (`npm run dev`)