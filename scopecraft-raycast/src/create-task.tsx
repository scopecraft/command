import { Form, ActionPanel, Action, showToast, Toast, open, popToRoot, showHUD } from "@raycast/api";
import { useState } from "react";
import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs/promises";

// Hardcoded path for prototype
const ROO_TASK_CLI_PATH = "/Users/davidpaquet/Projects/roo-task-cli";
const AUTONOMOUS_BASE_DIR = path.join(ROO_TASK_CLI_PATH, '.tasks/.autonomous-sessions');
const LOG_DIR = path.join(AUTONOMOUS_BASE_DIR, 'logs');

interface FormValues {
  description: string;
  typeHint?: string;
}

export default function Command() {
  const [isLoading, setIsLoading] = useState(false);

  // Generate session name (similar to task-creator-autonomous.ts)
  function getSessionName(description: string): string {
    const sanitized = description.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    return `task-${sanitized}-${Date.now()}`;
  }

  async function handleSubmit(values: FormValues) {
    if (!values.description.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Description Required",
        message: "Please enter a task description",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Show initial toast
      await showToast({
        style: Toast.Style.Animated,
        title: "Creating Task",
        message: "AI is analyzing and classifying your task...",
      });

      // Add type hint to description if selected
      let description = values.description;
      if (values.typeHint && values.typeHint !== "auto") {
        description = `${values.typeHint}: ${description}`;
      }

      // Generate session name
      const sessionName = getSessionName(description);
      
      // Ensure log directory exists
      await fs.mkdir(LOG_DIR, { recursive: true });

      // Execute the TypeScript file directly using node
      // We'll use the channelcoder CLI directly since we can't import the SDK here
      const scriptPath = path.join(ROO_TASK_CLI_PATH, 'scripts/prompts/task-creator-enhanced.md');
      const logFile = path.join(LOG_DIR, `${sessionName}.log`);
      
      // Create the channelcoder command
      const args = [
        'channelcoder',
        scriptPath,
        '-d', `ideaDescription=${description}`,
        '--log-file', logFile,
        '--detached',
        '--output-format', 'stream-json'
      ];

      // Spawn the process
      const child = spawn('npx', args, {
        cwd: ROO_TASK_CLI_PATH,
        detached: true,
        stdio: 'ignore',
        env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH}` } // Add homebrew path for bun
      });

      // Let the process run independently
      child.unref();

      // Save session info
      const sessionInfo = {
        sessionName,
        taskDescription: description,
        logFile,
        startTime: new Date().toISOString(),
        status: 'running',
        type: 'task-creator',
      };
      
      const sessionInfoPath = path.join(AUTONOMOUS_BASE_DIR, `${sessionName}.info.json`);
      await fs.writeFile(sessionInfoPath, JSON.stringify(sessionInfo, null, 2));

      // Show success with session info
      await showToast({
        style: Toast.Style.Success,
        title: "Task Creation Started",
        message: `Session: ${sessionName}`,
        primaryAction: {
          title: "Open Autonomous Monitor",
          onAction: async () => {
            // Open the task UI autonomous monitor
            await open(`http://localhost:8899/autonomous`);
          },
        },
      });

      // Also show HUD for quick feedback
      await showHUD(`✅ Task creation started: ${sessionName}`);

      // Close the command
      await popToRoot();
    } catch (error) {
      console.error("Error creating task:", error);
      
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Create Task",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Create Task with AI"
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.Description text="Create a new task with automatic AI classification. The AI will determine the type, area, and tags based on your description." />
      
      <Form.TextArea
        id="description"
        title="Task Description"
        placeholder="Add OAuth support to the CLI..."
        info="Describe what you want to do. AI will automatically classify the type, area, and tags."
      />
      
      <Form.Separator />
      
      <Form.Dropdown 
        id="typeHint" 
        title="Type Hint (Optional)" 
        defaultValue="auto"
        info="Optional hint to guide classification. AI will still do full analysis."
      >
        <Form.Dropdown.Item value="auto" title="Auto-detect" icon="🤖" />
        <Form.Dropdown.Item value="Feature" title="Feature" icon="✨" />
        <Form.Dropdown.Item value="Bug" title="Bug" icon="🐛" />
        <Form.Dropdown.Item value="Idea" title="Idea" icon="💡" />
        <Form.Dropdown.Item value="Chore" title="Chore" icon="🔧" />
        <Form.Dropdown.Item value="Docs" title="Documentation" icon="📚" />
        <Form.Dropdown.Item value="Test" title="Test" icon="🧪" />
      </Form.Dropdown>
      
      <Form.Separator />
      
      <Form.Description
        title="How it works"
        text="1. Describe your task in natural language
2. AI analyzes and classifies it (type, area, tags)
3. Performs impact analysis on the codebase
4. Creates the task with proper metadata
5. Check the autonomous monitor for progress"
      />
    </Form>
  );
}
