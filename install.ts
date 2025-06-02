#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run

import { ensureDir } from "@std/fs";
import { join } from "@std/path";
import { brightGreen, brightRed, brightYellow, gray } from "https://deno.land/std@0.218.0/fmt/colors.ts";

async function main() {
  console.log(brightGreen("🚀 Installing Claude Code History CLI..."));
  
  const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
  if (!homeDir) {
    console.error(brightRed("❌ Could not determine home directory"));
    Deno.exit(1);
  }

  // Determine the installation directory
  const installDir = join(homeDir, ".local", "bin");
  const binaryName = Deno.build.os === "windows" ? "cch.exe" : "cch";
  const binaryPath = join(installDir, binaryName);

  console.log(gray(`📁 Installation directory: ${installDir}`));

  try {
    // Ensure the installation directory exists
    await ensureDir(installDir);

    // Compile the binary
    console.log(brightYellow("🔨 Compiling binary..."));
    const compileCommand = new Deno.Command("deno", {
      args: [
        "compile",
        "--allow-read",
        "--allow-env",
        "--output",
        binaryPath,
        "src/main.ts"
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await compileCommand.output();

    if (code !== 0) {
      console.error(brightRed("❌ Compilation failed:"));
      console.error(new TextDecoder().decode(stderr));
      Deno.exit(1);
    }

    console.log(brightGreen("✅ Binary compiled successfully!"));

    // Make the binary executable (Unix-like systems)
    if (Deno.build.os !== "windows") {
      await Deno.chmod(binaryPath, 0o755);
    }

    // Check if the install directory is in PATH
    const path = Deno.env.get("PATH") || "";
    const pathDirs = path.split(Deno.build.os === "windows" ? ";" : ":");
    
    if (!pathDirs.includes(installDir)) {
      console.log(brightYellow("\n⚠️  The installation directory is not in your PATH."));
      console.log("Add the following to your shell configuration file:");
      
      const shellConfig = Deno.env.get("SHELL") || "";
      if (shellConfig.includes("zsh")) {
        console.log(gray(`\n# Add to ~/.zshrc:`));
        console.log(`export PATH="${installDir}:$PATH"`);
      } else if (shellConfig.includes("bash")) {
        console.log(gray(`\n# Add to ~/.bashrc or ~/.bash_profile:`));
        console.log(`export PATH="${installDir}:$PATH"`);
      } else if (shellConfig.includes("fish")) {
        console.log(gray(`\n# Add to ~/.config/fish/config.fish:`));
        console.log(`set -x PATH ${installDir} $PATH`);
      } else {
        console.log(gray(`\n# Add to your shell configuration:`));
        console.log(`export PATH="${installDir}:$PATH"`);
      }
      
      console.log(gray("\nThen reload your shell configuration:"));
      console.log(`source ~/.*rc  # or restart your terminal`);
    }

    console.log(brightGreen(`\n✨ Installation complete!`));
    console.log(gray(`Binary installed at: ${binaryPath}`));
    console.log(gray(`\nYou can now use the 'cch' command:`));
    console.log("  cch projects");
    console.log("  cch sessions -Users-yusukeaono-src-sandbox-claude-code");
    console.log("  cch show -Users-yusukeaono-src-sandbox-claude-code <session-id>");
    console.log("  cch search <keyword>");

  } catch (error) {
    console.error(brightRed(`❌ Installation failed: ${error.message}`));
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}