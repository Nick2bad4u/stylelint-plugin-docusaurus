import * as path from "node:path";
import { describe, expect, it } from "vitest";

import {
    createCompatibilityCheckCommands,
    getNpmCommand,
    getWindowsCommandShell,
    isDirectExecution,
    runStylelint16Compat,
} from "../scripts/run-stylelint16-compat.mjs";

describe("run-stylelint16-compat wrapper", () => {
    it("builds and tests Stylelint 16 in an isolated project", () => {
        expect.hasAssertions();

        expect(
            createCompatibilityCheckCommands({
                nodeCommand: "node",
                npmCommand: "npm",
                platform: "linux",
                repositoryRootPath: "/repo",
                runtimeDirectoryPath: "/temp/runtime",
                stylelintCompatSmokeScriptPath:
                    "/repo/scripts/stylelint-compat-smoke.mjs",
            })
        ).toStrictEqual([
            {
                args: ["run", "build"],
                command: "npm",
                repositoryRootPath: "/repo",
                shell: false,
            },
            {
                args: [
                    "install",
                    "--ignore-scripts",
                    "--no-audit",
                    "--no-fund",
                    "--package-lock=false",
                    "stylelint@^16",
                ],
                command: "npm",
                repositoryRootPath: "/temp/runtime",
                shell: false,
            },
            {
                args: [
                    "/repo/scripts/stylelint-compat-smoke.mjs",
                    "--expect-stylelint-major=16",
                ],
                command: "node",
                environment: {
                    STYLELINT_RUNTIME_ROOT: "/temp/runtime",
                },
                repositoryRootPath: "/repo",
                shell: false,
            },
        ]);
    });

    it("uses Windows-native npm invocation without weakening resolution", () => {
        expect.hasAssertions();

        expect(getNpmCommand("win32")).toBe("npm.cmd");
        expect(
            getWindowsCommandShell({
                COMSPEC: "custom-cmd.exe",
            })
        ).toBe("custom-cmd.exe");

        const commands = createCompatibilityCheckCommands({
            npmCommand: "npm.cmd",
            platform: "win32",
            runtimeDirectoryPath: "C:/temp/runtime",
        });

        expect(commands[1]?.shell).toBe(true);
        expect(commands[1]?.args).not.toContain("--legacy-peer-deps");
        expect(commands[1]?.args).not.toContain("--force");
    });

    it("removes the isolated project when the smoke check fails", async () => {
        expect.hasAssertions();

        const executedCommands: string[] = [];
        const removedPaths: string[] = [];
        const writtenPaths: string[] = [];

        await expect(
            runStylelint16Compat({
                mkdtempFn: () => Promise.resolve("/temp/runtime"),
                nodeCommand: "node",
                npmCommand: "npm",
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

                    if (executedCommands.length === 3) {
                        throw new Error("simulated smoke failure");
                    }
                },
                stylelintCompatSmokeScriptPath:
                    "/repo/scripts/stylelint-compat-smoke.mjs",
                tmpDirectoryPath: "/temp",
                writeFileFn: (targetPath) => {
                    if (typeof targetPath !== "string") {
                        throw new TypeError("Expected a string fixture path.");
                    }

                    writtenPaths.push(targetPath);

                    return Promise.resolve();
                },
            })
        ).rejects.toThrow("simulated smoke failure");

        expect(writtenPaths).toStrictEqual([
            path.join("/temp/runtime", "package.json"),
        ]);
        expect(executedCommands).toHaveLength(3);
        expect(removedPaths).toStrictEqual(["/temp/runtime"]);
    });

    it("reports both smoke and cleanup failures", async () => {
        expect.hasAssertions();

        await expect(
            runStylelint16Compat({
                mkdtempFn: () => Promise.resolve("/temp/runtime"),
                rmFn: () => Promise.reject(new Error("cleanup failed")),
                runCommandFn: () => {
                    throw new Error("smoke failed");
                },
                writeFileFn: () => Promise.resolve(),
            })
        ).rejects.toMatchObject({
            errors: [
                expect.objectContaining({ message: "smoke failed" }),
                expect.objectContaining({
                    message: expect.stringContaining(
                        "Failed to remove temporary compatibility project"
                    ),
                }),
            ],
        });
    });

    it("exposes a direct-execution guard", () => {
        expect.hasAssertions();

        expect(
            isDirectExecution({
                argvEntry: "C:/repo/scripts/run-stylelint16-compat.mjs",
                currentImportUrl:
                    "file:///C:/repo/scripts/run-stylelint16-compat.mjs",
            })
        ).toBe(true);
        expect(
            isDirectExecution({
                argvEntry: path.resolve(
                    "test",
                    "run-stylelint16-compat.test.ts"
                ),
                currentImportUrl:
                    "file:///C:/repo/scripts/run-stylelint16-compat.mjs",
            })
        ).toBe(false);
    });
});
