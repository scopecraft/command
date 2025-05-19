# Project Root Configuration System Design

## Overview

This document outlines the design for a flexible project root configuration system that enables Scopecraft to work with AI IDEs (Cursor, Claude Desktop, etc.) that spawn MCP servers from application directories rather than project directories.

## Problem Statement

Currently, Scopecraft uses `process.cwd()` to determine the project root, which assumes the MCP server is started from the project directory. This fails when AI IDEs spawn servers from their application directories, making Scopecraft unusable in these environments.

## Design Goals

1. **Multi-Source Configuration**: Support multiple configuration methods
2. **Clear Precedence**: Establish unambiguous precedence rules
3. **Backward Compatibility**: Maintain existing behavior as fallback
4. **Future-Ready**: Enable multi-project/worktree scenarios
5. **Developer Experience**: Provide clear error messages and debugging
6. **Runtime Flexibility**: Allow per-operation root overrides

## Architecture

### Configuration Sources and Precedence

Configuration sources are evaluated in the following order (highest to lowest priority):

1. **Runtime Override** (function parameter)
   - Passed directly to core functions
   - Highest priority for specific operations
   - Example: `listTasks({ rootPath: '/custom/path' })`

2. **CLI Parameter** (`--root-dir`)
   - Set at server startup via command line
   - Immutable for the server session
   - Example: `scopecraft-mcp --root-dir /path/to/project`

3. **Environment Variable** (`SCOPECRAFT_ROOT`)
   - Set in shell or IDE configuration
   - Useful for Claude Desktop global config
   - Falls back if CLI parameter not provided

4. **Session Configuration**
   - Set via `init_root` MCP command
   - Persists for the MCP session
   - Can be changed during runtime

5. **Config File** (`.scopecraft/config.json`)
   - User-level configuration in home directory
   - Supports multiple project definitions
   - Selected via project name or auto-detected

6. **Auto-Detection** (current behavior)
   - Uses `process.cwd()` as fallback
   - Maintains backward compatibility
   - Works when server started from project directory

### Core Interfaces

```typescript
// Configuration source enumeration
export enum ConfigSource {
  RUNTIME = 'runtime',
  CLI = 'cli',
  ENVIRONMENT = 'environment',
  SESSION = 'session',
  CONFIG_FILE = 'config_file',
  AUTO_DETECT = 'auto_detect'
}

// Root configuration with source tracking
export interface RootConfig {
  path: string;
  source: ConfigSource;
  projectName?: string;
  validated: boolean;
}

// Runtime configuration options for core functions
export interface RuntimeConfig {
  rootPath?: string;
  // Future: additional runtime overrides
}

// Updated filter/option interfaces with runtime config
export interface TaskFilterOptions {
  // Existing filters...
  phase?: string;
  subdirectory?: string;
  tags?: string[];
  
  // Runtime configuration
  config?: RuntimeConfig;
}

// Project definition for config file
export interface ProjectDefinition {
  name: string;
  path: string;
  description?: string;
  tags?: string[];
}

// Global configuration file structure
export interface ScopecraftConfig {
  version: string;
  defaultProject?: string;
  projects: ProjectDefinition[];
}

// Configuration manager interface
export interface IConfigurationManager {
  // Get current root configuration
  getRootConfig(runtime?: RuntimeConfig): RootConfig;
  
  // Set root via different sources
  setRootFromCLI(path: string): void;
  setRootFromEnvironment(): void;
  setRootFromSession(path: string): void;
  setRootFromConfig(projectName?: string): void;
  
  // Validation and utilities
  validateRoot(path: string): boolean;
  resolveRoot(runtime?: RuntimeConfig): RootConfig;
  getProjects(): ProjectDefinition[];
}
```

### Updated Core Function Signatures

```typescript
// Before: Functions use global projectConfig
export async function listTasks(
  options: TaskFilterOptions = {}
): Promise<OperationResult<Task[]>>

// After: Functions accept runtime config
export async function listTasks(
  options: TaskFilterOptions = {}
): Promise<OperationResult<Task[]>> {
  const rootConfig = configManager.getRootConfig(options.config);
  const tasksDir = path.join(rootConfig.path, '.tasks');
  // ... rest of implementation
}

// Example of other updated functions
export async function getTask(
  id: string,
  options?: {
    phase?: string;
    subdirectory?: string;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Task>>

export async function createTask(
  metadata: TaskMetadata,
  content: string,
  options?: {
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Task>>
```

### Configuration Manager Implementation

```typescript
export class ConfigurationManager implements IConfigurationManager {
  private static instance: ConfigurationManager;
  private rootConfig: RootConfig | null = null;
  private sessionConfig: RootConfig | null = null;
  private configFilePath = path.join(os.homedir(), '.scopecraft', 'config.json');
  
  private constructor() {
    // Singleton pattern
  }
  
  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }
  
  public getRootConfig(runtime?: RuntimeConfig): RootConfig {
    // If runtime config provided, use it with highest priority
    if (runtime?.rootPath) {
      return {
        path: runtime.rootPath,
        source: ConfigSource.RUNTIME,
        validated: this.validateRoot(runtime.rootPath)
      };
    }
    
    // Otherwise, use cached or resolve
    if (!this.rootConfig) {
      this.rootConfig = this.resolveRoot();
    }
    return this.rootConfig;
  }
  
  public resolveRoot(runtime?: RuntimeConfig): RootConfig {
    // 1. Check runtime parameter
    if (runtime?.rootPath) {
      return {
        path: runtime.rootPath,
        source: ConfigSource.RUNTIME,
        validated: this.validateRoot(runtime.rootPath)
      };
    }
    
    // 2. Check CLI parameter
    const cliRoot = this.checkCLIParameter();
    if (cliRoot) return cliRoot;
    
    // 3. Check environment variable
    const envRoot = this.checkEnvironmentVariable();
    if (envRoot) return envRoot;
    
    // 4. Check session configuration
    if (this.sessionConfig) return this.sessionConfig;
    
    // 5. Check config file
    const configRoot = this.checkConfigFile();
    if (configRoot) return configRoot;
    
    // 6. Auto-detect (fallback)
    return this.autoDetect();
  }
  
  private validateRoot(path: string): boolean {
    // Check if path exists
    if (!fs.existsSync(path)) return false;
    
    // Check for .tasks or .ruru directory
    const hasTasksDir = fs.existsSync(path.join(path, '.tasks'));
    const hasRuruDir = fs.existsSync(path.join(path, '.ruru'));
    
    return hasTasksDir || hasRuruDir;
  }
}
```

### Migration Strategy

1. **Phase 1: Add Configuration Manager**
   - Implement `ConfigurationManager` class
   - Add runtime config support to interfaces
   - Keep existing behavior as default

2. **Phase 2: Update Core Functions**
   - Add optional `config` parameter to all core functions
   - Use configuration manager for path resolution
   - Maintain backward compatibility

3. **Phase 3: Integrate with CLI**
   - Add `--root-dir` parameter to MCP server commands
   - Pass parameter to configuration manager
   - Test with different AI IDEs

4. **Phase 4: Add MCP Commands**
   - Implement `init_root` MCP command
   - Add project listing and switching commands
   - Enable runtime configuration changes

5. **Phase 5: Full Integration**
   - Replace all `projectConfig` usage
   - Remove direct `process.cwd()` calls
   - Update documentation

### Example Usage

```typescript
// Runtime override for specific operation
const tasks = await listTasks({
  phase: 'development',
  config: { rootPath: '/projects/my-project' }
});

// Using configuration manager directly
const configManager = ConfigurationManager.getInstance();
const rootConfig = configManager.getRootConfig();
console.log(`Using project root: ${rootConfig.path} (source: ${rootConfig.source})`);

// MCP command handler
async function handleInitRoot(params: { path: string }) {
  const configManager = ConfigurationManager.getInstance();
  configManager.setRootFromSession(params.path);
  return { success: true, root: params.path };
}
```

### Error Handling

```typescript
export class ConfigurationError extends Error {
  constructor(
    message: string,
    public source: ConfigSource,
    public path?: string,
    public operation?: string
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

// Example error messages
const errors = {
  INVALID_PATH: (path: string) => 
    `Invalid project root: ${path} does not exist`,
  NO_PROJECT_MARKERS: (path: string) => 
    `Invalid project root: ${path} does not contain .tasks or .ruru directory`,
  CONFIG_FILE_ERROR: (error: string) => 
    `Error reading configuration file: ${error}`,
  PROJECT_NOT_FOUND: (name: string) => 
    `Project '${name}' not found in configuration`,
  RUNTIME_VALIDATION_FAILED: (path: string, operation: string) =>
    `Runtime root override failed for ${operation}: ${path} is not a valid project`
};
```

### Testing Strategy

1. **Unit Tests**
   - Test each configuration source independently
   - Test precedence logic including runtime overrides
   - Test validation and error handling

2. **Integration Tests**
   - Test function-level runtime overrides
   - Test configuration persistence
   - Test multi-project scenarios

3. **End-to-End Tests**
   - Test with different AI IDE configurations
   - Test runtime config in real operations
   - Test migration from existing setup

## Implementation Plan

1. **Create Configuration Manager** (Core)
   - Implement `ConfigurationManager` class
   - Add runtime config interfaces
   - Add validation logic

2. **Update Core Functions** (Core)
   - Add `config` parameter to function signatures
   - Update path resolution logic
   - Maintain backward compatibility

3. **CLI Integration** (CLI)
   - Add `--root-dir` parameter
   - Update server startup logic
   - Pass configuration to core

4. **MCP Commands** (MCP)
   - Implement `init_root` command
   - Add project listing command
   - Enable runtime switching

5. **Documentation** (Docs)
   - User guide for configuration
   - Migration guide
   - API documentation updates

## Security Considerations

1. **Path Validation**
   - Validate runtime paths before operations
   - Prevent directory traversal attacks
   - Check file system permissions

2. **Config File Security**
   - Validate JSON structure
   - Limit file size
   - Check file permissions

3. **Runtime Override Security**
   - Log all runtime overrides
   - Validate against allowed paths
   - Rate limit configuration changes

## Future Enhancements

1. **Worktree Support**
   - Multiple active projects
   - Quick switching between projects
   - Project templates

2. **Project Discovery**
   - Auto-discover projects in workspace
   - Smart project detection
   - Recent projects list

3. **IDE Integration**
   - IDE-specific configuration
   - Better error reporting in IDEs
   - Configuration UI

## Human Review Required

### Design Decisions to Verify
- [ ] Runtime override approach is appropriate
- [ ] Precedence order including runtime is correct
- [ ] Function signature changes maintain compatibility
- [ ] Security considerations for runtime overrides

### Technical Assumptions
- [ ] Adding config parameter doesn't break existing code
- [ ] Runtime validation overhead is acceptable
- [ ] Configuration caching strategy is sound
- [ ] Migration path preserves functionality