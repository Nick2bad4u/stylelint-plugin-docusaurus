/**
 * @packageDocumentation
 * Static package and docs constants used throughout the Stylelint plugin runtime.
 */
import packageJson from "../../package.json" with { type: "json" };

/** Public npm package name. */
export const PACKAGE_NAME = "stylelint-plugin-docusaurus";
/** Public Stylelint rule namespace. */
export const PLUGIN_NAMESPACE = "docusaurus";
/** Public GitHub repository URL. */
export const REPOSITORY_URL =
    "https://github.com/Nick2bad4u/stylelint-plugin-docusaurus";
/** Public documentation site URL. */
export const DOCS_SITE_URL =
    "https://nick2bad4u.github.io/stylelint-plugin-docusaurus";
/** Base URL for authored rule documentation. */
export const DOCS_RULES_BASE_URL: `${string}/docs/rules` = `${DOCS_SITE_URL}/docs/rules`;
/** Supported shareable config names exported by this template. */
export const CONFIG_NAMES = ["recommended", "all"] as const;

/** Shareable config names exported by the plugin runtime. */
export type DocusaurusConfigName = (typeof CONFIG_NAMES)[number];

/**
 * Resolve package version from package.json data.
 *
 * @param pkg - Parsed package metadata value.
 *
 * @returns The package version, or `0.0.0` when unavailable.
 */
function getPackageVersion(pkg: unknown): string {
    if (typeof pkg !== "object" || pkg === null) {
        return "0.0.0";
    }

    const version = Reflect.get(pkg, "version");

    return typeof version === "string" ? version : "0.0.0";
}

/** Published package version resolved from `package.json`. */
export const PACKAGE_VERSION: string = getPackageVersion(packageJson);

/**
 * Create the canonical docs URL for one authored rule page.
 */
export function createRuleDocsUrl(ruleName: string): string {
    return `${DOCS_RULES_BASE_URL}/${ruleName}`;
}

/**
 * Create a fully qualified Stylelint rule name for this plugin namespace.
 */
export function createRuleName<const T extends string>(
    ruleName: T
): `${typeof PLUGIN_NAMESPACE}/${T}` {
    return `${PLUGIN_NAMESPACE}/${ruleName}`;
}
