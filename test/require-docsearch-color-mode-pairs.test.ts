import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/require-docsearch-color-mode-pairs", () => {
    it("allows paired light and dark DocSearch token overrides", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-theme='light'] .DocSearch {
                    --docsearch-primary-color: #4f46e5;
                }

                [data-theme='dark'] .DocSearch {
                    --docsearch-primary-color: #818cf8;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-docsearch-color-mode-pairs": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows paired DocSearch overrides when the root color-mode scope is wrapped in :is(...)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :is([data-theme='light'], html[data-theme='light']) .DocSearch {
                    --docsearch-primary-color: #4f46e5;
                }

                :where([data-theme='dark'], html[data-theme='dark']) .DocSearch {
                    --docsearch-primary-color: #818cf8;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-docsearch-color-mode-pairs": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports single-mode DocSearch overrides when the DocSearch root is wrapped in :global(...)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-theme='light'] :global(.DocSearch) {
                    --docsearch-primary-color: #4f46e5;
                }
            `,
            codeFilename: "src/components/SearchOverrides.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-docsearch-color-mode-pairs": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "[data-theme='dark'] .DocSearch"
        );
    });

    it("reports light-only DocSearch token overrides", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-theme='light'] .DocSearch {
                    --docsearch-primary-color: #4f46e5;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-docsearch-color-mode-pairs": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "[data-theme='dark'] .DocSearch"
        );
    });

    it("ignores unscoped DocSearch overrides because the rule only checks explicit color-mode pairs", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .DocSearch {
                    --docsearch-primary-color: #4f46e5;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-docsearch-color-mode-pairs": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("does not treat similarly named DocSearch-like classes as the documented DocSearch root scope", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-theme='light'] .DocSearchButton {
                    --docsearch-primary-color: #4f46e5;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-docsearch-color-mode-pairs": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("ignores single-mode blocks when .DocSearch only appears inside :not(...) instead of the selected root scope", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-theme='light'] :not(.DocSearch) {
                    --docsearch-primary-color: #4f46e5;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-docsearch-color-mode-pairs": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports single-mode DocSearch overrides that still use the legacy .theme-dark root scope", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .theme-dark .DocSearch {
                    --docsearch-primary-color: #818cf8;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-docsearch-color-mode-pairs": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "[data-theme='light'] .DocSearch"
        );
    });

    it("reports global-wrapped single-mode DocSearch overrides in CSS Modules", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :global(.theme-dark) :global(.DocSearch) {
                    --docsearch-primary-color: #818cf8;
                }
            `,
            codeFilename: "src/components/SearchOverrides.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-docsearch-color-mode-pairs": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "[data-theme='light'] .DocSearch"
        );
    });
});
