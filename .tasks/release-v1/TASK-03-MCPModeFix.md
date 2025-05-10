+++
id = "TASK-03-MCPModeFix"
title = "Fix MCP Server Mode Support"
type = "🐞 Bug"
status = "🟢 Done"
priority = "🔥 Highest"
created_date = "2025-05-10"
updated_date = "2025-05-10"
assigned_to = ""
phase = "release-v1"
+++

## Fix MCP Server Mode Support

The MCP server currently only supports Roo Commander mode (.ruru directory) and fails to start in standalone mode (.tasks directory). Unlike the CLI, which properly uses the `projectConfig` class to detect and handle both modes, the MCP server's startup code in `src/mcp/cli.ts` has hardcoded validation that requires the `.ruru` directory to exist.

This bug prevents users from using the MCP server in standalone mode, which contradicts the project's goal of supporting both modes consistently across all interfaces.

## Problem Analysis

The issue is in `src/mcp/cli.ts` where the code performs an explicit check for the `.ruru` directory instead of using the `projectConfig.validateEnvironment()` method:

```typescript
// Validate environment
const ruruDir = path.join(process.cwd(), '.ruru');

if (!fs.existsSync(ruruDir)) {
  console.error('Error: .ruru directory not found in the current directory');
  console.error('Make sure you are in a Roo Commander project or run "roocommander init" first');
  process.exit(1);
}
```

While the code does call `getTasksDirectory()` afterward, which would use the correct path based on the mode, the initial validation prevents the server from starting in standalone mode.

The CLI implementation correctly handles both modes by using the `projectConfig` singleton:

1. The CLI detects the mode automatically using `projectConfig.detectProjectMode()`
2. It builds the appropriate paths using `projectConfig.buildProjectPaths()`
3. It initializes the project structure when needed with `projectConfig.initializeProjectStructure()`

## Steps to Reproduce

1. Create a project with `.tasks` directory (standalone mode)
2. Run `bun run dev:mcp`
3. Observe error: "Error: .ruru directory not found in the current directory"

## Action Items

- [x] Remove the hardcoded `.ruru` directory check in `src/mcp/cli.ts`
- [x] Replace with `projectConfig.validateEnvironment()` or similar appropriate check
- [x] Ensure the environment check creates necessary directories if they don't exist
- [x] Update error messages to be mode-agnostic (mention both `.ruru` and `.tasks` as possibilities)
- [x] Add initialization step similar to the CLI's init command if directories don't exist
- [x] Test MCP server in both Roo Commander and standalone modes

## Acceptance Criteria

- [x] MCP server starts successfully in standalone mode (with `.tasks` directory)
- [x] MCP server starts successfully in Roo Commander mode (with `.ruru` directory)
- [x] MCP server properly creates necessary directories if they don't exist
- [x] MCP server uses the same logic as CLI for detecting and handling project modes
- [x] Error messages are clear and mode-agnostic
- [x] All MCP handlers work correctly in both modes

## Implementation Log

The MCP server CLI code was refactored to use the `projectConfig` singleton for project mode detection and validation, similar to how the main CLI works. The following changes were made:

1. Removed the hardcoded `.ruru` directory check in `src/mcp/cli.ts`
2. Added proper import for `projectConfig` and `ProjectMode` from the core module
3. Added a `--mode` option to allow forcing a specific project mode (roo or standalone)
4. Implemented mode-agnostic error messages that adapt to the current mode
5. Added automatic directory initialization using `projectConfig.initializeProjectStructure()`
6. Added helpful console output to indicate which mode the server is running in

The modified code now:
- Properly detects both standalone and Roo Commander modes
- Creates necessary directory structure if it doesn't exist
- Provides clear error messages tailored to the detected mode
- Supports forcing a specific mode with the `--mode` option
- Shows which mode the server is running in when it starts

Tests were conducted in both standalone mode and Roo Commander mode, confirming that the server now works correctly in both environments.
