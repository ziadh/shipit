export interface ShipitConfig {
    apiKey?: string;
    model?: string;
}
export declare function loadConfig(): ShipitConfig;
export declare function saveConfig(config: ShipitConfig): void;
export declare function getConfig(key: keyof ShipitConfig): string | undefined;
export declare function setConfig(key: keyof ShipitConfig, value: string): void;
export declare function setupConfig(): Promise<void>;
export declare function displayConfig(): void;
export declare function resetConfig(): void;
export declare function getConfigPath(): string;
