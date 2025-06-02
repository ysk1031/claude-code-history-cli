#!/bin/bash

# Claude Code History CLI Uninstallation Script

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🗑️  Uninstalling Claude Code History CLI...${NC}"

# Common installation locations
LOCATIONS=(
    "$HOME/.local/bin/cch"
    "/usr/local/bin/cch"
    "/opt/bin/cch"
    "$HOME/bin/cch"
)

FOUND=false

for location in "${LOCATIONS[@]}"; do
    if [ -f "$location" ]; then
        echo -e "${YELLOW}Found binary at: $location${NC}"
        
        # Ask for confirmation
        read -p "Remove this file? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -f "$location"
            echo -e "${GREEN}✅ Removed: $location${NC}"
            FOUND=true
        else
            echo -e "${YELLOW}Skipped: $location${NC}"
        fi
    fi
done

if [ "$FOUND" = false ]; then
    echo -e "${YELLOW}No Claude Code History CLI installations found.${NC}"
else
    echo -e "${GREEN}✨ Uninstallation complete!${NC}"
fi

echo -e "\nNote: You may also want to remove any PATH additions from your shell configuration files."