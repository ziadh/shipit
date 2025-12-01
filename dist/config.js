"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.getConfig = getConfig;
exports.setConfig = setConfig;
exports.setupConfig = setupConfig;
exports.displayConfig = displayConfig;
exports.resetConfig = resetConfig;
exports.getConfigPath = getConfigPath;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const inquirer_1 = __importDefault(require("inquirer"));
const CONFIG_DIR = path.join(os.homedir(), ".shipit");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
// Ensure config directory exists
function ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
}
// Load config from file
function loadConfig() {
    ensureConfigDir();
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            const data = fs.readFileSync(CONFIG_FILE, "utf-8");
            return JSON.parse(data);
        }
        catch (error) {
            return {};
        }
    }
    return {};
}
// Save config to file
function saveConfig(config) {
    ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}
// Get a specific config value
function getConfig(key) {
    const config = loadConfig();
    return config[key];
}
// Set a specific config value
function setConfig(key, value) {
    const config = loadConfig();
    config[key] = value;
    saveConfig(config);
}
// Interactive configuration setup
async function setupConfig() {
    const config = loadConfig();
    const answers = await inquirer_1.default.prompt([
        {
            type: "password",
            name: "apiKey",
            message: "Enter your OpenRouter API key:",
            default: config.apiKey || "",
            mask: "*",
        },
        {
            type: "input",
            name: "model",
            message: "Enter the model to use:",
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
    console.log("✓ Configuration saved!");
}
// Display current config (hide API key)
function displayConfig() {
    const config = loadConfig();
    if (!config.apiKey && !config.model) {
        console.log("No configuration found. Run `shipit config set` to get started.");
        return;
    }
    console.log("\nCurrent configuration:");
    console.log(`  API Key: ${config.apiKey ? "***" + config.apiKey.slice(-4) : "not set"}`);
    console.log(`  Model: ${config.model || "x-ai/grok-4.1-fast:free (default)"}`);
    console.log();
}
// Reset config
function resetConfig() {
    ensureConfigDir();
    if (fs.existsSync(CONFIG_FILE)) {
        fs.unlinkSync(CONFIG_FILE);
        console.log("✓ Configuration reset!");
    }
    else {
        console.log("No configuration found to reset.");
    }
}
// Get config path for display/debugging
function getConfigPath() {
    return CONFIG_FILE;
}
