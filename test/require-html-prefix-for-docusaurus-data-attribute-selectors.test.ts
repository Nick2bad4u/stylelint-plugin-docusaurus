import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/require-html-prefix-for-docusaurus-data-attribute-selectors", () => {
    it("allows html-prefixed root data attributes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                html[data-navbar='false'] .navbar {
                    display: none;
                }

                html[data-red-border] div#__docusaurus {
                    border: red solid thick;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-html-prefix-for-docusaurus-data-attribute-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows html-prefixed root data attributes wrapped in :is(...) when every relevant branch stays html-prefixed", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                html:is([data-navbar='false'], [data-red-border]) .navbar {
                    display: none;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-html-prefix-for-docusaurus-data-attribute-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows custom component data attributes that are not bare root selectors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .widget[data-mode='iframe'] .navbar {
                    display: none;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-html-prefix-for-docusaurus-data-attribute-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports bare root data attributes hidden inside :is(...) alternatives", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :is(.widget, [data-navbar='false']) .navbar {
                    display: none;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-html-prefix-for-docusaurus-data-attribute-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("data-navbar");
    });

    it("reports selectors that mix html-prefixed and bare root data-attribute alternatives", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :where(html[data-red-border], [data-red-border]) div#__docusaurus {
                    border: red solid thick;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-html-prefix-for-docusaurus-data-attribute-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("data-red-border");
    });

    it("reports :root data attributes because this rule requires an explicit html prefix", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :root[data-navbar='false'] .navbar {
                    display: none;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-html-prefix-for-docusaurus-data-attribute-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("html[data-navbar]");
    });

    it("reports bare navbar root data attributes without html", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-navbar='false'] .navbar {
                    display: none;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-html-prefix-for-docusaurus-data-attribute-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("html");
        expect(result.warnings[0]?.text).toContain("data-navbar");
    });

    it("reports bare __docusaurus root data attributes without html", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-red-border] div#__docusaurus {
                    border: red solid thick;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/require-html-prefix-for-docusaurus-data-attribute-selectors": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("data-red-border");
    });
});
