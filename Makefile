.PHONY: install compile clean uninstall help

# Default target
help:
	@echo "Claude Code History CLI - Available targets:"
	@echo "  make install    - Compile and install the binary to ~/.local/bin"
	@echo "  make compile    - Compile the binary (cch)"
	@echo "  make clean      - Remove compiled binary"
	@echo "  make uninstall  - Uninstall the binary from system"
	@echo "  make help       - Show this help message"

# Install the CLI tool
install:
	@echo "Installing Claude Code History CLI..."
	@deno task install

# Compile only
compile:
	@echo "Compiling binary..."
	@deno task compile

# Clean up
clean:
	@echo "Removing compiled binary..."
	@rm -f cch cch.exe

# Uninstall
uninstall:
	@echo "Uninstalling Claude Code History CLI..."
	@./uninstall.sh