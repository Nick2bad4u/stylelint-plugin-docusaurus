import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/no-subtree-data-theme-selectors", () => {
    it("allows root-scoped data-theme selectors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-theme='dark'] .navbar {
                    color: white;
                }

                html[data-theme='light'] .footer {
                    color: black;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-subtree-data-theme-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows equivalent root-scoped data-theme selectors in :is(...) and :root wrappers", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :is([data-theme='dark'], [data-theme='light']) .navbar {
                    color: white;
                }

                :root[data-theme='dark'] .footer {
                    color: black;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-subtree-data-theme-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports descendant [data-theme] selectors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .widget [data-theme='dark'] .navbar {
                    color: white;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-subtree-data-theme-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("html");
    });

    it("reports descendant data-theme usage even when the selector also starts from a valid root data-theme scope", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-theme='dark'] [data-theme='light'] .navbar {
                    color: white;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-subtree-data-theme-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("[data-theme]");
    });

    it("reports attribute usage on non-root elements", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .widget[data-theme='dark'] {
                    color: white;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-subtree-data-theme-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "\".widget[data-theme='dark']\""
        );
    });
});
