export const generateRulesSectionFromConfig: typeof import("./sync-configs-rules-matrix.mjs").generateRulesSectionFromConfig;
export const getConfigDocPath: typeof import("./sync-configs-rules-matrix.mjs").getConfigDocPath;
export const isDirectExecution: typeof import("./sync-configs-rules-matrix.mjs").isDirectExecution;
export const loadBuiltPluginMetadata: typeof import("./sync-configs-rules-matrix.mjs").loadBuiltPluginMetadata;
export const normalizeConfigNames: typeof import("./sync-configs-rules-matrix.mjs").normalizeConfigNames;
export const parseCliArgs: typeof import("./sync-configs-rules-matrix.mjs").parseCliArgs;
export const resolveConfigDocTargets: typeof import("./sync-configs-rules-matrix.mjs").resolveConfigDocTargets;
export const syncConfigDocs: typeof import("./sync-configs-rules-matrix.mjs").syncConfigDocs;

export function runCli(input?: {
    readonly runConfigMatrixCli?: typeof import("./sync-configs-rules-matrix.mjs").runCli;
    readonly warn?: typeof console.warn;
}): Promise<void>;
