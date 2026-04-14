/**
 * @deprecated Prefer `sync-configs-rules-matrix.mjs` for Stylelint template
 *   terminology.
 *
 * @packageDocumentation
 * Legacy compatibility alias for the old preset-matrix sync script name.
 */
// @ts-check

import {
    generateRulesSectionFromConfig as generateRulesSectionFromConfigCompat,
    getConfigDocPath as getConfigDocPathCompat,
    isDirectExecution as isDirectExecutionCompat,
    loadBuiltPluginMetadata as loadBuiltPluginMetadataCompat,
    normalizeConfigNames as normalizeConfigNamesCompat,
    parseCliArgs as parseCliArgsCompat,
    resolveConfigDocTargets as resolveConfigDocTargetsCompat,
    runCli as runConfigMatrixCli,
    syncConfigDocs as syncConfigDocsCompat,
} from "./sync-configs-rules-matrix.mjs";

/** @type {typeof generateRulesSectionFromConfigCompat} */
export const generateRulesSectionFromConfig = (...input) =>
    generateRulesSectionFromConfigCompat(...input);
/** @type {typeof getConfigDocPathCompat} */
export const getConfigDocPath = (...input) => getConfigDocPathCompat(...input);
/** @type {typeof isDirectExecutionCompat} */
export const isDirectExecution = (...input) =>
    isDirectExecutionCompat(...input);
/** @type {typeof loadBuiltPluginMetadataCompat} */
export const loadBuiltPluginMetadata = (...input) =>
    loadBuiltPluginMetadataCompat(...input);
/** @type {typeof normalizeConfigNamesCompat} */
export const normalizeConfigNames = (...input) =>
    normalizeConfigNamesCompat(...input);
/** @type {typeof parseCliArgsCompat} */
export const parseCliArgs = (...input) => parseCliArgsCompat(...input);
/** @type {typeof resolveConfigDocTargetsCompat} */
export const resolveConfigDocTargets = (...input) =>
    resolveConfigDocTargetsCompat(...input);
/** @type {typeof syncConfigDocsCompat} */
export const syncConfigDocs = (...input) => syncConfigDocsCompat(...input);

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
