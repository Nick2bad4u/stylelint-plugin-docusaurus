import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/require-ifm-color-primary-scale", () => {
    it("allows the full recommended Infima primary scale", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :root {
                    --ifm-color-primary: #4e89e8;
                    --ifm-color-primary-dark: #3576d4;
                    --ifm-color-primary-darker: #2c68be;
                    --ifm-color-primary-darkest: #234f92;
                    --ifm-color-primary-light: #6d9ef0;
                    --ifm-color-primary-lighter: #89b1f4;
                    --ifm-color-primary-lightest: #b8d0fa;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-ifm-color-primary-scale": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports partial primary-scale overrides inside wrapped root theme scopes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :is(:root, html[data-theme='light']) {
                    --ifm-color-primary: #4e89e8;
                    --ifm-color-primary-dark: #3576d4;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-ifm-color-primary-scale": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "full recommended primary scale"
        );
        expect(result.warnings[0]?.text).toContain(
            "--ifm-color-primary-darker"
        );
    });

    it("allows full primary-scale overrides inside global CSS Modules root scopes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :global(:root) {
                    --ifm-color-primary: #4e89e8;
                    --ifm-color-primary-dark: #3576d4;
                    --ifm-color-primary-darker: #2c68be;
                    --ifm-color-primary-darkest: #234f92;
                    --ifm-color-primary-light: #6d9ef0;
                    --ifm-color-primary-lighter: #89b1f4;
                    --ifm-color-primary-lightest: #b8d0fa;
                }
            `,
            codeFilename: "src/components/ThemeTokens.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-ifm-color-primary-scale": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports partial Infima primary scale overrides", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :root {
                    --ifm-color-primary: #4e89e8;
                    --ifm-color-primary-dark: #3576d4;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-ifm-color-primary-scale": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "full recommended primary scale"
        );
        expect(result.warnings[0]?.text).toContain(
            "--ifm-color-primary-darker"
        );
    });

    it("ignores scopes that do not override the primary color family", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :root {
                    --ifm-code-font-size: 95%;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-ifm-color-primary-scale": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });
});
