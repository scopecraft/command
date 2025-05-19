# Changelog

All notable changes to Scopecraft Command will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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