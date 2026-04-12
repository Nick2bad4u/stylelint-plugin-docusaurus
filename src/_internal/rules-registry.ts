/**
 * @packageDocumentation
 * Canonical registry of public Stylelint rules exported by this package.
 */
import type { StylelintPluginRuleContract } from "./create-stylelint-rule.js";

import * as noInvalidThemeCustomPropertyScopeModule from "../rules/no-invalid-theme-custom-property-scope.js";
import * as preferDataThemeColorModeModule from "../rules/prefer-data-theme-color-mode.js";
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
    "prefer-data-theme-color-mode": preferDataThemeColorModeModule.default,
    "require-ifm-color-primary-scale":
        requireIfmColorPrimaryScaleModule.default,
};

/** Public rule registry type. */
export type DocusaurusRulesRegistry = typeof docusaurusRules;
