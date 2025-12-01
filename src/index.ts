#!/usr/bin/env node

import { execSync } from "child_process";
import OpenAI from "openai";
import { Command } from "commander";
import ora from "ora";
import { setupConfig, displayConfig, resetConfig, getConfig } from "./config";

const program = new Command();

program
  .name("shipit")
  .description("Auto-generate and ship git commits with AI")
  .version("1.0.1");

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

program
  .command("ship", { isDefault: true })
  .description("Generate and ship your changes")
  .action(() => {
    ship();
  });

program.parse(process.argv);

async function ship() {
  let spinner;

  try {
    // check if we're in git repo
    execSync("git rev-parse --git-dir", { stdio: "ignore" });

    // stage changes
    spinner = ora({ text: "staging changes...", color: "blue" }).start();
    try {
      execSync("git add .");
      spinner.succeed("changes staged");
    } catch (error: any) {
      spinner.fail("failed to stage changes");
      throw error;
    }

    const diff = execSync("git diff --cached").toString();

    if (!diff) {
      ora().warn("no changes detected");
      return;
    }

    const apiKey = getConfig("apiKey");
    if (!apiKey) {
      ora().fail("API key not configured");
      console.error(
        "Run 'shipit config set' to configure your OpenRouter API key\n"
      );
      process.exit(1);
    }

    const model = getConfig("model") || "x-ai/grok-4.1-fast:free";

    spinner = ora({ text: "generating commit message...", color: "blue" }).start();

    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
    });

    try {
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

      // remove markdown code blocks if present
      commitMessage = commitMessage
        .replace(/^```[\s\S]*?\n/, "") // remove opening code block
        .replace(/\n```$/, "") // remove closing code block
        .trim();

      spinner.succeed(`commit message: ${commitMessage}`);

      spinner = ora({ text: "committing changes...", color: "blue" }).start();
      execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
      spinner.succeed("changes committed");
    } catch (error: any) {
      spinner.fail("failed to generate or commit");
      throw error;
    }

    spinner = ora({ text: "pushing changes...", color: "blue" }).start();
    try {
      execSync("git push");
      spinner.succeed("all shipped!");
    } catch (error: any) {
      spinner.fail("failed to push changes");
      throw error;
    }
  } catch (error: any) {
    if (spinner) {
      spinner.fail("operation failed");
    }
    console.error("\nError:", error.message);
    process.exit(1);
  }
}
