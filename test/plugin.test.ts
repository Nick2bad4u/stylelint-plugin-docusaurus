import { createRequire } from "node:module";
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

const require = createRequire(import.meta.url);
type BuiltCjsPluginModule = Readonly<{
    configs: typeof configs;
    meta: typeof meta;
    ruleIds: typeof ruleIds;
    ruleNames: typeof ruleNames;
    rules: typeof rules;
}> &
    typeof plugins;

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

    it("preserves named exports on the built CommonJS entrypoint", () => {
        expect.hasAssertions();

        const builtCjsPlugin =
            require("../dist/plugin.cjs") as BuiltCjsPluginModule;

        expect(Array.isArray(builtCjsPlugin)).toBeTruthy();
        expect(builtCjsPlugin.configs).toBeDefined();
        expect(builtCjsPlugin.meta).toBeDefined();
        expect(builtCjsPlugin.rules).toBeDefined();
        expect(builtCjsPlugin.ruleIds).toStrictEqual(ruleIds);
        expect(builtCjsPlugin.ruleNames).toStrictEqual(ruleNames);
        expect(builtCjsPlugin.meta).toStrictEqual(meta);
    });

    it("exposes the expected shareable config names", () => {
        expect.hasAssertions();

        expect(configNames).toStrictEqual(["recommended", "all"]);
        expect(Object.keys(configs)).toStrictEqual(["all", "recommended"]);
    });

    it("exposes the first public rule ids in stable order", () => {
        expect.hasAssertions();

        expect(ruleNames).toStrictEqual([
            "no-broad-all-resets-outside-isolation-subtrees",
            "no-direct-theme-token-consumption-in-css-modules",
            "no-docusaurus-layer-name-collisions",
            "no-invalid-theme-custom-property-scope",
            "no-mobile-navbar-backdrop-filter",
            "no-mobile-navbar-stacking-context-traps",
            "no-navbar-breakpoint-desync",
            "no-revert-layer-outside-isolation-subtrees",
            "no-subtree-data-theme-selectors",
            "no-unanchored-infima-subcomponent-selectors",
            "no-unsafe-theme-internal-selectors",
            "no-unscoped-content-element-overrides",
            "no-unstable-docusaurus-generated-class-selectors",
            "no-unwrapped-global-theme-selectors-in-css-modules",
            "prefer-data-theme-color-mode",
            "prefer-data-theme-docsearch-overrides",
            "prefer-data-theme-over-prefers-color-scheme",
            "prefer-docsearch-theme-tokens-over-structural-overrides",
            "prefer-infima-theme-tokens-over-structural-overrides",
            "prefer-stable-docusaurus-theme-class-names",
            "require-docsearch-color-mode-pairs",
            "require-docsearch-root-scope-for-docsearch-token-overrides",
            "require-html-prefix-for-docusaurus-data-attribute-selectors",
            "require-ifm-color-primary-scale",
            "require-ifm-color-primary-scale-per-color-mode",
            "require-local-anchor-for-global-theme-overrides-in-css-modules",
        ]);
        expect(ruleIds).toStrictEqual([
            "docusaurus/no-broad-all-resets-outside-isolation-subtrees",
            "docusaurus/no-direct-theme-token-consumption-in-css-modules",
            "docusaurus/no-docusaurus-layer-name-collisions",
            "docusaurus/no-invalid-theme-custom-property-scope",
            "docusaurus/no-mobile-navbar-backdrop-filter",
            "docusaurus/no-mobile-navbar-stacking-context-traps",
            "docusaurus/no-navbar-breakpoint-desync",
            "docusaurus/no-revert-layer-outside-isolation-subtrees",
            "docusaurus/no-subtree-data-theme-selectors",
            "docusaurus/no-unanchored-infima-subcomponent-selectors",
            "docusaurus/no-unsafe-theme-internal-selectors",
            "docusaurus/no-unscoped-content-element-overrides",
            "docusaurus/no-unstable-docusaurus-generated-class-selectors",
            "docusaurus/no-unwrapped-global-theme-selectors-in-css-modules",
            "docusaurus/prefer-data-theme-color-mode",
            "docusaurus/prefer-data-theme-docsearch-overrides",
            "docusaurus/prefer-data-theme-over-prefers-color-scheme",
            "docusaurus/prefer-docsearch-theme-tokens-over-structural-overrides",
            "docusaurus/prefer-infima-theme-tokens-over-structural-overrides",
            "docusaurus/prefer-stable-docusaurus-theme-class-names",
            "docusaurus/require-docsearch-color-mode-pairs",
            "docusaurus/require-docsearch-root-scope-for-docsearch-token-overrides",
            "docusaurus/require-html-prefix-for-docusaurus-data-attribute-selectors",
            "docusaurus/require-ifm-color-primary-scale",
            "docusaurus/require-ifm-color-primary-scale-per-color-mode",
            "docusaurus/require-local-anchor-for-global-theme-overrides-in-css-modules",
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
            "docusaurus/no-subtree-data-theme-selectors": true,
            "docusaurus/no-unwrapped-global-theme-selectors-in-css-modules": true,
            "docusaurus/prefer-data-theme-color-mode": true,
            "docusaurus/prefer-data-theme-over-prefers-color-scheme": true,
            "docusaurus/require-html-prefix-for-docusaurus-data-attribute-selectors": true,
            "docusaurus/require-local-anchor-for-global-theme-overrides-in-css-modules": true,
        });
        expect(configs.all.rules).toStrictEqual({
            "docusaurus/no-broad-all-resets-outside-isolation-subtrees": true,
            "docusaurus/no-direct-theme-token-consumption-in-css-modules": true,
            "docusaurus/no-docusaurus-layer-name-collisions": true,
            "docusaurus/no-invalid-theme-custom-property-scope": true,
            "docusaurus/no-mobile-navbar-backdrop-filter": true,
            "docusaurus/no-mobile-navbar-stacking-context-traps": true,
            "docusaurus/no-navbar-breakpoint-desync": true,
            "docusaurus/no-revert-layer-outside-isolation-subtrees": true,
            "docusaurus/no-subtree-data-theme-selectors": true,
            "docusaurus/no-unanchored-infima-subcomponent-selectors": true,
            "docusaurus/no-unsafe-theme-internal-selectors": true,
            "docusaurus/no-unscoped-content-element-overrides": true,
            "docusaurus/no-unstable-docusaurus-generated-class-selectors": true,
            "docusaurus/no-unwrapped-global-theme-selectors-in-css-modules": true,
            "docusaurus/prefer-data-theme-color-mode": true,
            "docusaurus/prefer-data-theme-docsearch-overrides": true,
            "docusaurus/prefer-data-theme-over-prefers-color-scheme": true,
            "docusaurus/prefer-docsearch-theme-tokens-over-structural-overrides": true,
            "docusaurus/prefer-infima-theme-tokens-over-structural-overrides": true,
            "docusaurus/prefer-stable-docusaurus-theme-class-names": true,
            "docusaurus/require-docsearch-color-mode-pairs": true,
            "docusaurus/require-docsearch-root-scope-for-docsearch-token-overrides": true,
            "docusaurus/require-html-prefix-for-docusaurus-data-attribute-selectors": true,
            "docusaurus/require-ifm-color-primary-scale": true,
            "docusaurus/require-ifm-color-primary-scale-per-color-mode": true,
            "docusaurus/require-local-anchor-for-global-theme-overrides-in-css-modules": true,
        });
    });
});
