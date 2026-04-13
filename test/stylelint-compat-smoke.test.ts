import { describe, expect, it, vi } from "vitest";

import type {
    BuiltPluginSurface,
    StylelintLike,
} from "../scripts/stylelint-compat-smoke.mjs";

import {
    isDirectExecution,
    normalizeStylelintRuntime,
    parseExpectedStylelintMajor,
    runStylelintCompatSmoke,
} from "../scripts/stylelint-compat-smoke.mjs";

function createMockBuiltPluginSurface(): BuiltPluginSurface {
    const plugin = ["mock-plugin-pack"];
    const configNames = ["recommended", "all"] as const;
    const ruleIds = ["mock-rule", "mock-rule-strict"] as const;
    const ruleNames = [
        "docusaurus/mock-rule",
        "docusaurus/mock-rule-strict",
    ] as const;
    const meta = {
        name: "stylelint-plugin-docusaurus",
        namespace: "docusaurus",
    } as const;
    const recommendedRules = {
        "docusaurus/mock-rule": true,
    } as const;
    const allRules = {
        "docusaurus/mock-rule": true,
        "docusaurus/mock-rule-strict": true,
    } as const;
    const rules = {
        "mock-rule": {
            ruleName: "docusaurus/mock-rule",
        },
        "mock-rule-strict": {
            ruleName: "docusaurus/mock-rule-strict",
        },
    } as const;
    const builtPluginCjs = Object.assign([...plugin], {
        configNames,
        configs: {
            all: {
                rules: allRules,
            },
            recommended: {
                rules: recommendedRules,
            },
        },
        meta,
        ruleIds,
        ruleNames,
        rules,
    });

    return {
        builtPluginCjs,
        configNames,
        configs: {
            all: {
                plugins: plugin,
                rules: allRules,
            },
            recommended: {
                plugins: plugin,
                rules: recommendedRules,
            },
        },
        meta,
        plugin,
        ruleIds,
        ruleNames,
        rules,
    };
}

describe("stylelint compatibility smoke script", () => {
    it("parses expected Stylelint major arguments and rejects invalid values", () => {
        expect.hasAssertions();

        expect(
            parseExpectedStylelintMajor(["--expect-stylelint-major=16"])
        ).toBe(16);
        expect(() =>
            parseExpectedStylelintMajor(["--expect-stylelint-major="])
        ).toThrow("Missing Stylelint major value");
        expect(() =>
            parseExpectedStylelintMajor(["--expect-stylelint-major=abc"])
        ).toThrow("Invalid Stylelint major value");
        expect(() =>
            parseExpectedStylelintMajor(["--expect-stylelint-major=16beta"])
        ).toThrow("Invalid Stylelint major value");
        expect(() =>
            parseExpectedStylelintMajor(["--expect-stylelint-major=16.0"])
        ).toThrow("Invalid Stylelint major value");
        expect(() =>
            parseExpectedStylelintMajor(["--expect-stylelint-major=0"])
        ).toThrow("Invalid Stylelint major value");
    });

    it("normalizes Stylelint runtimes from namespace and default-export module shapes", () => {
        expect.hasAssertions();

        const lint = vi.fn<
            () => Promise<{
                results: [];
            }>
        >(() => Promise.resolve({ results: [] }));

        expect(normalizeStylelintRuntime({ lint })).toStrictEqual({ lint });
        expect(normalizeStylelintRuntime({ default: { lint } })).toStrictEqual({
            lint,
        });
        expect(() => normalizeStylelintRuntime({ default: {} })).toThrow(
            "Unable to load a Stylelint runtime with lint()."
        );
    });

    it("runs all compatibility scenarios against the loaded Stylelint runtime", async () => {
        expect.hasAssertions();

        const codeFilenames: string[] = [];
        const lint = vi.fn<
            (input: Readonly<Parameters<StylelintLike["lint"]>[0]>) => Promise<{
                results: {
                    invalidOptionWarnings: [];
                    parseErrors: [];
                    warnings: [];
                }[];
            }>
        >((input) => {
            codeFilenames.push(input.codeFilename);

            return Promise.resolve({
                results: [
                    {
                        invalidOptionWarnings: [],
                        parseErrors: [],
                        warnings: [],
                    },
                ],
            });
        });
        const logger = {
            log: vi.fn<(...messages: readonly unknown[]) => void>(),
        };

        await runStylelintCompatSmoke({
            loadBuiltPluginSurfaceFn: () =>
                Promise.resolve(createMockBuiltPluginSurface()),
            loadStylelintFn: () =>
                Promise.resolve({ lint } satisfies StylelintLike),
            logger,
            stylelintRuntimeVersion: "16.22.0",
        });

        expect(lint).toHaveBeenCalledTimes(5);
        expect(codeFilenames).toStrictEqual([
            "Component.module.css",
            "Component.module.css",
            "Component.module.css",
            "src/css/custom.css",
            "src/css/custom.css",
        ]);
    });

    it("fails early when the installed Stylelint major does not match the requested runtime", async () => {
        expect.hasAssertions();

        const lint = vi.fn<
            () => Promise<{
                results: [];
            }>
        >(() => Promise.resolve({ results: [] }));

        await expect(
            runStylelintCompatSmoke({
                argv: ["--expect-stylelint-major=16"],
                loadBuiltPluginSurfaceFn: () =>
                    Promise.resolve(createMockBuiltPluginSurface()),
                loadStylelintFn: () =>
                    Promise.resolve({ lint } satisfies StylelintLike),
                logger: {
                    log: vi.fn<(...messages: readonly unknown[]) => void>(),
                },
                stylelintRuntimeVersion: "17.0.1",
            })
        ).rejects.toThrow("Expected Stylelint major 16, but detected 17.0.1.");
        expect(lint).not.toHaveBeenCalled();
    });

    it("converts missing build artifacts into an actionable build error", async () => {
        expect.hasAssertions();

        await expect(
            runStylelintCompatSmoke({
                loadBuiltPluginSurfaceFn: () =>
                    Promise.reject(
                        new Error("Cannot find module '/repo/dist/plugin.js'")
                    ),
                loadStylelintFn: () =>
                    Promise.resolve({
                        lint: () => Promise.resolve({ results: [] }),
                    }),
                logger: {
                    log: vi.fn<(...messages: readonly unknown[]) => void>(),
                },
                stylelintRuntimeVersion: "16.0.0",
            })
        ).rejects.toThrow(
            "Run `npm run build` before running the Stylelint compatibility smoke check."
        );
    });

    it("exposes a direct-execution guard so importing the script does not run it", () => {
        expect.hasAssertions();

        expect(
            isDirectExecution({
                argvEntry: "C:/repo/scripts/stylelint-compat-smoke.mjs",
                currentImportUrl:
                    "file:///C:/repo/scripts/stylelint-compat-smoke.mjs",
            })
        ).toBeTruthy();
        expect(
            isDirectExecution({
                argvEntry: "C:/repo/test/stylelint-compat-smoke.test.ts",
                currentImportUrl:
                    "file:///C:/repo/scripts/stylelint-compat-smoke.mjs",
            })
        ).toBeFalsy();
    });
});
