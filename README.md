# Claude Code History CLI

A command-line tool for viewing and searching Claude Code conversation history with enhanced formatting and navigation features.

## Features

- 📁 **Project Management** - List and browse all your Claude Code projects
- 📝 **Session Overview** - View sessions with timestamps and message counts
- 💬 **Conversation Display** - Read conversations with formatted tool usage and syntax highlighting
- 🔍 **Powerful Search** - Search across all projects or within specific projects
- ⏱️ **Timeline View** - Navigate conversations chronologically
- 🎯 **Smart Filtering** - Filter by project, date, or content type
- 🖥️ **Cross-Platform** - Native binaries for macOS, Linux, and Windows

## Installation

### Prerequisites

Deno must be installed on your system:

```bash
# Install Deno (if not already installed)
curl -fsSL https://deno.land/install.sh | sh

# Add to PATH
echo 'export DENO_INSTALL="$HOME/.deno"' >> ~/.zshrc
echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Quick Install (Recommended)

```bash
# Clone the repository
git clone https://github.com/ysk1031/claude-code-history-cli.git
cd claude-code-history-cli

# Run the installation script
./install.sh

# Or use Deno task
deno task install
```

After installation, the `cch` command will be available in your terminal.

### Manual Installation

```bash
# Compile the binary
deno task compile

# Move to a directory in your PATH
sudo mv cch /usr/local/bin/
# Or for user-local installation
mkdir -p ~/.local/bin
mv cch ~/.local/bin/

# Add ~/.local/bin to PATH if using local installation
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## Usage

Once installed, use the `cch` command directly:

### Basic Commands

```bash
# List all projects
cch projects

# List sessions for a project
cch sessions PROJECT_NAME

# Show conversation history
cch show PROJECT_NAME "session-id"

# Show only user prompts from a session
cch prompts PROJECT_NAME "session-id"

# Search across all projects
cch search "keyword"

# Search within a specific project
cch search -p PROJECT_NAME "keyword"
```

### Advanced Usage

```bash
# Show full conversation content (not truncated)
cch show PROJECT_NAME "session-id" --full

# Limit number of messages displayed
cch show PROJECT_NAME "session-id" --limit 10

# Show user prompts in markdown format
cch prompts PROJECT_NAME "session-id" --markdown

# Show recent 5 prompts only
cch prompts PROJECT_NAME "session-id" --recent 5

# Search with project filtering
cch search -p "My AI Project" "bug fix"

# Get help for any command
cch help
cch show --help
```

## Development

For development purposes, you can run commands without compilation:

```bash
# List projects in development mode
deno task dev projects

# Show sessions in development mode
deno task dev sessions PROJECT_NAME

# Display conversation in development mode
deno task dev show PROJECT_NAME "session-id"

# Search in development mode
deno task dev search "keyword"

# Run tests
deno task test
```

## Command Reference

### `cch projects`
Lists all Claude Code projects with their creation dates and session counts.

### `cch sessions <project>`
Displays all sessions for a given project, showing:
- Session ID
- Start time
- Message count
- Last activity

### `cch show <project> <session-id>`
Shows the conversation history for a specific session with:
- Formatted tool usage (Bash, Read, Edit, etc.)
- Syntax-highlighted code blocks
- Timestamp information
- User and assistant messages

**Options:**
- `-f, --full` - Display complete message content (default shows abbreviated)
- `-l, --limit <n>` - Limit the number of messages shown
- `-r, --recent <n>` - Show recent N messages

### `cch prompts <project> <session-id>`
Displays only user prompts (requests) from a specific session, filtering out system-generated messages and tool results.

**Options:**
- `-f, --full` - Display complete prompt content (default shows 3-line preview)
- `-l, --limit <n>` - Limit the number of prompts shown
- `-r, --recent <n>` - Show recent N prompts
- `-m, --markdown` - Output in markdown format (useful for documentation or commit logs)

### `cch search <query>`
Searches through conversation content across projects.

**Options:**
- `-p, --project <name>` - Limit search to a specific project

## Build and Deployment

### Compilation

```bash
# Auto-detect platform and compile
deno task compile

# Platform-specific compilation
deno task compile:macos      # macOS ARM64
deno task compile:macos-intel # macOS Intel
deno task compile:linux      # Linux x86_64
deno task compile:windows    # Windows

# Using Make
make compile
```

### Uninstallation

```bash
# Remove the installed binary
./uninstall.sh
# Or
make uninstall
```

## Technical Details

- **Runtime**: Deno with TypeScript
- **CLI Framework**: Cliffy for advanced command parsing
- **Data Source**: Reads from `~/.claude/projects/` (Claude Code's local storage)
- **Output**: Formatted terminal output with icons and syntax highlighting
- **Architecture**: Modular design with separate parser, types, and main components

## License

This project is open source. Please check the repository for license details.

## Support

If you encounter issues or have questions:
- Check the [Issues](https://github.com/ysk1031/claude-code-history-cli/issues) page
- Create a new issue with detailed information about the problem
- Include your OS, Deno version, and error messages if applicable