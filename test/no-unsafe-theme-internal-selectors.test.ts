import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/no-unsafe-theme-internal-selectors", () => {
    it("allows unrelated attribute-selector fallbacks", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [class*='customCard'] {
                    border-radius: 8px;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unsafe-theme-internal-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports unsafe internal announcement bar fallback selectors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [class*='announcementBarContent'] {
                    max-inline-size: 60rem;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unsafe-theme-internal-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("announcementBarContent");
    });

    it("reports unsafe internal table-of-contents fallback selectors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [class^='tableOfContents'] {
                    inset-block-start: 4rem;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unsafe-theme-internal-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("tableOfContents");
    });

    it("reports unsafe internal selectors even when attribute operators contain extra whitespace", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [class *= "announcementBarContent"] {
                    max-inline-size: 60rem;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unsafe-theme-internal-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("announcementBarContent");
        expect(result.warnings[0]?.text).toContain(
            '[class *= "announcementBarContent"]'
        );
    });

    it("reports unsafe internal selectors even when they are wrapped in :global(...)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :global([class*='announcementBarContent']) {
                    max-inline-size: 60rem;
                }
            `,
            codeFilename: "src/components/AnnouncementBarOverrides.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unsafe-theme-internal-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("announcementBarContent");
        expect(result.warnings[0]?.text).toContain(
            "[class*='announcementBarContent']"
        );
    });
});
