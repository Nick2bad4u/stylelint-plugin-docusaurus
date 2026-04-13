import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it, vi } from "vitest";

import {
    createMadgeExcludeRegExp,
    createMadgeOptions,
    formatCircularDependencies,
    isDirectExecution,
    runCli,
} from "../scripts/check-circular-deps.mjs";

describe("check-circular-deps script", () => {
    it("excludes only the intended path segments and css files", () => {
        expect.hasAssertions();

        const excludeRegExp = createMadgeExcludeRegExp();

        expect(
            excludeRegExp.test(path.join("src", ".cache", "file.ts"))
        ).toBeTruthy();
        expect(
            excludeRegExp.test(
                path.join("docs", "docusaurus", ".docusaurus", "app.js")
            )
        ).toBeTruthy();
        expect(excludeRegExp.test(path.join("src", "styles.css"))).toBeTruthy();
        expect(
            excludeRegExp.test(path.join("src", "scache", "file.ts"))
        ).toBeFalsy();
        expect(
            excludeRegExp.test(path.join("src", "adocusaurus", "file.ts"))
        ).toBeFalsy();
    });

    it("builds Madge options from the repository root instead of the current cwd", () => {
        expect.hasAssertions();

        expect(
            createMadgeOptions({ repositoryRootPath: "C:/repo" })
        ).toStrictEqual({
            excludeRegExp: [createMadgeExcludeRegExp()],
            fileExtensions: [
                "ts",
                "tsx",
                "js",
                "jsx",
                "mjs",
                "cjs",
                "cts",
                "mts",
            ],
            tsConfig: path.resolve("C:/repo", "tsconfig.json"),
        });
    });

    it("formats circular dependency paths predictably for reporting", () => {
        expect.hasAssertions();

        expect(
            formatCircularDependencies([
                [
                    "src/a.ts",
                    "src/b.ts",
                    "src/a.ts",
                ],
                [
                    "src/c.ts",
                    "src/d.ts",
                    "src/c.ts",
                ],
            ])
        ).toStrictEqual([
            "src/a.ts -> src/b.ts -> src/a.ts",
            "src/c.ts -> src/d.ts -> src/c.ts",
        ]);
    });

    it("returns success or failure codes through the injected Madge analyzer", async () => {
        expect.hasAssertions();

        const successLogger = {
            error: vi.fn<(message?: unknown) => void>(),
            log: vi.fn<(message?: unknown) => void>(),
        };
        const successAnalyzer = vi.fn<
            () => Promise<{ circular: () => string[][] }>
        >(() => Promise.resolve({ circular: () => [] }));

        await expect(
            runCli({
                analyzeWithMadge: successAnalyzer,
                logger: successLogger,
                repositoryRootPath: "C:/repo",
            })
        ).resolves.toBe(0);
        expect(successAnalyzer).toHaveBeenCalledWith(
            path.resolve("C:/repo", "src"),
            createMadgeOptions({ repositoryRootPath: "C:/repo" })
        );
        expect(successLogger.log).toHaveBeenCalledWith(
            expect.stringContaining("No circular dependency found")
        );

        const failureLogger = {
            error: vi.fn<(message?: unknown) => void>(),
            log: vi.fn<(message?: unknown) => void>(),
        };

        await expect(
            runCli({
                analyzeWithMadge: () =>
                    Promise.resolve({
                        circular: () => [
                            [
                                "src/a.ts",
                                "src/b.ts",
                                "src/a.ts",
                            ],
                        ],
                    }),
                logger: failureLogger,
                repositoryRootPath: "C:/repo",
            })
        ).resolves.toBe(1);
        expect(failureLogger.error).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("Circular dependencies detected")
        );
        expect(failureLogger.error).toHaveBeenNthCalledWith(
            2,
            "- src/a.ts -> src/b.ts -> src/a.ts"
        );
    });

    it("uses a direct-execution guard so imports do not run the CLI", () => {
        expect.hasAssertions();

        const scriptPath = path.resolve("scripts", "check-circular-deps.mjs");
        const scriptUrl = pathToFileURL(scriptPath).href;

        expect(
            isDirectExecution({
                argvEntry: scriptPath,
                currentImportUrl: scriptUrl,
            })
        ).toBeTruthy();

        expect(
            isDirectExecution({
                argvEntry: path.resolve("test", "check-circular-deps.test.ts"),
                currentImportUrl: scriptUrl,
            })
        ).toBeFalsy();
    });
});
