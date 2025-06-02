import { ClaudeMessage, Session } from "./types.ts";
import { join } from "@std/path";
import { exists } from "@std/fs";

export class ClaudeHistoryParser {
  private readonly basePath: string;

  constructor() {
    const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";
    this.basePath = join(home, ".claude", "projects");
  }

  async getProjects(): Promise<string[]> {
    const projects: string[] = [];
    
    try {
      for await (const entry of Deno.readDir(this.basePath)) {
        if (entry.isDirectory) {
          projects.push(entry.name);
        }
      }
    } catch (error) {
      console.error("Error reading projects directory:", error);
    }
    
    return projects;
  }

  async getSessions(projectName: string): Promise<string[]> {
    const projectPath = join(this.basePath, projectName);
    const sessions: string[] = [];
    
    try {
      for await (const entry of Deno.readDir(projectPath)) {
        if (entry.isFile && entry.name.endsWith(".jsonl")) {
          sessions.push(entry.name.replace(".jsonl", ""));
        }
      }
    } catch (error) {
      console.error(`Error reading project ${projectName}:`, error);
    }
    
    return sessions;
  }

  async parseSession(projectName: string, sessionId: string): Promise<Session | null> {
    const filePath = join(this.basePath, projectName, `${sessionId}.jsonl`);
    
    if (!await exists(filePath)) {
      return null;
    }

    const messages: ClaudeMessage[] = [];
    
    try {
      const fileContent = await Deno.readTextFile(filePath);
      const lines = fileContent.trim().split("\n");
      
      for (const line of lines) {
        if (line) {
          try {
            const message = JSON.parse(line) as ClaudeMessage;
            messages.push(message);
          } catch (parseError) {
            console.error("Error parsing line:", parseError);
          }
        }
      }
      
      if (messages.length === 0) {
        return null;
      }

      const startTime = new Date(messages[0].timestamp);
      const endTime = new Date(messages[messages.length - 1].timestamp);

      return {
        id: sessionId,
        projectPath: projectName,
        messages,
        startTime,
        endTime,
      };
    } catch (error) {
      console.error(`Error reading session file ${filePath}:`, error);
      return null;
    }
  }

  extractMessageContent(message: ClaudeMessage, showFull: boolean = false): string {
    if (!message.message || !message.message.content) {
      return "";
    }
    
    if (typeof message.message.content === "string") {
      return message.message.content;
    }
    
    if (Array.isArray(message.message.content)) {
      const parts = message.message.content
        .map(item => {
          if (item.type === "text" && item.text) {
            return item.text;
          } else if (item.type === "tool_use") {
            return this.formatToolUse(item, showFull);
          } else if (item.type === "tool_result") {
            return this.formatToolResult(item, showFull);
          }
          return "";
        })
        .filter(text => text);

      // Add proper spacing between different content types
      let result = "";
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i > 0) {
          // Add extra spacing before tool uses and results
          if (part.startsWith("[") && (parts[i-1] && !parts[i-1].startsWith("["))) {
            result += "\n\n";
          } else if (!part.startsWith("[") && (parts[i-1] && parts[i-1].startsWith("["))) {
            result += "\n\n";
          } else {
            result += "\n";
          }
        }
        result += part;
      }
      return result;
    }
    
    return "";
  }

  private formatToolUse(toolUse: any, showFull: boolean = false): string {
    const name = toolUse.name;
    const input = toolUse.input || {};
    
    if (showFull) {
      // Full display shows complete tool information in a more Claude Code-like format
      switch (name) {
        case "Bash":
          const description = input.description || "";
          const command = input.command || "";
          let result = `🔧 Running Bash command`;
          if (description) result += `\n   ${description}`;
          if (command) result += `\n   $ ${command}`;
          return result;
          
        case "Read":
          const filePath = input.file_path || "";
          const limit = input.limit || "";
          const offset = input.offset || "";
          let readResult = `📖 Reading file`;
          if (filePath) {
            const fileName = filePath.split("/").pop() || filePath;
            readResult += `\n   📄 ${fileName}`;
            if (limit || offset) {
              const details = [];
              if (limit) details.push(`${limit} lines`);
              if (offset) details.push(`from line ${offset}`);
              readResult += ` (${details.join(", ")})`;
            }
          }
          return readResult;
          
        case "Edit":
        case "MultiEdit":
          const editFilePath = input.file_path || "";
          const fileName = editFilePath ? editFilePath.split("/").pop() || editFilePath : "";
          let editResult = name === "Edit" ? `✏️  Editing file` : `📝 Multi-editing file`;
          if (fileName) editResult += `\n   📄 ${fileName}`;
          if (name === "Edit") {
            const oldString = input.old_string || "";
            const newString = input.new_string || "";
            if (oldString && newString) {
              const oldPreview = oldString.length > 50 ? oldString.substring(0, 50) + "..." : oldString;
              const newPreview = newString.length > 50 ? newString.substring(0, 50) + "..." : newString;
              editResult += `\n   🔄 Replacing: "${oldPreview}"`;
              editResult += `\n   ➡️  With: "${newPreview}"`;
            }
          } else if (name === "MultiEdit") {
            const edits = input.edits || [];
            editResult += `\n   🔄 ${edits.length} changes`;
          }
          return editResult;
          
        case "Write":
          const writeFilePath = input.file_path || "";
          const content = input.content || "";
          const writeFileName = writeFilePath ? writeFilePath.split("/").pop() || writeFilePath : "";
          let writeResult = `💾 Creating file`;
          if (writeFileName) writeResult += `\n   📄 ${writeFileName}`;
          if (content) writeResult += `\n   📏 ${content.length.toLocaleString()} characters`;
          return writeResult;
          
        case "TodoWrite":
          const todos = input.todos || [];
          let todoResult = `📋 Managing tasks`;
          todoResult += `\n   📝 ${todos.length} tasks updated`;
          if (todos.length > 0) {
            const statusIcons = { pending: "⏳", in_progress: "🔄", completed: "✅" };
            todos.slice(0, 3).forEach((todo: any, i: number) => {
              const icon = statusIcons[todo.status as keyof typeof statusIcons] || "📌";
              todoResult += `\n   ${icon} ${todo.content}`;
            });
            if (todos.length > 3) todoResult += `\n   ... and ${todos.length - 3} more tasks`;
          }
          return todoResult;
          
        case "Glob":
          const pattern = input.pattern || "";
          const path = input.path || "";
          let globResult = `🔍 Finding files`;
          if (pattern) globResult += `\n   🎯 Pattern: ${pattern}`;
          if (path) globResult += `\n   📁 In: ${path}`;
          return globResult;
          
        case "Grep":
          const searchPattern = input.pattern || "";
          const include = input.include || "";
          const grepPath = input.path || "";
          let grepResult = `🔎 Searching content`;
          if (searchPattern) grepResult += `\n   🎯 Pattern: ${searchPattern}`;
          if (include) grepResult += `\n   📋 Include: ${include}`;
          if (grepPath) grepResult += `\n   📁 In: ${grepPath}`;
          return grepResult;
          
        default:
          return `🔧 ${name}\n   ${JSON.stringify(input, null, 2)}`;
      }
    } else {
      // Abbreviated display - simpler, more compact format
      switch (name) {
        case "Bash":
          const description = input.description || "";
          const command = input.command || "";
          if (description) {
            return `🔧 ${description}`;
          } else if (command) {
            const shortCommand = command.length > 40 ? command.substring(0, 40) + "..." : command;
            return `🔧 ${shortCommand}`;
          }
          return `🔧 Bash command`;
          
        case "Read":
          const filePath = input.file_path || "";
          if (filePath) {
            const fileName = filePath.split("/").pop() || filePath;
            return `📖 ${fileName}`;
          }
          return `📖 Reading file`;
          
        case "Edit":
        case "MultiEdit":
          const editFilePath = input.file_path || "";
          if (editFilePath) {
            const fileName = editFilePath.split("/").pop() || editFilePath;
            const icon = name === "Edit" ? "✏️" : "📝";
            return `${icon} ${fileName}`;
          }
          return name === "Edit" ? `✏️ Editing file` : `📝 Multi-editing file`;
          
        case "Write":
          const writeFilePath = input.file_path || "";
          if (writeFilePath) {
            const fileName = writeFilePath.split("/").pop() || writeFilePath;
            return `💾 ${fileName}`;
          }
          return `💾 Creating file`;
          
        case "TodoWrite":
          const todos = input.todos || [];
          return `📋 ${todos.length} tasks`;
          
        case "TodoRead":
          return `📋 Reading tasks`;
          
        case "Glob":
          const pattern = input.pattern || "";
          return pattern ? `🔍 ${pattern}` : `🔍 Finding files`;
          
        case "Grep":
          const searchPattern = input.pattern || "";
          return searchPattern ? `🔎 ${searchPattern}` : `🔎 Searching`;
          
        case "LS":
          const lsPath = input.path || "";
          if (lsPath) {
            const dirName = lsPath.split("/").pop() || lsPath;
            return `📁 ${dirName}`;
          }
          return `📁 Listing directory`;
          
        default:
          return `🔧 ${name}`;
      }
    }
  }

  private formatToolResult(toolResult: any, showFull: boolean = false): string {
    if (showFull) {
      // Full display shows complete result in a more readable format
      let result = "📤 Tool Result";
      if (toolResult.content) {
        const content = typeof toolResult.content === "string" ? toolResult.content : JSON.stringify(toolResult.content);
        // Add proper indentation for better readability
        const indentedContent = content.split('\n').map((line: string) => `   ${line}`).join('\n');
        result += `\n${indentedContent}`;
      }
      if (toolResult.toolUseResult) {
        const meta = toolResult.toolUseResult;
        if (meta.stdout) {
          const indentedStdout = meta.stdout.split('\n').map((line: string) => `   ${line}`).join('\n');
          result += `\n   📤 Output:\n${indentedStdout}`;
        }
        if (meta.stderr) {
          const indentedStderr = meta.stderr.split('\n').map((line: string) => `   ${line}`).join('\n');
          result += `\n   ⚠️  Error:\n${indentedStderr}`;
        }
        if (meta.interrupted) result += `\n   ⏹️  Interrupted: ${meta.interrupted}`;
      }
      return result;
    } else {
      // Abbreviated display with better formatting
      if (toolResult.content) {
        const content = typeof toolResult.content === "string" ? toolResult.content : JSON.stringify(toolResult.content);
        if (content.length > 80) {
          return `📤 ${content.substring(0, 80)}...`;
        }
        return `📤 ${content}`;
      }
      return "📤 Tool completed";
    }
  }
}