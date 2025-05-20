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

# Uninstall any existing installations first
npm uninstall -g @scopecraft/cmd

# Install the package globally
npm install -g "$LATEST_PACKAGE"

# Check installation path
NPM_GLOBAL_PATH=$(npm root -g)
INSTALL_PATH=$(find "$NPM_GLOBAL_PATH" -name "scopecraft-cmd" | head -1)
echo "Package installed at: $INSTALL_PATH"

# Verify installation
echo "Verifying installation:"
sc --version
sc-mcp --version
sc-stdio --version

# Print PATH information for debugging
echo "PATH entries:"
echo $PATH | tr ':' '\n' | grep -i npm

echo "Successfully installed @scopecraft/cmd locally"