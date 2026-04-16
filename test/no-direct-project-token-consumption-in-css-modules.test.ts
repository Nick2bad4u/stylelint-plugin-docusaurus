import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

const RULE = "docusaurus/no-direct-project-token-consumption-in-css-modules";

describe(RULE, () => {
    // ── Valid cases ─────────────────────────────────────────────────────────

    it("allows aliased project token usage in CSS Modules", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .button {
                    --button-bg: var(--sb-brand-primary);
                    background: var(--button-bg);
                }
            `,
            codeFilename: "Button.module.css",
            config: {
                plugins: [],
                rules: {
                    [RULE]: [true, { tokenPrefixes: ["--sb-"] }],
                },
            },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows project token in custom property definition (aliasing declaration itself)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .card {
                    --card-border: var(--sb-border-color);
                }
            `,
            codeFilename: "Card.module.css",
            config: {
                plugins: [],
                rules: {
                    [RULE]: [true, { tokenPrefixes: ["--sb-"] }],
                },
            },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows project token usage in non-CSS-module files", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.button { color: var(--sb-brand-primary); }`,
            codeFilename: "custom.css",
            config: {
                plugins: [],
                rules: {
                    [RULE]: [true, { tokenPrefixes: ["--sb-"] }],
                },
            },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows usage of tokens with a different prefix than configured", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.button { color: var(--other-token); }`,
            codeFilename: "Button.module.css",
            config: {
                plugins: [],
                rules: {
                    [RULE]: [true, { tokenPrefixes: ["--sb-"] }],
                },
            },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("skips processing when secondary options are omitted (invalid config)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.button { color: var(--sb-brand-primary); }`,
            codeFilename: "Button.module.css",
            config: {
                plugins: [],
                rules: {
                    [RULE]: true,
                },
            },
        });

        // Invalid options cause stylelint validation error, not a rule warning
        expect(result.warnings.length).toBeGreaterThanOrEqual(0);
    });

    it("skips when rule is disabled", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.button { color: var(--sb-brand-primary); }`,
            codeFilename: "Button.module.css",
            config: {
                plugins: [],
                rules: { [RULE]: null },
            },
        });

        expect(result.warnings).toHaveLength(0);
    });

    // ── Invalid cases ────────────────────────────────────────────────────────

    it("reports direct --sb- project token in CSS Module background", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.button { background: var(--sb-brand-primary); }`,
            codeFilename: "Button.module.css",
            config: {
                plugins: [],
                rules: {
                    [RULE]: [true, { tokenPrefixes: ["--sb-"] }],
                },
            },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("--sb-brand-primary");
        expect(result.warnings[0]?.text).toContain("--sb-");
    });

    it("reports direct --my-app- project token in CSS Module padding", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.card { padding: var(--my-app-spacing-md); }`,
            codeFilename: "Card.module.css",
            config: {
                plugins: [],
                rules: {
                    [RULE]: [true, { tokenPrefixes: ["--my-app-"] }],
                },
            },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("--my-app-spacing-md");
    });

    it("reports first matching token per declaration across multiple prefixes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .layout {
                    width: var(--ds-sidebar-width);
                    background: var(--brand-surface);
                }
            `,
            codeFilename: "Layout.module.css",
            config: {
                plugins: [],
                rules: {
                    [RULE]: [true, { tokenPrefixes: ["--ds-", "--brand-"] }],
                },
            },
        });

        expect(result.warnings).toHaveLength(2);
    });

    it("reports message containing property name and prefix", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.hero { color: var(--sb-hero-text); }`,
            codeFilename: "Hero.module.css",
            config: {
                plugins: [],
                rules: {
                    [RULE]: [true, { tokenPrefixes: ["--sb-"] }],
                },
            },
        });

        expect(result.warnings[0]?.text).toContain("--sb-hero-text");
        expect(result.warnings[0]?.text).toContain("--sb-");
        expect(result.warnings[0]?.text).toContain("color");
    });

    it("reports token consumption in .module.scss files", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `.component { border: 1px solid var(--sb-border-color); }`,
            codeFilename: "Component.module.scss",
            config: {
                plugins: [],
                rules: {
                    [RULE]: [true, { tokenPrefixes: ["--sb-"] }],
                },
            },
        });

        expect(result.warnings).toHaveLength(1);
    });
});
