import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import {
    generateRulesSectionFromConfig,
    getConfigDocPath,
    isDirectExecution,
    loadBuiltPluginMetadata,
    normalizeConfigNames,
    parseCliArgs,
    resolveConfigDocTargets,
    syncConfigDocs,
} from "../scripts/sync-configs-rules-matrix.mjs";

describe("sync-configs-rules-matrix automation", () => {
    it("preserves exported config name order instead of hardcoding only recommended/all", () => {
        expect.hasAssertions();

        expect(
            normalizeConfigNames(
                [
                    "recommended",
                    "strict",
                    "recommended",
                    "all",
                ],
                {
                    all: {},
                    recommended: {},
                    strict: {},
                }
            )
        ).toStrictEqual([
            "recommended",
            "strict",
            "all",
        ]);
    });

    it("falls back to sorted config object keys when configNames metadata is absent", () => {
        expect.hasAssertions();

        expect(
            normalizeConfigNames(undefined, { all: {}, strict: {} })
        ).toStrictEqual(["all", "strict"]);
    });

    it("fails when an exported config does not have a matching docs file", async () => {
        expect.hasAssertions();

        await expect(
            resolveConfigDocTargets({
                configNames: ["recommended", "strict"],
                hasDocFile: (filePath) =>
                    Promise.resolve(filePath.endsWith("recommended.md")),
                repositoryRoot: "C:/repo",
            })
        ).rejects.toThrow(
            String.raw`Missing config documentation file for exported config 'strict': C:\repo\docs\rules\configs\strict.md`
        );
    });

    it("generates rules sections for arbitrary future config names", () => {
        expect.hasAssertions();

        const generatedSection = generateRulesSectionFromConfig({
            configName: "strict",
            configs: {
                strict: {
                    rules: {
                        "docusaurus/strict-rule": true,
                    },
                },
            },
            rules: {
                "strict-rule": {
                    docs: {
                        description: "Strict-only rule.",
                        recommended: false,
                        url: "https://example.test/docs/rules/strict-rule",
                    },
                    meta: {
                        fixable: true,
                    },
                },
            },
        });

        expect(generatedSection).toContain("## Rules in this config");
        expect(generatedSection).toContain(
            "[`strict-rule`](https://example.test/docs/rules/strict-rule)"
        );
        expect(generatedSection).toContain("🔧");
        expect(getConfigDocPath("strict", "C:/repo")).toBe(
            String.raw`C:\repo\docs\rules\configs\strict.md`
        );
    });

    it("escapes markdown table delimiters and line breaks in config rule descriptions", () => {
        expect.hasAssertions();

        const generatedSection = generateRulesSectionFromConfig({
            configName: "strict",
            configs: {
                strict: {
                    rules: {
                        "docusaurus/strict-rule": true,
                    },
                },
            },
            rules: {
                "strict-rule": {
                    docs: {
                        description:
                            "Strict rule handles A | B\\C\nwithout breaking docs.",
                        recommended: false,
                        url: "https://example.test/docs/rules/strict-rule",
                    },
                    meta: {
                        fixable: true,
                    },
                },
            },
        });

        expect(generatedSection).toContain(
            "| [`strict-rule`](https://example.test/docs/rules/strict-rule) | 🔧 | Strict rule handles A \\| B\\\\C<br>without breaking docs. |"
        );
    });

    it("escapes asterisks and opening brackets in config rule descriptions", () => {
        expect.hasAssertions();

        const generatedSection = generateRulesSectionFromConfig({
            configName: "strict",
            configs: {
                strict: {
                    rules: {
                        "docusaurus/strict-rule": true,
                    },
                },
            },
            rules: {
                "strict-rule": {
                    docs: {
                        description: "Disallow --ifm-* and [data-theme] usage.",
                        recommended: false,
                        url: "https://example.test/docs/rules/strict-rule",
                    },
                    meta: {
                        fixable: false,
                    },
                },
            },
        });

        expect(generatedSection).toContain(
            "| [`strict-rule`](https://example.test/docs/rules/strict-rule) | — | Disallow --ifm-\\* and \\[data-theme] usage. |"
        );
    });

    it("parses write-mode CLI args and rejects unknown flags", () => {
        expect.hasAssertions();

        expect(parseCliArgs(["--write"])).toStrictEqual({
            writeChanges: true,
        });
        expect(() => parseCliArgs(["--wat"])).toThrow(
            "Unknown argument: --wat"
        );
    });

    it("loads built plugin metadata lazily through an injectable module loader", async () => {
        expect.hasAssertions();

        await expect(
            loadBuiltPluginMetadata({
                builtPluginPath: "C:/repo/dist/plugin.js",
                importModule: () =>
                    Promise.resolve({
                        configNames: ["strict"],
                        configs: {
                            strict: {
                                rules: {
                                    "docusaurus/strict-rule": true,
                                },
                            },
                        },
                        rules: {
                            "strict-rule": {
                                docs: {
                                    description: "Strict-only rule.",
                                    recommended: false,
                                    url: "https://example.test/docs/rules/strict-rule",
                                },
                                meta: {
                                    fixable: true,
                                },
                            },
                        },
                    }),
            })
        ).resolves.toStrictEqual({
            configNames: ["strict"],
            configs: {
                strict: {
                    rules: {
                        "docusaurus/strict-rule": true,
                    },
                },
            },
            rules: {
                "strict-rule": {
                    docs: {
                        description: "Strict-only rule.",
                        recommended: false,
                        url: "https://example.test/docs/rules/strict-rule",
                    },
                    meta: {
                        fixable: true,
                    },
                },
            },
        });
    });

    it("rewrites stale config doc rule tables from canonical plugin metadata", async () => {
        expect.hasAssertions();

        const writes: {
            contents: string;
            encoding: string;
            filePath: string;
        }[] = [];
        const result = await syncConfigDocs({
            hasDocFile: () => Promise.resolve(true),
            metadata: {
                configNames: ["strict"],
                configs: {
                    strict: {
                        rules: {
                            "docusaurus/strict-rule": true,
                        },
                    },
                },
                rules: {
                    "strict-rule": {
                        docs: {
                            description: "Strict-only rule.",
                            recommended: false,
                            url: "https://example.test/docs/rules/strict-rule",
                        },
                        meta: {
                            fixable: true,
                        },
                    },
                },
            },
            readFileFn: () =>
                Promise.resolve(
                    [
                        "# strict",
                        "",
                        "## Rules in this config",
                        "",
                        "stale table",
                    ].join("\n")
                ),
            repositoryRootPath: "C:/repo",
            writeChanges: true,
            writeFileFn: (filePath, contents, encoding) => {
                writes.push({
                    contents,
                    encoding,
                    filePath,
                });

                return Promise.resolve();
            },
        });

        expect(result).toStrictEqual({
            changed: true,
            updatedFilePaths: [
                String.raw`C:\repo\docs\rules\configs\strict.md`,
            ],
        });
        expect(writes).toHaveLength(1);
        expect(writes[0]?.encoding).toBe("utf8");
        expect(writes[0]?.contents).toContain("## Rules in this config");
        expect(writes[0]?.contents).toContain(
            "| [`strict-rule`](https://example.test/docs/rules/strict-rule) | 🔧 | Strict-only rule. |"
        );
    });

    it("fails check mode with an actionable sync command when config docs drift", async () => {
        expect.hasAssertions();

        await expect(
            syncConfigDocs({
                hasDocFile: () => Promise.resolve(true),
                metadata: {
                    configNames: ["strict"],
                    configs: {
                        strict: {
                            rules: {
                                "docusaurus/strict-rule": true,
                            },
                        },
                    },
                    rules: {
                        "strict-rule": {
                            docs: {
                                description: "Strict-only rule.",
                                recommended: false,
                                url: "https://example.test/docs/rules/strict-rule",
                            },
                        },
                    },
                },
                readFileFn: () =>
                    Promise.resolve(
                        "# strict\n\n## Rules in this config\n\nstale table\n"
                    ),
                repositoryRootPath: "C:/repo",
                writeChanges: false,
            })
        ).rejects.toThrow(
            "Config documentation tables are out of sync. Run: node scripts/sync-configs-rules-matrix.mjs --write"
        );
    });

    it("exposes a direct-execution guard so imports do not run the CLI", () => {
        expect.hasAssertions();

        const scriptPath = path.resolve(
            "scripts",
            "sync-configs-rules-matrix.mjs"
        );
        const scriptUrl = pathToFileURL(scriptPath).href;

        expect(
            isDirectExecution({
                argvEntry: scriptPath,
                currentImportUrl: scriptUrl,
            })
        ).toBeTruthy();
        expect(
            isDirectExecution({
                argvEntry: path.resolve(
                    "test",
                    "sync-configs-rules-matrix.test.ts"
                ),
                currentImportUrl: scriptUrl,
            })
        ).toBeFalsy();
    });
});
