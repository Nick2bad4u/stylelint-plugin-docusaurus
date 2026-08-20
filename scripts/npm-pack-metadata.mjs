// @ts-check

import { readFile } from "node:fs/promises";
import process from "node:process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Determine whether an unknown value is a non-null object record.
 *
 * @param {unknown} value - Candidate value.
 *
 * @returns {value is Record<string, unknown>} Whether the value is a record.
 */
export const isRecord = (value) => typeof value === "object" && value !== null;

/**
 * Normalize npm 11's array-shaped and npm 12's package-keyed object-shaped `npm
 * pack --json` output to one safe tarball filename.
 *
 * @param {unknown} metadata - Parsed `npm pack --json` output.
 *
 * @returns {string} The tarball filename.
 */
export function resolvePackedTarballFilename(metadata) {
    const packageEntries = Array.isArray(metadata)
        ? metadata
        : isRecord(metadata)
          ? Object.values(metadata)
          : [];

    if (packageEntries.length !== 1 || !isRecord(packageEntries[0])) {
        throw new TypeError(
            "Expected npm pack metadata for exactly one package."
        );
    }

    const { filename } = packageEntries[0];

    if (
        typeof filename !== "string" ||
        filename.length === 0 ||
        !filename.endsWith(".tgz") ||
        /[\\/:\0\r\n]/u.test(filename) ||
        filename === ".tgz"
    ) {
        throw new TypeError(
            "Expected npm pack metadata to contain a safe .tgz filename."
        );
    }

    return filename;
}

/**
 * Read and normalize an `npm pack --json` metadata file.
 *
 * @param {string} metadataPath - Path to the JSON metadata file.
 *
 * @returns {Promise<string>} The tarball filename.
 */
export async function readPackedTarballFilename(metadataPath) {
    const metadata = JSON.parse(await readFile(metadataPath, "utf8"));

    return resolvePackedTarballFilename(metadata);
}

/**
 * Determine whether this module is being executed directly.
 *
 * @param {object} [input] - Direct-execution input.
 * @param {string | undefined} [input.argvEntry] - CLI entry path.
 * @param {string} [input.currentImportUrl] - Current module URL.
 *
 * @returns {boolean} Whether the module is the CLI entrypoint.
 */
export function isDirectExecution({
    argvEntry = process.argv[1],
    currentImportUrl = import.meta.url,
} = {}) {
    return (
        typeof argvEntry === "string" &&
        argvEntry.length > 0 &&
        pathToFileURL(resolve(argvEntry)).href === currentImportUrl
    );
}

if (isDirectExecution()) {
    const metadataPath = process.argv[2];

    if (typeof metadataPath !== "string" || metadataPath.length === 0) {
        throw new TypeError("Usage: node scripts/npm-pack-metadata.mjs <path>");
    }

    process.stdout.write(await readPackedTarballFilename(metadataPath));
}
