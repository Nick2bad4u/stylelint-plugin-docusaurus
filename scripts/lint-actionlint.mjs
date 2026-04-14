#!/usr/bin/env node

/**
 * Run actionlint for workflow files, honoring an optional excluded-file list by
 * default. Pass --include-excluded to lint those files too.
 *
 * Defaults:
 *
 * - Disable shellcheck/pyflakes integrations unless explicitly provided.
 * - Enable color output unless -no-color is provided.
 * - Use ActionLintConfig.yaml unless -config-file is provided.
 */

import { readdirSync } from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import pc from "picocolors";

/**
 * Resolve the repository root from the script location rather than from the
 * caller's current working directory.
 *
 * @param {string} [currentImportUrl] - Script module URL. Default is
 *   `import.meta.url`
 *
 * @returns {string} Repository root path.
 */
export function getRepositoryRootPath(currentImportUrl = import.meta.url) {
    return path.resolve(path.dirname(fileURLToPath(currentImportUrl)), "..");
}

const repositoryRootPath = getRepositoryRootPath();
const excludedFiles = new Set(
    ["FILL_EXCLUDED_FILES_HERE.yml"].map((fileName) => fileName.toLowerCase())
);
/** @type {Set<string>} */
const flagsWithValues = new Set([
    "-config-file",
    "-format",
    "-ignore",
    "-pyflakes",
    "-shellcheck",
    "-stdin-filename",
]);

/**
 * Determine whether the current module is being executed directly.
 *
 * @param {object} [input] - Direct-execution detection input.
 * @param {string | undefined} [input.argvEntry] - Entry path. Default is
 *   `process.argv[1]`
 * @param {string} [input.currentImportUrl] - Current module URL. Default is
 *   `import.meta.url`
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

    return pathToFileURL(path.resolve(argvEntry)).href === currentImportUrl;
}

/**
 * Check whether parsed actionlint arguments include a specific flag, supporting
 * both spaced and equals-style forms.
 *
 * @param {readonly string[]} args - Parsed actionlint arguments.
 * @param {string} flag - Flag to search for.
 *
 * @returns {boolean} Whether the flag is present.
 */
export function hasActionlintFlag(args, flag) {
    return args.some(
        (argument) => argument === flag || argument.startsWith(`${flag}=`)
    );
}

/**
 * Check whether any candidate flag is present.
 *
 * @param {readonly string[]} args - Parsed actionlint arguments.
 * @param {readonly string[]} flags - Candidate flags.
 *
 * @returns {boolean} Whether any flag is present.
 */
export function hasAnyActionlintFlag(args, flags) {
    return flags.some((flag) => hasActionlintFlag(args, flag));
}

/**
 * Parse raw wrapper CLI arguments into actionlint args and explicit file args.
 *
 * @param {readonly string[]} [rawArgs] - Raw CLI arguments. Default is
 *   `process.argv.slice(2)`
 *
 * @returns {{
 *     fileArgs: readonly string[];
 *     overrideExcluded: boolean;
 *     userArgs: readonly string[];
 * }}
 *   Parsed argument groups.
 */
export function parseActionlintCliArgs(rawArgs = process.argv.slice(2)) {
    const overrideExcluded = rawArgs.includes("--include-excluded");

    /** @type {string[]} */
    const userArgs = [];
    /** @type {string[]} */
    const fileArgs = [];

    for (let index = 0; index < rawArgs.length; index += 1) {
        const arg = rawArgs[index];

        if (arg === undefined || arg === "--include-excluded") {
            continue;
        }

        if (arg === "-" || !arg.startsWith("-")) {
            fileArgs.push(arg);
            continue;
        }

        userArgs.push(arg);

        if (flagsWithValues.has(arg)) {
            const value = rawArgs[index + 1];
            if (typeof value === "string") {
                userArgs.push(value);
                index += 1;
            }
        }
    }

    return {
        fileArgs,
        overrideExcluded,
        userArgs,
    };
}

/**
 * Determine whether the wrapper should pass arguments through without adding
 * default config or workflow targets.
 *
 * @param {readonly string[]} userArgs - Parsed actionlint arguments.
 *
 * @returns {boolean} Whether the wrapper should avoid default injection.
 */
export function isActionlintPassThroughMode(userArgs) {
    return hasAnyActionlintFlag(userArgs, [
        "-help",
        "--help",
        "-init-config",
        "--init-config",
        "-version",
        "--version",
    ]);
}

/**
 * Resolve the workflow file targets for a default wrapper invocation.
 *
 * @param {object} input - Target resolution input.
 * @param {boolean} [input.overrideExcluded] - Whether to include excluded
 *   files. Default is `false`
 * @param {string} [input.repoRootPath] - Repository root path. Default is
 *   `repositoryRootPath`
 * @param {(
 *     directoryPath: string
 * ) => readonly { readonly isFile: () => boolean; readonly name: string }[]} [input.readDirectoryEntries]
 *   - Directory reader.
 *
 * @returns {readonly string[]} Workflow file targets.
 */
export function resolveDefaultWorkflowTargets({
    overrideExcluded = false,
    readDirectoryEntries = (directoryPath) =>
        readdirSync(directoryPath, { withFileTypes: true }),
    repoRootPath = repositoryRootPath,
} = {}) {
    const workflowsDirectory = path.join(repoRootPath, ".github", "workflows");

    return readDirectoryEntries(workflowsDirectory)
        .filter((entry) => entry.isFile())
        .map((entry) => path.join(workflowsDirectory, entry.name))
        .filter((filePath) => {
            const extension = path.extname(filePath).toLowerCase();
            if (extension !== ".yml" && extension !== ".yaml") {
                return false;
            }

            if (overrideExcluded) {
                return true;
            }

            return !excludedFiles.has(path.basename(filePath).toLowerCase());
        })
        .toSorted((left, right) => left.localeCompare(right));
}

/**
 * Build the final actionlint invocation plan for the wrapper.
 *
 * @param {object} [input] - Planning input.
 * @param {readonly string[]} [input.rawArgs] - Raw CLI arguments. Default is
 *   `process.argv.slice(2)`
 * @param {(
 *     directoryPath: string
 * ) => readonly { readonly isFile: () => boolean; readonly name: string }[]} [input.readDirectoryEntries]
 *   - Directory reader.
 * @param {string} [input.repoRootPath] - Repository root path. Default is
 *   `repositoryRootPath`
 *
 * @returns {{
 *     overrideExcluded: boolean;
 *     passThroughMode: boolean;
 *     targetFiles: readonly string[];
 *     useDefaultFiles: boolean;
 *     userArgs: readonly string[];
 * }}
 *   Invocation plan.
 */
export function createActionlintExecutionPlan({
    rawArgs = process.argv.slice(2),
    readDirectoryEntries,
    repoRootPath = repositoryRootPath,
} = {}) {
    const { fileArgs, overrideExcluded, userArgs } =
        parseActionlintCliArgs(rawArgs);
    const passThroughMode = isActionlintPassThroughMode(userArgs);
    const useDefaultFiles = fileArgs.length === 0 && !passThroughMode;

    /** @type {string[]} */
    const normalizedUserArgs = [...userArgs];

    if (!passThroughMode) {
        if (!hasActionlintFlag(normalizedUserArgs, "-config-file")) {
            normalizedUserArgs.push(
                "-config-file",
                path.join(repoRootPath, "ActionLintConfig.yaml")
            );
        }

        if (
            !hasAnyActionlintFlag(normalizedUserArgs, ["-color", "-no-color"])
        ) {
            normalizedUserArgs.push("-color");
        }

        if (!hasActionlintFlag(normalizedUserArgs, "-shellcheck")) {
            normalizedUserArgs.push("-shellcheck", "");
        }

        if (!hasActionlintFlag(normalizedUserArgs, "-pyflakes")) {
            normalizedUserArgs.push("-pyflakes", "");
        }
    }

    const targetFiles = useDefaultFiles
        ? resolveDefaultWorkflowTargets({
              overrideExcluded,
              readDirectoryEntries,
              repoRootPath,
          })
        : fileArgs;

    return {
        overrideExcluded,
        passThroughMode,
        targetFiles,
        useDefaultFiles,
        userArgs: normalizedUserArgs,
    };
}

/**
 * Run the actionlint wrapper CLI.
 *
 * @param {object} [input] - CLI input.
 * @param {{
 *     error: (...args: readonly unknown[]) => void;
 *     log: (...args: readonly unknown[]) => void;
 * }} [input.logger]
 *   - Logger. Defaults to `console`.
 * @param {readonly string[]} [input.rawArgs] - Raw CLI arguments. Defaults to
 *   `process.argv.slice(2)`.
 * @param {string} [input.repoRootPath] - Repository root path. Defaults to
 *   `repositoryRootPath`.
 * @param {(
 *     directoryPath: string
 * ) => readonly { readonly isFile: () => boolean; readonly name: string }[]} [input.readDirectoryEntries]
 *   - Directory reader.
 * @param {(
 *     command: string,
 *     args: readonly string[],
 *     options: { readonly stdio: "inherit" }
 * ) => {
 *     readonly error?: unknown;
 *     readonly signal: string | null;
 *     readonly status: number | null;
 * }} [input.spawnActionlint]
 *   - Spawn implementation.
 *
 * @returns {number} Exit code.
 */
export function runCli({
    logger = console,
    rawArgs = process.argv.slice(2),
    readDirectoryEntries,
    repoRootPath = repositoryRootPath,
    spawnActionlint = (command, args, options) =>
        spawnSync(command, args, options),
} = {}) {
    const plan = createActionlintExecutionPlan({
        rawArgs,
        readDirectoryEntries,
        repoRootPath,
    });

    if (plan.useDefaultFiles && plan.targetFiles.length === 0) {
        logger.error(pc.red("No workflow files found to lint."));
        process.exitCode = 1;
        return 1;
    }

    if (plan.useDefaultFiles) {
        const scopeText = plan.overrideExcluded
            ? "including" + ` ${pc.magenta([...excludedFiles].join(", "))}`
            : "excluding" + ` ${pc.magenta([...excludedFiles].join(", "))}`;
        logger.log(
            `${pc.bold(pc.cyan("Running actionlint on"))} ${pc.magenta(
                String(plan.targetFiles.length)
            )} ${pc.cyan(`workflow file(s), ${scopeText}.`)}`
        );
    }

    const result = spawnActionlint(
        "actionlint",
        [...plan.userArgs, ...plan.targetFiles],
        { stdio: "inherit" }
    );

    if (result.error) {
        logger.error(pc.red("Failed to run actionlint:"), result.error);
        process.exitCode = 1;
        return 1;
    }

    if (result.status === 0) {
        logger.log(pc.green("✓ actionlint completed successfully."));
        return 0;
    }

    if (result.status !== null) {
        logger.error(
            `${pc.red("actionlint failed with exit code")} ${pc.bold(
                pc.magenta(String(result.status))
            )}.`
        );
        process.exitCode = result.status;
        return result.status;
    }

    if (result.signal !== null) {
        logger.error(
            `${pc.red("actionlint terminated by signal")} ${pc.bold(
                pc.magenta(result.signal)
            )}.`
        );
        process.exitCode = 1;
        return 1;
    }

    process.exitCode = 1;
    return 1;
}

if (isDirectExecution()) {
    runCli({
        rawArgs: process.argv.slice(2),
        repoRootPath: repositoryRootPath,
    });
}
