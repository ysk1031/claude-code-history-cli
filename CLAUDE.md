# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Run in development mode (no compilation needed)
deno task dev <command> [args]

# Run tests
deno task test
```

### Build and Compile
```bash
# Compile to native binary (auto-detects platform)
deno task compile

# Platform-specific compilation
deno task compile:macos      # macOS ARM64
deno task compile:macos-intel # macOS Intel
deno task compile:linux      # Linux x86_64
deno task compile:windows    # Windows

# Alternative using Make
make compile
```

### GitHub CLI
```bash
# GitHub CLI (gh) is available for repository operations
gh pr create      # Create pull request
gh pr list        # List pull requests
gh issue create   # Create issue
gh issue list     # List issues
```

### Installation
```bash
# Automatic installation (compiles and installs to ~/.local/bin)
./install.sh
# or
deno task install
# or
make install

# Uninstall
./uninstall.sh
# or
make uninstall
```

## Architecture

### Core Components

**Entry Point**: `src/main.ts`
- Defines CLI commands using Cliffy framework
- Commands: `projects`, `sessions`, `show`, `search`, `help`
- Handles command-line arguments and option parsing

**Parser**: `src/parser.ts`
- `ClaudeHistoryParser` class reads JSONL files from `~/.claude/projects/`
- Formats tool usage (Bash, Read, Edit, etc.) with appropriate icons
- Extracts and formats message content with abbreviated/full display modes

**Type Definitions**: `src/types.ts`
- Defines `ClaudeMessage` and `Session` interfaces
- Ensures type safety throughout the application

### Key Design Decisions

1. **Deno Runtime**: Uses Deno for modern TypeScript support and easy compilation to native binaries
2. **Cliffy Framework**: Provides advanced CLI features including command parsing and help generation
3. **Local File Access**: Reads directly from Claude Code's local storage at `~/.claude/projects/`
4. **Cross-Platform**: Supports compilation for macOS (ARM64/Intel), Linux, and Windows

### Data Flow

1. User invokes `cch` command
2. Cliffy parses command and options
3. `ClaudeHistoryParser` reads relevant JSONL files
4. Messages are formatted based on display preferences
5. Output is rendered to terminal with appropriate formatting

## Development Guidelines

When modifying this codebase:
- Maintain TypeScript type safety - all message structures should conform to defined interfaces
- Follow existing formatting patterns for tool usage display
- Test commands with actual Claude Code history files
- Ensure cross-platform compatibility when adding new features