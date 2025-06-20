/**
 * Project configuration manager
 * Uses ConfigurationManager for root resolution and handles project-specific config
 */
import fs from 'node:fs';
import path from 'node:path';
import { ConfigurationManager } from './config/configuration-manager.js';
import type { RuntimeConfig } from './config/types.js';

/**
 * Interface for project paths
 */
export interface ProjectPaths {
  tasksRoot: string;
  configRoot: string;
  templatesRoot: string;
}

// Default directory structure
const DEFAULT_DIRECTORIES = {
  tasks: '.tasks',
  config: '.tasks/.config',
  templates: '.tasks/.templates',
};

/**
 * Project configuration class
 * Handles project configuration and path resolution
 */
export class ProjectConfig {
  private configManager: ConfigurationManager;
  private paths: ProjectPaths;
  private runtime?: RuntimeConfig;

  constructor(runtime?: RuntimeConfig) {
    this.configManager = ConfigurationManager.getInstance();
    this.runtime = runtime;
    this.paths = this.buildProjectPaths();
  }

  /**
   * Get singleton instance (for backward compatibility)
   */
  static getInstance(runtime?: RuntimeConfig): ProjectConfig {
    return new ProjectConfig(runtime);
  }

  /**
   * Get the project root directory
   */
  private getRoot(): string {
    return this.configManager.getRootConfig(this.runtime).path;
  }

  /**
   * Build project paths based on configuration
   */
  private buildProjectPaths(): ProjectPaths {
    const root = this.getRoot();

    const dirs = DEFAULT_DIRECTORIES;

    // Use runtime config if provided
    if (this.runtime?.tasksDir) {
      return {
        tasksRoot: this.runtime.tasksDir,
        configRoot: path.join(this.runtime.tasksDir, '.config'),
        templatesRoot: path.join(this.runtime.tasksDir, '.templates'),
      };
    }

    return {
      tasksRoot: path.join(root, dirs.tasks),
      configRoot: path.join(root, dirs.config),
      templatesRoot: path.join(root, dirs.templates),
    };
  }

  /**
   * Get project definition from configuration
   */
  private getProjectDefinition() {
    const root = this.getRoot();
    const projects = this.configManager.getProjects();
    return projects.find((p) => p.path === root);
  }

  /**
   * Get tasks directory
   */
  getTasksDirectory(): string {
    return this.paths.tasksRoot;
  }

  /**
   * @deprecated phases are now first-level directories under tasks
   */
  getPhasesDirectory(): string {
    // Return tasks directory as phases are now first-level directories
    return this.paths.tasksRoot;
  }

  /**
   * Get configuration directory
   */
  getConfigDirectory(): string {
    return this.paths.configRoot;
  }

  /**
   * Get templates directory
   */
  getTemplatesDirectory(): string {
    return this.paths.templatesRoot;
  }

  /**
   * Initialize project structure
   * Creates necessary directories
   */
  initializeProjectStructure(): void {
    // Create all directories
    for (const dirPath of Object.values(this.paths)) {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }

    // Create QUICKSTART.md if it doesn't exist in repository .tasks/
    const repoTasksDir = path.join(this.getRoot(), '.tasks');
    if (!fs.existsSync(repoTasksDir)) {
      fs.mkdirSync(repoTasksDir, { recursive: true });
    }
    const quickstartPath = path.join(repoTasksDir, 'QUICKSTART.md');
    if (!fs.existsSync(quickstartPath)) {
      const quickstartContent = `# 🚀 Scopecraft Quick Start Guide

Welcome to Scopecraft Command! This guide will help you get started with managing your tasks.

## 📋 Basic Commands

### Creating Tasks
\`\`\`bash
# Create a new feature task
sc create --type feature --title "Add user authentication"

# Create a bug report
sc create --type bug --title "Fix login error" --priority "🔼 High"

# Create from a template
sc create --template feature --title "New Feature"
\`\`\`

### Viewing Tasks
\`\`\`bash
# List all tasks
sc list

# List tasks by status
sc list --status "🔵 In Progress"

# Get details of a specific task
sc get TASK-001
\`\`\`

### Updating Tasks
\`\`\`bash
# Update task status
sc update TASK-001 --status "🔵 In Progress"

# Assign a task
sc update TASK-001 --assignee "john.doe"

# Mark task as complete
sc update TASK-001 --status "🟢 Done"
\`\`\`

## 📁 Task Types

Scopecraft supports 6 task types:
- **🌟 Feature**: New functionality or enhancements
- **🐞 Bug**: Issues that need fixing
- **🧹 Chore**: Maintenance and housekeeping tasks
- **📖 Documentation**: Documentation updates
- **🧪 Test**: Test-related tasks
- **💡 Spike/Research**: Investigation and research tasks

## 🎯 Workflow Tips

1. **Start with phases**: Organize your work into phases (releases, sprints, etc.)
   \`\`\`bash
   sc phase-create --id "sprint-1" --name "Sprint 1"
   \`\`\`

2. **Use features for complex work**: Group related tasks together
   \`\`\`bash
   sc feature create --name "UserAuth" --title "User Authentication System" --phase "sprint-1"
   \`\`\`

3. **Track progress**: See what's currently in progress
   \`\`\`bash
   sc current-task
   \`\`\`

4. **Find next task**: Get recommendations on what to work on next
   \`\`\`bash
   sc next-task
   \`\`\`

## 🛠️ Customization

### Templates
Templates are stored in \`.tasks/.templates/\`. You can customize them to match your workflow:
- Edit the YAML frontmatter to add custom fields
- Modify the markdown structure to fit your needs
- Templates support all standard MDTM fields

### AI Execution Modes
Execution modes are stored in \`.tasks/.modes/\`. These guide AI assistants when working on different types of tasks:
- **exploration/** - Research and investigation prompts
- **design/** - Architecture and design prompts
- **implementation/** - Building and coding prompts
- **orchestration/** - Multi-task coordination prompts
- **planning/** - Project planning prompts

Customize these modes by:
1. Editing the base prompts in each mode directory
2. Adding area-specific guidance in \`area/\` subdirectories
3. Using Claude commands: \`@mode-init\` and \`@mode-update\`

## 📚 Learn More

- Run \`sc --help\` for all available commands
- Visit https://github.com/scopecraft/scopecraft-command for documentation
- Use \`sc list-templates\` to see available task templates

## 💡 Pro Tips

- Use tags to categorize tasks: \`--tags "backend,api"\`
- Set dependencies between tasks: \`--depends "TASK-001,TASK-002"\`
- Filter tasks by multiple criteria: \`sc list --status "🟡 To Do" --type "🌟 Feature"\`
- Export tasks as JSON: \`sc list --format json > tasks.json\`

Happy task management! 🎉
`;
      fs.writeFileSync(quickstartPath, quickstartContent);
    }
  }

  /**
   * Validate project environment
   */
  validateEnvironment(): boolean {
    return this.configManager.validateRoot(this.getRoot());
  }

  /**
   * Get task file path
   */
  getTaskFilePath(id: string, phase: string, subdirectory: string): string {
    const baseDir = phase ? path.join(this.paths.tasksRoot, phase) : this.paths.tasksRoot;

    return path.join(baseDir, subdirectory, `${id}.md`);
  }

  /**
   * Parse task path to extract phase and subdirectory
   * @deprecated Use directory-utils.parseTaskPath instead
   */
  parseTaskPath(filePath: string): { phase?: string; subdirectory?: string } {
    const tasksRoot = this.paths.tasksRoot;

    // Ensure we're working with absolute paths
    const absoluteFilePath = path.resolve(filePath);
    const absoluteTasksRoot = path.resolve(tasksRoot);

    // Check if the file is actually under the tasks root
    if (!absoluteFilePath.startsWith(absoluteTasksRoot)) {
      return {};
    }

    // Get the relative path from tasks root
    const relativePath = path.relative(absoluteTasksRoot, absoluteFilePath);
    const parts = relativePath.split(path.sep);

    // Skip dot-prefix directories (system dirs)
    if (parts.length > 0 && parts[0].startsWith('.')) {
      return {};
    }

    if (parts.length === 1) {
      // Only filename, no phase or subdirectory
      return {};
    }

    if (parts.length === 2) {
      // phase/filename - has phase but no subdirectory
      return { phase: parts[0] };
    }

    // Has both phase and subdirectory (or more levels)
    const phase = parts[0];
    // Combine all middle directories as the subdirectory path
    const subdirectory = parts.slice(1, -1).join(path.sep);
    return { phase, subdirectory };
  }
}

// Export a singleton instance (for backward compatibility)
export const projectConfig = new ProjectConfig();
