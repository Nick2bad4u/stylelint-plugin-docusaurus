import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/prefer-docsearch-theme-tokens-over-structural-overrides", () => {
    it("allows token-driven DocSearch customization", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    [data-theme='dark'] .DocSearch {
                        --docsearch-searchbox-background: rgb(17 24 39 / 80%);
                    }

                    .DocSearch-Button {
                        background-color: var(--docsearch-searchbox-background);
                    }
                `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-docsearch-theme-tokens-over-structural-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports hard-coded DocSearch button backgrounds", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    .DocSearch-Button {
                        background-color: rgb(17 24 39 / 80%);
                    }
                `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-docsearch-theme-tokens-over-structural-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "--docsearch-searchbox-background"
        );
    });

    it("reports hard-coded DocSearch modal backgrounds", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    .DocSearch-Modal {
                        background: #111827;
                    }
                `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-docsearch-theme-tokens-over-structural-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "--docsearch-modal-background"
        );
    });

    it("does not report descendant selectors that style a local element inside DocSearch", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    .DocSearch-Modal .searchSurface {
                        background: #111827;
                    }
                `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-docsearch-theme-tokens-over-structural-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows mixed-case var() references to the recommended DocSearch token", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    .DocSearch-Footer {
                        background-color: VAR(--docsearch-footer-background);
                    }
                `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-docsearch-theme-tokens-over-structural-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports global-wrapped DocSearch structural overrides in CSS Modules too", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    :global(.DocSearch-Footer) {
                        background-color: #111827;
                    }
                `,
            codeFilename: "src/components/Search/styles.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-docsearch-theme-tokens-over-structural-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "--docsearch-footer-background"
        );
    });
});
