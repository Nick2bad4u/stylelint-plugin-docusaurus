#!/usr/bin/env node

/**
 * @packageDocumentation
 * Run the Stylelint 16 compatibility smoke check by temporarily swapping the
 * installed Stylelint runtime, then restoring the working install.
 */
// @ts-check

import { copyFile, cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptsDirectoryPath = dirname(fileURLToPath(import.meta.url));
const repositoryRootPath = resolve(scriptsDirectoryPath, "..");
const packageJsonPath = join(repositoryRootPath, "package.json");
const packageLockJsonPath = join(repositoryRootPath, "package-lock.json");
const stylelintCompatSmokeScriptPath = join(
    scriptsDirectoryPath,
    "stylelint-compat-smoke.mjs"
);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const nodeCommand = process.execPath;

/**
 * Execute one child process synchronously and fail fast on non-zero exits.
 *
 * @param {string} command
 * @param {readonly string[]} args
 */
function runCommand(command, args) {
    const result = spawnSync(command, args, {
        cwd: repositoryRootPath,
        shell: false,
        stdio: "inherit",
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
 * Temporarily install Stylelint 16, run the compat smoke script, and restore
 * the working dependency installation and manifests afterwards.
 */
async function main() {
    const tempBackupDirectory = await mkdtemp(
        join(tmpdir(), "stylelint-plugin-docusaurus-stylelint16-")
    );
    const packageJsonBackupPath = join(tempBackupDirectory, "package.json");
    const packageLockBackupPath = join(
        tempBackupDirectory,
        "package-lock.json"
    );

    await copyFile(packageJsonPath, packageJsonBackupPath);
    await copyFile(packageLockJsonPath, packageLockBackupPath);

    try {
        runCommand(npmCommand, [
            "install",
            "--no-save",
            "--legacy-peer-deps",
            "stylelint@^16",
        ]);
        runCommand(nodeCommand, [
            stylelintCompatSmokeScriptPath,
            "--expect-stylelint-major=16",
        ]);
    } finally {
        await cp(packageJsonBackupPath, packageJsonPath, { force: true });
        await cp(packageLockBackupPath, packageLockJsonPath, { force: true });
        runCommand(npmCommand, [
            "install",
            "--ignore-scripts",
            "--no-audit",
            "--no-fund",
            "--legacy-peer-deps",
        ]);
        await rm(tempBackupDirectory, { force: true, recursive: true });
    }
}

try {
    await main();
} catch (error) {
    console.error("Stylelint 16 compatibility check failed:", error);
    process.exitCode = 1;
}
