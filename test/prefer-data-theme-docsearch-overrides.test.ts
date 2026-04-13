import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/prefer-data-theme-docsearch-overrides", () => {
    it("allows DocSearch overrides scoped by site color mode", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-theme='dark'] .DocSearch-Button {
                    color: white;
                    background: rgb(20 20 20 / 80%);
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-docsearch-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows non-DocSearch navbar style overrides", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar--dark .searchLabel {
                    color: white;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-docsearch-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports .navbar--dark DocSearch button overrides without data-theme scope", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar--dark .DocSearch-Button {
                    color: white;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-docsearch-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("[data-theme='dark']");
        expect(result.warnings[0]?.text).toContain(
            ".navbar--dark .DocSearch-Button"
        );
    });

    it("reports nested DocSearch modal overrides keyed only from .navbar--dark", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar--dark .DocSearch-Modal .DocSearch-SearchBar {
                    background: #111;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-docsearch-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("DocSearch styles");
    });

    it("allows selectors that combine .navbar--dark with an explicit data-theme scope", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-theme='light'] .navbar--dark .DocSearch-Button {
                    color: black;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-docsearch-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports selectors wrapped in :is(...) when they still rely on .navbar--dark as a color-mode proxy", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :is(.navbar--dark, .theme-layout-navbar) .DocSearch-Button {
                    color: white;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-docsearch-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            ":is(.navbar--dark, .theme-layout-navbar) .DocSearch-Button"
        );
    });

    it("reports :global(...) DocSearch overrides that still rely on .navbar--dark without data-theme scope", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :global(.navbar--dark) :global(.DocSearch-Button) {
                    color: white;
                }
            `,
            codeFilename: "src/components/SearchOverrides.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-docsearch-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            ":global(.navbar--dark) :global(.DocSearch-Button)"
        );
    });

    it("allows :global(...) DocSearch overrides when an explicit data-theme scope is also global", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :global([data-theme='dark']) :global(.navbar--dark) :global(.DocSearch-Button) {
                    color: white;
                }
            `,
            codeFilename: "src/components/SearchOverrides.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-docsearch-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("does not report similarly named navbar and DocSearch classes that only contain the target tokens as substrings", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar--darkness .DocSearchButton {
                    color: white;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-docsearch-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("does not report selectors when .navbar--dark only appears inside :not(...)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :not(.navbar--dark) .DocSearch-Button {
                    color: white;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-docsearch-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("still reports selectors when the only apparent data-theme scope is hidden inside :not(...)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :not([data-theme='dark']) .navbar--dark .DocSearch-Button {
                    color: white;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-docsearch-overrides": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            ":not([data-theme='dark']) .navbar--dark .DocSearch-Button"
        );
    });
});
