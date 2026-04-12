import { describe, expect, it } from "vitest";

import {
    lintWithConfig,
    runStylelintWithConfig,
} from "./_internal/stylelint-test-helpers";

describe("docusaurus/prefer-data-theme-color-mode", () => {
    it("allows data-theme selectors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-theme='dark'] .navbar {
                    color: white;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-color-mode": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports legacy .theme-dark selectors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .theme-dark .navbar {
                    color: white;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-color-mode": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "Prefer [data-theme='dark']"
        );
    });

    it("autofixes legacy theme selectors to data-theme selectors", async () => {
        expect.hasAssertions();

        const lintResult = await runStylelintWithConfig({
            code: `
                .theme-light .navbar,
                .theme-dark .footer {
                    color: white;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/prefer-data-theme-color-mode": true,
                },
            },
            fix: true,
        });

        const [result] = lintResult.results;

        expect(result).toBeDefined();
        expect(lintResult.code).toContain("[data-theme='light'] .navbar");
        expect(lintResult.code).toContain("[data-theme='dark'] .footer");

        expect(result?.parseErrors).toHaveLength(0);
    });
});
