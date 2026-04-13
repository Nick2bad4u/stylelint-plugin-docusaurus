import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/no-unstable-docusaurus-generated-class-selectors", () => {
    it("allows stable theme and Infima class selectors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .navbar__brand,
                .theme-doc-markdown {
                    color: var(--ifm-color-primary);
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unstable-docusaurus-generated-class-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows resilient attribute selectors that ignore the hash suffix", async () => {
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
                    "docusaurus/no-unstable-docusaurus-generated-class-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("does not confuse quoted attribute values that merely mention a generated class name", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-target='.codeBlockContainer_RIuc'] {
                    border-radius: 8px;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unstable-docusaurus-generated-class-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports exact generated Docusaurus class selectors in global CSS", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .codeBlockContainer_RIuc {
                    border-radius: 8px;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unstable-docusaurus-generated-class-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(".codeBlockContainer_RIuc");
        expect(result.warnings[0]?.text).toContain(
            "[class*='codeBlockContainer']"
        );
    });

    it("reports generated announcement bar selectors with hash-like suffixes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .announcementBarContent_a1B2 {
                    padding: 1rem;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unstable-docusaurus-generated-class-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
    });

    it("reports generated class selectors nested inside pseudo-function selectors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :is(.codeBlockContainer_RIuc, .theme-doc-markdown) {
                    border-radius: 8px;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unstable-docusaurus-generated-class-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(".codeBlockContainer_RIuc");
    });

    it("ignores CSS module source files", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .codeBlockContainer_RIuc {
                    border-radius: 8px;
                }
            `,
            codeFilename: "src/theme/CodeBlock/styles.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unstable-docusaurus-generated-class-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("ignores Less CSS module source files", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .codeBlockContainer_RIuc {
                    border-radius: 8px;
                }
            `,
            codeFilename: "src/theme/CodeBlock/styles.module.less",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unstable-docusaurus-generated-class-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("does not confuse snake_case classes with generated hash suffixes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .search_label {
                    color: white;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-unstable-docusaurus-generated-class-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });
});
