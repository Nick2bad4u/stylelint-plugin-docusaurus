#!/usr/bin/env node

/**
 * Keep `peerDependencies.stylelint` aligned with the currently installed
 * `devDependencies.stylelint` upper range while preserving the oldest supported
 * Stylelint major for this template.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const packageJsonPath = fileURLToPath(
    new URL("../package.json", import.meta.url)
);
const minimumSupportedStylelintRange = "^16.0.0";

/**
 * @returns {Promise<Record<string, unknown>>}
 */
const readPackageJson = async () => {
    try {
        const packageJsonContent = await readFile(packageJsonPath, "utf8");
        return /** @type {Record<string, unknown>} */ (
            JSON.parse(packageJsonContent)
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new TypeError(
            `Failed to read package.json at ${packageJsonPath}: ${message}`,
            { cause: error }
        );
    }
};

/**
 * @param {unknown} existingPeerRange
 *
 * @returns {string}
 */
const resolvePeerFloorRange = (existingPeerRange) => {
    if (typeof existingPeerRange !== "string") {
        return minimumSupportedStylelintRange;
    }

    const [floorCandidate] = existingPeerRange
        .split("||")
        .map((part) => part.trim());

    return floorCandidate || minimumSupportedStylelintRange;
};

/**
 * @param {unknown} value
 *
 * @returns {value is Record<string, unknown>}
 */
const isRecord = (value) => typeof value === "object" && value !== null;

/**
 * Synchronize `peerDependencies.stylelint` to the current supported range.
 *
 * @returns {Promise<void>}
 */
const main = async () => {
    const packageJson = await readPackageJson();
    const devDependencies = packageJson["devDependencies"];
    const peerDependencies = packageJson["peerDependencies"];

    if (!isRecord(devDependencies) || !isRecord(peerDependencies)) {
        throw new TypeError(
            "Expected package.json to include object-valued devDependencies and peerDependencies"
        );
    }

    const devDependencyStylelintRange = devDependencies["stylelint"];

    if (
        typeof devDependencyStylelintRange !== "string" ||
        devDependencyStylelintRange.trim().length === 0
    ) {
        throw new TypeError(
            "Expected devDependencies.stylelint to be a non-empty string range"
        );
    }

    const peerFloorRange = resolvePeerFloorRange(peerDependencies["stylelint"]);
    const nextPeerSegments = [
        ...new Set([peerFloorRange, devDependencyStylelintRange]),
    ];
    const nextPeerStylelintRange = nextPeerSegments.join(" || ");

    if (peerDependencies["stylelint"] === nextPeerStylelintRange) {
        console.log(
            `peerDependencies.stylelint already aligned: ${nextPeerStylelintRange}`
        );
        return;
    }

    peerDependencies["stylelint"] = nextPeerStylelintRange;
    await writeFile(
        packageJsonPath,
        `${JSON.stringify(packageJson, null, 4)}\n`,
        "utf8"
    );
    console.log(
        `Updated peerDependencies.stylelint to: ${nextPeerStylelintRange}`
    );
};

try {
    await main();
} catch (error) {
    console.error("Failed to synchronize peerDependencies.stylelint:", error);
    process.exitCode = 1;
}
