#!/usr/bin/env bun

/**
 * Security Check Script
 * 
 * Runs security-focused checks for immediate threats
 * Usage: bun scripts/security-check.ts [options]
 * 
 * Checks performed:
 * - Dependency vulnerabilities (OSV Scanner - Google's open source scanner)
 * - Secret scanning (secretlint)
 * - Static analysis security checks (OpenGrep - true open source fork)
 * - Custom security patterns
 * 
 * Options:
 * --format=json      Output results in JSON format
 * --help             Show this help message
 */

import { parseArgs } from 'util';
import { simpleGit } from 'simple-git';

// Parse command line arguments
const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    format: { type: 'string', default: 'human' }, // human or json
    help: { type: 'boolean', default: false },
  }
});

// Show help if requested
if (values.help) {
  console.log(`
🔒 Security Check Script

Usage: bun scripts/security-check.ts [options]

Performs security-focused checks:
  • Dependency vulnerability scanning (OSV Scanner via Docker)
  • Secret detection in source code (secretlint via Docker)
  • Static analysis security checks (OpenGrep via Docker)
  • Custom security pattern analysis

Prerequisites:
  Docker must be installed and running
  All security tools run via Docker containers (no local installation needed)

Options:
  --format=json      Output results in JSON format
  --help             Show this help message

Examples:
  bun scripts/security-check.ts              # Run all security checks
  bun scripts/security-check.ts --format=json # JSON output for CI
`);
  process.exit(0);
}

const git = simpleGit();

// Run a command and capture output
async function runCommand(cmd: string[], description: string) {
  console.log(`\n${description}`);
  
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
  
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
  
  return {
    success: exitCode === 0,
    stdout,
    stderr,
    exitCode
  };
}

// Custom security pattern checks
function checkSecurityPatterns(content: string, filePath: string): string[] {
  const issues: string[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Check for common security issues
    if (line.includes('eval(') && !line.includes('// security-ok')) {
      issues.push(`${filePath}:${lineNum} - Potential eval() usage detected`);
    }
    
    if (line.match(/console\.log.*(?:password|secret|key|token)/i)) {
      issues.push(`${filePath}:${lineNum} - Potential secret logging detected`);
    }
    
    if (line.match(/process\.env\.[A-Z_]+.*=.*["'][^"']*["']/)) {
      issues.push(`${filePath}:${lineNum} - Hardcoded environment variable detected`);
    }
    
    // Check for suspicious URLs
    if (line.match(/https?:\/\/.*(?:admin|dev|test|staging).*/) && !line.includes('// url-ok')) {
      issues.push(`${filePath}:${lineNum} - Suspicious URL detected (dev/admin endpoint)`);
    }
  }
  
  return issues;
}

// Scan files for custom security patterns
async function runCustomSecurityChecks(): Promise<{ success: boolean, issues: string[] }> {
  console.log('\n🔍 Custom Security Pattern Check:');
  
  const issues: string[] = [];
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  try {
    // Get all source files
    const files = await Bun.spawn(['find', 'src', '-type', 'f'], { stdout: 'pipe' });
    let fileList = '';
    
    if (files.stdout) {
      const reader = files.stdout.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fileList += decoder.decode(value);
        }
      } catch (error) {
        // Ignore read errors
      }
    }
    
    await files.exited;
    
    const filePaths = fileList.trim().split('\n').filter(path => 
      extensions.some(ext => path.endsWith(ext))
    );
    
    // Check each file
    for (const filePath of filePaths) {
      if (!filePath) continue;
      
      try {
        const file = Bun.file(filePath);
        const content = await file.text();
        const fileIssues = checkSecurityPatterns(content, filePath);
        issues.push(...fileIssues);
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    if (issues.length === 0) {
      console.log('✅ No custom security issues found');
    } else {
      console.log('❌ Security issues detected:');
      for (const issue of issues) {
        console.log(`  - ${issue}`);
      }
    }
    
    return { success: issues.length === 0, issues };
  } catch (error) {
    console.error('Error running custom security checks:', error);
    return { success: false, issues: ['Custom security check failed'] };
  }
}

// Main security check function
async function runSecurityChecks() {
  console.log('🔒 Running Security Checks...\n');
  
  const results = {
    audit: { success: false as any },
    secrets: { success: false as any },
    opengrep: { success: false as any },
    custom: { success: false as any },
    overall: false
  };
  
  // Run checks in parallel where possible
  const auditPromise = runCommand(
    ['docker', 'run', '--rm', '-v', `${process.cwd()}:/src`, 'ghcr.io/google/osv-scanner:latest', '--format=table', '/src'],
    '🛡️  Dependency Vulnerability Check (OSV Scanner):'
  ).then(result => {
    results.audit = result;
  });
  
  const secretsPromise = runCommand(
    ['docker', 'run', '--rm', '-v', `${process.cwd()}:/workspace`, 'secretlint/secretlint:latest', 'secretlint', '/workspace/src', '/workspace/scripts', '/workspace/*.ts', '/workspace/*.js', '/workspace/*.json'],
    '🔐 Secret Scanning:'
  ).then(result => {
    results.secrets = result;
  });

  const opengrepPromise = runCommand(
    ['docker', 'run', '--rm', '-v', `${process.cwd()}:/src`, 'opengrep/opengrep:latest', '--config=auto', '--severity=ERROR', '--severity=WARNING', '/src/src', '/src/scripts'],
    '🔍 Static Analysis Security Check (OpenGrep):'
  ).then(result => {
    results.opengrep = result;
  });
  
  const customPromise = runCustomSecurityChecks().then(result => {
    results.custom = result;
  });
  
  // Wait for all checks to complete
  await Promise.all([auditPromise, secretsPromise, opengrepPromise, customPromise]);
  
  // Overall result
  results.overall = results.audit.success && results.secrets.success && results.opengrep.success && results.custom.success;
  
  // Summary
  console.log('\n🔒 Security Summary:');
  console.log(`  Audit: ${results.audit.success ? '✅ Pass' : '❌ Fail'}`);
  console.log(`  Secrets: ${results.secrets.success ? '✅ Pass' : '❌ Fail'}`);
  console.log(`  OpenGrep: ${results.opengrep.success ? '✅ Pass' : '❌ Fail'}`);
  console.log(`  Custom: ${results.custom.success ? '✅ Pass' : '❌ Fail'}`);
  console.log(`  Overall: ${results.overall ? '✅ All security checks passed!' : '❌ Security issues detected'}`);
  
  // Security recommendations
  if (!results.overall) {
    console.log('\n💡 Security Recommendations:');
    if (!results.audit.success) {
      console.log('  • Update vulnerable dependencies immediately');
    }
    if (!results.secrets.success) {
      console.log('  • Remove or secure detected secrets');
    }
    if (!results.opengrep.success) {
      console.log('  • Fix static analysis security issues detected by OpenGrep');
    }
    if (!results.custom.success) {
      console.log('  • Review and fix custom security patterns');
    }
  }
  
  // Output JSON if requested
  if (values.format === 'json') {
    console.log('\n📄 JSON Output:');
    console.log(JSON.stringify(results, null, 2));
  }
  
  // Exit with appropriate code
  process.exit(results.overall ? 0 : 1);
}

// Run the security checks
runSecurityChecks().catch(error => {
  console.error('❌ Error running security checks:', error);
  process.exit(1);
});