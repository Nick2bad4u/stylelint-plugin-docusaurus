import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/require-docsearch-root-scope-for-docsearch-token-overrides", () => {
    it("allows DocSearch token overrides on the DocSearch root", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    .DocSearch {
                        --docsearch-primary-color: #8ab4f8;
                    }
                `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-docsearch-root-scope-for-docsearch-token-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows color-mode-scoped DocSearch root token overrides", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    [data-theme='dark'] .DocSearch {
                        --docsearch-primary-color: #8ab4f8;
                    }
                `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-docsearch-root-scope-for-docsearch-token-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows CSS Modules overrides when the root scope is explicit through :global(.DocSearch)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    [data-theme='dark'] :global(.DocSearch) {
                        --docsearch-primary-color: #8ab4f8;
                    }
                `,
            codeFilename: "src/components/SearchOverrides.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-docsearch-root-scope-for-docsearch-token-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports root theme scopes that declare DocSearch tokens without the DocSearch root", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    [data-theme='dark'] {
                        --docsearch-primary-color: #8ab4f8;
                    }
                `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-docsearch-root-scope-for-docsearch-token-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(".DocSearch root scope");
        expect(result.warnings[0]?.text).toContain("[data-theme='dark']");
    });

    it("reports descendant DocSearch selectors such as .DocSearch-Button", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    .DocSearch-Button {
                        --docsearch-primary-color: #8ab4f8;
                    }
                `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-docsearch-root-scope-for-docsearch-token-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(".DocSearch-Button");
    });

    it("reports color-mode-scoped descendant DocSearch selectors too", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    [data-theme='dark'] .DocSearch-Button {
                        --docsearch-primary-color: #8ab4f8;
                    }
                `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-docsearch-root-scope-for-docsearch-token-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "[data-theme='dark'] .DocSearch-Button"
        );
    });

    it("still reports selectors when the only apparent DocSearch root is hidden inside :not(...)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    :not(.DocSearch) {
                        --docsearch-primary-color: #8ab4f8;
                    }
                `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-docsearch-root-scope-for-docsearch-token-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(":not(.DocSearch)");
    });
});
