#!/usr/bin/env node

/**
 * @packageDocumentation
 * Run the Stylelint 16 compatibility smoke check in an isolated installation.
 */
// @ts-check

import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptsDirectoryPath = dirname(fileURLToPath(import.meta.url));
const repositoryRootPath = resolve(scriptsDirectoryPath, "..");
const stylelintCompatSmokeScriptPath = join(
    scriptsDirectoryPath,
    "stylelint-compat-smoke.mjs"
);

/** @param {string} value */
const isWindowsAbsolutePath = (value) => /^[A-Za-z]:[\\/]/u.test(value);

/** @param {string} filePath */
const toFileHref = (filePath) => {
    if (isWindowsAbsolutePath(filePath)) {
        const normalized = filePath.replaceAll("\\", "/");

        return new URL(`file:///${normalized}`).href;
    }

    return pathToFileURL(resolve(filePath)).href;
};

/**
 * @typedef {Readonly<{
 *     args: readonly string[];
 *     command: string;
 *     environment?: Readonly<Record<string, string>>;
 *     repositoryRootPath: string;
 *     shell: boolean;
 * }>} CommandSpec
 */

/** @param {string} [platform] */
export const getNpmCommand = (platform = process.platform) =>
    platform === "win32" ? "npm.cmd" : "npm";

/** @param {NodeJS.ProcessEnv} [environment] */
export const getWindowsCommandShell = (environment = process.env) =>
    environment["ComSpec"] ?? environment["COMSPEC"] ?? "cmd.exe";

/**
 * @param {Readonly<{
 *     argvEntry?: string | undefined;
 *     currentImportUrl: string;
 * }>} input
 */
export const isDirectExecution = ({ argvEntry, currentImportUrl }) =>
    typeof argvEntry === "string" && toFileHref(argvEntry) === currentImportUrl;

/**
 * Resolve the deterministic tarball name produced by `npm pack`.
 *
 * @param {unknown} packageMetadata - Parsed package metadata.
 *
 * @returns {string} Packed tarball filename.
 */
export function getPackedTarballFilename(packageMetadata) {
    if (typeof packageMetadata !== "object" || packageMetadata === null) {
        throw new TypeError("Expected package metadata to be an object.");
    }

    const name = Reflect.get(packageMetadata, "name");
    const version = Reflect.get(packageMetadata, "version");

    if (
        typeof name !== "string" ||
        !/^(?:@[a-z0-9._~-]+\/)?[a-z0-9._~-]+$/u.test(name)
    ) {
        throw new TypeError("Expected a valid npm package name.");
    }

    if (
        typeof version !== "string" ||
        !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/u.test(
            version
        )
    ) {
        throw new TypeError("Expected a valid npm package version.");
    }

    return `${name.replace(/^@/u, "").replace("/", "-")}-${version}.tgz`;
}

/**
 * @param {Readonly<{
 *     nodeCommand?: string;
 *     npmCommand?: string;
 *     platform?: string;
 *     packedPluginPath: string;
 *     repositoryRootPath?: string;
 *     runtimeDirectoryPath: string;
 *     stylelintCompatSmokeScriptPath?: string;
 * }>} input
 *
 * @returns {readonly CommandSpec[]}
 */
export const createCompatibilityCheckCommands = ({
    nodeCommand = process.execPath,
    npmCommand = getNpmCommand(),
    platform = process.platform,
    packedPluginPath,
    repositoryRootPath: targetRepositoryRootPath = repositoryRootPath,
    runtimeDirectoryPath,
    stylelintCompatSmokeScriptPath:
        targetSmokeScriptPath = stylelintCompatSmokeScriptPath,
}) => {
    const shouldUseWindowsShell = platform === "win32";

    return [
        {
            args: ["run", "build"],
            command: npmCommand,
            repositoryRootPath: targetRepositoryRootPath,
            shell: shouldUseWindowsShell,
        },
        {
            args: [
                "pack",
                "--ignore-scripts",
                "--pack-destination",
                runtimeDirectoryPath,
            ],
            command: npmCommand,
            repositoryRootPath: targetRepositoryRootPath,
            shell: shouldUseWindowsShell,
        },
        {
            args: [
                "install",
                "--ignore-scripts",
                "--no-audit",
                "--no-fund",
                "--package-lock=false",
                "stylelint@^16",
                packedPluginPath,
            ],
            command: npmCommand,
            repositoryRootPath: runtimeDirectoryPath,
            shell: shouldUseWindowsShell,
        },
        {
            args: [targetSmokeScriptPath, "--expect-stylelint-major=16"],
            command: nodeCommand,
            environment: {
                STYLELINT_RUNTIME_ROOT: runtimeDirectoryPath,
            },
            repositoryRootPath: targetRepositoryRootPath,
            shell: false,
        },
    ];
};

/**
 * @param {CommandSpec & Readonly<{ windowsCommandShell?: string }>} input
 */
export function runCommand({
    args,
    command,
    environment = {},
    repositoryRootPath: targetRepositoryRootPath,
    shell = false,
    windowsCommandShell = getWindowsCommandShell(),
}) {
    const childProcessEnvironment = {
        ...Object.fromEntries(
            Object.entries(process.env).filter(
                ([name]) => name.toLowerCase() !== "npm_config_allow_scripts"
            )
        ),
        ...environment,
    };
    const shouldUseWindowsCommandShell = process.platform === "win32" && shell;
    const result = shouldUseWindowsCommandShell
        ? spawnSync(
              windowsCommandShell,
              [
                  "/d",
                  "/s",
                  "/c",
                  command,
                  ...args,
              ],
              {
                  cwd: targetRepositoryRootPath,
                  env: childProcessEnvironment,
                  shell: false,
                  stdio: "inherit",
                  windowsHide: true,
              }
          )
        : spawnSync(command, args, {
              cwd: targetRepositoryRootPath,
              env: childProcessEnvironment,
              shell: false,
              stdio: "inherit",
              windowsHide: true,
          });

    if (result.error !== undefined) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(
            `Command failed (${String(result.status)}): ${command} ${args.join(" ")}`
        );
    }
}

/**
 * @param {Readonly<{
 *     mkdtempFn?: (prefix: string) => Promise<string>;
 *     nodeCommand?: string;
 *     npmCommand?: string;
 *     platform?: string;
 *     readFileFn?: (path: string, encoding: "utf8") => Promise<string>;
 *     repositoryRootPath?: string;
 *     rmFn?: typeof rm;
 *     runCommandFn?: typeof runCommand;
 *     stylelintCompatSmokeScriptPath?: string;
 *     tmpDirectoryPath?: string;
 *     windowsCommandShell?: string;
 *     writeFileFn?: typeof writeFile;
 * }>} [input]
 */
export async function runStylelint16Compat({
    mkdtempFn = mkdtemp,
    nodeCommand = process.execPath,
    npmCommand = getNpmCommand(),
    platform = process.platform,
    readFileFn = readFile,
    repositoryRootPath: targetRepositoryRootPath = repositoryRootPath,
    rmFn = rm,
    runCommandFn = runCommand,
    stylelintCompatSmokeScriptPath:
        targetSmokeScriptPath = stylelintCompatSmokeScriptPath,
    tmpDirectoryPath = tmpdir(),
    windowsCommandShell = getWindowsCommandShell(),
    writeFileFn = writeFile,
} = {}) {
    const runtimeDirectoryPath = await mkdtempFn(
        join(tmpDirectoryPath, "stylelint-plugin-docusaurus-stylelint16-")
    );
    /** @type {Error | undefined} */
    let primaryError;

    try {
        await writeFileFn(
            join(runtimeDirectoryPath, "package.json"),
            `${JSON.stringify({ private: true, type: "module" }, null, 4)}\n`,
            "utf8"
        );

        const packageMetadata = JSON.parse(
            await readFileFn(
                join(targetRepositoryRootPath, "package.json"),
                "utf8"
            )
        );
        const packedPluginPath = join(
            runtimeDirectoryPath,
            getPackedTarballFilename(packageMetadata)
        );

        for (const command of createCompatibilityCheckCommands({
            nodeCommand,
            npmCommand,
            packedPluginPath,
            platform,
            repositoryRootPath: targetRepositoryRootPath,
            runtimeDirectoryPath,
            stylelintCompatSmokeScriptPath: targetSmokeScriptPath,
        })) {
            runCommandFn({ ...command, windowsCommandShell });
        }
    } catch (error) {
        primaryError =
            error instanceof Error
                ? error
                : new Error("Stylelint 16 compatibility check failed.");
    }

    try {
        await rmFn(runtimeDirectoryPath, { force: true, recursive: true });
    } catch (error) {
        const cleanupError = new Error(
            `Failed to remove temporary compatibility project: ${runtimeDirectoryPath}`,
            { cause: error instanceof Error ? error : undefined }
        );

        if (primaryError !== undefined) {
            throw new AggregateError(
                [primaryError, cleanupError],
                "Stylelint 16 compatibility check failed and cleanup also failed."
            );
        }

        throw cleanupError;
    }

    if (primaryError !== undefined) {
        throw primaryError;
    }
}

export async function runCli() {
    await runStylelint16Compat();
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
        console.error("Stylelint 16 compatibility check failed:", error);
        process.exitCode = 1;
    }
}
