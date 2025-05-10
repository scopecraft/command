+++
id = "TASK-04-MCP-SDK-UPDATE"
title = "Update MCP Server to Official SDK"
status = "🟢 Done"
type = "🔄 Enhancement"
priority = "🔼 High"
created_date = "2025-05-10"
updated_date = "2025-05-10"
assigned_to = ""
parent_task = ""
depends_on = [ ]
related_docs = [ ]
tags = [ "mcp", "refactor", "enhancement" ]
template_schema_doc = ".ruru/templates/toml-md/01_mdtm_feature.README.md"
phase = "release-v1"
assignee = ""
created = "2025-05-10"
updated = "2025-05-10"
+++

# Update MCP Server to Official SDK

## Description ✍️

* **What is this feature?** Migrate our custom MCP server implementation to use the official `@modelcontextprotocol/sdk` v1.11.1 (or latest version)
* **Why is it needed?** Our current implementation is a custom HTTP server that doesn't fully conform to the latest MCP specification. The official SDK would provide better compatibility, maintainability, and support for the latest transport methods.
* **Scope:** Replace our custom MCP server code with the official SDK while maintaining all existing functionality
* **Links:**
  * [MCP SDK on npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
  * [TypeScript SDK GitHub](https://github.com/modelcontextprotocol/typescript-sdk)

## Acceptance Criteria ✅

* - [x] Install the official `@modelcontextprotocol/sdk` package (v1.11.1 or latest)
* - [x] Refactor the MCP server to use the SDK's server implementation
* - [x] Implement all existing methods using the SDK's tools/methods API
* - [x] Update the server to use Streamable HTTP transport (replacing our custom HTTP implementation)
* - [x] Add STDIO transport support for easier local development and testing
* - [x] Ensure consistent API format across the codebase
* - [x] Add comprehensive error handling using the SDK's built-in error mechanisms
* - [x] Update any relevant documentation about the MCP server
* - [x] Verify the updated server works with the MCP Inspector

## Implementation Notes / Sub-Tasks 📝

* - [x] Research the SDK's API and server implementation approaches
* - [x] Create a proof-of-concept MCP server with one method using the SDK
* - [x] Plan the migration approach (gradual or all-at-once)
* - [x] Ensure clean design with proper separation of concerns
* - [x] Migrate each method one by one:
  * - [x] Task listing methods
  * - [x] Task CRUD operations
  * - [x] Phase management methods
  * - [x] Workflow methods
* - [x] Update CLI entry point and command-line options as needed

**Note:** Discovered an issue with the StreamableHTTP implementation when testing with the MCP Inspector. STDIO implementation works perfectly. A new bug task has been created to track and fix the StreamableHTTP issue.

## Technical Architecture

The new MCP server implementation should follow these principles:

1. Use the official SDK's server implementation as the foundation
2. Implement our methods as Tools using the SDK's API
3. Use Streamable HTTP transport (the modern recommended approach)
4. Keep our domain logic separate from the MCP server implementation
5. Provide appropriate error handling and logging

Migration should focus on creating a clean, modern implementation using the SDK.

## AI Prompt Log 🤖

* Research indicated that the SSE transport is deprecated in favor of Streamable HTTP
* The latest MCP SDK version is 1.11.1 (as of May 2025)
* The current implementation is custom-built and doesn't use the SDK

## Implementation Log 📋

* Installed `@modelcontextprotocol/sdk` v1.11.1
* Created a proof-of-concept server with StreamableHTTP transport
* Refactored to a clean architecture with a shared core server implementation
* Added support for both StreamableHTTP and STDIO transports
* Implemented all existing methods in `methodRegistry` using the SDK's tool API
* Added comprehensive documentation in `docs/mcp-sdk.md`
* Added CLI entry points for both transport types:
  * `roo-task-mcp-sdk` for StreamableHTTP transport
  * `roo-task-mcp-stdio` for STDIO transport
* Tested with the MCP Inspector (STDIO works well, StreamableHTTP has issues)
* Created bug task to track and fix StreamableHTTP issues

## Review Notes 👀 (For Reviewer)

* Verify that all existing functionality works with the new SDK
* Check that error handling is comprehensive
* Check for any performance implications of using the SDK
* Note that STDIO transport is fully functional but StreamableHTTP has issues
* Verify the architecture with clean separation of concerns
