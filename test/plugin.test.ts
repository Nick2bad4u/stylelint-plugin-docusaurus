import { describe, expect, it } from "vitest";

import plugins, {
    configNames,
    configs,
    meta,
    ruleIds,
    ruleNames,
    rules,
} from "../src/plugin";
import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("stylelint-plugin-docusaurus runtime scaffold", () => {
    it("exports stable package metadata", () => {
        expect.hasAssertions();

        expect(meta.name).toBe("stylelint-plugin-docusaurus");
        expect(meta.namespace).toBe("docusaurus");
        expect(meta.version).toMatch(/^\d+\.\d+\.\d+/v);
    });

    it("keeps rule registry exports internally consistent", () => {
        expect.hasAssertions();

        expect(ruleNames).toHaveLength(ruleIds.length);
        expect(Object.keys(rules)).toStrictEqual([...ruleNames]);

        for (const ruleId of ruleIds) {
            expect(ruleId.startsWith("docusaurus/")).toBeTruthy();
        }
    });

    it("exposes the expected shareable config names", () => {
        expect.hasAssertions();

        expect(configNames).toStrictEqual(["recommended", "all"]);
        expect(Object.keys(configs)).toStrictEqual(["all", "recommended"]);
    });

    it("exposes the first public rule ids in stable order", () => {
        expect.hasAssertions();

        expect(ruleNames).toStrictEqual([
            "no-invalid-theme-custom-property-scope",
            "no-mobile-navbar-backdrop-filter",
            "no-mobile-navbar-stacking-context-traps",
            "no-unstable-docusaurus-generated-class-selectors",
            "prefer-data-theme-color-mode",
            "prefer-data-theme-docsearch-overrides",
            "prefer-stable-docusaurus-theme-class-names",
            "require-ifm-color-primary-scale",
        ]);
        expect(ruleIds).toStrictEqual([
            "docusaurus/no-invalid-theme-custom-property-scope",
            "docusaurus/no-mobile-navbar-backdrop-filter",
            "docusaurus/no-mobile-navbar-stacking-context-traps",
            "docusaurus/no-unstable-docusaurus-generated-class-selectors",
            "docusaurus/prefer-data-theme-color-mode",
            "docusaurus/prefer-data-theme-docsearch-overrides",
            "docusaurus/prefer-stable-docusaurus-theme-class-names",
            "docusaurus/require-ifm-color-primary-scale",
        ]);
    });

    it("lets the recommended config lint baseline CSS without parse errors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .heroBanner {
                    color: var(--ifm-color-primary);
                }
            `,
            config: {
                ...configs.recommended,
                // eslint-disable-next-line @typescript-eslint/no-misused-spread -- This is a plugin array copy, not text decomposition.
                plugins: [...configs.recommended.plugins],
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("keeps `recommended` and `all` aligned with the shipped public rule catalog", () => {
        expect.hasAssertions();

        expect(configs.recommended.plugins).toStrictEqual([...plugins]);
        expect(configs.all.plugins).toStrictEqual([...plugins]);
        expect(configs.recommended.rules).toStrictEqual({
            "docusaurus/no-invalid-theme-custom-property-scope": true,
            "docusaurus/no-mobile-navbar-backdrop-filter": true,
            "docusaurus/prefer-data-theme-color-mode": true,
        });
        expect(configs.all.rules).toStrictEqual({
            "docusaurus/no-invalid-theme-custom-property-scope": true,
            "docusaurus/no-mobile-navbar-backdrop-filter": true,
            "docusaurus/no-mobile-navbar-stacking-context-traps": true,
            "docusaurus/no-unstable-docusaurus-generated-class-selectors": true,
            "docusaurus/prefer-data-theme-color-mode": true,
            "docusaurus/prefer-data-theme-docsearch-overrides": true,
            "docusaurus/prefer-stable-docusaurus-theme-class-names": true,
            "docusaurus/require-ifm-color-primary-scale": true,
        });
    });
});
