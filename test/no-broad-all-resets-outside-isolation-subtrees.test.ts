import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/no-broad-all-resets-outside-isolation-subtrees", () => {
    it("allows all: revert inside a local component wrapper", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .sandbox {
                    all: revert;
                }
            `,
            codeFilename: "Component.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-broad-all-resets-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows all: unset behind a dedicated data attribute", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-docusaurus-layer-isolation] {
                    all: unset;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-broad-all-resets-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows all: initial behind a dedicated global data attribute in CSS Modules", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :global([data-docusaurus-layer-isolation]) {
                    all: initial;
                }
            `,
            codeFilename: "src/components/Reset.module.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-broad-all-resets-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports all: revert on broad stable Docusaurus wrappers", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .theme-doc-markdown {
                    all: revert;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-broad-all-resets-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("theme-doc-markdown");
        expect(result.warnings[0]?.text).toContain("all: revert");
    });

    it("reports all: unset on global element selectors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                h1 {
                    all: unset;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-broad-all-resets-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain('"h1"');
        expect(result.warnings[0]?.text).toContain("all: unset");
    });

    it("reports mixed-case all: initial resets too", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                h1 {
                    all: INITIAL;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-broad-all-resets-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("all: initial");
    });

    it("does not treat all: revert-layer as part of this rule's reset surface", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                h1 {
                    all: revert-layer;
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-broad-all-resets-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("does not treat quoted all-reset keywords as actual reset usage", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                h1::before {
                    content: "unset initial revert";
                }
            `,
            codeFilename: "src/css/custom.css",
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-broad-all-resets-outside-isolation-subtrees": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });
});
