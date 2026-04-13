import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/prefer-stable-docusaurus-theme-class-names", () => {
    it("allows documented stable Docusaurus theme class names", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .theme-code-block,
                .theme-announcement-bar {
                    border-radius: 8px;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-stable-docusaurus-theme-class-names": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows attribute selectors for unrelated class fragments", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [class*='announcementBarContent'] {
                    max-width: 60rem;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-stable-docusaurus-theme-class-names": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports code block attribute selectors when a stable theme class exists", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [class*='codeBlockContainer'] {
                    border-radius: 8px;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-stable-docusaurus-theme-class-names": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(".theme-code-block");
        expect(result.warnings[0]?.text).toContain(
            "[class*='codeBlockContainer']"
        );
    });

    it("reports announcement bar prefix selectors when a stable theme class exists", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [class^='announcementBar'] {
                    padding-block: 1rem;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-stable-docusaurus-theme-class-names": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(".theme-announcement-bar");
    });

    it("reports stable-theme opportunities even when the attribute selector uses spacing around the operator", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [class ^= "announcementBar"] {
                    padding-block: 1rem;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-stable-docusaurus-theme-class-names": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(".theme-announcement-bar");
        expect(result.warnings[0]?.text).toContain(
            '[class ^= "announcementBar"]'
        );
    });

    it("reports mobile toc attribute selectors in favor of theme-doc-toc-mobile", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [class*="tocMobile"] {
                    margin-top: 1rem;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-stable-docusaurus-theme-class-names": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(".theme-doc-toc-mobile");
    });

    it("reports brittle stable-theme attribute selectors even when they are wrapped in :global(...)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :global([class*='codeBlockContainer']) {
                    border-radius: 8px;
                }
            `,
            codeFilename: "src/components/CodeBlockOverrides.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-stable-docusaurus-theme-class-names": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(".theme-code-block");
        expect(result.warnings[0]?.text).toContain(
            "[class*='codeBlockContainer']"
        );
    });
});
