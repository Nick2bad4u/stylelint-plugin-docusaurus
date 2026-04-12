import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/no-mobile-navbar-backdrop-filter", () => {
    it("allows navbar styles that do not use backdrop filters", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar {
                    background: rgb(20 20 20 / 70%);
                    border-bottom: 1px solid rgb(255 255 255 / 12%);
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-mobile-navbar-backdrop-filter": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports backdrop-filter on the Docusaurus navbar", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar {
                    backdrop-filter: blur(16px);
                    background: rgb(20 20 20 / 70%);
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-mobile-navbar-backdrop-filter": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("mobile sidebar");
        expect(result.warnings[0]?.text).toContain("@media (min-width: 997px)");
    });

    it("reports vendor-prefixed backdrop-filter declarations on navbar modifiers", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar--fixed-top {
                    -webkit-backdrop-filter: blur(20px);
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-mobile-navbar-backdrop-filter": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("-webkit-backdrop-filter");
    });

    it("allows desktop-only navbar blur that stays above the mobile breakpoint", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media (min-width: 997px) {
                    nav.navbar.navbar--fixed-top {
                        backdrop-filter: blur(16px);
                    }
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-mobile-navbar-backdrop-filter": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows mobile reset selectors and non-navbar class names", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar-sidebar--show {
                    backdrop-filter: none;
                }

                .navbar-shell {
                    backdrop-filter: blur(12px);
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-mobile-navbar-backdrop-filter": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });
});
