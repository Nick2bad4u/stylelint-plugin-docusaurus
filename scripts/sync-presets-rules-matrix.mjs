/**
 * @deprecated Prefer `sync-configs-rules-matrix.mjs` for Stylelint template
 *   terminology.
 *
 * @packageDocumentation
 * Legacy compatibility alias for the old preset-matrix sync script name.
 */
// @ts-check

import {
    generateRulesSectionFromConfig,
    getConfigDocPath,
    isDirectExecution,
    loadBuiltPluginMetadata,
    normalizeConfigNames,
    parseCliArgs,
    resolveConfigDocTargets,
    runCli as runConfigMatrixCli,
    syncConfigDocs,
} from "./sync-configs-rules-matrix.mjs";

export {
    generateRulesSectionFromConfig,
    getConfigDocPath,
    isDirectExecution,
    loadBuiltPluginMetadata,
    normalizeConfigNames,
    parseCliArgs,
    resolveConfigDocTargets,
    syncConfigDocs,
};

/**
 * CLI entrypoint for the legacy preset-matrix alias.
 *
 * @param {Readonly<{
 *     runConfigMatrixCli?: typeof import("./sync-configs-rules-matrix.mjs").runCli;
 *     warn?: typeof console.warn;
 * }>} [input]
 *
 * @returns {Promise<void>}
 */
export async function runCli({
    runConfigMatrixCli: configMatrixCli = runConfigMatrixCli,
    warn = console.warn,
} = {}) {
    warn(
        "sync-presets-rules-matrix.mjs is deprecated in this Stylelint template. Use sync-configs-rules-matrix.mjs instead."
    );
    await configMatrixCli({ legacyAlias: true });
}

if (
    isDirectExecution({
        argvEntry: process.argv[1],
        currentImportUrl: import.meta.url,
    })
) {
    try {
        await runCli();
    } catch (error) {
        console.error(
            "Failed to synchronize config documentation tables via legacy preset alias:",
            error
        );
        process.exitCode = 1;
    }
}
