import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/no-mobile-navbar-stacking-context-traps", () => {
    it("allows ordinary navbar styling that does not create a containing block", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar {
                    background: var(--ifm-navbar-background-color);
                    box-shadow: var(--ifm-global-shadow-lw);
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-mobile-navbar-stacking-context-traps": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows safe reset values on navbar selectors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar {
                    transform: none;
                    filter: none;
                    perspective: none;
                    contain: none;
                    will-change: opacity;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-mobile-navbar-stacking-context-traps": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports transform on the mobile navbar path", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar {
                    transform: translateZ(0);
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-mobile-navbar-stacking-context-traps": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "containing block or stacking-context trap"
        );
        expect(result.warnings[0]?.text).toContain("@media (min-width: 997px)");
    });

    it("reports contain on the fixed navbar selector", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar--fixed-top {
                    contain: content;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-mobile-navbar-stacking-context-traps": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("contain: content");
    });

    it("reports will-change when it hints a risky transform-like property", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .theme-layout-navbar {
                    will-change: transform, opacity;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-mobile-navbar-stacking-context-traps": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("will-change");
    });

    it("does not report descendant selectors that style children inside the navbar rather than the navbar element itself", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar .heroBanner {
                    transform: translateZ(0);
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-mobile-navbar-stacking-context-traps": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("still reports selectors wrapped in :is(...) when they target the navbar element itself", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :is(.navbar, .theme-layout-navbar) {
                    transform: translateZ(0);
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-mobile-navbar-stacking-context-traps": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            ":is(.navbar, .theme-layout-navbar)"
        );
    });

    it("allows risky properties when they are explicitly desktop-only", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media (min-width: 997px) {
                    .navbar {
                        transform: translateZ(0);
                        contain: content;
                    }
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-mobile-navbar-stacking-context-traps": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows range-context desktop guards such as width greater than 996px", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media (996px < width) {
                    .theme-layout-navbar {
                        transform: translateZ(0);
                        contain: content;
                    }
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-mobile-navbar-stacking-context-traps": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("still reports risky navbar properties when a negated desktop guard applies on mobile", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media not all and (min-width: 997px) {
                    .navbar {
                        transform: translateZ(0);
                    }
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-mobile-navbar-stacking-context-traps": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "containing block or stacking-context trap"
        );
    });
});
