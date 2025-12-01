import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import inquirer from "inquirer";

export interface ShipitConfig {
  apiKey?: string;
  model?: string;
}

const CONFIG_DIR = path.join(os.homedir(), ".shipit");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

// Ensure config directory exists
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

// Load config from file
export function loadConfig(): ShipitConfig {
  ensureConfigDir();
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }
  return {};
}

// Save config to file
export function saveConfig(config: ShipitConfig) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Get a specific config value
export function getConfig(key: keyof ShipitConfig): string | undefined {
  const config = loadConfig();
  return config[key];
}

// Set a specific config value
export function setConfig(key: keyof ShipitConfig, value: string) {
  const config = loadConfig();
  config[key] = value;
  saveConfig(config);
}

// Interactive configuration setup
export async function setupConfig() {
  const config = loadConfig();

  const answers = await inquirer.prompt([
    {
      type: "password",
      name: "apiKey",
      message: "enter your OpenRouter API key:",
      default: config.apiKey || "",
      mask: "*",
    },
    {
      type: "input",
      name: "model",
      message: "enter the model to use:",
      default: config.model || "x-ai/grok-4.1-fast:free",
    },
  ]);

  if (answers.apiKey) {
    config.apiKey = answers.apiKey;
  }
  if (answers.model) {
    config.model = answers.model;
  }

  saveConfig(config);
  console.log("✓ configuration saved!");
}

// Display current config (hide API key)
export function displayConfig() {
  const config = loadConfig();

  if (!config.apiKey && !config.model) {
    console.log(
      "no configuration found. Run `shipit config set` to get started."
    );
    return;
  }

  console.log("\ncurrent configuration:");
  console.log(
    `  API Key: ${config.apiKey ? "***" + config.apiKey.slice(-4) : "not set"}`
  );
  console.log(
    `  model: ${config.model || "x-ai/grok-4.1-fast:free (default)"}`
  );
  console.log();
}

// Reset config
export function resetConfig() {
  ensureConfigDir();
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE);
    console.log("✓ configuration reset!");
  } else {
    console.log("no configuration found to reset.");
  }
}

// Get config path for display/debugging
export function getConfigPath(): string {
  return CONFIG_FILE;
}
