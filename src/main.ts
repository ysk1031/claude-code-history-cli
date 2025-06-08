#!/usr/bin/env -S deno run --allow-read --allow-env

import { format } from "@std/datetime";
import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.4/command/mod.ts";
import { Table } from "https://deno.land/x/cliffy@v1.0.0-rc.4/table/mod.ts";
import { bold, blue, green, yellow, red, cyan, dim, italic } from "https://deno.land/std@0.220.0/fmt/colors.ts";
import { ClaudeHistoryParser } from "./parser.ts";

const parser = new ClaudeHistoryParser();

const main = new Command()
  .name("claude-code-history")
  .version("0.1.0")
  .description("CLI tool for viewing Claude Code conversation history")
  .allowEmpty(false)
  .action(() => {
    main.showHelp();
  });

// List all projects
main.command("projects", "List all projects with Claude Code history")
  .action(async () => {
    const projects = await parser.getProjects();
    
    if (projects.length === 0) {
      console.log("No projects found.");
      return;
    }

    const table = new Table()
      .header(["Project"])
      .body(projects.map(p => [p]));
    
    console.log(table.toString());
  });

// List sessions for a project
const sessionsCmd = main.command("sessions", "List all sessions for a project")
  .arguments("<project:string>")
  .useRawArgs()
  .action(async (_, ...args) => {
    // Check for help flag
    if (args.includes("--help") || args.includes("-h")) {
      console.log(`Usage:   claude-code-history sessions <project>
Version: 0.1.0

Description:

  List all sessions for a project

Options:

  -h, --help  Show this help.`);
      return;
    }
    
    const project = args[0];
    const sessions = await parser.getSessions(project);
    
    if (sessions.length === 0) {
      console.log(`No sessions found for project: ${project}`);
      return;
    }

    const sessionDetails = [];
    for (const sessionId of sessions) {
      const session = await parser.parseSession(project, sessionId);
      if (session) {
        sessionDetails.push({
          id: sessionId,
          startTime: session.startTime,
          messageCount: session.messages.length,
        });
      }
    }

    const table = new Table()
      .header(["Session ID", "Start Time", "Messages"])
      .body(
        sessionDetails.map(s => [
          s.id,
          format(s.startTime, "yyyy-MM-dd HH:mm:ss"),
          s.messageCount.toString(),
        ])
      );
    
    console.log(table.toString());
  });

// Show a specific session
const showCmd = main.command("show", "Show conversation history for a session")
  .arguments("<project:string> <session:string>")
  .useRawArgs()
  .option("-f, --full", "Show full content instead of 3-line preview")
  .option("-l, --limit <limit:number>", "Limit number of messages to show")
  .option("-r, --recent <recent:number>", "Show recent N messages (newest first)")
  .action(async (options, ...args) => {
    // Check for help flag
    if (args.includes("--help") || args.includes("-h")) {
      console.log(`Usage:   claude-code-history show <project> <session>
Version: 0.1.0

Description:

  Show conversation history for a session

Options:

  -h, --help            Show this help.
  -f, --full            Show full content instead of 3-line preview
  -l, --limit <limit>   Limit number of messages to show
  -r, --recent <recent> Show recent N messages`);
      Deno.exit(0);
    }
    
    // Manual parsing since we use useRawArgs
    const fullFlag = args.includes("--full") || args.includes("-f");
    const limitIndex = args.findIndex(arg => arg === "--limit" || arg === "-l");
    const limitValue = limitIndex !== -1 && limitIndex + 1 < args.length ? parseInt(args[limitIndex + 1]) : undefined;
    const recentIndex = args.findIndex(arg => arg === "--recent" || arg === "-r");
    const recentValue = recentIndex !== -1 && recentIndex + 1 < args.length ? parseInt(args[recentIndex + 1]) : undefined;
    
    // Get project and session arguments (excluding flags)
    // First two arguments are always project and session, even if they start with -
    const project = args[0];
    const session = args[1];
    const sessionData = await parser.parseSession(project, session);
    
    if (!sessionData) {
      console.log(`Session not found: ${session}`);
      return;
    }

    // Header with better formatting
    console.log("\n" + "═".repeat(80));
    console.log(bold(blue("📂 Project: ")) + cyan(project));
    console.log(bold(blue("🔖 Session: ")) + cyan(session));
    console.log(bold(blue("🕐 Time:    ")) + format(sessionData.startTime, "yyyy-MM-dd HH:mm:ss") + dim(" → ") + format(sessionData.endTime, "HH:mm:ss"));
    console.log(bold(blue("💬 Messages:")) + ` ${sessionData.messages.length}`);
    console.log("═".repeat(80) + "\n");

    let messages = sessionData.messages;
    
    // Apply limit or recent filter
    if (recentValue) {
      // Show recent N messages (in chronological order)
      messages = messages.slice(-recentValue);
    } else if (limitValue) {
      // Show first N messages (oldest first)
      messages = messages.slice(0, limitValue);
    }

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.isMeta) continue;

      const time = format(new Date(msg.timestamp), "HH:mm:ss");
      let roleIcon: string;
      let roleLabel: string;
      let roleColor: (str: string) => string;
      
      // Distinguish between actual user input and system-generated tool results
      if (msg.type === "assistant") {
        roleIcon = "🤖";
        roleLabel = "Claude";
        roleColor = green;
      } else if (msg.toolUseResult) {
        // This is a system-generated tool result, not actual user input
        roleIcon = "📤";
        roleLabel = "System";
        roleColor = yellow;
      } else {
        // This is actual user input
        roleIcon = "👤";
        roleLabel = "User";
        roleColor = blue;
      }
      
      const content = parser.extractMessageContent(msg, fullFlag);
      
      // Add visual separator between messages (except for the first one)
      if (i > 0) {
        console.log(dim("─".repeat(80)));
      }
      
      // Message header with better formatting
      console.log("");
      console.log(
        dim("[") + cyan(time) + dim("]") + " " +
        roleIcon + " " + 
        bold(roleColor(roleLabel))
      );
      console.log("");
      
      if (fullFlag) {
        // Format content with proper indentation and styling
        const formattedContent = content.split("\n").map(line => {
          // Special formatting for tool usage lines
          if (line.startsWith("🔧") || line.startsWith("📖") || line.startsWith("✏️") || 
              line.startsWith("📝") || line.startsWith("💾") || line.startsWith("📋") ||
              line.startsWith("🔍") || line.startsWith("🔎") || line.startsWith("📁") ||
              line.startsWith("📤")) {
            return "  " + yellow(line);
          } else if (line.startsWith("   ")) {
            // Indented content (tool details)
            return "  " + dim(line);
          } else {
            return "  " + line;
          }
        }).join("\n");
        console.log(formattedContent);
      } else {
        const lines = content.split("\n");
        const previewLines = lines.slice(0, 3);
        const formattedPreview = previewLines.map(line => {
          // Special formatting for tool usage lines in preview
          if (line.startsWith("🔧") || line.startsWith("📖") || line.startsWith("✏️") || 
              line.startsWith("📝") || line.startsWith("💾") || line.startsWith("📋") ||
              line.startsWith("🔍") || line.startsWith("🔎") || line.startsWith("📁") ||
              line.startsWith("📤")) {
            return "  " + yellow(line);
          } else {
            return "  " + line;
          }
        }).join("\n");
        
        console.log(formattedPreview);
        if (lines.length > 3) {
          console.log("  " + dim(italic("... (use -f/--full to see complete message)")));
        }
      }
      
      console.log("");
    }

    // Footer
    console.log("═".repeat(80));
    
    if (recentValue && recentValue < sessionData.messages.length) {
      console.log(dim(`\nShowing recent ${recentValue} of ${sessionData.messages.length} messages`));
    } else if (limitValue && limitValue < sessionData.messages.length) {
      console.log(dim(`\nShowing first ${limitValue} of ${sessionData.messages.length} messages`));
    }
  });

// Search across all sessions
const searchCmd = main.command("search", "Search for keyword in all conversations")
  .arguments("<keyword:string>")
  .useRawArgs()
  .option("-p, --project <project:string>", "Search within specific project")
  .action(async (options, ...args) => {
    // Check for help flag
    if (args.includes("--help") || args.includes("-h")) {
      console.log(`Usage:   claude-code-history search <keyword>
Version: 0.1.0

Description:

  Search for keyword in all conversations

Options:

  -h, --help                Show this help.
  -p, --project <project>   Search within specific project`);
      return;
    }
    
    const { project } = options;
    const keyword = args[0];
    const projects = project ? [project] : await parser.getProjects();
    let totalResults = 0;

    for (const proj of projects) {
      const sessions = await parser.getSessions(proj);
      
      for (const sessionId of sessions) {
        const session = await parser.parseSession(proj, sessionId);
        if (!session) continue;

        const matches = session.messages.filter(msg => {
          if (msg.isMeta) return false;
          const content = parser.extractMessageContent(msg, false);
          return content.toLowerCase().includes(keyword.toLowerCase());
        });

        if (matches.length > 0) {
          console.log(`\n📁 ${proj} / ${sessionId.substring(0, 8)}...`);
          console.log(`Found ${matches.length} matches:`);
          
          for (const match of matches.slice(0, 3)) {
            const time = format(new Date(match.timestamp), "yyyy-MM-dd HH:mm:ss");
            let role: string;
            if (match.type === "assistant") {
              role = "🤖";
            } else if (match.toolUseResult) {
              role = "📤";
            } else {
              role = "👤";
            }
            const content = parser.extractMessageContent(match, false);
            const preview = content.substring(0, 100).replace(/\n/g, " ");
            
            console.log(`  [${time}] ${role} ${preview}...`);
          }
          
          if (matches.length > 3) {
            console.log(`  ... and ${matches.length - 3} more matches`);
          }
          
          totalResults += matches.length;
        }
      }
    }

    console.log(`\nTotal results: ${totalResults}`);
  });

// Help command
main.command("help", "Show help for a command")
  .arguments("[command:string]")
  .action((_, command) => {
    if (command === "show") {
      console.log(`Usage:   claude-code-history show <project> <session>
Version: 0.1.0

Description:

  Show conversation history for a session

Options:

  -h, --help            Show this help.
  -f, --full            Show full content instead of 3-line preview
  -l, --limit <limit>   Limit number of messages to show
  -r, --recent <recent> Show recent N messages`);
    } else if (command === "sessions") {
      console.log(`Usage:   claude-code-history sessions <project>
Version: 0.1.0

Description:

  List all sessions for a project

Options:

  -h, --help  Show this help.`);
    } else if (command === "search") {
      console.log(`Usage:   claude-code-history search <keyword>
Version: 0.1.0

Description:

  Search for keyword in all conversations

Options:

  -h, --help                Show this help.
  -p, --project <project>   Search within specific project`);
    } else if (command === "projects") {
      console.log("Usage:   claude-code-history projects\n\nDescription:\n\n  List all projects with Claude Code history");
    } else {
      main.showHelp();
    }
  });

if (import.meta.main) {
  await main.parse(Deno.args);
}
