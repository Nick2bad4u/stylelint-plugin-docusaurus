import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

const RULE = "docusaurus/no-color-scheme-on-docusaurus-html-root";

describe(RULE, () => {
    // ── Valid cases ─────────────────────────────────────────────────────────

    it("allows color-scheme on a custom component selector", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.my-widget { color-scheme: dark; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows other properties on :root", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `:root { --ifm-color-primary: blue; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows color-scheme inside a media query on a non-root selector", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media (prefers-color-scheme: dark) {
                    .code-block { color-scheme: dark; }
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows other declarations on [data-theme]", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `[data-theme="dark"] { --ifm-color-primary: #66b2ff; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows color-scheme on theme-code-block sub-selector", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.theme-code-block pre { color-scheme: dark; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("skips when rule is disabled", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `:root { color-scheme: dark; }`,
            config: { plugins: [], rules: { [RULE]: null } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    // ── Invalid cases ────────────────────────────────────────────────────────

    it("reports color-scheme on :root", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `:root { color-scheme: dark light; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("color-scheme");
        expect(result.warnings[0]?.text).toContain(":root");
    });

    it("reports color-scheme on html selector", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `html { color-scheme: light; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("html");
    });

    it("reports color-scheme on [data-theme]", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `[data-theme] { color-scheme: dark light; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("[data-theme]");
    });

    it("reports color-scheme on [data-theme=dark] (double-quoted)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `[data-theme="dark"] { color-scheme: dark; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
    });

    it("reports color-scheme on [data-theme='light'] (single-quoted)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `[data-theme='light'] { color-scheme: light; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
    });

    it("reports color-scheme on html[data-theme]", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `html[data-theme="dark"] { color-scheme: dark; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
    });

    it("reports color-scheme when a comma-separated selector list includes a managed root", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `html, .wrapper { color-scheme: dark; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("html");
    });

    it("message contains the matched selector and color-scheme", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `:root { color-scheme: dark light; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings[0]?.text).toContain("color-scheme");
        expect(result.warnings[0]?.text).toContain(":root");
        expect(result.warnings[0]?.text).toContain("Docusaurus");
    });

    it("reports multiple color-scheme declarations in the same managed root selector", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :root {
                    color-scheme: dark light;
                    color-scheme: light dark;
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(2);
    });
});
