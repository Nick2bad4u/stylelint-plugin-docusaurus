import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/no-docusaurus-layer-name-collisions", () => {
    it("allows app-specific layer names", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @layer app.components {
                    .heroBanner {
                        color: white;
                    }
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-docusaurus-layer-name-collisions": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports direct collisions with reserved Docusaurus layer names", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @layer docusaurus.infima {
                    .heroBanner {
                        color: white;
                    }
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-docusaurus-layer-name-collisions": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("docusaurus.infima");
    });

    it("reports import-layer collisions with the reserved Docusaurus prefix", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @import url('./theme.css') layer(docusaurus.widgets);
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-docusaurus-layer-name-collisions": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("docusaurus.widgets");
    });

    it("reports escaped declared layer names that still resolve to reserved Docusaurus layers", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: String.raw`
                @layer docusaurus\2e infima {
                    .heroBanner {
                        color: white;
                    }
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-docusaurus-layer-name-collisions": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("docusaurus.infima");
    });

    it("reports escaped import layer() syntax that still targets reserved Docusaurus layers", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: String.raw`
                @import url('./theme.css') \6c ayer(docusaurus\2e widgets);
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-docusaurus-layer-name-collisions": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("docusaurus.widgets");
    });

    it("does not misread layer text inside import URLs as an actual layer() target", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @import url('https://cdn.example.com/layer(docusaurus.infima).css');
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-docusaurus-layer-name-collisions": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("does not misread nested supports() selector text as an import layer() target", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @import url('./theme.css') supports(selector([data-icon='layer(docusaurus.infima)'])) screen;
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-docusaurus-layer-name-collisions": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });
});
