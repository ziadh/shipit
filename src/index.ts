#!/usr/bin/env node

import { execSync } from "child_process";
import OpenAI from "openai";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    // check if we're in git repo
    execSync("git rev-parse --git-dir", { stdio: "ignore" });

    // stage changes
    console.log("staging changes...");
    execSync("git add. ");

    const diff = execSync("git diff --cached").toString();

    if (!diff) {
      console.log("no changes detected");
      return;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("mising api key");
      process.exit(1);
    }

    const model = process.env.OPENROUTER_MODEL || "x-ai/grok-4.1-fast:free";

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
          content: `Generate a concise git commit message for these changes:\n\n${diff}`,
        },
      ],
    });

    const commitMessage =
      response.choices[0]?.message?.content?.trim() || "Auto-generated commit";

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

main();
