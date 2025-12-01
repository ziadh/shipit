#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const openai_1 = __importDefault(require("openai"));
const commander_1 = require("commander");
const config_1 = require("./config");
const program = new commander_1.Command();
program
    .name("shipit")
    .description("Auto-generate and ship git commits with AI")
    .version("1.0.0");
// Config command group
program
    .command("config <action>")
    .description("Manage shipit configuration")
    .action(async (action) => {
    switch (action) {
        case "set":
            await (0, config_1.setupConfig)();
            break;
        case "get":
            (0, config_1.displayConfig)();
            break;
        case "reset":
            (0, config_1.resetConfig)();
            break;
        case "path":
            console.log(`Config file: ${require("./config").getConfigPath()}`);
            break;
        default:
            console.error(`Unknown config action: ${action}. Use: set, get, reset, or path`);
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
        (0, child_process_1.execSync)("git rev-parse --git-dir", { stdio: "ignore" });
        // stage changes
        console.log("staging changes...");
        (0, child_process_1.execSync)("git add .");
        const diff = (0, child_process_1.execSync)("git diff --cached").toString();
        if (!diff) {
            console.log("no changes detected");
            return;
        }
        const apiKey = (0, config_1.getConfig)("apiKey");
        if (!apiKey) {
            console.error("\n✗ API key not configured");
            console.error("Run 'shipit config set' to configure your OpenRouter API key\n");
            process.exit(1);
        }
        const model = (0, config_1.getConfig)("model") || "x-ai/grok-4.1-fast:free";
        console.log("generating commit message...");
        const client = new openai_1.default({
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
        const commitMessage = response.choices[0]?.message?.content?.trim() || "Auto-generated commit";
        console.log(`\ncommit message: ${commitMessage}\n`);
        (0, child_process_1.execSync)(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
        console.log("pushing changes...");
        (0, child_process_1.execSync)("git push");
        console.log("✓ all shipped!");
    }
    catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}
