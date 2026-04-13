import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/no-revert-layer-outside-isolation-subtrees", () => {
    it("allows revert-layer inside a local component wrapper", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .sandbox {
                    all: revert-layer;
                }
            `,
            codeFilename: "Component.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-revert-layer-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows revert-layer behind a dedicated data attribute", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-docusaurus-layer-isolation] {
                    color: revert-layer;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-revert-layer-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows revert-layer behind a dedicated data attribute when the anchor is authored through :global(...) in CSS Modules", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :global([data-docusaurus-layer-isolation]) {
                    color: revert-layer;
                }
            `,
            codeFilename: "src/components/Reset.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-revert-layer-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports revert-layer on broad stable Docusaurus wrappers", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .theme-doc-markdown {
                    all: revert-layer;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-revert-layer-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("theme-doc-markdown");
    });

    it("still reports revert-layer on broad stable Docusaurus wrappers even when they are authored through :global(...) in CSS Modules", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :global(.theme-doc-markdown) {
                    all: revert-layer;
                }
            `,
            codeFilename: "src/components/Reset.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-revert-layer-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("theme-doc-markdown");
    });

    it("reports revert-layer on global element selectors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                h1 {
                    color: revert-layer;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-revert-layer-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain('"h1"');
    });

    it("does not treat quoted text that merely mentions revert-layer as actual keyword usage", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                h1::before {
                    content: "revert-layer";
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-revert-layer-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("still reports mixed-case revert-layer keywords", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                h1 {
                    color: REVERT-LAYER;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-revert-layer-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain('"h1"');
    });

    it("does not treat raw url() text containing revert-layer as actual keyword usage", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                h1 {
                    background-image: url(/assets/revert-layer.svg);
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-revert-layer-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("still reports revert-layer when the only apparent anchor is hidden inside :not(...)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :not(.sandbox) {
                    all: revert-layer;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-revert-layer-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain('":not(.sandbox)"');
    });
});
