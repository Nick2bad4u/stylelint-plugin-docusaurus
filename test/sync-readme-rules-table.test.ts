import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it, vi } from "vitest";

import {
    generateReadmeRulesSectionFromRules,
    getReadmePath,
    isDirectExecution,
    loadBuiltRules,
    syncReadmeRulesTable,
} from "../scripts/sync-readme-rules-table.mjs";

describe("sync-readme-rules-table automation", () => {
    it("resolves README paths from the repository root instead of the current working directory", () => {
        expect.hasAssertions();

        expect(getReadmePath("C:/repo")).toBe("C:\\repo\\README.md");
    });

    it("loads built rules lazily through an injectable module loader", async () => {
        expect.hasAssertions();

        const builtRules = {
            "alpha-rule": {
                docs: {
                    description: "Alpha rule.",
                    recommended: true,
                    url: "https://example.test/docs/rules/alpha-rule",
                },
                meta: {
                    fixable: true,
                },
            },
        };

        await expect(
            loadBuiltRules({
                builtPluginPath: "C:/repo/dist/plugin.js",
                importModule: async () => ({
                    rules: builtRules,
                }),
            })
        ).resolves.toStrictEqual(builtRules);
    });

    it("rewrites the README rules section with sorted canonical rule rows", async () => {
        expect.hasAssertions();

        const writes: Array<{
            contents: string;
            encoding: string;
            filePath: string;
        }> = [];
        const result = await syncReadmeRulesTable({
            readFileFn: async () =>
                [
                    "# Repo",
                    "",
                    "## Rules",
                    "",
                    "stale table",
                    "",
                    "## Next",
                    "",
                    "tail",
                ].join("\n"),
            readmeFilePath: "C:/repo/README.md",
            rules: {
                "zeta-rule": {
                    docs: {
                        description: "Zeta rule.",
                        recommended: false,
                        url: "https://example.test/docs/rules/zeta-rule",
                    },
                    meta: {
                        fixable: false,
                    },
                },
                "alpha-rule": {
                    docs: {
                        description: "Alpha rule.",
                        recommended: true,
                        url: "https://example.test/docs/rules/alpha-rule",
                    },
                    meta: {
                        fixable: true,
                    },
                },
            },
            writeChanges: true,
            writeFileFn: async (filePath, contents, encoding) => {
                writes.push({
                    contents,
                    encoding,
                    filePath,
                });
            },
        });

        expect(result).toStrictEqual({
            changed: true,
            readmeFilePath: "C:/repo/README.md",
        });
        expect(writes).toHaveLength(1);
        expect(writes[0]?.encoding).toBe("utf8");
        expect(writes[0]?.contents).toContain(
            "| [`alpha-rule`](https://example.test/docs/rules/alpha-rule) | 🔧 | recommended, all | Alpha rule. |"
        );
        expect(writes[0]?.contents).toContain(
            "| [`zeta-rule`](https://example.test/docs/rules/zeta-rule) | — | all | Zeta rule. |"
        );
        expect(writes[0]?.contents).toContain("## Next");
    });

    it("escapes markdown table delimiters and line breaks in rule descriptions", () => {
        expect.hasAssertions();

        const generatedSection = generateReadmeRulesSectionFromRules({
            "alpha-rule": {
                docs: {
                    description: "Alpha uses A | B\\C\nand stays readable.",
                    recommended: true,
                    url: "https://example.test/docs/rules/alpha-rule",
                },
                meta: {
                    fixable: true,
                },
            },
        });

        expect(generatedSection).toContain(
            "| [`alpha-rule`](https://example.test/docs/rules/alpha-rule) | 🔧 | recommended, all | Alpha uses A \\| B\\\\C<br>and stays readable. |"
        );
    });

    it("reports synchronized READMEs without rewriting them", async () => {
        expect.hasAssertions();

        const generatedSection = generateReadmeRulesSectionFromRules({
            "alpha-rule": {
                docs: {
                    description: "Alpha rule.",
                    recommended: true,
                    url: "https://example.test/docs/rules/alpha-rule",
                },
                meta: {
                    fixable: true,
                },
            },
        });
        const writeSpy = vi.fn();
        const result = await syncReadmeRulesTable({
            readFileFn: async () =>
                [
                    "# Repo",
                    "",
                    generatedSection.trimEnd(),
                    "",
                    "## Next",
                    "",
                    "tail",
                ].join("\n"),
            readmeFilePath: "C:/repo/README.md",
            rules: {
                "alpha-rule": {
                    docs: {
                        description: "Alpha rule.",
                        recommended: true,
                        url: "https://example.test/docs/rules/alpha-rule",
                    },
                    meta: {
                        fixable: true,
                    },
                },
            },
            writeChanges: true,
            writeFileFn: writeSpy,
        });

        expect(result).toStrictEqual({
            changed: false,
            readmeFilePath: "C:/repo/README.md",
        });
        expect(writeSpy).not.toHaveBeenCalled();
    });

    it("keeps the package sync workflow build-backed and write-mode consistent", () => {
        expect.hasAssertions();

        const packageJson = JSON.parse(
            readFileSync(resolve("package.json"), "utf8")
        ) as {
            scripts?: Record<string, string>;
        };

        expect(packageJson.scripts?.["precommit"]).toBe(
            "npm run build && npm run sync:readme-rules-table:write && npm run sync:configs-rules-matrix:write"
        );
        expect(packageJson.scripts?.["sync:configs-rules-matrix:write"]).toBe(
            "node scripts/sync-configs-rules-matrix.mjs --write"
        );
    });

    it("exposes a direct-execution guard so imports do not run the CLI", () => {
        expect.hasAssertions();

        const scriptPath = resolve("scripts", "sync-readme-rules-table.mjs");
        const scriptUrl = pathToFileURL(scriptPath).href;

        expect(
            isDirectExecution({
                argvEntry: scriptPath,
                currentImportUrl: scriptUrl,
            })
        ).toBeTruthy();

        expect(
            isDirectExecution({
                argvEntry: resolve("test", "sync-readme-rules-table.test.ts"),
                currentImportUrl: scriptUrl,
            })
        ).toBeFalsy();
    });
});
