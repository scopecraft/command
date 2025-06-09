/**
 * Plan command using new primitive-based architecture
 * Demonstrates the clean, simple approach without task assumptions
 */

import { ConfigurationManager } from '../../core/config/index.js';
import { execute, resolveModePromptPath } from '../../integrations/channelcoder/index.js';
import { printError, printSuccess } from '../formatters.js';

/**
 * Plan command options
 */
export interface PlanCommandOptions {
  dryRun?: boolean;
}

/**
 * Main handler for the plan command
 *
 * @param description Required feature description (first argument)
 * @param area Optional area (second argument, defaults to "general")
 * @param contextArgs Additional context arguments (remaining arguments)
 * @param options Command options
 */
export async function handlePlanCommand(
  description: string,
  area: string | undefined,
  contextArgs: string[],
  options: PlanCommandOptions = {}
): Promise<void> {
  try {
    // Get project root
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = configManager.getProjectRoot();

    if (!projectRoot) {
      printError('No project root found. Run "sc init" or specify --root-dir.');
      process.exit(1);
    }

    // Build context from remaining arguments
    const context = contextArgs.length > 0 ? contextArgs.join(' ') : undefined;
    const actualArea = area || 'general';

    // Display what we're planning
    if (options.dryRun) {
      printSuccess(`[DRY RUN] Would plan: ${description}`);
      if (actualArea !== 'general') {
        printSuccess(`[DRY RUN] Area: ${actualArea}`);
      }
      if (context) {
        printSuccess(`[DRY RUN] Context: ${context}`);
      }
    } else {
      printSuccess(`Planning: ${description}`);
      if (actualArea !== 'general') {
        printSuccess(`Area: ${actualArea}`);
      }
      if (context) {
        printSuccess(`Context: ${context}`);
      }
    }

    // Execute planning using simple function
    const promptPath = resolveModePromptPath(projectRoot, 'planning');
    const result = await execute(promptPath, {
      mode: 'interactive',
      dryRun: options.dryRun,
      data: {
        feature_description: description,
        area: actualArea,
        context: context || '',
      },
    });

    if (result.success) {
      if (options.dryRun) {
        printSuccess('[DRY RUN] Planning session would complete');
      } else {
        printSuccess('✅ Planning session completed');
      }
    } else {
      printError(`Planning failed: ${result.error || 'Unknown error'}`);
      process.exit(1);
    }
  } catch (error) {
    printError(`Plan command failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
