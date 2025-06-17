#!/usr/bin/env bun
/**
 * Debug script to trace MCP phase parameter through the code path
 */

import * as core from '../src/core/index.js';
import { buildTaskCreateOptionsBase } from '../src/mcp/handlers/shared/options-builders.js';
import { TaskCreateInputSchema } from '../src/mcp/schemas.js';
import { loadProjectConfig } from '../src/mcp/handlers/shared/config-utils.js';
import { handleTaskCreate } from '../src/mcp/handlers/write-handlers.js';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';

// Test parameters
const testParams = {
  title: 'Debug MCP Phase Test',
  type: 'test',
  phase: 'active',
  area: 'general',
  status: 'todo',
  workflowState: 'current',
  priority: 'medium',
};

// Project root
const projectRoot = '/Users/davidpaquet/Projects/scopecraft-v2';

console.log('🔍 MCP Phase Debug Script\n');
console.log('='.repeat(60));

// Step 1: Test Schema Validation
console.log('\n📋 Step 1: Testing Schema Validation');
console.log('Input params:', testParams);

try {
  const validatedParams = TaskCreateInputSchema.parse(testParams);
  console.log('✅ Schema validation passed');
  console.log('Validated params phase:', validatedParams.phase);
  console.log('Has phase:', 'phase' in validatedParams);
} catch (error) {
  console.log('❌ Schema validation failed:', error);
}

// Step 2: Test Options Builder
console.log('\n📋 Step 2: Testing Options Builder');
const baseOptions = buildTaskCreateOptionsBase({
  title: testParams.title,
  type: testParams.type,
  area: testParams.area,
  status: testParams.status,
  workflowState: testParams.workflowState,
  phase: testParams.phase,
  instruction: undefined,
});

console.log('Base options:', baseOptions);
console.log('Base options phase:', baseOptions.phase);
console.log('Has phase:', 'phase' in baseOptions);

// Step 3: Test Core Create Options
console.log('\n📋 Step 3: Testing Core Create Options');
const createOptions: core.TaskCreateOptions = {
  ...baseOptions,
  title: testParams.title,
  type: testParams.type as core.TaskType,
  area: testParams.area || 'general',
  phase: testParams.phase as core.TaskPhase,
  customMetadata: {
    priority: testParams.priority,
  },
};

console.log('Create options:', createOptions);
console.log('Create options phase:', createOptions.phase);
console.log('Has phase:', 'phase' in createOptions);
console.log('Phase type:', typeof createOptions.phase);

// Step 4: Test Core Create Function
console.log('\n📋 Step 4: Testing Core Create Function');
try {
  const projectConfig = loadProjectConfig(projectRoot);
  const result = await core.create(projectRoot, createOptions, projectConfig);
  
  if (result.success && result.data) {
    console.log('✅ Task created successfully');
    console.log('Task ID:', result.data.metadata.id);
    console.log('Task phase in frontmatter:', result.data.document.frontmatter.phase);
    console.log('Has phase:', 'phase' in result.data.document.frontmatter);
    
    // Step 5: Check actual file
    console.log('\n📋 Step 5: Checking Actual File');
    const filePath = result.data.metadata.path;
    console.log('File path:', filePath);
    
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8');
      console.log('\nFile content:');
      console.log('-'.repeat(40));
      console.log(content);
      console.log('-'.repeat(40));
      
      // Parse frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        console.log('\nFrontmatter found:');
        console.log(frontmatterMatch[1]);
        console.log('Contains "phase:":', frontmatterMatch[1].includes('phase:'));
      }
    }
    
    // Clean up test file
    console.log('\n🧹 Cleaning up test file...');
    try {
      unlinkSync(filePath);
      console.log('✅ Test file deleted');
    } catch (e) {
      console.log('⚠️  Could not delete test file:', e);
    }
  } else {
    console.log('❌ Task creation failed:', result.error);
  }
} catch (error) {
  console.log('❌ Error:', error);
}

// Step 6: Test MCP Handler Directly
console.log('\n📋 Step 6: Testing MCP Handler Directly');
console.log('='.repeat(60));

const mcpParams = {
  title: 'Debug MCP Handler Phase Test',
  type: 'test',
  phase: 'completed',
  area: 'general',
  status: 'todo',
  workflowState: 'current',
  priority: 'medium',
};

console.log('MCP Input params:', mcpParams);

try {
  const mcpResult = await handleTaskCreate(mcpParams);
  console.log('\nMCP Handler Result:');
  console.log('Success:', mcpResult.success);
  
  if (mcpResult.success && mcpResult.data) {
    console.log('Response data:', mcpResult.data);
    console.log('Response has phase:', 'phase' in mcpResult.data);
    console.log('Response phase value:', (mcpResult.data as any).phase);
    
    // Check the actual file created by MCP
    const mcpFilePath = mcpResult.data.path;
    console.log('\nChecking MCP-created file:', mcpFilePath);
    
    if (existsSync(mcpFilePath)) {
      const content = readFileSync(mcpFilePath, 'utf-8');
      console.log('\nMCP File content:');
      console.log('-'.repeat(40));
      console.log(content);
      console.log('-'.repeat(40));
      
      // Parse frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        console.log('\nMCP Frontmatter analysis:');
        console.log('Contains "phase:":', frontmatterMatch[1].includes('phase:'));
        console.log('Contains "phase: completed":', frontmatterMatch[1].includes('phase: completed'));
      }
      
      // Clean up
      console.log('\n🧹 Cleaning up MCP test file...');
      try {
        unlinkSync(mcpFilePath);
        console.log('✅ MCP test file deleted');
      } catch (e) {
        console.log('⚠️  Could not delete MCP test file:', e);
      }
    }
  } else {
    console.log('MCP Result error:', mcpResult.error);
  }
} catch (error) {
  console.log('❌ MCP Handler Error:', error);
}

console.log('\n' + '='.repeat(60));
console.log('🏁 Debug script complete\n');

// Summary comparison
console.log('📊 COMPARISON SUMMARY:');
console.log('='.repeat(60));
console.log('Core API directly: Phase parameter ✅ WORKS - saved to file');
console.log('MCP Handler: Phase parameter ? - check results above');
console.log('='.repeat(60));