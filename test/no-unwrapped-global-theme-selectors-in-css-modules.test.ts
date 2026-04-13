import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/no-unwrapped-global-theme-selectors-in-css-modules", () => {
    it("allows purely local CSS Module selectors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .heroBanner {
                    color: white;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unwrapped-global-theme-selectors-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows Docusaurus theme selectors wrapped with :global(...)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :global(.theme-doc-sidebar-menu) :global(.menu__link) {
                    color: white;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unwrapped-global-theme-selectors-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports unwrapped runtime theme classes in CSS Modules", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .theme-doc-sidebar-menu .menu__link {
                    color: white;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unwrapped-global-theme-selectors-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(":global(...)");
        expect(result.warnings[0]?.text).toContain(".theme-doc-sidebar-menu");
    });

    it("also reports unwrapped runtime theme classes in Less CSS Modules", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .theme-doc-sidebar-menu .menu__link {
                    color: white;
                }
            `,
            codeFilename: "src/theme/Sidebar/styles.module.less",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unwrapped-global-theme-selectors-in-css-modules": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(".theme-doc-sidebar-menu");
    });
});
