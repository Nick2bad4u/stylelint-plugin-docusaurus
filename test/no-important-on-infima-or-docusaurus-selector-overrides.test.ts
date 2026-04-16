import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

const RULE =
    "docusaurus/no-important-on-infima-or-docusaurus-selector-overrides";

describe(RULE, () => {
    // ── Valid cases ─────────────────────────────────────────────────────────

    it("allows !important on a custom project class", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.my-button { color: red !important; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows !important on utility classes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .sr-only {
                    position: absolute !important;
                    width: 1px !important;
                    height: 1px !important;
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows declarations without !important on Infima selectors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.navbar__link { color: blue; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows !important on :root custom property definitions", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `:root { --my-var: red !important; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("skips when rule is disabled", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.navbar__link { color: red !important; }`,
            config: { plugins: [], rules: { [RULE]: null } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    // ── Invalid cases ────────────────────────────────────────────────────────

    it("reports !important on .navbar__link (Infima nav class)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.navbar__link { color: red !important; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("color");
        expect(result.warnings[0]?.text).toContain("!important");
    });

    it("reports !important on .menu__link--active (Infima menu class)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.menu__link--active { font-weight: 700 !important; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("font-weight");
    });

    it("reports !important on .theme-doc-sidebar-container (Docusaurus wrapper)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.theme-doc-sidebar-container { width: 280px !important; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("width");
    });

    it("reports !important on a compound selector containing .navbar__brand", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.custom-header .navbar__brand { width: 160px !important; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
    });

    it("reports multiple !important declarations inside an Infima selector", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .menu__link--active {
                    font-weight: 700 !important;
                    background-color: var(--ifm-color-primary) !important;
                }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(2);
    });

    it("reports !important on footer__ Infima class", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.footer__link-item { display: block !important; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
    });

    it("message contains property name and selector in the report", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.navbar__link { color: hotpink !important; }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings[0]?.text).toContain("color");
        expect(result.warnings[0]?.text).toContain("!important");
        expect(result.warnings[0]?.text).toContain("navbar__link");
    });

    it("allows !important when the selector does not contain Infima/Docusaurus class", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .prose h1 { margin-top: 0 !important; }
                .card-body p { margin-bottom: 0.5rem !important; }
            `,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });
});
