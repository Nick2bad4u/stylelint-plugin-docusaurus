/**
 * @deprecated Prefer `sync-configs-rules-matrix.mjs` for Stylelint template
 *   terminology.
 *
 * @packageDocumentation
 * Legacy compatibility alias for the old preset-matrix sync script name.
 */
// @ts-check

import { pathToFileURL } from "node:url";

import { runCli as runConfigMatrixCli } from "./sync-configs-rules-matrix.mjs";

/**
 * CLI entrypoint for the legacy preset-matrix alias.
 *
 * @returns {Promise<void>}
 */
async function main() {
    console.warn(
        "sync-presets-rules-matrix.mjs is deprecated in this Stylelint template. Use sync-configs-rules-matrix.mjs instead."
    );
    await runConfigMatrixCli({ legacyAlias: true });
}

if (
    process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href
) {
    await main();
}
