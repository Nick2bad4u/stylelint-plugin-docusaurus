import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it, vi } from "vitest";

import {
    createActionlintExecutionPlan,
    getRepositoryRootPath,
    hasActionlintFlag,
    isActionlintPassThroughMode,
    isDirectExecution,
    parseActionlintCliArgs,
    runCli,
} from "../scripts/lint-actionlint.mjs";

describe("lint-actionlint wrapper", () => {
    it("detects equals-style flags so defaults are not duplicated", () => {
        expect.hasAssertions();

        const plan = createActionlintExecutionPlan({
            rawArgs: [
                "-config-file=custom-actionlint.yaml",
                "-shellcheck=C:/tools/shellcheck.exe",
                "-pyflakes=pyflakes",
            ],
            readDirectoryEntries: () => [],
            repoRootPath: "C:/repo",
        });

        expect(hasActionlintFlag(plan.userArgs, "-config-file")).toBeTruthy();
        expect(plan.userArgs).not.toContain("C:/repo/ActionLintConfig.yaml");
        expect(plan.userArgs).not.toStrictEqual(
            expect.arrayContaining(["-shellcheck", ""])
        );
        expect(plan.userArgs).not.toStrictEqual(
            expect.arrayContaining(["-pyflakes", ""])
        );
    });

    it("treats help and version style invocations as pass-through mode", () => {
        expect.hasAssertions();

        expect(isActionlintPassThroughMode(["-help"])).toBeTruthy();
        expect(isActionlintPassThroughMode(["--version"])).toBeTruthy();

        const helpPlan = createActionlintExecutionPlan({
            rawArgs: ["-help"],
            repoRootPath: "C:/repo",
        });

        expect(helpPlan.passThroughMode).toBeTruthy();
        expect(helpPlan.useDefaultFiles).toBeFalsy();
        expect(helpPlan.targetFiles).toStrictEqual([]);
        expect(helpPlan.userArgs).toStrictEqual(["-help"]);
    });

    it("parses wrapper-only flags separately from file arguments", () => {
        expect.hasAssertions();

        expect(
            parseActionlintCliArgs([
                "--include-excluded",
                ".github/workflows/ci.yml",
                "-format",
                "{{json .}}",
            ])
        ).toStrictEqual({
            fileArgs: [".github/workflows/ci.yml"],
            overrideExcluded: true,
            userArgs: ["-format", "{{json .}}"],
        });
    });

    it("resolves default workflow targets with exclusion and override support", () => {
        expect.hasAssertions();

        const mockEntries = [
            { isFile: () => true, name: "z.yml" },
            { isFile: () => true, name: "FILL_EXCLUDED_FILES_HERE.yml" },
            { isFile: () => true, name: "a.yaml" },
            { isFile: () => false, name: "nested" },
            { isFile: () => true, name: "README.md" },
        ];

        expect(
            createActionlintExecutionPlan({
                rawArgs: [],
                readDirectoryEntries: () => mockEntries,
                repoRootPath: "C:/repo",
            }).targetFiles
        ).toStrictEqual([
            path.join("C:/repo", ".github", "workflows", "a.yaml"),
            path.join("C:/repo", ".github", "workflows", "z.yml"),
        ]);

        expect(
            createActionlintExecutionPlan({
                rawArgs: ["--include-excluded"],
                readDirectoryEntries: () => mockEntries,
                repoRootPath: "C:/repo",
            }).targetFiles
        ).toStrictEqual([
            path.join("C:/repo", ".github", "workflows", "a.yaml"),
            path.join(
                "C:/repo",
                ".github",
                "workflows",
                "FILL_EXCLUDED_FILES_HERE.yml"
            ),
            path.join("C:/repo", ".github", "workflows", "z.yml"),
        ]);
    });

    it("uses a direct-execution guard so imports do not run the CLI", () => {
        expect.hasAssertions();

        const scriptPath = path.resolve("scripts", "lint-actionlint.mjs");
        const scriptUrl = pathToFileURL(scriptPath).href;

        expect(
            isDirectExecution({
                argvEntry: scriptPath,
                currentImportUrl: scriptUrl,
            })
        ).toBeTruthy();

        expect(
            isDirectExecution({
                argvEntry: path.resolve("test", "lint-actionlint.test.ts"),
                currentImportUrl: scriptUrl,
            })
        ).toBeFalsy();
    });

    it("resolves the repository root from the script location", () => {
        expect.hasAssertions();

        const scriptPath = path.resolve("scripts", "lint-actionlint.mjs");
        const scriptUrl = pathToFileURL(scriptPath).href;

        expect(getRepositoryRootPath(scriptUrl)).toBe(path.resolve("."));
    });

    it("uses the script-resolved repository root even when process.cwd differs", () => {
        expect.hasAssertions();

        const repositoryRootPath = path.resolve(".");
        const cwdSpy = vi
            .spyOn(process, "cwd")
            .mockReturnValue("C:/different-cwd");

        try {
            const visitedDirectories: string[] = [];
            const plan = createActionlintExecutionPlan({
                rawArgs: [],
                readDirectoryEntries: (directoryPath) => {
                    visitedDirectories.push(directoryPath);
                    return [];
                },
            });

            expect(visitedDirectories).toStrictEqual([
                path.join(repositoryRootPath, ".github", "workflows"),
            ]);
            expect(plan.userArgs).toContain("-config-file");
            expect(plan.userArgs).toContain(
                path.join(repositoryRootPath, "ActionLintConfig.yaml")
            );
            expect(plan.userArgs).not.toContain(
                path.join("C:/different-cwd", "ActionLintConfig.yaml")
            );
        } finally {
            cwdSpy.mockRestore();
        }
    });

    it("skips with success when actionlint binary is missing (ENOENT)", () => {
        expect.hasAssertions();

        const logs: string[] = [];
        const errors: string[] = [];

        const exitCode = runCli({
            logger: {
                error: (...args) => {
                    errors.push(args.map(String).join(" "));
                },
                log: (...args) => {
                    logs.push(args.map(String).join(" "));
                },
            },
            rawArgs: ["-help"],
            spawnActionlint: () => ({
                error: {
                    code: "ENOENT",
                    message: "spawnSync actionlint ENOENT",
                },
                signal: null,
                status: null,
            }),
        });

        expect(exitCode).toBe(0);
        expect(errors).toStrictEqual([]);
        expect(logs.join("\n")).toContain("actionlint binary not found");
    });

    it("fails when actionlint returns a non-ENOENT spawn error", () => {
        expect.hasAssertions();

        const logs: string[] = [];
        const errors: string[] = [];

        const exitCode = runCli({
            logger: {
                error: (...args) => {
                    errors.push(args.map(String).join(" "));
                },
                log: (...args) => {
                    logs.push(args.map(String).join(" "));
                },
            },
            rawArgs: ["-help"],
            spawnActionlint: () => ({
                error: {
                    code: "EACCES",
                    message: "spawnSync actionlint EACCES",
                },
                signal: null,
                status: null,
            }),
        });

        expect(exitCode).toBe(1);
        expect(errors.join("\n")).toContain("Failed to run actionlint");
        expect(logs).toStrictEqual([]);
    });
});
