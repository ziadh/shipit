#!/usr/bin/env node

import { execSync } from "child_process";
import OpenAI from "openai";
import { Command } from "commander";
import {
  loadConfig,
  setupConfig,
  displayConfig,
  resetConfig,
  getConfig,
} from "./config";

const program = new Command();

program
  .name("shipit")
  .description("Auto-generate and ship git commits with AI")
  .version("1.0.0");

// Config command group
program
  .command("config <action>")
  .description("Manage shipit configuration")
  .action(async (action: string) => {
    switch (action) {
      case "set":
        await setupConfig();
        break;
      case "get":
        displayConfig();
        break;
      case "reset":
        resetConfig();
        break;
      case "path":
        console.log(`Config file: ${require("./config").getConfigPath()}`);
        break;
      default:
        console.error(
          `Unknown config action: ${action}. Use: set, get, reset, or path`
        );
        process.exit(1);
    }
  });

// Main ship command (default when no args or explicit 'ship' command)
program
  .command("ship", { isDefault: true })
  .description("Generate and ship your changes")
  .action(() => {
    ship();
  });

// Allow running without explicit 'ship' command
program.parse(process.argv);

async function ship() {
  try {
    // check if we're in git repo
    execSync("git rev-parse --git-dir", { stdio: "ignore" });

    // stage changes
    console.log("staging changes...");
    execSync("git add .");

    const diff = execSync("git diff --cached").toString();

    if (!diff) {
      console.log("no changes detected");
      return;
    }

    const apiKey = getConfig("apiKey");
    if (!apiKey) {
      console.error("\n✗ API key not configured");
      console.error(
        "Run 'shipit config set' to configure your OpenRouter API key\n"
      );
      process.exit(1);
    }

    const model = getConfig("model") || "x-ai/grok-4.1-fast:free";

    console.log("generating commit message...");

    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
    });

    const response = await client.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: `Generate a concise git commit message for these changes. Return ONLY plain text, no markdown, no code blocks:\n\n${diff}`,
        },
      ],
    });

    let commitMessage =
      response.choices[0]?.message?.content?.trim() || "Auto-generated commit";

    // Remove markdown code blocks if present
    commitMessage = commitMessage
      .replace(/^```[\s\S]*?\n/, "") // Remove opening code block
      .replace(/\n```$/, "") // Remove closing code block
      .trim();

    console.log(`\ncommit message: ${commitMessage}\n`);

    execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);

    console.log("pushing changes...");

    execSync("git push");

    console.log("✓ all shipped!");
  } catch (error: any) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}
