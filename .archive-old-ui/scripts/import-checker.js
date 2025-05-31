#!/usr/bin/env bun

/**
 * This script checks for common import errors by statically analyzing import statements
 * in TypeScript and React files. It catches issues that TypeScript's type checker might miss,
 * especially with third-party library imports.
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// Libraries to check more carefully
const PROBLEMATIC_LIBRARIES = [
  'reactflow',
  'wouter',
  '@tanstack/react-table'
];

// Base directory to scan
const BASE_DIR = path.join(process.cwd(), 'src');

// Helper to find all .ts and .tsx files
function findAllTypeScriptFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findAllTypeScriptFiles(fullPath));
    } else if (
      entry.isFile() && 
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !entry.name.endsWith('.d.ts')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

// Parse imports from a file
function extractImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = [];

  // Match normal import statements
  const importRegex = /import\s+(?:{([^}]*)}|\*\s+as\s+([^,]+)|([^,{}\s]+))(?:\s*,\s*(?:{([^}]+)}|(\*)\s+as\s+([^,}]+)))?\s+from\s+['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = importRegex.exec(content))) {
    const braceImports = match[1] ? match[1].split(',')
      .map(s => s.trim().split(' as ')[0])
      .filter(s => s !== '') : [];
    const namespaceImport = match[2] ? match[2].trim() : null;
    const defaultImport = match[3] ? match[3].trim() : null;
    const secondBraceImports = match[4] ? match[4].split(',').map(s => s.trim().split(' as ')[0]) : [];
    const source = match[7];

    const importObj = {
      source,
      specifiers: [
        ...braceImports,
        ...secondBraceImports
      ]
    };

    if (namespaceImport) importObj.namespaceImport = namespaceImport;
    if (defaultImport) importObj.default = defaultImport;

    imports.push(importObj);
  }

  // Match type imports
  const typeImportRegex = /import\s+type\s+(?:{([^}]+)}|\*\s+as\s+([^,]+)|([^,{}\s]+))(?:\s*,\s*(?:{([^}]+)}|(\*)\s+as\s+([^,}]+)))?\s+from\s+['"]([^'"]+)['"]/g;
  
  while ((match = typeImportRegex.exec(content))) {
    const braceImports = match[1] ? match[1].split(',').map(s => s.trim().split(' as ')[0]) : [];
    const namespaceImport = match[2] ? match[2].trim() : null;
    const defaultImport = match[3] ? match[3].trim() : null;
    const secondBraceImports = match[4] ? match[4].split(',').map(s => s.trim().split(' as ')[0]) : [];
    const source = match[7];

    const importObj = {
      source,
      isTypeOnly: true,
      specifiers: [
        ...braceImports,
        ...secondBraceImports
      ]
    };

    if (namespaceImport) importObj.namespaceImport = namespaceImport;
    if (defaultImport) importObj.default = defaultImport;

    imports.push(importObj);
  }

  return { file: filePath, imports };
}

// Handle React Flow specific checks
function checkReactFlowImports(fileImports) {
  const issues = [];

  // Define known ReactFlow exports
  const reactFlowTypeExports = [
    'Node', 'Edge', 'NodeProps', 'Connection', 'NodeMouseHandler', 'NodeTypes',
    'EdgeTypes', 'EdgeProps', 'EdgeMouseHandler', 'FlowElement', 'FlowElements',
    'Elements', 'Transform', 'XYPosition', 'Dimensions', 'Rect', 'Box',
    'Viewport', 'PanOnScrollMode', 'OnConnect', 'OnConnectStart', 'OnConnectEnd',
    'OnConnectMove', 'ConnectionLineType', 'ConnectionLineComponent', 'HandleType',
    'NodeChange', 'EdgeChange', 'ConnectionMode', 'OnNodesChange', 'OnEdgesChange',
    'NodeDragHandler', 'OnSelectionChangeFunc', 'NodeExtent', 'CoordinateExtent',
    'SelectionDragHandler', 'OnInit', 'OnMove', 'PanelPosition', 'ProOptions',
    'OnNodeDrag', 'OnNodeDragStart', 'OnNodeDragStop', 'FitViewOptions', 'NodeOrigin'
  ];

  const reactFlowRuntimeExports = [
    'ReactFlow', 'Handle', 'EdgeText', 'StraightEdge', 'StepEdge', 'BezierEdge',
    'SmoothStepEdge', 'useReactFlow', 'useNodes', 'useEdges',
    'ReactFlowProvider', 'addEdge', 'getOutgoers', 'getIncomers', 'getConnectedEdges',
    'updateEdge', 'isNode', 'isEdge', 'Background', 'BackgroundVariant', 'MiniMap',
    'Controls', 'ControlButton', 'Panel', 'useNodesState', 'useEdgesState',
    'MarkerType', 'internalsSymbol', 'Position', 'useUpdateNodeInternals',
    'BaseEdge', 'getBezierPath', 'getSmoothStepPath', 'getStraightPath', 'getMarkerEnd'
  ];

  for (const { file, imports } of fileImports) {
    for (const imp of imports) {
      if (imp.source === 'reactflow') {
        // Check for non-type imports that should be type imports
        for (const specifier of imp.specifiers) {
          if (reactFlowTypeExports.includes(specifier) && !imp.isTypeOnly) {
            issues.push({
              file,
              message: `"${specifier}" from 'reactflow' should be imported as a type using "import type"`
            });
          }

          // Check for non-existent imports
          if (!reactFlowTypeExports.includes(specifier) && !reactFlowRuntimeExports.includes(specifier)) {
            issues.push({
              file,
              message: `"${specifier}" (length: ${specifier.length}) is not exported from 'reactflow'. Check the spelling or import requirements.`
            });
          }
        }

        // Check for type imports that should be runtime imports
        if (imp.isTypeOnly) {
          for (const specifier of imp.specifiers) {
            if (reactFlowRuntimeExports.includes(specifier)) {
              issues.push({
                file,
                message: `"${specifier}" from 'reactflow' is a runtime value and should NOT be imported with "import type"`
              });
            }
          }
        }
      }
    }
  }

  return issues;
}

// Handle Wouter specific checks
function checkWouterImports(fileImports) {
  const issues = [];

  // Define known Wouter exports
  const wouterExports = [
    'useRoute', 'useLocation', 'Route', 'Switch', 'Link', 'Redirect',
    'Router', 'navigate', 'useRouter', 'makeMatcher', 'DefaultMatcher',
    'BaseRouter', 'RouterContext', 'useBaseLocation', 'buildContext'
  ];

  for (const { file, imports } of fileImports) {
    for (const imp of imports) {
      if (imp.source === 'wouter') {
        // Check for non-existent imports
        for (const specifier of imp.specifiers) {
          if (!wouterExports.includes(specifier)) {
            if (specifier === 'useNavigate') {
              issues.push({
                file,
                message: `'useNavigate' is not exported from 'wouter'. Use 'const [, navigate] = useLocation()' instead.`
              });
            } else {
              issues.push({
                file,
                message: `"${specifier}" is not exported from 'wouter'. Check the spelling or import requirements.`
              });
            }
          }
        }
      }
    }
  }

  return issues;
}

// Main function
async function checkImports() {
  console.log('🔍 Checking imports...');
  const files = findAllTypeScriptFiles(BASE_DIR);
  console.log(`Found ${files.length} TypeScript files to analyze`);
  
  const fileImports = files.map(extractImports);
  
  // Perform library-specific checks
  const reactFlowIssues = checkReactFlowImports(fileImports);
  const wouterIssues = checkWouterImports(fileImports);
  
  const issues = [
    ...reactFlowIssues,
    ...wouterIssues
  ];
  
  if (issues.length > 0) {
    console.error('\n🚨 Found import issues:');
    for (const issue of issues) {
      const relativePath = path.relative(process.cwd(), issue.file);
      console.error(`  - ${relativePath}: ${issue.message}`);
    }
    process.exit(1);
  } else {
    console.log('✅ No import issues found');
  }
}

checkImports().catch(err => {
  console.error('Error running import checker:', err);
  process.exit(1);
});