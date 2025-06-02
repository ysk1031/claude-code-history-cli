#!/bin/bash

# Script to add ~/.local/bin to PATH

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

INSTALL_DIR="$HOME/.local/bin"

# Check if already in PATH
if [[ ":$PATH:" == *":$INSTALL_DIR:"* ]]; then
    echo -e "${GREEN}✅ $INSTALL_DIR is already in your PATH${NC}"
    exit 0
fi

# Detect shell and update config
SHELL_NAME=$(basename "$SHELL")
CONFIG_FILE=""

case "$SHELL_NAME" in
    zsh)
        CONFIG_FILE="$HOME/.zshrc"
        ;;
    bash)
        # Check for .bash_profile on macOS, .bashrc on Linux
        if [[ "$OSTYPE" == "darwin"* ]]; then
            CONFIG_FILE="$HOME/.bash_profile"
        else
            CONFIG_FILE="$HOME/.bashrc"
        fi
        ;;
    fish)
        CONFIG_FILE="$HOME/.config/fish/config.fish"
        ;;
    *)
        echo -e "${RED}❌ Unsupported shell: $SHELL_NAME${NC}"
        echo "Please manually add the following to your shell configuration:"
        echo "export PATH=\"$INSTALL_DIR:\$PATH\""
        exit 1
        ;;
esac

echo -e "${YELLOW}📝 Adding $INSTALL_DIR to PATH in $CONFIG_FILE${NC}"

# Add PATH export to config file
if [ "$SHELL_NAME" = "fish" ]; then
    echo "set -x PATH $INSTALL_DIR \$PATH" >> "$CONFIG_FILE"
else
    echo "export PATH=\"$INSTALL_DIR:\$PATH\"" >> "$CONFIG_FILE"
fi

echo -e "${GREEN}✅ PATH updated successfully!${NC}"
echo -e "\nTo apply the changes, run:"
echo -e "  ${GREEN}source $CONFIG_FILE${NC}"
echo -e "\nOr restart your terminal."