/**
 * @packageDocumentation
 * Canonical registry of public Stylelint rules exported by this package.
 */
import type { StylelintPluginRuleContract } from "./create-stylelint-rule.js";

import * as noDirectThemeTokenConsumptionInCssModulesModule from "../rules/no-direct-theme-token-consumption-in-css-modules.js";
import * as noDocusaurusLayerNameCollisionsModule from "../rules/no-docusaurus-layer-name-collisions.js";
import * as noInvalidThemeCustomPropertyScopeModule from "../rules/no-invalid-theme-custom-property-scope.js";
import * as noNavbarBreakpointDesyncModule from "../rules/no-navbar-breakpoint-desync.js";
import * as noMobileNavbarBackdropFilterModule from "../rules/no-mobile-navbar-backdrop-filter.js";
import * as noMobileNavbarStackingContextTrapsModule from "../rules/no-mobile-navbar-stacking-context-traps.js";
import * as noRevertLayerOutsideIsolationSubtreesModule from "../rules/no-revert-layer-outside-isolation-subtrees.js";
import * as noSubtreeDataThemeSelectorsModule from "../rules/no-subtree-data-theme-selectors.js";
import * as noUnanchoredInfimaSubcomponentSelectorsModule from "../rules/no-unanchored-infima-subcomponent-selectors.js";
import * as noUnscopedContentElementOverridesModule from "../rules/no-unscoped-content-element-overrides.js";
import * as noUnsafeThemeInternalSelectorsModule from "../rules/no-unsafe-theme-internal-selectors.js";
import * as noUnstableDocusaurusGeneratedClassSelectorsModule from "../rules/no-unstable-docusaurus-generated-class-selectors.js";
import * as noUnwrappedGlobalThemeSelectorsInCssModulesModule from "../rules/no-unwrapped-global-theme-selectors-in-css-modules.js";
import * as preferDataThemeColorModeModule from "../rules/prefer-data-theme-color-mode.js";
import * as preferDataThemeDocsearchOverridesModule from "../rules/prefer-data-theme-docsearch-overrides.js";
import * as preferInfimaThemeTokensOverStructuralOverridesModule from "../rules/prefer-infima-theme-tokens-over-structural-overrides.js";
import * as preferStableDocusaurusThemeClassNamesModule from "../rules/prefer-stable-docusaurus-theme-class-names.js";
import * as requireDocsearchColorModePairsModule from "../rules/require-docsearch-color-mode-pairs.js";
import * as requireIfmColorPrimaryScaleModule from "../rules/require-ifm-color-primary-scale.js";
import * as requireIfmColorPrimaryScalePerColorModeModule from "../rules/require-ifm-color-primary-scale-per-color-mode.js";
import * as requireHtmlPrefixForDocusaurusDataAttributeSelectorsModule from "../rules/require-html-prefix-for-docusaurus-data-attribute-selectors.js";

/**
 * Public rule registry keyed by unqualified rule name. The scaffold
 * intentionally starts empty. Add new rule modules here as the plugin grows.
 */
export const docusaurusRules: Readonly<
    Record<string, StylelintPluginRuleContract>
> = {
    "no-direct-theme-token-consumption-in-css-modules":
        noDirectThemeTokenConsumptionInCssModulesModule.default,
    "no-docusaurus-layer-name-collisions":
        noDocusaurusLayerNameCollisionsModule.default,
    "no-invalid-theme-custom-property-scope":
        noInvalidThemeCustomPropertyScopeModule.default,
    "no-mobile-navbar-backdrop-filter":
        noMobileNavbarBackdropFilterModule.default,
    "no-mobile-navbar-stacking-context-traps":
        noMobileNavbarStackingContextTrapsModule.default,
    "no-navbar-breakpoint-desync": noNavbarBreakpointDesyncModule.default,
    "no-revert-layer-outside-isolation-subtrees":
        noRevertLayerOutsideIsolationSubtreesModule.default,
    "no-subtree-data-theme-selectors":
        noSubtreeDataThemeSelectorsModule.default,
    "no-unanchored-infima-subcomponent-selectors":
        noUnanchoredInfimaSubcomponentSelectorsModule.default,
    "no-unsafe-theme-internal-selectors":
        noUnsafeThemeInternalSelectorsModule.default,
    "no-unscoped-content-element-overrides":
        noUnscopedContentElementOverridesModule.default,
    "no-unstable-docusaurus-generated-class-selectors":
        noUnstableDocusaurusGeneratedClassSelectorsModule.default,
    "no-unwrapped-global-theme-selectors-in-css-modules":
        noUnwrappedGlobalThemeSelectorsInCssModulesModule.default,
    "prefer-data-theme-color-mode": preferDataThemeColorModeModule.default,
    "prefer-data-theme-docsearch-overrides":
        preferDataThemeDocsearchOverridesModule.default,
    "prefer-infima-theme-tokens-over-structural-overrides":
        preferInfimaThemeTokensOverStructuralOverridesModule.default,
    "prefer-stable-docusaurus-theme-class-names":
        preferStableDocusaurusThemeClassNamesModule.default,
    "require-docsearch-color-mode-pairs":
        requireDocsearchColorModePairsModule.default,
    "require-html-prefix-for-docusaurus-data-attribute-selectors":
        requireHtmlPrefixForDocusaurusDataAttributeSelectorsModule.default,
    "require-ifm-color-primary-scale":
        requireIfmColorPrimaryScaleModule.default,
    "require-ifm-color-primary-scale-per-color-mode":
        requireIfmColorPrimaryScalePerColorModeModule.default,
};

/** Public rule registry type. */
export type DocusaurusRulesRegistry = typeof docusaurusRules;
