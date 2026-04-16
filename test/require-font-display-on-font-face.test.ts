import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

const RULE = "docusaurus/require-font-display-on-font-face";

describe(RULE, () => {
    // ── Valid cases ─────────────────────────────────────────────────────────

    it("allows @font-face with font-display: swap", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    font-family: "MyFont";
                    font-display: swap;
                    src: local("MyFont"), url("/fonts/myfont.woff2") format("woff2");
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows @font-face with font-display: optional", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    font-family: "NerdFont";
                    font-display: optional;
                    src: url("/fonts/nerdfont.woff2") format("woff2");
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows @font-face with font-display: fallback", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    font-family: "SystemFont";
                    font-display: fallback;
                    src: local("Arial");
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows @font-face with font-display: block", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    font-family: "BlockFont";
                    font-display: block;
                    src: url("/fonts/block.woff2") format("woff2");
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows font-display: auto when auto is in configured allowedValues", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    font-family: "AutoFont";
                    font-display: auto;
                    src: url("/fonts/auto.woff2") format("woff2");
                }
            `,
            config: {
                plugins: [],
                rules: {
                    [RULE]: [true, { allowedValues: ["auto", "swap"] }],
                },
            },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows font-display: SWAP (case-insensitive value)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    font-family: "BigFont";
                    font-display: SWAP;
                    src: url("/fonts/big.woff2") format("woff2");
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("skips when rule is disabled", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@font-face { font-family: "X"; src: url("/x.woff2"); }`,
            config: { plugins: [], rules: { [RULE]: null } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    // ── Invalid cases ────────────────────────────────────────────────────────

    it("reports @font-face missing font-display entirely", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    font-family: "MyFont";
                    src: url("/fonts/myfont.woff2") format("woff2");
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("font-display");
    });

    it("reports @font-face with font-display: auto (not in default allowed list)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    font-family: "AutoFont";
                    font-display: auto;
                    src: url("/fonts/auto.woff2") format("woff2");
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("auto");
    });

    it("reports @font-face with disallowed font-display when allowedValues configured", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    font-family: "BrandFont";
                    font-display: block;
                    src: url("/fonts/brand.woff2") format("woff2");
                }
            `,
            config: {
                plugins: [],
                rules: {
                    [RULE]: [true, { allowedValues: ["swap", "optional"] }],
                },
            },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("block");
    });

    it("reports multiple @font-face blocks missing font-display", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    font-family: "Font1";
                    src: url("/fonts/font1.woff2") format("woff2");
                }
                @font-face {
                    font-family: "Font2";
                    src: url("/fonts/font2.woff2") format("woff2");
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(2);
    });

    it("message contains CLS/FOIT context", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    font-family: "NoDisplay";
                    src: url("/fonts/nodisplay.woff2") format("woff2");
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings[0]?.text).toContain("font-display");
    });
});
