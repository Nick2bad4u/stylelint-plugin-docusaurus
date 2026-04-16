import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

const RULE = "docusaurus/no-hardcoded-docusaurus-breakpoint-values";

describe(RULE, () => {
    // ── Valid cases ─────────────────────────────────────────────────────────

    it("allows @media with a non-Docusaurus px value", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@media (max-width: 600px) { .a { color: red; } }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows @media with no px values", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@media (prefers-reduced-motion: reduce) { * { transition: none; } }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows @media with em values that correspond to breakpoints numerically", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@media (min-width: 62em) { .a { color: red; } }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("allows an ignored breakpoint via ignoreBreakpoints secondary option", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@media (max-width: 768px) { .nav { display: none; } }`,
            config: {
                plugins: [],
                rules: {
                    [RULE]: [true, { ignoreBreakpoints: ["768px"] }],
                },
            },
        });

        expect(result.warnings).toHaveLength(0);
    });

    it("skips when rule is disabled (primary: null)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@media (max-width: 996px) { .a { color: red; } }`,
            config: { plugins: [], rules: { [RULE]: null } },
        });

        expect(result.warnings).toHaveLength(0);
    });

    // ── Invalid cases ────────────────────────────────────────────────────────

    it("reports 996px — the JS mobile-toggle boundary", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@media (max-width: 996px) { .nav { display: none; } }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("996px");
    });

    it("reports 768px — Infima medium breakpoint", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@media (min-width: 768px) { .sidebar { width: 300px; } }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("768px");
    });

    it("reports 576px — Infima small breakpoint", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@media (max-width: 576px) { .card { flex-direction: column; } }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("576px");
    });

    it("reports 992px — Infima large breakpoint (the dangerous near-miss value)", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@media (max-width: 992px) { .a { color: red; } }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("992px");
    });

    it("reports 997px — docusaurusDesktopNavbarMinWidthPx", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@media (min-width: 997px) { .desktop-only { display: flex; } }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("997px");
    });

    it("reports 1200px — Infima xl breakpoint", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@media screen and (min-width: 1200px) { .container { max-width: 1100px; } }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("1200px");
    });

    it("reports 1400px — Infima xxl breakpoint", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@media (min-width: 1400px) { .wide { padding: 0 60px; } }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("1400px");
    });

    it("reports multiple breakpoint values in the same @media query", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@media (min-width: 768px) and (max-width: 996px) { .a { display: none; } }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(2);
    });

    it("message contains helpful context about the value", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@media (max-width: 996px) { .nav { display: none; } }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings[0]?.text).toContain("996px");
        expect(result.warnings[0]?.text).toContain("@media");
    });

    it("reports modern range syntax with a known breakpoint value", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `@media (width <= 996px) { .a { display: none; } }`,
            config: { plugins: [], rules: { [RULE]: true } },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("996px");
    });

    it("allows a non-breakpoint value alongside an ignored breakpoint", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                @media (max-width: 768px) { .nav { display: none; } }
                @media (max-width: 996px) { .a { color: red; } }
            `,
            config: {
                plugins: [],
                rules: {
                    [RULE]: [true, { ignoreBreakpoints: ["768px"] }],
                },
            },
        });

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain("996px");
    });
});
