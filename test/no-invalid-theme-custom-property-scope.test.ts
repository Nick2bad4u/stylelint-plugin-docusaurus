import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/no-invalid-theme-custom-property-scope", () => {
    it("allows Docusaurus theme tokens in :root", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :root {
                    --ifm-color-primary: #4e89e8;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-invalid-theme-custom-property-scope": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows Docusaurus theme tokens in dark mode scopes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-theme='dark'] {
                    --docsearch-primary-color: #8ab4f8;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-invalid-theme-custom-property-scope": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows wrapped root theme scopes such as :where(:root)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :where(:root) {
                    --ifm-color-primary: #4e89e8;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-invalid-theme-custom-property-scope": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows DocSearch token overrides scoped to the DocSearch UI", async () => {
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
                    "docusaurus/no-invalid-theme-custom-property-scope": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows DocSearch token overrides scoped through :global(.DocSearch)", async () => {
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
                    "docusaurus/no-invalid-theme-custom-property-scope": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows DocSearch token overrides when the root theme scope uses :is(...)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :is([data-theme='dark'], html[data-theme='dark']) .DocSearch {
                    --docsearch-primary-color: #8ab4f8;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-invalid-theme-custom-property-scope": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports Docusaurus theme tokens declared in component scopes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .heroBanner {
                    --ifm-color-primary: #4e89e8;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-invalid-theme-custom-property-scope": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "global Docusaurus theme scopes"
        );
    });

    it("still reports selectors that append component targets after a wrapped root scope", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :is(:root, html[data-theme='light']) .heroBanner {
                    --ifm-color-primary: #4e89e8;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-invalid-theme-custom-property-scope": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            ":is(:root, html[data-theme='light']) .heroBanner"
        );
    });

    it("does not treat similarly named classes that only contain DocSearch as a substring as valid token scopes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .DocSearchButton {
                    --docsearch-primary-color: #8ab4f8;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-invalid-theme-custom-property-scope": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(".DocSearchButton");
    });

    it("still reports DocSearch token declarations when the only apparent DocSearch root is hidden inside :not(...)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-theme='dark'] :not(.DocSearch) {
                    --docsearch-primary-color: #8ab4f8;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-invalid-theme-custom-property-scope": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(":not(.DocSearch)");
    });
});
