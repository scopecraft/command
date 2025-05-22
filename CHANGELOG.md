# Changelog

All notable changes to Scopecraft Command will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.13.0] - 2025-05-22

### Added
- **Enhanced MCP Tool Descriptions**: Comprehensive field-level descriptions for all MCP tools including Task, Feature, and Phase entities
- **MCP Documentation**: New detailed documentation for all MCP tool categories (task-tools.md, feature-tools.md, phase-tools.md)
- **AI-Assisted Release Process**: Automated release analysis and npm scripts with OTP support

### Changed
- **Tasks UI Development**: Improved dev server workflow and configuration for better developer experience

### Fixed
- **Release Analyzer**: Reset version tracking and improved release analysis accuracy

## [0.12.0] - 2025-05-22

No new changes found since v0.12.0. Current version is already at the latest release.

### Previous Release (v0.12.0)
- **MCP Tool Descriptions**: Enhanced all MCP tool descriptions with field-level documentation
- **Development Workflow**: Improved tasks-ui development server workflow  
- **Documentation**: Added comprehensive MCP tool documentation
- **Release Process**: Enhanced AI-assisted release process with OTP support

## [0.12.0] - 2025-05-22

### Added
- **AI-Assisted Release Automation**: Complete automated release system with Claude integration for version analysis and changelog generation
- **Content Filtering**: Added content and completed filtering options to feature_list MCP tool for better data management
- **Enhanced Security Checks**: Comprehensive Docker-based security checking with smart filtering for tasks-ui components
- **AI-First Knowledge System**: Complete vision and brainstorm documentation for improved knowledge management

### Changed
- **CLI Table Formatting**: Improved table display with clean layout and expanded titles for better readability
- **Code Quality Checks**: Enhanced code-check script with smart filtering and better defaults for more efficient development
- **MCP Tool Registration**: Updated dependencies and refactored MCP tool registration for improved performance
- **Task Documentation**: Updated with complete implementation details for better developer experience

### Fixed
- **Release Script**: Fixed TypeScript checks during execute phase to prevent build failures
- **Formatter Output**: Removed unnecessary structuredContent from formatResponse and formatError functions

## [0.12.0] - 2025-05-22

### Added
- **AI-Assisted Release Automation**: Complete automated release system with Claude integration for version analysis and changelog generation
- **Content Filtering**: Added content and completed filtering options to feature_list MCP tool for better data management
- **Enhanced Security Checks**: Comprehensive Docker-based security checking with smart filtering for tasks-ui components
- **AI-First Knowledge System**: Complete vision and brainstorm documentation for improved knowledge management

### Changed
- **CLI Table Formatting**: Improved table display with clean layout and expanded titles for better readability
- **Code Quality Checks**: Enhanced code-check script with smart filtering and better defaults for more efficient development
- **MCP Tool Registration**: Updated dependencies and refactored MCP tool registration for improved performance
- **Task Documentation**: Updated with complete implementation details for better developer experience

### Fixed
- **Release Script**: Fixed TypeScript checks during execute phase to prevent build failures
- **Formatter Output**: Removed unnecessary structuredContent from formatResponse and formatError functions


## [0.11.1] - 2025-05-22

### Added
- **Security System**: Comprehensive Docker-based security check script that scans for vulnerabilities, secrets, and custom security patterns
- **CLI Formatting**: Improved table formatting with cleaner layout and expanded titles for better readability
- **Content Filtering**: Added content and completed filtering to feature_list MCP tool for better search capabilities

### Changed
- **Code Quality Tools**: Enhanced code-check script with smart filtering, better defaults, and support for checking specific files
- **Task Formatter**: Updated formatting system for cleaner output and improved readability in CLI displays
- **MCP Server**: Significant improvements to the core server implementation for better reliability and performance

### Security
- **Vulnerability Detection**: Added Docker-based OSV Scanner integration to detect dependencies with known vulnerabilities
- **Secret Detection**: Integrated secretlint for identifying accidentally committed secrets and credentials
- **Custom Security Patterns**: Added pattern detection for potentially unsafe code practices


## [0.11.0] - 2025-05-22

### Added
- **Security System**: New comprehensive Docker-based security check script that scans for vulnerabilities, secrets, and custom security patterns.
- **CLI Formatting**: Improved table formatting with cleaner layout and expanded titles for better readability.
- **Content Filtering**: Added content and completed filtering options to feature_list MCP tool for better search capabilities.

### Changed
- **Code Quality Tools**: Enhanced code-check script with smart filtering, better defaults, and support for checking specific files.
- **Task Formatter**: Updated formatting system for cleaner output and improved readability in CLI displays.
- **MCP Server**: Significant improvements to the core server implementation for better reliability and performance.

### Security
- **Vulnerability Detection**: Added Docker-based OSV Scanner integration to detect dependencies with known vulnerabilities.
- **Secret Detection**: Integrated secretlint for identifying accidentally committed secrets and credentials.
- **Custom Security Patterns**: Added pattern detection for potentially unsafe code practices.


## [0.10.6] - 2025-05-21

### Fixed
- **MCP Server**: Removed structuredContent from formatResponse and formatError functions in core-server.ts
- **MCP Tool Registration**: Improved MCP tool registration with refactored code and updated dependencies

## [0.10.5] - 2025-05-21

### Fixed
- **MCP Feature Creation**: Fixed parameter structure mismatch in feature_create MCP tool that was causing "undefined" errors
- **CI/CD Pipeline**: Improved error handling in continuous integration workflow
- **Worktree Dashboard**: Fixed feature status calculations to properly derive from task progress

### Improved
- **UI Components**: Enhanced Worktree Dashboard with better layout and styling
- **Task Management**: Added Claude session button for task and feature UI
- **CLI Workflow**: Added fish shell integration for automatic directory changing with task worktrees

## [0.10.4] - 2025-05-20

### Added
- **Worktree Dashboard**: New dashboard to visualize and manage git worktrees
- **Task UI Enhancements**: Added collapsible sections to sidebar for better organization

### Fixed
- **JSON Streaming**: Fixed Claude JSON format handling in task UI
- **Feature Management**: Removed taskId modification for features to maintain consistency

## [0.10.1] - 2025-05-19

### Fixed
- **Path Parsing Bug**: Fixed an issue where using relative paths with `--root-dir` would cause incorrect subdirectory extraction
- **System Directory Filtering**: Improved filtering of system directories (dot-prefixed) from phase listings
- **API Root Dir Support**: Added comprehensive support for `root_dir` parameter across all API endpoints
- **CRUD Function Parameters**: Refactored all CRUD operations to use an options pattern for better extensibility and runtime configuration

### Improved
- **CLI Documentation**: Added help text for `--root-dir` option across all commands
- **Code Structure**: Enhanced directory utilities with consistent path handling functions
- **Configuration Management**: Better support for runtime configuration propagation throughout the application

## [0.10.0] - 2025-05-18

### Added
- **Flexible Project Root Configuration**: You can now specify your project root directory in multiple ways:
  - Use the `--root-dir` CLI parameter to override the default location
  - Create a `.scopecraft.conf`, `.scopecraft.json`, or `.scopecraft.toml` configuration file in your project
  - Set the `SCOPECRAFT_ROOT_DIR` environment variable for persistent configuration
- **MCP Server Configuration Commands**: New commands to manage MCP server configuration
  - Easier setup and management of MCP server instances
  - Better integration with Model Context Protocol clients

### Improved
- Configuration system now supports multiple sources with clear precedence rules
- Enhanced documentation for project setup and configuration
- Better error messages when configuration issues occur

## [0.9.0] - 2025-05-18

### Added
- Initial release of Scopecraft Command
- Command-line interface for managing MDTM (Markdown-Driven Task Management) files
- MCP (Model Context Protocol) server for AI assistant integration
- Task management with phases, features, and areas
- Support for both standalone use and integration with Roo Commander
- TOML and YAML frontmatter support