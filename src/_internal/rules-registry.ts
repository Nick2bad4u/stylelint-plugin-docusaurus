/**
 * @packageDocumentation
 * Canonical registry of public Stylelint rules exported by this package.
 */
import type { StylelintPluginRuleContract } from "./create-stylelint-rule.js";

import * as noInvalidThemeCustomPropertyScopeModule from "../rules/no-invalid-theme-custom-property-scope.js";
import * as noMobileNavbarBackdropFilterModule from "../rules/no-mobile-navbar-backdrop-filter.js";
import * as noMobileNavbarStackingContextTrapsModule from "../rules/no-mobile-navbar-stacking-context-traps.js";
import * as noUnstableDocusaurusGeneratedClassSelectorsModule from "../rules/no-unstable-docusaurus-generated-class-selectors.js";
import * as preferDataThemeColorModeModule from "../rules/prefer-data-theme-color-mode.js";
import * as preferDataThemeDocsearchOverridesModule from "../rules/prefer-data-theme-docsearch-overrides.js";
import * as preferStableDocusaurusThemeClassNamesModule from "../rules/prefer-stable-docusaurus-theme-class-names.js";
import * as requireIfmColorPrimaryScaleModule from "../rules/require-ifm-color-primary-scale.js";

/**
 * Public rule registry keyed by unqualified rule name.
 *
 * @remarks
 * The scaffold intentionally starts empty. Add new rule modules here as the
 * plugin grows.
 */
export const docusaurusRules: Readonly<
    Record<string, StylelintPluginRuleContract>
> = {
    "no-invalid-theme-custom-property-scope":
        noInvalidThemeCustomPropertyScopeModule.default,
    "no-mobile-navbar-backdrop-filter":
        noMobileNavbarBackdropFilterModule.default,
    "no-mobile-navbar-stacking-context-traps":
        noMobileNavbarStackingContextTrapsModule.default,
    "no-unstable-docusaurus-generated-class-selectors":
        noUnstableDocusaurusGeneratedClassSelectorsModule.default,
    "prefer-data-theme-color-mode": preferDataThemeColorModeModule.default,
    "prefer-data-theme-docsearch-overrides":
        preferDataThemeDocsearchOverridesModule.default,
    "prefer-stable-docusaurus-theme-class-names":
        preferStableDocusaurusThemeClassNamesModule.default,
    "require-ifm-color-primary-scale":
        requireIfmColorPrimaryScaleModule.default,
};

/** Public rule registry type. */
export type DocusaurusRulesRegistry = typeof docusaurusRules;
