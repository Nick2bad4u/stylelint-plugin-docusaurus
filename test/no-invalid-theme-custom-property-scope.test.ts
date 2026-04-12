import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("docusaurus/no-invalid-theme-custom-property-scope", () => {
    it("allows Docusaurus theme tokens in :root", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                :root {
                    --ifm-color-primary: #4e89e8;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-invalid-theme-custom-property-scope": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("allows Docusaurus theme tokens in dark mode scopes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                [data-theme='dark'] {
                    --docsearch-primary-color: #8ab4f8;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-invalid-theme-custom-property-scope": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("reports Docusaurus theme tokens declared in component scopes", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .heroBanner {
                    --ifm-color-primary: #4e89e8;
                }
            `,
            config: {
                plugins: [],
                rules: {
                    "docusaurus/no-invalid-theme-custom-property-scope": true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]?.text).toContain(
            "global Docusaurus theme scopes"
        );
    });
});
