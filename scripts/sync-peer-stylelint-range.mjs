#!/usr/bin/env node

/**
 * Keep `peerDependencies.stylelint` aligned with the currently installed
 * `devDependencies.stylelint` upper range while preserving the oldest supported
 * Stylelint major for this template.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageJsonPath = fileURLToPath(
    new URL("../package.json", import.meta.url)
);
export const minimumSupportedStylelintRange = "^16.0.0";

/**
 * Determine whether the current module is being executed directly.
 *
 * @param {object} [input] - Direct-execution detection input.
 * @param {string | undefined} [input.argvEntry=process.argv[1]] - Entry path.
 *   Default is `process.argv[1]`
 * @param {string} [input.currentImportUrl=import.meta.url] - Current module
 *   URL. Default is `import.meta.url`
 *
 * @returns {boolean} Whether this module is the CLI entrypoint.
 */
export function isDirectExecution({
    argvEntry = process.argv[1],
    currentImportUrl = import.meta.url,
} = {}) {
    if (typeof argvEntry !== "string" || argvEntry.length === 0) {
        return false;
    }

    return pathToFileURL(resolve(argvEntry)).href === currentImportUrl;
}

/**
 * @returns {Promise<Record<string, unknown>>}
 */
export const readPackageJson = async (filePath = packageJsonPath) => {
    try {
        const packageJsonContent = await readFile(filePath, "utf8");
        return /** @type {Record<string, unknown>} */ (
            JSON.parse(packageJsonContent)
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new TypeError(
            `Failed to read package.json at ${filePath}: ${message}`,
            { cause: error }
        );
    }
};

/**
 * @param {unknown} value
 *
 * @returns {value is Record<string, unknown>}
 */
export const isRecord = (value) => typeof value === "object" && value !== null;

/**
 * Normalize a Stylelint range string.
 *
 * @param {unknown} range
 *
 * @returns {string}
 */
export const normalizeStylelintRange = (range) => {
    if (typeof range !== "string" || range.trim().length === 0) {
        throw new TypeError(
            "Expected a non-empty Stylelint version range string."
        );
    }

    return range.trim();
};

/**
 * Split a Stylelint semver range into normalized `||` clauses.
 *
 * @param {string} range
 *
 * @returns {readonly string[]}
 */
const getStylelintRangeClauses = (range) =>
    normalizeStylelintRange(range)
        .split("||")
        .map((clause) => clause.trim())
        .filter((clause) => clause.length > 0);

/**
 * Build the next `peerDependencies.stylelint` range.
 *
 * The template's minimum supported Stylelint range is always the floor source
 * of truth. Existing peer ranges must not be allowed to drop or replace it.
 *
 * @param {object} input
 * @param {unknown} input.devDependencyStylelintRange
 * @param {string} [input.minimumRange=minimumSupportedStylelintRange] Default
 *   is `minimumSupportedStylelintRange`
 *
 * @returns {string}
 */
export const createPeerStylelintRange = ({
    devDependencyStylelintRange,
    minimumRange = minimumSupportedStylelintRange,
}) => {
    const normalizedMinimumRange = normalizeStylelintRange(minimumRange);
    const normalizedDevDependencyRange = normalizeStylelintRange(
        devDependencyStylelintRange
    );

    return [
        ...new Set([
            normalizedMinimumRange,
            ...getStylelintRangeClauses(normalizedDevDependencyRange),
        ]),
    ].join(" || ");
};

/**
 * Synchronize `peerDependencies.stylelint` to the current supported range.
 *
 * @param {object} [input]
 * @param {string} [input.filePath=packageJsonPath] Default is `packageJsonPath`
 * @param {{ log: (...args: readonly unknown[]) => void }} [input.logger=console]
 *   Default is `console`
 *
 * @returns {Promise<"updated" | "unchanged">}
 */
export const synchronizePeerStylelintRange = async ({
    filePath = packageJsonPath,
    logger = console,
} = {}) => {
    const packageJson = await readPackageJson(filePath);
    const devDependencies = packageJson["devDependencies"];
    const peerDependencies = packageJson["peerDependencies"];

    if (!isRecord(devDependencies) || !isRecord(peerDependencies)) {
        throw new TypeError(
            "Expected package.json to include object-valued devDependencies and peerDependencies"
        );
    }

    const nextPeerStylelintRange = createPeerStylelintRange({
        devDependencyStylelintRange: devDependencies["stylelint"],
    });

    if (peerDependencies["stylelint"] === nextPeerStylelintRange) {
        logger.log(
            `peerDependencies.stylelint already aligned: ${nextPeerStylelintRange}`
        );
        return "unchanged";
    }

    peerDependencies["stylelint"] = nextPeerStylelintRange;
    await writeFile(
        filePath,
        `${JSON.stringify(packageJson, null, 4)}\n`,
        "utf8"
    );
    logger.log(
        `Updated peerDependencies.stylelint to: ${nextPeerStylelintRange}`
    );
    return "updated";
};

/**
 * CLI entrypoint.
 *
 * @param {object} [input]
 * @param {string} [input.filePath=packageJsonPath] Default is `packageJsonPath`
 * @param {{
 *     error: (...args: readonly unknown[]) => void;
 *     log: (...args: readonly unknown[]) => void;
 * }} [input.logger=console]
 *   Default is `console`
 *
 * @returns {Promise<number>}
 */
export const runCli = async ({
    filePath = packageJsonPath,
    logger = console,
} = {}) => {
    try {
        await synchronizePeerStylelintRange({
            filePath,
            logger,
        });
        return 0;
    } catch (error) {
        logger.error(
            "Failed to synchronize peerDependencies.stylelint:",
            error
        );
        return 1;
    }
};

if (isDirectExecution()) {
    const exitCode = await runCli({ filePath: packageJsonPath });

    if (exitCode !== 0) {
        process.exitCode = exitCode;
    }
}
