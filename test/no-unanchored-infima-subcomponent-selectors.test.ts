import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/no-unanchored-infima-subcomponent-selectors", () => {
    it("allows stable Docusaurus wrapper anchors around Infima selectors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .theme-doc-sidebar-menu .menu__link {
                    font-weight: 700;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unanchored-infima-subcomponent-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows curated Infima container anchors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar .navbar__link {
                    font-weight: 700;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unanchored-infima-subcomponent-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports naked Infima selector usage", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .menu__link {
                    font-weight: 700;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unanchored-infima-subcomponent-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(".menu__link");
    });

    it("reports chained internal selectors that still lack a stable anchor", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .dropdown__menu .dropdown__link {
                    color: white;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unanchored-infima-subcomponent-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(".dropdown__menu");
    });

    it("ignores Less CSS Modules files just like other CSS Module stylesheets", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .menu__link {
                    font-weight: 700;
                }
            `,
            codeFilename: "src/components/Menu/styles.module.less",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unanchored-infima-subcomponent-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("still reports Infima selectors when the only apparent anchor is hidden inside :not(...)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :not(.navbar) .menu__link {
                    font-weight: 700;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unanchored-infima-subcomponent-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(".menu__link");
    });
});
