#!/usr/bin/env bun

/**
 * Test script for Claude Helper utility
 * 
 * Tests individual components before running the full release
 */

import { prepareGitData, callClaude, validateVersionAnalysis, validateChangelogGeneration } from './utils/claude-helper';

console.log('🧪 Testing Claude Helper Utility...\n');

// Test 1: Git data preparation
async function testGitDataPrep() {
  console.log('1️⃣ Testing Git Data Preparation...');
  try {
    const gitData = await prepareGitData();
    console.log(`   ✅ Last tag: ${gitData.last_tag}`);
    console.log(`   ✅ Commits: ${gitData.commits.split('\n').length} lines`);
    console.log(`   ✅ Diff: ${gitData.diff.length} characters`);
    return true;
  } catch (error) {
    console.error(`   ❌ Git data preparation failed: ${error}`);
    return false;
  }
}

// Test 2: Simple Claude call (without validation)
async function testSimpleClaudeCall() {
  console.log('\n2️⃣ Testing Simple Claude Call...');
  
  // Create a minimal test prompt
  const testPrompt = `---
allowedTools:
  - "Read"
---

# Simple Test

Please respond with this exact JSON:

\`\`\`json
{
  "success": true,
  "message": "Hello from Claude",
  "timestamp": "${new Date().toISOString()}"
}
\`\`\``;

  try {
    // Write temporary prompt file
    const tempPath = '/tmp/test-claude-prompt.md';
    await Bun.write(tempPath, testPrompt);
    
    const result = await callClaude(tempPath);
    
    console.log(`   ✅ Claude call successful: ${result.success}`);
    console.log(`   ✅ Data received: ${result.data ? 'Yes' : 'No'}`);
    
    if (result.data) {
      console.log(`   ✅ Message: ${result.data.message}`);
    }
    
    // Cleanup
    await Bun.write(tempPath, ''); // Clear file
    
    return result.success;
  } catch (error) {
    console.error(`   ❌ Simple Claude call failed: ${error}`);
    return false;
  }
}

// Test 3: Version analysis prompt (if git data works)
async function testVersionAnalysis() {
  console.log('\n3️⃣ Testing Version Analysis Prompt...');
  
  try {
    const gitData = await prepareGitData();
    const pkg = JSON.parse(await Bun.file('package.json').text());
    
    const data = {
      current_version: pkg.version,
      target_version: '', // Let Claude determine
      last_tag: gitData.last_tag,
      ...gitData
    };
    
    console.log(`   🔍 Analyzing version from ${pkg.version} since tag ${gitData.last_tag}`);
    
    const result = await callClaude(
      'scripts/prompts/tasks/version-analysis.md',
      data
    );
    
    console.log(`   ✅ Claude response: ${result.success}`);
    
    if (result.success) {
      const validation = validateVersionAnalysis(result);
      if (validation.success) {
        console.log(`   ✅ Validation passed`);
        console.log(`   ✅ Recommended version: ${validation.data.recommended_version}`);
        console.log(`   ✅ Change type: ${validation.data.change_type}`);
        console.log(`   ✅ Confidence: ${validation.data.confidence}`);
      } else {
        console.error(`   ❌ Validation failed: ${validation.error}`);
        return false;
      }
    }
    
    return result.success;
  } catch (error) {
    console.error(`   ❌ Version analysis failed: ${error}`);
    return false;
  }
}

// Test 4: Changelog generation prompt (if version analysis works)
async function testChangelogGeneration() {
  console.log('\n4️⃣ Testing Changelog Generation Prompt...');
  
  try {
    const gitData = await prepareGitData();
    const pkg = JSON.parse(await Bun.file('package.json').text());
    
    const data = {
      target_version: `${pkg.version}-test`,
      release_date: new Date().toISOString().split('T')[0],
      last_tag: gitData.last_tag,
      ...gitData
    };
    
    console.log(`   📝 Generating changelog for ${data.target_version}`);
    
    const result = await callClaude(
      'scripts/prompts/tasks/changelog-generation.md',
      data
    );
    
    console.log(`   ✅ Claude response: ${result.success}`);
    
    if (result.success) {
      const validation = validateChangelogGeneration(result);
      if (validation.success) {
        console.log(`   ✅ Validation passed`);
        console.log(`   ✅ Summary: ${validation.data.summary}`);
        console.log(`   ✅ Categories: ${validation.data.categories_used.join(', ')}`);
        console.log(`   ✅ Total changes: ${validation.data.total_changes}`);
      } else {
        console.error(`   ❌ Validation failed: ${validation.error}`);
        return false;
      }
    }
    
    return result.success;
  } catch (error) {
    console.error(`   ❌ Changelog generation failed: ${error}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  const tests = [
    { name: 'Git Data Preparation', fn: testGitDataPrep },
    { name: 'Simple Claude Call', fn: testSimpleClaudeCall },
    { name: 'Version Analysis', fn: testVersionAnalysis },
    { name: 'Changelog Generation', fn: testChangelogGeneration }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const success = await test.fn();
    results.push({ name: test.name, success });
    
    if (!success) {
      console.log(`\n⚠️  ${test.name} failed - stopping here`);
      break;
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  for (const result of results) {
    console.log(`   ${result.success ? '✅' : '❌'} ${result.name}`);
  }
  
  const allPassed = results.every(r => r.success);
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '❌ Some tests failed'}`);
  
  if (allPassed) {
    console.log('\n🚀 Ready to test full release script with --dry-run');
  } else {
    console.log('\n🔧 Fix the failing components before proceeding');
  }
}

// Execute tests
if (import.meta.main) {
  runTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}