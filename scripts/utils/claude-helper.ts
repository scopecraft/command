#!/usr/bin/env bun

/**
 * Claude Helper Utility
 * 
 * Provides standardized interface for calling Claude with prompts that have frontmatter configuration
 */

import { parseArgs } from 'util';
import matter from 'gray-matter';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

export interface ClaudeResult {
  success: boolean;
  data?: any;
  error?: string;
  stdout?: string;
  stderr?: string;
  warnings?: string[];
}

export interface PromptConfig {
  allowedTools?: string[];
  systemPrompt?: string;
  useSystemPromptFlag?: boolean; // Feature flag for --system-prompt support
}

// Zod schemas for validation
export const VersionAnalysisSchema = z.object({
  success: z.boolean(),
  current_version: z.string(),
  recommended_version: z.string(),
  change_type: z.enum(['major', 'minor', 'patch']),
  confidence: z.enum(['high', 'medium', 'low']),
  reasoning: z.string(),
  breaking_changes: z.boolean(),
  notable_features: z.array(z.string()).optional(),
  validation: z.object({
    target_version_correct: z.boolean(),
    concerns: z.array(z.string())
  }).optional()
});

export const ChangelogGenerationSchema = z.object({
  success: z.boolean(),
  version: z.string(),
  release_date: z.string(),
  changelog_markdown: z.string(),
  summary: z.string(),
  breaking_changes: z.boolean(),
  highlights: z.array(z.string()),
  categories_used: z.array(z.string()),
  total_changes: z.number()
});

export type VersionAnalysisResult = z.infer<typeof VersionAnalysisSchema>;
export type ChangelogGenerationResult = z.infer<typeof ChangelogGenerationSchema>;

/**
 * Run a command and capture output
 */
async function runCommand(cmd: string[], description: string, silent = false, showAllOutput = false): Promise<ClaudeResult> {
  if (!silent) {
    console.log(`\n${description}`);
  }
  
  const proc = Bun.spawn(cmd, {
    stdout: 'pipe',
    stderr: 'pipe'
  });
  
  // Read stdout
  let stdout = '';
  if (proc.stdout) {
    const reader = proc.stdout.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        stdout += decoder.decode(value);
      }
    } catch (error) {
      // Ignore read errors
    }
  }
  
  // Read stderr
  let stderr = '';
  if (proc.stderr) {
    const reader = proc.stderr.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        stderr += decoder.decode(value);
      }
    } catch (error) {
      // Ignore read errors
    }
  }
  
  const exitCode = await proc.exited;
  
  // Only show output if not silent or if there's an error
  if (!silent || exitCode !== 0) {
    if (stdout) console.log(stdout);
    if (stderr && (exitCode !== 0 || showAllOutput)) console.error(stderr);
  }
  
  return {
    success: exitCode === 0,
    stdout,
    stderr,
    error: exitCode !== 0 ? `Command failed with exit code ${exitCode}` : undefined
  };
}

/**
 * Run a command with piped input
 */
async function runCommandWithInput(cmd: string[], input: string, description: string, silent = false, showAllOutput = false): Promise<ClaudeResult> {
  if (!silent) {
    console.log(`\n${description}`);
  }
  
  const proc = Bun.spawn(cmd, {
    stdin: 'pipe',
    stdout: 'pipe',
    stderr: 'pipe'
  });
  
  // Write input to stdin using Bun's API
  if (proc.stdin) {
    proc.stdin.write(input);
    proc.stdin.end();
  }
  
  // Read stdout
  let stdout = '';
  if (proc.stdout) {
    const reader = proc.stdout.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        stdout += decoder.decode(value);
      }
    } catch (error) {
      // Ignore read errors
    }
  }
  
  // Read stderr
  let stderr = '';
  if (proc.stderr) {
    const reader = proc.stderr.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        stderr += decoder.decode(value);
      }
    } catch (error) {
      // Ignore read errors
    }
  }
  
  const exitCode = await proc.exited;
  
  // Only show output if not silent or if there's an error
  if (!silent || exitCode !== 0) {
    if (stdout) console.log(stdout);
    if (stderr && (exitCode !== 0 || showAllOutput)) console.error(stderr);
  }
  
  return {
    success: exitCode === 0,
    stdout,
    stderr,
    error: exitCode !== 0 ? `Command failed with exit code ${exitCode}` : undefined
  };
}

/**
 * Load and parse a prompt file with frontmatter
 */
function loadPrompt(promptPath: string): { content: string; config: PromptConfig } {
  try {
    const fileContent = readFileSync(promptPath, 'utf-8');
    const parsed = matter(fileContent);
    
    return {
      content: parsed.content,
      config: parsed.data as PromptConfig
    };
  } catch (error) {
    throw new Error(`Failed to load prompt file ${promptPath}: ${error}`);
  }
}

// System prompt is now fully supported in the latest Claude Code version

/**
 * Call Claude with a prompt file and optional data
 */
export async function callClaude(
  promptPath: string, 
  data?: Record<string, any>,
  overrideConfig?: Partial<PromptConfig>,
  verbose = false
): Promise<ClaudeResult> {
  const { content, config } = loadPrompt(promptPath);
  
  // System prompt is now fully supported, always enable it when specified
  const finalConfig = { ...config, ...overrideConfig };
  
  // Replace placeholders in content with data
  let processedContent = content;
  if (data) {
    if (verbose) {
      console.log('\n🔄 Replacing placeholders:');
    }
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `$${key.toUpperCase()}`;
      const valueStr = String(value);
      if (verbose) {
        console.log(`  ${placeholder} -> ${valueStr.substring(0, 100)}${valueStr.length > 100 ? '...' : ''}`);
      }
      processedContent = processedContent.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), valueStr);
    }
  }
  
  // System prompt is always passed via --system-prompt flag when specified
  
  // CRITICAL: Remove frontmatter from the processed content for Claude
  // We'll pipe the content directly, so no frontmatter should be included
  const frontmatterMatch = processedContent.match(/^---\n[\s\S]*?\n---\n/);
  if (frontmatterMatch) {
    processedContent = processedContent.substring(frontmatterMatch[0].length);
  }
  
  if (verbose) {
    console.log(`\n📄 Prompt content (first 500 chars):`);
    console.log(processedContent.substring(0, 500) + '...');
    console.log('\n📤 Sending to Claude...');
  }
  
  try {
    // Build Claude command for piping
    const cmd = ['claude', '-p'];
    
    // Add system prompt if specified
    if (finalConfig.systemPrompt) {
      cmd.push('--system-prompt', finalConfig.systemPrompt);
    }
    
    // Add allowed tools if specified
    if (finalConfig.allowedTools && finalConfig.allowedTools.length > 0) {
      cmd.push('--allowedTools', finalConfig.allowedTools.join(','));
    }
    
    // Add verbose and streaming if requested
    if (verbose) {
      cmd.push('--verbose', '--output-format', 'stream-json');
    }
    
    // Execute Claude command with piped content
    const result = await runCommandWithInput(cmd, processedContent, `Claude: ${promptPath}`, false, verbose);
    
    // Try to parse JSON output if present
    if (result.success && result.stdout) {
      const jsonMatch = result.stdout.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          const parsedData = JSON.parse(jsonMatch[1]);
          result.data = parsedData;
        } catch (e) {
          result.success = false;
          result.error = `Failed to parse JSON output from Claude: ${e}`;
          result.warnings = result.warnings || [];
          result.warnings.push('Claude output contained malformed JSON');
        }
      } else {
        result.warnings = result.warnings || [];
        result.warnings.push('No JSON output found in Claude response');
      }
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: `Claude execution failed: ${error}`
    };
  }
}

/**
 * Validate Claude result using Zod schema
 */
export function validateClaudeResult<T>(
  result: ClaudeResult, 
  schema: z.ZodSchema<T>,
  context: string = 'Claude response'
): { success: true; data: T } | { success: false; error: string } {
  if (!result.success) {
    return { 
      success: false, 
      error: `${context} failed: ${result.error || 'Unknown error'}` 
    };
  }
  
  if (!result.data) {
    return { 
      success: false, 
      error: `${context} did not return any data` 
    };
  }
  
  try {
    const validatedData = schema.parse(result.data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      
      return { 
        success: false, 
        error: `${context} validation failed: ${errorMessages}` 
      };
    }
    
    return { 
      success: false, 
      error: `${context} validation error: ${error}` 
    };
  }
}

/**
 * Specialized validation functions for common use cases
 */
export function validateVersionAnalysis(result: ClaudeResult): { success: true; data: VersionAnalysisResult } | { success: false; error: string } {
  return validateClaudeResult(result, VersionAnalysisSchema, 'Version analysis');
}

export function validateChangelogGeneration(result: ClaudeResult): { success: true; data: ChangelogGenerationResult } | { success: false; error: string } {
  return validateClaudeResult(result, ChangelogGenerationSchema, 'Changelog generation');
}

/**
 * Create a data object for git-related prompts
 */
export async function prepareGitData(lastTag?: string): Promise<Record<string, any>> {
  const gitTag = lastTag || await getLastTag();
  const commits = await getCommitsSince(gitTag);
  const diff = await getDiffSince(gitTag);
  
  console.log(`🔍 Git data prepared: tag=${gitTag}, commits=${commits.split('\n').length} lines, diff=${diff.length} chars`);
  
  return {
    last_tag: gitTag,
    commits,
    diff,
    target_version: '' // To be filled by caller
  };
}

async function getLastTag(): Promise<string> {
  const result = await runCommand(['git', 'tag', '--sort=-version:refname'], 'Get last git tag', true);
  if (result.success && result.stdout) {
    const tags = result.stdout.trim().split('\n');
    return tags[0] || 'HEAD~10';
  }
  return 'HEAD~10';
}

async function getCommitsSince(since: string): Promise<string> {
  const excludedPaths = [
    'package.json',
    '**/package.json', 
    'bun.lockb',
    'yarn.lock',
    '**/tsconfig.json',
    'docs/**',
    '.github/**',
    '.vscode/**',
    'CHANGELOG.md'
  ];
  
  const pathArgs = excludedPaths.flatMap(path => ['--', `:!${path}`]);
  const result = await runCommand(
    ['git', 'log', '--oneline', `${since}..HEAD`, ...pathArgs], 
    'Get commits since last tag',
    false // Not silent for debugging
  );
  
  if (result.success && result.stdout) {
    return result.stdout
      .split('\n')
      .filter(line => line.trim())
      .filter(line => !line.includes('[skip ci]'))
      .filter(line => !line.includes('update version'))
      .join('\n');
  }
  
  return '';
}

async function getDiffSince(since: string): Promise<string> {
  const excludedPaths = [
    'package.json',
    '**/package.json', 
    'bun.lockb',
    'yarn.lock',
    '**/tsconfig.json',
    'docs/**',
    '.github/**',
    '.vscode/**',
    'CHANGELOG.md',
    '.tasks/**' // Exclude large task files
  ];
  
  const pathArgs = excludedPaths.flatMap(path => [`:!${path}`]);
  const result = await runCommand(
    ['git', 'diff', `${since}..HEAD`, '--stat', '--', ...pathArgs], // Use --stat for summary instead of full diff
    'Get diff since last tag',
    true // Silent
  );
  
  if (result.success && result.stdout) {
    // Truncate if too long (keep under 2000 chars for Claude)
    const diff = result.stdout;
    if (diff.length > 2000) {
      return diff.substring(0, 1800) + '\n\n[... diff truncated for brevity ...]';
    }
    return diff;
  }
  
  return '';
}