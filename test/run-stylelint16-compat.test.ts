import * as path from "node:path";
import { describe, expect, it } from "vitest";

import {
    createCompatibilityCheckCommands,
    createRestoreDependenciesCommand,
    getNpmCommand,
    getWindowsCommandShell,
    isDirectExecution,
    runStylelint16Compat,
} from "../scripts/run-stylelint16-compat.mjs";

describe("run-stylelint16-compat wrapper", () => {
    it("builds before installing Stylelint 16 and running the smoke check", () => {
        expect.hasAssertions();

        expect(
            createCompatibilityCheckCommands({
                nodeCommand: "node",
                npmCommand: "npm",
                platform: "linux",
                stylelintCompatSmokeScriptPath:
                    "/repo/scripts/stylelint-compat-smoke.mjs",
            })
        ).toStrictEqual([
            {
                args: ["run", "build"],
                command: "npm",
                shell: false,
            },
            {
                args: [
                    "install",
                    "--no-save",
                    "--legacy-peer-deps",
                    "stylelint@^16",
                ],
                command: "npm",
                shell: false,
            },
            {
                args: [
                    "/repo/scripts/stylelint-compat-smoke.mjs",
                    "--expect-stylelint-major=16",
                ],
                command: "node",
                shell: false,
            },
        ]);
    });

    it("creates a Windows-aware restore install command", () => {
        expect.hasAssertions();

        expect(getNpmCommand("win32")).toBe("npm.cmd");
        expect(
            getWindowsCommandShell({
                COMSPEC: "custom-cmd.exe",
            } as NodeJS.ProcessEnv)
        ).toBe("custom-cmd.exe");
        expect(
            createRestoreDependenciesCommand({
                npmCommand: "npm.cmd",
                platform: "win32",
            })
        ).toStrictEqual({
            args: [
                "install",
                "--ignore-scripts",
                "--no-audit",
                "--no-fund",
                "--legacy-peer-deps",
            ],
            command: "npm.cmd",
            shell: true,
        });
    });

    it("restores manifests and dependencies even when the smoke check fails", async () => {
        expect.hasAssertions();

        const copiedFiles: string[] = [];
        const restoredFiles: string[] = [];
        const executedCommands: string[] = [];
        const removedPaths: string[] = [];
        let invocationIndex = 0;
        const tempBackupDirectory = "/temp/stylelint16-backup";

        await expect(
            runStylelint16Compat({
                copyFileFn: (sourcePath, destinationPath) => {
                    copiedFiles.push(
                        `${String(sourcePath)}->${String(destinationPath)}`
                    );

                    return Promise.resolve();
                },
                cpFn: (sourcePath, destinationPath) => {
                    restoredFiles.push(
                        `${String(sourcePath)}->${String(destinationPath)}`
                    );

                    return Promise.resolve();
                },
                mkdtempFn: () => Promise.resolve(tempBackupDirectory),
                nodeCommand: "node",
                npmCommand: "npm",
                packageJsonPath: "/repo/package.json",
                packageLockJsonPath: "/repo/package-lock.json",
                platform: "linux",
                repositoryRootPath: "/repo",
                rmFn: (targetPath) => {
                    removedPaths.push(String(targetPath));

                    return Promise.resolve();
                },
                runCommandFn: (input) => {
                    executedCommands.push(
                        `${input.command} ${input.args.join(" ")}`
                    );
                    invocationIndex += 1;

                    if (invocationIndex === 3) {
                        throw new Error("simulated smoke failure");
                    }
                },
                stylelintCompatSmokeScriptPath:
                    "/repo/scripts/stylelint-compat-smoke.mjs",
                tmpDirectoryPath: "/temp",
                windowsCommandShell: "cmd.exe",
            })
        ).rejects.toThrow("simulated smoke failure");

        expect(copiedFiles).toStrictEqual([
            `/repo/package.json->${path.join(tempBackupDirectory, "package.json")}`,
            `/repo/package-lock.json->${path.join(tempBackupDirectory, "package-lock.json")}`,
        ]);
        expect(restoredFiles).toStrictEqual([
            `${path.join(tempBackupDirectory, "package.json")}->/repo/package.json`,
            `${path.join(tempBackupDirectory, "package-lock.json")}->/repo/package-lock.json`,
        ]);
        expect(executedCommands).toStrictEqual([
            "npm run build",
            "npm install --no-save --legacy-peer-deps stylelint@^16",
            "node /repo/scripts/stylelint-compat-smoke.mjs --expect-stylelint-major=16",
            "npm install --ignore-scripts --no-audit --no-fund --legacy-peer-deps",
        ]);
        expect(removedPaths).toStrictEqual([tempBackupDirectory]);
    });

    it("preserves the original smoke failure when cleanup also fails", async () => {
        expect.hasAssertions();

        const executedCommands: string[] = [];
        let invocationIndex = 0;

        let thrownError: unknown = undefined;

        try {
            await runStylelint16Compat({
                copyFileFn: () => Promise.resolve(),
                cpFn: () => Promise.resolve(),
                mkdtempFn: () => Promise.resolve("/temp/stylelint16-backup"),
                nodeCommand: "node",
                npmCommand: "npm",
                packageJsonPath: "/repo/package.json",
                packageLockJsonPath: "/repo/package-lock.json",
                platform: "linux",
                repositoryRootPath: "/repo",
                rmFn: () => Promise.resolve(),
                runCommandFn: (input) => {
                    executedCommands.push(
                        `${input.command} ${input.args.join(" ")}`
                    );
                    invocationIndex += 1;

                    if (invocationIndex === 3) {
                        throw new Error("simulated smoke failure");
                    }

                    if (invocationIndex === 4) {
                        throw new Error("simulated restore failure");
                    }
                },
                stylelintCompatSmokeScriptPath:
                    "/repo/scripts/stylelint-compat-smoke.mjs",
                tmpDirectoryPath: "/temp",
                windowsCommandShell: "cmd.exe",
            });
        } catch (error) {
            thrownError = error;
        }

        expect(thrownError).toBeInstanceOf(AggregateError);

        const aggregateError = thrownError as AggregateError;
        const messages = aggregateError.errors.map((item: unknown) =>
            item instanceof Error ? item.message : String(item)
        );

        expect(aggregateError.message).toContain(
            "cleanup encountered additional errors"
        );
        expect(messages).toContain("simulated smoke failure");
        expect(messages).toContain(
            "Failed to restore dependencies after the Stylelint 16 compatibility check."
        );

        expect(executedCommands).toStrictEqual([
            "npm run build",
            "npm install --no-save --legacy-peer-deps stylelint@^16",
            "node /repo/scripts/stylelint-compat-smoke.mjs --expect-stylelint-major=16",
            "npm install --ignore-scripts --no-audit --no-fund --legacy-peer-deps",
        ]);
    });

    it("surfaces cleanup failures even when the compatibility check succeeds", async () => {
        expect.hasAssertions();

        await expect(
            runStylelint16Compat({
                copyFileFn: () => Promise.resolve(),
                cpFn: () => Promise.resolve(),
                mkdtempFn: () => Promise.resolve("/temp/stylelint16-backup"),
                nodeCommand: "node",
                npmCommand: "npm",
                packageJsonPath: "/repo/package.json",
                packageLockJsonPath: "/repo/package-lock.json",
                platform: "linux",
                repositoryRootPath: "/repo",
                rmFn: () => {
                    throw new Error("simulated temp cleanup failure");
                },
                runCommandFn: () => {},
                stylelintCompatSmokeScriptPath:
                    "/repo/scripts/stylelint-compat-smoke.mjs",
                tmpDirectoryPath: "/temp",
                windowsCommandShell: "cmd.exe",
            })
        ).rejects.toThrow(
            "Failed to remove temporary backup directory: /temp/stylelint16-backup"
        );
    });

    it("exposes a direct-execution guard so imports do not trigger the wrapper", () => {
        expect.hasAssertions();

        expect(
            isDirectExecution({
                argvEntry: "C:/repo/scripts/run-stylelint16-compat.mjs",
                currentImportUrl:
                    "file:///C:/repo/scripts/run-stylelint16-compat.mjs",
            })
        ).toBeTruthy();

        expect(
            isDirectExecution({
                argvEntry: "C:/repo/test/run-stylelint16-compat.test.ts",
                currentImportUrl:
                    "file:///C:/repo/scripts/run-stylelint16-compat.mjs",
            })
        ).toBeFalsy();
    });
});
