import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/prefer-infima-theme-tokens-over-structural-overrides", () => {
    it("allows token-driven global theme customization", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :root {
                    --ifm-navbar-background-color: #111827;
                }

                .navbar {
                    background-color: var(--ifm-navbar-background-color);
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-infima-theme-tokens-over-structural-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports hard-coded navbar background overrides", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar {
                    background-color: #111827;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-infima-theme-tokens-over-structural-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "--ifm-navbar-background-color"
        );
    });

    it("does not report descendant selectors that style other elements inside the navbar", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar .heroBanner {
                    background-color: #111827;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-infima-theme-tokens-over-structural-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports footer background overrides that should use a token", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .theme-layout-footer {
                    background: #111827;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-infima-theme-tokens-over-structural-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "--ifm-footer-background-color"
        );
    });

    it("does not treat URL text containing the token name as an actual token-driven override", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .theme-layout-footer {
                    background: url("/assets/--ifm-footer-background-color.svg");
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-infima-theme-tokens-over-structural-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "--ifm-footer-background-color"
        );
    });

    it("allows mixed-case var() calls that still reference the recommended token", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar {
                    background-color: VAR(--ifm-navbar-background-color);
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-infima-theme-tokens-over-structural-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });
});
