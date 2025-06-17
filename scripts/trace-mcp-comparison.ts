#!/usr/bin/env bun
/**
 * Trace and compare MCP handler vs server request processing
 */

import { handleTaskCreate } from '../src/mcp/handlers/write-handlers.js';
import { createMcpHandler } from '../src/mcp/handler-wrapper.js';
import { TaskCreateInputSchema } from '../src/mcp/schemas.js';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';

console.log('🔍 MCP Handler vs Server Trace Comparison\n');
console.log('='.repeat(70));

// Test parameters - exactly what MCP client sends
const rawParams = {
  title: 'Trace Test Direct Handler',
  type: 'test',
  phase: 'backlog',
  area: 'general',
  status: 'todo',
  priority: 'medium',
};

console.log('📋 Raw input parameters:');
console.log(JSON.stringify(rawParams, null, 2));

// ============================================================================
// Test 1: Direct handler call (what our debug script does)
// ============================================================================
console.log('\n' + '='.repeat(70));
console.log('🔧 TEST 1: Direct Handler Call (handleTaskCreate)');
console.log('='.repeat(70));

try {
  console.log('⚡ Calling handleTaskCreate directly...');
  const directResult = await handleTaskCreate(rawParams);
  
  console.log('\n📄 Direct Result:');
  console.log('Success:', directResult.success);
  if (!directResult.success) {
    console.log('Error:', directResult.error);
  }
  console.log('Has phase in response:', 'phase' in (directResult.data || {}));
  console.log('Phase value:', (directResult.data as any)?.phase);
  
  if (directResult.success && directResult.data) {
    const filePath = directResult.data.path;
    console.log('\n📁 Checking direct file:', filePath);
    
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8');
      const hasPhase = content.includes('phase:');
      console.log('File contains phase:', hasPhase);
      
      if (hasPhase) {
        const phaseMatch = content.match(/phase:\s*(\w+)/);
        console.log('Phase value in file:', phaseMatch?.[1] || 'not found');
      }
      
      // Clean up
      try { unlinkSync(filePath); } catch (e) { /* ignore */ }
    }
  }
} catch (error) {
  console.log('❌ Direct handler error:', error);
}

// ============================================================================
// Test 2: MCP wrapper call (what the server does)
// ============================================================================
console.log('\n' + '='.repeat(70));
console.log('🌐 TEST 2: MCP Wrapper Call (createMcpHandler)');
console.log('='.repeat(70));

try {
  console.log('⚡ Creating wrapped handler...');
  const wrappedHandler = createMcpHandler(handleTaskCreate);
  
  console.log('⚡ Calling wrapped handler...');
  const wrappedResult = await wrappedHandler(rawParams);
  
  console.log('\n📄 Wrapped Result:');
  console.log('Success:', wrappedResult.success);
  if (!wrappedResult.success) {
    console.log('Error:', wrappedResult.error);
  }
  console.log('Has phase in response:', 'phase' in (wrappedResult.data || {}));
  console.log('Phase value:', (wrappedResult.data as any)?.phase);
  
  if (wrappedResult.success && wrappedResult.data) {
    const filePath = wrappedResult.data.path;
    console.log('\n📁 Checking wrapped file:', filePath);
    
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8');
      const hasPhase = content.includes('phase:');
      console.log('File contains phase:', hasPhase);
      
      if (hasPhase) {
        const phaseMatch = content.match(/phase:\s*(\w+)/);
        console.log('Phase value in file:', phaseMatch?.[1] || 'not found');
      }
      
      // Clean up
      try { unlinkSync(filePath); } catch (e) { /* ignore */ }
    }
  }
} catch (error) {
  console.log('❌ Wrapped handler error:', error);
}

// ============================================================================
// Test 3: Schema validation step by step
// ============================================================================
console.log('\n' + '='.repeat(70));
console.log('📋 TEST 3: Schema Validation Tracing');
console.log('='.repeat(70));

try {
  console.log('⚡ Testing schema validation...');
  const validated = TaskCreateInputSchema.parse(rawParams);
  
  console.log('\n📄 Schema validation result:');
  console.log('Has phase:', 'phase' in validated);
  console.log('Phase value:', validated.phase);
  console.log('Phase type:', typeof validated.phase);
  console.log('All keys:', Object.keys(validated));
} catch (error) {
  console.log('❌ Schema validation error:', error);
}

// ============================================================================
// Test 4: Test with undefined phase
// ============================================================================
console.log('\n' + '='.repeat(70));
console.log('🔍 TEST 4: Undefined Phase Test');
console.log('='.repeat(70));

const undefinedPhaseParams = { ...rawParams };
delete (undefinedPhaseParams as any).phase;

try {
  console.log('⚡ Testing with undefined phase...');
  const undefinedResult = await handleTaskCreate(undefinedPhaseParams);
  
  console.log('\n📄 Undefined phase result:');
  console.log('Success:', undefinedResult.success);
  console.log('Has phase in response:', 'phase' in (undefinedResult.data || {}));
  console.log('Phase value:', (undefinedResult.data as any)?.phase);
  
  if (undefinedResult.success && undefinedResult.data) {
    const filePath = undefinedResult.data.path;
    console.log('\n📁 Checking undefined phase file:', filePath);
    
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8');
      const hasPhase = content.includes('phase:');
      console.log('File contains phase:', hasPhase);
      
      // Clean up
      try { unlinkSync(filePath); } catch (e) { /* ignore */ }
    }
  }
} catch (error) {
  console.log('❌ Undefined phase error:', error);
}

// ============================================================================
// Summary
// ============================================================================
console.log('\n' + '='.repeat(70));
console.log('📊 COMPARISON SUMMARY');
console.log('='.repeat(70));
console.log('Direct handler call: Phase parameter handling');
console.log('MCP wrapper call: Phase parameter handling');
console.log('Schema validation: Phase parameter validation');
console.log('Undefined phase: Fallback behavior');
console.log('='.repeat(70));