#!/usr/bin/env bun

import { claude, stream } from 'channelcoder';
import { execSync } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { z } from 'zod';

// Output schema for type safety
const IdeaExplorationOutput = z.object({
  expandedIdea: z.string(),
  codebaseNotes: z.array(z.string()),
  suggestions: z.array(z.string()),
  questions: z.array(z.string()),
  taskId: z.string().optional(),
});

// Session storage
const SESSION_DIR = '.claude-sessions/ideas';

async function ensureSessionDir() {
  await fs.mkdir(SESSION_DIR, { recursive: true });
}

async function saveSession(ideaId: string, data: any) {
  await ensureSessionDir();
  const sessionFile = path.join(SESSION_DIR, `${ideaId}.json`);
  await fs.writeFile(sessionFile, JSON.stringify(data, null, 2));
}

async function loadSession(ideaId: string) {
  try {
    const sessionFile = path.join(SESSION_DIR, `${ideaId}.json`);
    const data = await fs.readFile(sessionFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function exploreIdea(title: string, description: string, sessionId?: string) {
  console.log('🚀 Exploring feature idea...\n');
  
  // Load previous session if continuing
  const session = sessionId ? await loadSession(sessionId) : null;
  
  try {
    // Collect the full response while streaming
    let fullResponse = '';
    
    console.log('🤖 Claude is thinking...\n');
    
    // Stream the response so we can see what's happening
    for await (const chunk of stream('scripts/prompts/explore-idea.md', {
      data: {
        ideaTitle: title,
        ideaDescription: description,
        previousAnswers: session?.answers || undefined,
      },
    })) {
      // Debug: log raw chunk
      if (process.env.DEBUG) {
        console.log('\n🔍 Raw chunk:', JSON.stringify(chunk));
      }
      
      // Just output everything as JSON for now
      console.log(JSON.stringify(chunk));
    }
    
    console.log('\n\n📊 Processing response...\n');
    
    // Try to extract structured data from the response
    try {
      // Extract sections using regex
      const expandedIdea = fullResponse.match(/### Expanded Idea\n([\s\S]*?)(?=\n###|$)/)?.[1]?.trim() || '';
      const codebaseNotes = fullResponse.match(/### Codebase Notes\n([\s\S]*?)(?=\n###|$)/)?.[1]
        ?.split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim()) || [];
      const taskIdMatch = fullResponse.match(/Task ID:\s*(\S+)/);
      const taskId = taskIdMatch?.[1];
      
      const suggestions = fullResponse.match(/### Suggestions\n([\s\S]*?)(?=\n###|$)/)?.[1]
        ?.split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) || [];
        
      const questions = fullResponse.match(/### Questions for Further Exploration\n([\s\S]*?)(?=\n###|$)/)?.[1]
        ?.split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) || [];
      
      // Save session
      const newSessionId = sessionId || `idea-${Date.now()}`;
      await saveSession(newSessionId, {
        title,
        description,
        exploration: {
          expandedIdea,
          codebaseNotes,
          suggestions,
          questions,
          taskId,
        },
        fullResponse,
        answers: session?.answers || {},
        iterations: (session?.iterations || 0) + 1,
      });
      
      console.log(`💾 Session saved: ${newSessionId}`);
      console.log('\nTo continue exploring with answers:');
      console.log(`  1. Edit ${SESSION_DIR}/${newSessionId}.json`);
      console.log(`  2. Add your answers to the "answers" object`);
      console.log(`  3. Run: bun run scripts/explore-idea.ts --continue ${newSessionId}`);
      
    } catch (parseError) {
      console.error('⚠️  Could not parse structured data, but response was saved');
      
      // Still save the raw response
      const newSessionId = sessionId || `idea-${Date.now()}`;
      await saveSession(newSessionId, {
        title,
        description,
        rawResponse: fullResponse,
        answers: session?.answers || {},
        iterations: (session?.iterations || 0) + 1,
      });
      
      console.log(`💾 Raw session saved: ${newSessionId}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === '--continue' && args[1]) {
    // Continue existing session
    const sessionId = args[1];
    const session = await loadSession(sessionId);
    
    if (!session) {
      console.error(`❌ Session not found: ${sessionId}`);
      process.exit(1);
    }
    
    console.log(`📂 Continuing session: ${sessionId}`);
    console.log(`📋 Original idea: ${session.title}`);
    console.log(`🔄 Iteration: ${(session.iterations || 0) + 1}\n`);
    
    await exploreIdea(session.title, session.description, sessionId);
    
  } else if (args[0] === '--list') {
    // List existing sessions
    await ensureSessionDir();
    const files = await fs.readdir(SESSION_DIR);
    const sessions = files.filter(f => f.endsWith('.json'));
    
    if (sessions.length === 0) {
      console.log('No idea exploration sessions found.');
      return;
    }
    
    console.log('📚 Existing idea sessions:\n');
    for (const file of sessions) {
      const session = await loadSession(file.replace('.json', ''));
      console.log(`  ${file.replace('.json', '')}: ${session.title} (${session.iterations || 1} iterations)`);
    }
    
  } else if (args.length >= 2) {
    // New idea
    const title = args[0];
    const description = args.slice(1).join(' ');
    
    console.log(`💡 New idea: ${title}`);
    console.log(`📝 Description: ${description}\n`);
    
    await exploreIdea(title, description);
    
  } else {
    // Help
    console.log('🤔 Feature Idea Explorer\n');
    console.log('Usage:');
    console.log('  New idea:        bun run scripts/explore-idea.ts "Title" "Description of the idea"');
    console.log('  Continue:        bun run scripts/explore-idea.ts --continue <session-id>');
    console.log('  List sessions:   bun run scripts/explore-idea.ts --list');
    console.log('\nExample:');
    console.log('  bun run scripts/explore-idea.ts "Smart Task Dependencies" "Automatically detect task dependencies based on code analysis"');
  }
}

main().catch(console.error);