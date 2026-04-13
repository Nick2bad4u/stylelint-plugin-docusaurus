import { join, resolve } from "node:path";
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
            excludeRegExp.test(join("src", ".cache", "file.ts"))
        ).toBeTruthy();
        expect(
            excludeRegExp.test(
                join("docs", "docusaurus", ".docusaurus", "app.js")
            )
        ).toBeTruthy();
        expect(excludeRegExp.test(join("src", "styles.css"))).toBeTruthy();
        expect(
            excludeRegExp.test(join("src", "scache", "file.ts"))
        ).toBeFalsy();
        expect(
            excludeRegExp.test(join("src", "adocusaurus", "file.ts"))
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
            tsConfig: resolve("C:/repo", "tsconfig.json"),
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
            error: vi.fn(),
            log: vi.fn(),
        };
        const successAnalyzer = vi.fn(async () => ({ circular: () => [] }));

        await expect(
            runCli({
                analyzeWithMadge: successAnalyzer,
                logger: successLogger,
                repositoryRootPath: "C:/repo",
            })
        ).resolves.toBe(0);
        expect(successAnalyzer).toHaveBeenCalledWith(
            resolve("C:/repo", "src"),
            createMadgeOptions({ repositoryRootPath: "C:/repo" })
        );
        expect(successLogger.log).toHaveBeenCalledWith(
            expect.stringContaining("No circular dependency found")
        );

        const failureLogger = {
            error: vi.fn(),
            log: vi.fn(),
        };

        await expect(
            runCli({
                analyzeWithMadge: async () => ({
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

        const scriptPath = resolve("scripts", "check-circular-deps.mjs");
        const scriptUrl = pathToFileURL(scriptPath).href;

        expect(
            isDirectExecution({
                argvEntry: scriptPath,
                currentImportUrl: scriptUrl,
            })
        ).toBeTruthy();

        expect(
            isDirectExecution({
                argvEntry: resolve("test", "check-circular-deps.test.ts"),
                currentImportUrl: scriptUrl,
            })
        ).toBeFalsy();
    });
});
