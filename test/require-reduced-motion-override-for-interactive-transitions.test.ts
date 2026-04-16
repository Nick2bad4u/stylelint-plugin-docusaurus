import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

const RULE =
    "docusaurus/require-reduced-motion-override-for-interactive-transitions";

describe("docusaurus/require-reduced-motion-override-for-interactive-transitions", () => {
    // ─── Valid (no warnings expected) ─────────────────────────────────────────

    describe("valid — no interactive pseudo-classes", () => {
        it("allows transition on a non-interactive selector", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .hero {
                        transition: transform 0.3s ease;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it("allows animation on a non-interactive selector", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }

                    .spinner {
                        animation: spin 1s linear infinite;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });
    });

    describe("valid — safe motion values", () => {
        it("allows transition: none on an interactive selector", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .navbar__link:hover {
                        color: var(--ifm-color-primary);
                        transition: none;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it("allows animation: none on an interactive selector", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .button:active {
                        animation: none;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it("allows transition-duration: 0s on an interactive selector", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .card:focus-visible {
                        transition-duration: 0s;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it("allows transition-duration: 0ms on an interactive selector", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .card:focus-visible {
                        transition-duration: 0ms;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });
    });

    describe("valid — exact selector companion", () => {
        it("allows transition when an exact selector companion exists in @media (prefers-reduced-motion: reduce)", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .navbar__link:hover {
                        color: var(--ifm-color-primary);
                        transition: color 0.2s ease;
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .navbar__link:hover {
                            transition: none;
                        }
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it("allows animation when an exact selector companion exists", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .button:hover {
                        animation: pulse 0.5s ease;
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .button:hover {
                            animation: none;
                        }
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it("allows transition when a companion is in @media (prefers-reduced-motion: no-preference) wrapper", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    @media (prefers-reduced-motion: no-preference) {
                        .hero__cta:hover {
                            transform: scale(1.04);
                            transition: transform 0.2s ease;
                        }
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });
    });

    describe("valid — base selector companion", () => {
        it("allows transition when a base-selector (interactive pseudo stripped) companion exists", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .sidebar__link:focus-visible {
                        outline-offset: 4px;
                        transition: outline-offset 0.15s ease;
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .sidebar__link {
                            transition: none;
                        }
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it("allows transition on :active when .menu__link base selector is covered", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .menu__link:active {
                        background: var(--ifm-color-primary-lightest);
                        transition: background 0.1s ease;
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .menu__link {
                            transition: none;
                        }
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });
    });

    describe("valid — universal selector global reset", () => {
        it("allows transition when a universal * reset disables transition in reduced-motion block", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    @media (prefers-reduced-motion: reduce) {
                        * {
                            transition: none !important;
                        }
                    }

                    .button:hover {
                        transform: translateY(-2px);
                        transition: transform 0.2s ease;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it("allows transition when a comma-separated universal reset covers all interactive selectors", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    @media (prefers-reduced-motion: reduce) {
                        *,
                        *::before,
                        *::after {
                            animation: none !important;
                            transition: none !important;
                        }
                    }

                    .card:hover {
                        box-shadow: 0 4px 8px rgb(0 0 0 / 15%);
                        transition: box-shadow 0.2s ease;
                    }

                    .link:focus-visible {
                        outline-offset: 4px;
                        transition: outline-offset 0.15s ease;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it("allows animation when a universal * reset disables animation in reduced-motion block", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    @media (prefers-reduced-motion: reduce) {
                        * {
                            animation: none !important;
                        }
                    }

                    .spinner:hover {
                        animation: spin 0.5s linear;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });
    });

    describe("valid — already inside @media (prefers-reduced-motion)", () => {
        it("does not report transition declared inside a reduced-motion block", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    @media (prefers-reduced-motion: reduce) {
                        .navbar__link:hover {
                            transition: none;
                        }
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });
    });

    describe("valid — multiple interactive selectors fully covered", () => {
        it("allows multiple interactive selectors when each has a companion", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .button:hover {
                        transform: translateY(-2px);
                        transition: transform 0.2s ease;
                    }

                    .button:focus-visible {
                        box-shadow: 0 0 0 3px var(--ifm-color-primary);
                        transition: box-shadow 0.15s ease;
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .button:hover,
                        .button:focus-visible {
                            transition: none;
                        }
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });
    });

    // ─── Invalid (warnings expected) ─────────────────────────────────────────

    describe("invalid — no @media (prefers-reduced-motion) block at all", () => {
        it("reports transition on :hover when no reduced-motion companion exists anywhere", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .navbar__link:hover {
                        color: var(--ifm-color-primary);
                        transition: color 0.2s ease;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]?.text).toContain(".navbar__link:hover");
            expect(result.warnings[0]?.text).toContain("transition");
            expect(result.warnings[0]?.text).toContain(
                "prefers-reduced-motion"
            );
        });

        it("reports animation on :hover when no reduced-motion companion exists", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .button:hover {
                        animation: pulse 0.4s ease;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]?.text).toContain(".button:hover");
            expect(result.warnings[0]?.text).toContain("animation");
        });

        it("reports transition on :focus", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .card:focus {
                        outline-color: var(--ifm-color-primary);
                        transition: outline-color 0.2s ease;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]?.text).toContain(".card:focus");
        });

        it("reports transition on :focus-visible", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .link:focus-visible {
                        outline-offset: 4px;
                        transition: outline-offset 0.15s ease;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]?.text).toContain(".link:focus-visible");
        });

        it("reports transition on :focus-within", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .form:focus-within {
                        border-color: var(--ifm-color-primary);
                        transition: border-color 0.15s ease;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]?.text).toContain(".form:focus-within");
        });

        it("reports transition on :active", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .menu__item:active {
                        background: var(--ifm-color-primary-lightest);
                        transition: background 0.1s ease;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]?.text).toContain(".menu__item:active");
        });
    });

    describe("invalid — reduced-motion companion exists but does not cover this selector", () => {
        it("reports when the reduced-motion block covers a different selector", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .badge:hover {
                        transform: scale(1.08);
                        transition: transform 0.2s ease;
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .card:hover {
                            transition: none;
                        }
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]?.text).toContain(".badge:hover");
        });

        it("reports for one selector when another interactive selector IS covered but this one is not", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .sidebar__link:focus-visible {
                        outline-offset: 4px;
                        transition: outline-offset 0.15s ease;
                    }

                    .hero__cta:hover {
                        transform: translateY(-2px);
                        transition: transform 0.2s ease;
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .hero__cta:hover {
                            transition: none;
                        }
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]?.text).toContain(
                ".sidebar__link:focus-visible"
            );
        });
    });

    describe("invalid — multiple motion properties on the same uncovered interactive selector", () => {
        it("reports both transition and animation-name when the selector is not covered", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .widget:hover {
                        animation-name: pop;
                        transition: transform 0.2s ease;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            // One warning per motion declaration
            expect(result.warnings).toHaveLength(2);
        });
    });

    describe("invalid — transition-property and transition-duration", () => {
        it("reports transition-property on an uncovered interactive selector", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .tab:hover {
                        transition-duration: 0.3s;
                        transition-property: color, border-color;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            // Transition-property is flagged (it names motion props); transition-duration: 0.3s is also flagged
            expect(result.warnings).toHaveLength(2);
        });
    });

    // ─── Edge cases ───────────────────────────────────────────────────────────

    describe("edge cases", () => {
        it("does not report on a rule with no transition or animation declarations", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .button:hover {
                        color: var(--ifm-color-primary);
                        background: var(--ifm-color-primary-lightest);
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it("does not report when the primary option is not set to true", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .button:hover {
                        transition: color 0.2s ease;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: null } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it("handles an empty file gracefully", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: "",
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it("handles a file with only comments gracefully", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: "/* just a comment */",
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it("does not report transition on :hover inside @media (prefers-reduced-motion: no-preference)", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    @media (prefers-reduced-motion: no-preference) {
                        .navbar__link:hover {
                            transition: color 0.2s ease;
                        }
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it("does not report transition on :hover nested inside other @media blocks within a reduced-motion block", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    @media (prefers-reduced-motion: reduce) {
                        @media (min-width: 997px) {
                            .navbar__link:hover {
                                transition: none;
                            }
                        }
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it("reports transition even when the rule is inside a non-reduced-motion media query", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    @media (min-width: 997px) {
                        .navbar__link:hover {
                            transition: color 0.2s ease;
                        }
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]?.text).toContain(".navbar__link:hover");
        });

        it("does not report animation-name: none on an interactive selector", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .button:hover {
                        animation-name: none;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it("reports animation-name when it names an actual animation on an uncovered interactive selector", async () => {
            expect.hasAssertions();

            const result = await lintWithConfig({
                code: `
                    .card:hover {
                        animation-name: pop;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]?.text).toContain("animation-name");
        });

        it("does not report transition on :hover when *::before universal reset covers animation but not transition", async () => {
            expect.hasAssertions();

            // The universal reset covers only animation, not transition.
            // Because hasGlobalMotionReset requires transition OR animation
            // to be set to none in the universal selector, this sets animation: none
            // which satisfies the global reset condition.
            const result = await lintWithConfig({
                code: `
                    @media (prefers-reduced-motion: reduce) {
                        *::before {
                            animation: none !important;
                        }
                    }

                    .hero:hover {
                        transition: transform 0.3s ease;
                    }
                `,
                config: { plugins: [], rules: { [RULE]: true } },
            });

            // *::before with animation:none triggers hasGlobalMotionReset,
            // so .hero:hover transition is covered.
            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });
    });
});
