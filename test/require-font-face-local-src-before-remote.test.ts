import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

const RULE = "docusaurus/require-font-face-local-src-before-remote";

describe(RULE, () => {
    // ── Valid cases ─────────────────────────────────────────────────────────

    it("allows @font-face with local() before url()", async () => {
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

    it("allows @font-face with multiple local() sources before url()", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    font-family: "OpenSans";
                    font-display: swap;
                    src:
                        local("Open Sans"),
                        local("OpenSans"),
                        url("/fonts/opensans.woff2") format("woff2"),
                        url("/fonts/opensans.woff") format("woff");
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows @font-face with only local() sources (no url)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    font-family: "SystemFont";
                    src: local("Arial"), local("Helvetica Neue");
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows @font-face with no src declaration", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    font-family: "NoSrc";
                    font-display: swap;
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("skips when rule is disabled", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@font-face { src: url("/x.woff2") format("woff2"); }`,
            config: { plugins: [], rules: { [RULE]: null } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    // ── Invalid cases ────────────────────────────────────────────────────────

    it("reports @font-face with only url() and no local() fallback", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    font-family: "NerdFont";
                    font-display: swap;
                    src: url("/fonts/nerdfont.woff2") format("woff2");
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("local()");
    });

    it("reports @font-face with url() before local() in the src value", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    font-family: "MyFont";
                    font-display: swap;
                    src: url("/fonts/myfont.woff2") format("woff2"), local("MyFont");
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("local()");
        expect(result.warnings[0]?.text).toContain("url()");
    });

    it("reports multiple @font-face blocks each missing a local() src", async () => {
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

    it("message mentions missing local() when no local() source exists", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    src: url("/fonts/only-cdn.woff2") format("woff2");
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings[0]?.text).toContain("local()");
        expect(result.warnings[0]?.text).toContain("url()");
    });

    it("message mentions ordering when url() appears before local()", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @font-face {
                    src:
                        url("/fonts/font.woff2") format("woff2"),
                        local("Font");
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings[0]?.text).toContain("local()");
        expect(result.warnings[0]?.text).toContain("url()");
    });
});
