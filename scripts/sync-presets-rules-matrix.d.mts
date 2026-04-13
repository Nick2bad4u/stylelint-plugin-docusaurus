export {
    generateRulesSectionFromConfig,
    getConfigDocPath,
    isDirectExecution,
    loadBuiltPluginMetadata,
    normalizeConfigNames,
    parseCliArgs,
    resolveConfigDocTargets,
    syncConfigDocs,
} from "./sync-configs-rules-matrix.mjs";

export function runCli(input?: {
    readonly runConfigMatrixCli?: typeof import("./sync-configs-rules-matrix.mjs").runCli;
    readonly warn?: typeof console.warn;
}): Promise<void>;
