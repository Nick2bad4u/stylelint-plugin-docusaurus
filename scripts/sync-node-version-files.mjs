/**
 * Synchronize repository Node version files.
 *
 * Source of truth:
 *
 * - Current runtime version by default (`process.versions.node`)
 * - Optional `--version x.y.z` override for automation
 *
 * Files managed:
 *
 * - `.node-version`
 * - `.nvmrc`
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageJsonPath = fileURLToPath(
    new URL("../package.json", import.meta.url)
);
const nodeVersionFilePath = fileURLToPath(
    new URL("../.node-version", import.meta.url)
);
const nvmrcFilePath = fileURLToPath(new URL("../.nvmrc", import.meta.url));

/**
 * @typedef {"updated" | "validated" | "validated-current"} NodeVersionSyncResult
 */

/**
 * Normalize a Node.js version string to exact `x.y.z` form.
 *
 * @param {unknown} version
 *
 * @returns {string}
 */
export const normalizeNodeVersion = (version) => {
    if (typeof version !== "string") {
        throw new TypeError("Expected a string Node.js version.");
    }

    const trimmedVersion = version.trim().replace(/^v/iu, "");

    if (!/^\d+\.\d+\.\d+$/u.test(trimmedVersion)) {
        throw new TypeError(
            `Expected an exact Node.js version in x.y.z form, received: ${version}`
        );
    }

    return trimmedVersion;
};

/**
 * Check whether an unknown value is a non-null object record.
 *
 * @param {unknown} value
 *
 * @returns {value is Record<string, unknown>}
 */
export const isRecord = (value) => typeof value === "object" && value !== null;

/**
 * Determine whether the current module is being executed directly.
 *
 * @param {object} [input]
 * @param {string | undefined} [input.argvEntry] - Default is
 *   `process.argv[1]`
 * @param {string} [input.currentImportUrl] - Default is
 *   `import.meta.url`
 *
 * @returns {boolean}
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
 * Parse command-line arguments.
 *
 * Supported options:
 *
 * - `--check`: validate file existence and synchronization only
 * - `--check-current`: validate files match current runtime version exactly
 * - `--version x.y.z` or `--version=x.y.z`: explicit version override
 *
 * @param {readonly string[]} argumentList
 *
 * @returns {{
 *     checkOnly: boolean;
 *     checkCurrent: boolean;
 *     explicitVersion: string | null;
 * }}
 */
export const parseArguments = (argumentList) => {
    /** @type {boolean} */
    let checkOnly = false;
    /** @type {boolean} */
    let checkCurrent = false;
    /** @type {string | null} */
    let explicitVersion = null;

    for (let index = 0; index < argumentList.length; index += 1) {
        const argument = argumentList[index];

        if (typeof argument !== "string") {
            throw new TypeError(
                `Expected a string command-line argument at index ${index}.`
            );
        }

        if (argument === "--check") {
            checkOnly = true;
            continue;
        }

        if (argument === "--check-current") {
            checkCurrent = true;
            continue;
        }

        if (argument === "--version") {
            const nextArgument = argumentList[index + 1];

            if (typeof nextArgument !== "string") {
                throw new TypeError("Expected a version after --version.");
            }

            explicitVersion = normalizeNodeVersion(nextArgument);
            index += 1;
            continue;
        }

        if (argument.startsWith("--version=")) {
            explicitVersion = normalizeNodeVersion(
                argument.slice("--version=".length)
            );
            continue;
        }

        throw new TypeError(`Unknown argument: ${argument}`);
    }

    if (checkOnly && checkCurrent) {
        throw new TypeError(
            "Use either --check or --check-current, but not both together."
        );
    }

    return {
        checkCurrent,
        checkOnly,
        explicitVersion,
    };
};

/**
 * Read and parse package.json.
 *
 * @param {string} [filePath] - Default is `packageJsonPath`
 *
 * @returns {Promise<Record<string, unknown>>}
 */
export const readPackageJson = async (filePath = packageJsonPath) => {
    try {
        const packageJsonContent = await readFile(filePath, "utf8");
        const parsedPackageJson = JSON.parse(packageJsonContent);

        if (!isRecord(parsedPackageJson)) {
            throw new TypeError(
                "Expected package.json to contain a JSON object."
            );
        }

        return parsedPackageJson;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new TypeError(
            `Failed to read package.json at ${filePath}: ${message}`,
            {
                cause: error,
            }
        );
    }
};

/**
 * Extract the minimum supported Node.js version when `engines.node` uses a
 * leading `>=` comparator, optionally followed by upper-bound comparators.
 *
 * @param {unknown} enginesValue
 *
 * @returns {string | null}
 */
export const resolveMinimumEngineVersion = (enginesValue) => {
    if (!isRecord(enginesValue) || typeof enginesValue["node"] !== "string") {
        return null;
    }

    const nodeEngineRange = enginesValue["node"].trim();
    if (nodeEngineRange.includes("||")) {
        return null;
    }

    const match = /^>=\s*(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\s+.*)?$/u.exec(
        nodeEngineRange
    );

    if (match === null) {
        return null;
    }

    const [
        ,
        majorVersion,
        minorVersion = "0",
        patchVersion = "0",
    ] = match;

    return `${majorVersion}.${minorVersion}.${patchVersion}`;
};

/**
 * Compare two exact semver versions.
 *
 * @param {string} leftVersion
 * @param {string} rightVersion
 *
 * @returns {number}
 */
export const compareExactVersions = (leftVersion, rightVersion) => {
    const leftSegments = leftVersion.split(".").map(Number);
    const rightSegments = rightVersion.split(".").map(Number);

    for (
        let index = 0;
        index < Math.max(leftSegments.length, rightSegments.length);
        index += 1
    ) {
        const leftSegment = leftSegments[index] ?? 0;
        const rightSegment = rightSegments[index] ?? 0;

        if (leftSegment !== rightSegment) {
            return leftSegment - rightSegment;
        }
    }

    return 0;
};

/**
 * Ensure the preferred version does not fall below the minimum supported
 * engine.
 *
 * @param {string} preferredVersion
 * @param {string | null} minimumEngineVersion
 *
 * @returns {void}
 */
export const assertPreferredVersionSupported = (
    preferredVersion,
    minimumEngineVersion
) => {
    if (minimumEngineVersion === null) {
        return;
    }

    if (compareExactVersions(preferredVersion, minimumEngineVersion) < 0) {
        throw new RangeError(
            [
                "Preferred Node.js version is below package.json engines.node.",
                `Preferred: ${preferredVersion}.`,
                `Minimum engine: ${minimumEngineVersion}.`,
            ].join(" ")
        );
    }
};

/**
 * Read a managed version file if it exists.
 *
 * @param {string} filePath
 *
 * @returns {Promise<string | null>}
 */
export const readOptionalVersionFile = async (filePath) => {
    try {
        return await readFile(filePath, "utf8");
    } catch (error) {
        if (
            error instanceof Error &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            return null;
        }

        throw error;
    }
};

/**
 * Write the managed version files.
 *
 * @param {object} input
 * @param {string} input.preferredVersion
 * @param {string} [input.nodeVersionFilePath] - Default is
 *   `nodeVersionFilePath`
 * @param {string} [input.nvmrcFilePath] - Default is
 *   `nvmrcFilePath`
 *
 * @returns {Promise<string>}
 */
export const writeVersionFiles = async ({
    preferredVersion,
    nodeVersionFilePath: targetNodeVersionFilePath = nodeVersionFilePath,
    nvmrcFilePath: targetNvmrcFilePath = nvmrcFilePath,
}) => {
    const normalizedPreferredVersion = normalizeNodeVersion(preferredVersion);
    const fileContent = `${normalizedPreferredVersion}\n`;

    await Promise.all([
        writeFile(targetNodeVersionFilePath, fileContent, "utf8"),
        writeFile(targetNvmrcFilePath, fileContent, "utf8"),
    ]);

    return normalizedPreferredVersion;
};

/**
 * Validate the managed version files.
 *
 * @param {object} input
 * @param {string | null} input.expectedVersion
 * @param {string | null} [input.minimumEngineVersion] - Default is `null`
 * @param {{ log: (...args: readonly unknown[]) => void }} [input.logger]
 *   Default is `console`
 * @param {string} [input.nodeVersionFilePath] - Default is
 *   `nodeVersionFilePath`
 * @param {string} [input.nvmrcFilePath] - Default is
 *   `nvmrcFilePath`
 *
 * @returns {Promise<string>}
 */
export const validateVersionFiles = async ({
    expectedVersion,
    minimumEngineVersion = null,
    logger = console,
    nodeVersionFilePath: targetNodeVersionFilePath = nodeVersionFilePath,
    nvmrcFilePath: targetNvmrcFilePath = nvmrcFilePath,
}) => {
    const nodeVersionFileContent = await readOptionalVersionFile(
        targetNodeVersionFilePath
    );
    const nvmrcFileContent = await readOptionalVersionFile(targetNvmrcFilePath);

    if (nodeVersionFileContent === null || nvmrcFileContent === null) {
        throw new TypeError(
            "Expected both .node-version and .nvmrc to exist in the repository root."
        );
    }

    const normalizedNodeVersionFile = normalizeNodeVersion(
        nodeVersionFileContent
    );
    const normalizedNvmrcFile = normalizeNodeVersion(nvmrcFileContent);

    if (normalizedNodeVersionFile !== normalizedNvmrcFile) {
        throw new TypeError(
            [
                "Node version files are out of sync.",
                `.node-version=${normalizedNodeVersionFile}`,
                `.nvmrc=${normalizedNvmrcFile}`,
            ].join(" ")
        );
    }

    if (
        expectedVersion !== null &&
        normalizedNodeVersionFile !== expectedVersion
    ) {
        throw new TypeError(
            [
                "Node version files do not match the expected version.",
                `Expected: ${expectedVersion}.`,
                `Actual: ${normalizedNodeVersionFile}.`,
            ].join(" ")
        );
    }

    assertPreferredVersionSupported(
        normalizedNodeVersionFile,
        minimumEngineVersion
    );

    logger.log(
        `Node version files are synchronized: ${normalizedNodeVersionFile}`
    );

    return normalizedNodeVersionFile;
};

/**
 * Synchronize or validate the repository's Node version files.
 *
 * @param {object} [input]
 * @param {readonly string[]} [input.argumentList]
 *   Default is `process.argv.slice(2)`
 * @param {string} [input.currentRuntimeVersion] - Default
 *   is `process.versions.node`
 * @param {{ log: (...args: readonly unknown[]) => void }} [input.logger]
 *   Default is `console`
 * @param {string} [input.packageJsonPath] - Default is
 *   `packageJsonPath`
 * @param {string} [input.nodeVersionFilePath] - Default is
 *   `nodeVersionFilePath`
 * @param {string} [input.nvmrcFilePath] - Default is
 *   `nvmrcFilePath`
 *
 * @returns {Promise<NodeVersionSyncResult>}
 */
export const synchronizeNodeVersionFiles = async ({
    argumentList = process.argv.slice(2),
    currentRuntimeVersion = process.versions.node,
    logger = console,
    packageJsonPath: targetPackageJsonPath = packageJsonPath,
    nodeVersionFilePath: targetNodeVersionFilePath = nodeVersionFilePath,
    nvmrcFilePath: targetNvmrcFilePath = nvmrcFilePath,
} = {}) => {
    const { checkCurrent, checkOnly, explicitVersion } =
        parseArguments(argumentList);
    const packageJson = await readPackageJson(targetPackageJsonPath);
    const minimumEngineVersion = resolveMinimumEngineVersion(
        packageJson["engines"]
    );
    const preferredVersion =
        explicitVersion ?? normalizeNodeVersion(currentRuntimeVersion);

    assertPreferredVersionSupported(preferredVersion, minimumEngineVersion);

    if (checkOnly) {
        await validateVersionFiles({
            expectedVersion: null,
            logger,
            minimumEngineVersion,
            nodeVersionFilePath: targetNodeVersionFilePath,
            nvmrcFilePath: targetNvmrcFilePath,
        });
        return "validated";
    }

    if (checkCurrent) {
        await validateVersionFiles({
            expectedVersion: preferredVersion,
            logger,
            minimumEngineVersion,
            nodeVersionFilePath: targetNodeVersionFilePath,
            nvmrcFilePath: targetNvmrcFilePath,
        });
        return "validated-current";
    }

    const synchronizedVersion = await writeVersionFiles({
        preferredVersion,
        nodeVersionFilePath: targetNodeVersionFilePath,
        nvmrcFilePath: targetNvmrcFilePath,
    });

    logger.log(
        `Synchronized .node-version and .nvmrc to ${synchronizedVersion}`
    );
    return "updated";
};

/**
 * CLI entrypoint.
 *
 * @param {object} [input]
 * @param {readonly string[]} [input.argumentList]
 *   Default is `process.argv.slice(2)`
 * @param {string} [input.currentRuntimeVersion] - Default
 *   is `process.versions.node`
 * @param {{[input.logger][input.logger][input.logger][input.logger][input.logger][input.logger][input.logger]
 *     error: (...args: readonly unknown[]) => void;
 *     log: (...args: readonly unknown[]) => void;
 * }} [input.logger=console]
 *   Default is `console`
 * @param {string} [input.packageJsonPath=packageJsonPath] Default is
 *   `packageJsonPath`
 * @param {string} [input.nodeVersionFilePath=nodeVersionFilePath] Default is
 *   `nodeVersionFilePath`
 * @param {string} [input.nvmrcFilePath=nvmrcFilePath] Default is
 *   `nvmrcFilePath`
 *
 * @returns {Promise<number>}
 */
export const runCli = async ({
    argumentList = process.argv.slice(2),
    currentRuntimeVersion = process.versions.node,
    logger = console,
    packageJsonPath: targetPackageJsonPath = packageJsonPath,
    nodeVersionFilePath: targetNodeVersionFilePath = nodeVersionFilePath,
    nvmrcFilePath: targetNvmrcFilePath = nvmrcFilePath,
} = {}) => {
    try {
        await synchronizeNodeVersionFiles({
            argumentList,
            currentRuntimeVersion,
            logger,
            packageJsonPath: targetPackageJsonPath,
            nodeVersionFilePath: targetNodeVersionFilePath,
            nvmrcFilePath: targetNvmrcFilePath,
        });
        return 0;
    } catch (error) {
        logger.error("Failed to synchronize Node version files:", error);
        return 1;
    }
};

if (isDirectExecution()) {
    const exitCode = await runCli();

    if (exitCode !== 0) {
        process.exitCode = exitCode;
    }
}
