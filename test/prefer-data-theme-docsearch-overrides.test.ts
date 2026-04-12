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
});
