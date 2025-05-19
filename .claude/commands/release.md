<task>
Help me prepare a release of version $ARGUMENTS for this project. If no version is provided, determine next version based on changes.
</task>

<context>
Release management for this project follows these key principles:
1. Semantic versioning (MAJOR.MINOR.PATCH)
2. Changelog-driven release notes
3. Consistent commit messages for release
4. Automated version reference updates
5. Local package validation before publishing
</context>

<version_determination>
If no explicit version is provided in "$ARGUMENTS", determine the next version by:

1. Examine the scope of changes since last release:
   - Bug fixes only = PATCH bump (0.10.0 → 0.10.1)
   - New features = MINOR bump (0.10.0 → 0.11.0)
   - Breaking changes = MAJOR bump (0.10.0 → 1.0.0)

2. Look at commit messages to determine change type:
   - "fix:", "bugfix:", "patch:" → PATCH
   - "feat:", "feature:", "minor:" → MINOR
   - "BREAKING CHANGE:", "breaking:" → MAJOR

3. Propose and confirm the suggested version with the user
</version_determination>

<release_steps>
Follow these steps in sequence:

1. **Determine Version**
   - Current version: Check package.json
   - Next version: Determine based on changes

2. **Update Package Metadata**
   - Update version in package.json
   - Run version update script: `bun run update-version`
   - Verify CLI version references are updated

3. **Update Changelog**
   - Follow Keep a Changelog format (https://keepachangelog.com/)
   - Group changes by type: Added, Changed, Fixed, Removed, Security
   - Include precise date with correct format: [x.y.z] - YYYY-MM-DD
   - Describe changes in user-friendly language
   - Highlight important changes first
   - Use bullet points consistently
   - Link to relevant issues if applicable

4. **Build and Validate**
   - Run build process: `bun run build`
   - Verify build outputs are generated correctly
   - Run tests: `bun test`

5. **Create Local Package**
   - Run `bun run publish:local` to create and copy package
   - Run `bun run install:local` to test local installation

6. **Commit Changes**
   - Stage changes: package.json, CHANGELOG.md, version reference files
   - Create standardized commit message:
     ```
     Bump version to x.y.z

     - Update version in package.json to x.y.z
     - Update CLI version references in source files
     - Add CHANGELOG entry for x.y.z release
     - [Summary of key changes in this release]

     🤖 Generated with [Claude Code](https://claude.ai/code)

     Co-Authored-By: Claude <noreply@anthropic.com>
     ```

7. **Publish Package (when ready)**
   - Summarize final steps for NPM publishing
   - Recommend creating a GitHub release
   - Document post-release verification
</release_steps>

<changelog_guidelines>
CHANGELOG entries should follow these rules:

1. **Entry Format**
   ```markdown
   ## [1.2.3] - YYYY-MM-DD

   ### Added
   - **User-facing feature name**: Description of what it does and why it matters
   
   ### Fixed
   - **Issue area**: Description of what was broken and how it's fixed
   
   ### Changed
   - **Component name**: Description of what changed and impact on users
   ```

2. **Language Guidelines**
   - Write from user perspective (what they get, not how you coded it)
   - Focus on value and impact
   - Use present tense, active voice
   - Bold the feature/area name for scanability
   - Keep entries concise but informative
   - Avoid technical implementation details unless relevant to users

3. **Grouping Logic**
   - Added: New features and capabilities (things users couldn't do before)
   - Fixed: Bug fixes, corrections (things that should have worked but didn't)
   - Changed: Modifications to existing functionality (things that work differently now)
   - Removed: Features taken away (things users could do before but can't now)
   - Security: Security-related changes (always highlight these)
   - Deprecated: Features that will be removed in future releases
</changelog_guidelines>

<examples>
**Example 1: Patch Release (Bug Fix)**

```markdown
## [0.10.1] - 2025-05-19

### Fixed
- **Path Parsing Bug**: Fixed an issue where using relative paths with `--root-dir` would cause incorrect subdirectory extraction
- **System Directory Filtering**: Improved filtering of system directories (dot-prefixed) from phase listings

### Improved
- **Configuration Management**: Better support for runtime configuration propagation throughout the application
```

**Example 2: Minor Release (New Features)**

```markdown
## [0.11.0] - 2025-06-02

### Added
- **Task Templates**: Added support for creating tasks from custom templates
- **Multiple Phase Selection**: Now supporting selection of multiple phases in task listings
- **Export Formats**: Added CSV and JSON export options for task lists

### Fixed
- **Search Performance**: Improved search speed for large task collections
- **UI Rendering**: Fixed display issues in task detail view
```

**Example 3: Major Release (Breaking Changes)**

```markdown
## [1.0.0] - 2025-07-15

### Added
- **REST API**: Complete HTTP API for all task management operations
- **Authentication**: Support for API keys and role-based access control
- **Plugins System**: Extensible architecture for custom workflows

### Changed
- **Command Structure**: Reorganized CLI commands for consistency (see migration guide)
- **Configuration Format**: New JSON schema for configuration (requires migration)

### Removed
- **Legacy Import Format**: Removed support for v0.x import formats
```
</examples>

<human_review_needed>
Flag these aspects for verification:
- [ ] Correct version bump based on changes (PATCH/MINOR/MAJOR)
- [ ] Completeness of CHANGELOG entries
- [ ] Build and test results
- [ ] Package validation results
- [ ] Final release approval
</human_review_needed>