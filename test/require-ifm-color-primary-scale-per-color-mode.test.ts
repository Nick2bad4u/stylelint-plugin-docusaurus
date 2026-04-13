import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/require-ifm-color-primary-scale-per-color-mode", () => {
    it("allows matching primary-scale customization in light and dark modes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :root {
                    --ifm-color-primary: #4f46e5;
                }

                [data-theme='dark'] {
                    --ifm-color-primary: #818cf8;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-ifm-color-primary-scale-per-color-mode": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows equivalent light and dark root scopes wrapped in :is(...) and :where(...)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :is(:root, html[data-theme='light']) {
                    --ifm-color-primary: #4f46e5;
                }

                :where([data-theme='dark'], html[data-theme='dark']) {
                    --ifm-color-primary: #818cf8;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-ifm-color-primary-scale-per-color-mode": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports light-only primary-scale customization", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :root {
                    --ifm-color-primary: #4f46e5;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-ifm-color-primary-scale-per-color-mode": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("[data-theme='dark']");
    });

    it("reports dark-only primary-scale customization", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-theme='dark'] {
                    --ifm-color-primary: #818cf8;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-ifm-color-primary-scale-per-color-mode": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            ":root or [data-theme='light']"
        );
    });

    it("allows a legacy dark scope to pair with a light root scale while teams migrate away from theme-dark", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :root {
                    --ifm-color-primary: #4f46e5;
                }

                .theme-dark {
                    --ifm-color-primary: #818cf8;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-ifm-color-primary-scale-per-color-mode": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports dark-only primary-scale customization when it still uses the legacy theme-dark scope", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .theme-dark {
                    --ifm-color-primary: #818cf8;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-ifm-color-primary-scale-per-color-mode": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            ":root or [data-theme='light']"
        );
    });
});
