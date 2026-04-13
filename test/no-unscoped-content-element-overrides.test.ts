import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/no-unscoped-content-element-overrides", () => {
    it("allows stable Docusaurus content wrappers", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .theme-doc-markdown h2 {
                    margin-block-start: 2rem;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unscoped-content-element-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows component-local class anchors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .heroBanner h1 {
                    text-wrap: balance;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unscoped-content-element-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows stable Docusaurus content wrappers when they are authored through :global(...) in CSS Modules", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :global(.theme-doc-markdown) h2 {
                    margin-block-start: 2rem;
                }
            `,
            codeFilename: "src/components/Heading.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unscoped-content-element-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports bare content-element selectors that leak across the site", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                h1 {
                    margin-block-end: 0.5rem;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unscoped-content-element-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("theme-doc-markdown");
        expect(result.warnings[0]?.text).toContain('"h1"');
    });

    it("reports color-mode-only selectors that still target all content", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-theme='dark'] table {
                    border-color: white;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unscoped-content-element-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "\"[data-theme='dark'] table\""
        );
    });

    it("still reports content selectors when the only apparent wrapper is hidden inside :not(...)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :not(.theme-doc-markdown) h2 {
                    margin-block-start: 2rem;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unscoped-content-element-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            '":not(.theme-doc-markdown) h2"'
        );
    });
});
