# Changelog

All notable changes to Scopecraft Command will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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