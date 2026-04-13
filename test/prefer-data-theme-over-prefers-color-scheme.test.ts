import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/prefer-data-theme-over-prefers-color-scheme", () => {
    it("allows data-theme selector scopes without prefers-color-scheme media queries", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-theme='dark'] .navbar {
                    background: black;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-over-prefers-color-scheme": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("ignores local component prefers-color-scheme usage because the rule only targets Docusaurus theme surfaces", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media (prefers-color-scheme: dark) {
                    .card {
                        color: plum;
                    }
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-over-prefers-color-scheme": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports Docusaurus theme token declarations inside prefers-color-scheme media queries", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media (prefers-color-scheme: dark) {
                    :root {
                        --ifm-color-primary: #4e89e8;
                    }
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-over-prefers-color-scheme": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("[data-theme='dark']");
        expect(result.warnings[0]?.text).toContain("--ifm-color-primary");
    });

    it("reports global Docusaurus theme surface selectors inside prefers-color-scheme media queries", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media screen and (prefers-color-scheme: dark) {
                    .navbar {
                        box-shadow: none;
                    }
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-over-prefers-color-scheme": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("[data-theme='dark']");
        expect(result.warnings[0]?.text).toContain(".navbar");
    });

    it("reports wrapped DocSearch runtime selectors inside prefers-color-scheme media queries", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media (prefers-color-scheme: dark) {
                    :global(.DocSearch-Button) {
                        border-color: rebeccapurple;
                    }
                }
            `,
            codeFilename: "src/components/Search/styles.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-over-prefers-color-scheme": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("DocSearch-Button");
    });
});
