#!/bin/bash
# Install the local package globally
# This script can be run from the ~/MCP/scopecraft directory

# Find the latest version of the package
LATEST_PACKAGE=$(ls -t ~/MCP/scopecraft/scopecraft-cmd-*.tgz | head -1)

if [ -z "$LATEST_PACKAGE" ]; then
  echo "Error: No package file found in ~/MCP/scopecraft/"
  echo "Run 'npm run publish:local' first to create the package"
  exit 1
fi

echo "Installing package: $LATEST_PACKAGE"

# Install the package globally
npm install -g "$LATEST_PACKAGE"

# Verify installation
echo "Verifying installation:"
sc --version
sc-mcp --version
sc-stdio --version

echo "Successfully installed @scopecraft/cmd locally"