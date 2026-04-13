import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/require-local-anchor-for-global-theme-overrides-in-css-modules", () => {
    it("allows explicit global theme selectors when they are anchored by a local class", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    .card :global(.navbar__link) {
                        text-decoration: underline;
                    }
                `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-local-anchor-for-global-theme-overrides-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows local component dark-mode selectors that are still anchored by a local class", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    [data-theme='dark'] .card {
                        color: white;
                    }
                `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-local-anchor-for-global-theme-overrides-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("does not duplicate the companion unwrapped-global-selector rule", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    .navbar {
                        background: black;
                    }
                `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-local-anchor-for-global-theme-overrides-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports wrapped global Docusaurus selectors without a local anchor", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    :global(.navbar) {
                        background: black;
                    }
                `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-local-anchor-for-global-theme-overrides-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(":global(.navbar)");
    });

    it("reports root data-theme selectors without a local anchor", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    [data-theme='dark'] {
                        color: white;
                    }
                `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-local-anchor-for-global-theme-overrides-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("[data-theme='dark']");
    });

    it("reports theme-token root scopes inside CSS Modules when they are not locally anchored", async () => {
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
                    "docusaurus/require-local-anchor-for-global-theme-overrides-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(":root");
    });

    it("ignores the same selectors in non-module global stylesheets", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                    [data-theme='dark'] {
                        color: white;
                    }
                `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-local-anchor-for-global-theme-overrides-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });
});
