/**
 * @packageDocumentation
 * Canonical registry of public Stylelint rules exported by this package.
 */
import type { StylelintPluginRule } from "./create-stylelint-rule.js";

/**
 * Public rule registry keyed by unqualified rule name.
 *
 * @remarks
 * The scaffold intentionally starts empty. Add new rule modules here as the
 * plugin grows.
 */
export const docusaurusRules: Readonly<Record<string, StylelintPluginRule>> =
    {};

/** Public rule registry type. */
export type DocusaurusRulesRegistry = typeof docusaurusRules;
