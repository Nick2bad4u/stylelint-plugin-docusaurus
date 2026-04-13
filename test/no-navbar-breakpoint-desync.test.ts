import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/no-navbar-breakpoint-desync", () => {
    it("allows the documented Docusaurus mobile breakpoint", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media (max-width: 996px) {
                    .navbar-sidebar {
                        transform: translateX(0);
                    }
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-navbar-breakpoint-desync": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows equivalent range-context breakpoints that preserve the documented cutoff", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media (width > 996px) {
                    .navbar-sidebar {
                        transform: translateX(0);
                    }
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-navbar-breakpoint-desync": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports custom breakpoints for mobile navbar/sidebar surfaces", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media (max-width: 1024px) {
                    .navbar-sidebar {
                        transform: translateX(0);
                    }
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-navbar-breakpoint-desync": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("1024px");
        expect(result.warnings[0]?.text).toContain("navbar/sidebar logic");
    });

    it("reports range-context comparisons that shift the documented breakpoint boundary", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media (width >= 996px) {
                    .navbar-sidebar {
                        transform: translateX(0);
                    }
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-navbar-breakpoint-desync": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("996px");
    });

    it("does not report descendant selectors that style children inside responsive navbar surfaces", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media (max-width: 1024px) {
                    .navbar-sidebar .menu__list {
                        padding: 1rem;
                    }
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-navbar-breakpoint-desync": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("still reports custom breakpoints when the responsive surface is targeted through :is(...)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media (max-width: 1024px) {
                    :is(.navbar-sidebar, .theme-layout-navbar-sidebar) {
                        transform: translateX(0);
                    }
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-navbar-breakpoint-desync": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            ":is(.navbar-sidebar, .theme-layout-navbar-sidebar)"
        );
    });

    it("ignores unrelated breakpoints on non-navbar surfaces", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media (max-width: 1024px) {
                    .heroBanner {
                        padding: 2rem;
                    }
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-navbar-breakpoint-desync": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });
});
