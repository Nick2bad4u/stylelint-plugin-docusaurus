import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/no-direct-theme-token-consumption-in-css-modules", () => {
    it("allows aliasing a global token to a component-local custom property", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .card {
                    --card-link-color: var(--ifm-color-primary);
                    color: var(--card-link-color);
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-direct-theme-token-consumption-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows direct theme-token consumption outside CSS Modules", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .heroBanner {
                    color: var(--ifm-color-primary);
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-direct-theme-token-consumption-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports direct --ifm-* consumption in CSS Modules declarations", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .card {
                    color: var(--ifm-color-primary);
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-direct-theme-token-consumption-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "component-scoped custom property"
        );
        expect(result.warnings[0]?.text).toContain("--ifm-color-primary");
    });

    it("reports direct --docsearch-* consumption in CSS Modules declarations", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .search {
                    background: color-mix(in srgb, var(--docsearch-primary-color) 75%, white);
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-direct-theme-token-consumption-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("--docsearch-primary-color");
    });

    it("does not treat quoted text that merely mentions var(--ifm-...) as direct token consumption", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .card::before {
                    content: "var(--ifm-color-primary)";
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-direct-theme-token-consumption-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("also reports direct theme-token consumption in Less CSS Modules", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .card {
                    color: var(--ifm-color-primary);
                }
            `,
            codeFilename: "src/components/Card/styles.module.less",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-direct-theme-token-consumption-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("--ifm-color-primary");
    });
});
