import type { AtRule, Declaration, Node, Rule } from "postcss";

import {
    arrayAt,
    arrayIncludes,
    isDefined,
    objectHasIn,
    safeCastTo,
    setHas,
    stringSplit,
} from "ts-extras";

/** Allowed global selectors for Docusaurus theme-token declarations. */
export const docusaurusThemeScopeSelectors: ReadonlySet<string> = new Set([
    ":root",
    '[data-theme="dark"]',
    '[data-theme="light"]',
    "[data-theme='dark']",
    "[data-theme='light']",
    'html[data-theme="dark"]',
    'html[data-theme="light"]',
    "html[data-theme='dark']",
    "html[data-theme='light']",
]);

/** Required Infima primary color scale variables recommended by Docusaurus docs. */
export const requiredIfmColorPrimaryScaleVariables: readonly [
    "--ifm-color-primary",
    "--ifm-color-primary-dark",
    "--ifm-color-primary-darker",
    "--ifm-color-primary-darkest",
    "--ifm-color-primary-light",
    "--ifm-color-primary-lighter",
    "--ifm-color-primary-lightest",
] = [
    "--ifm-color-primary",
    "--ifm-color-primary-dark",
    "--ifm-color-primary-darker",
    "--ifm-color-primary-darkest",
    "--ifm-color-primary-light",
    "--ifm-color-primary-lighter",
    "--ifm-color-primary-lightest",
];

/**
 * Legacy class-based color-mode selectors sometimes found in old Docusaurus
 * CSS.
 */
const legacyThemeColorModeSelectorPattern =
    /(?<prefix>^|[\s()+,>~])\.theme-(?<mode>dark|light)\b/gu;

/**
 * Detect the first legacy class-based color-mode selector token in a selector.
 */
export function findLegacyThemeColorModeSelector(
    selector: string
): ".theme-dark" | ".theme-light" | undefined {
    if (selector.includes(".theme-dark")) {
        return ".theme-dark";
    }

    if (selector.includes(".theme-light")) {
        return ".theme-light";
    }

    return undefined;
}

/**
 * Find the nearest containing PostCSS rule for a node.
 */
export function getContainingRule(node: Readonly<Node>): Rule | undefined {
    let currentNode: Node | undefined = node.parent ?? undefined;

    while (isDefined(currentNode)) {
        if (currentNode.type === "rule") {
            return currentNode as Rule;
        }

        currentNode = currentNode.parent ?? undefined;
    }

    return undefined;
}

/**
 * Check whether every selector in a rule belongs to an allowed global theme
 * scope.
 */
export function isAllowedThemeScopeRule(rule: Readonly<Rule>): boolean {
    const selectors = stringSplit(rule.selector, ",")
        .map((selector) => selector.trim())
        .filter((selector) => selector.length > 0);

    return (
        selectors.length > 0 &&
        selectors.every((selector) =>
            setHas(docusaurusThemeScopeSelectors, selector)
        )
    );
}

/**
 * Check whether a selector is an allowed global Docusaurus theme-token scope.
 */
export function isAllowedThemeScopeSelector(selector: string): boolean {
    return setHas(docusaurusThemeScopeSelectors, selector);
}

/**
 * Check whether a custom property belongs to the Docusaurus/Infima global theme
 * token surface.
 */
export function isDocusaurusThemeCustomPropertyName(
    propertyName: string
): boolean {
    return (
        propertyName.startsWith("--ifm-") ||
        propertyName.startsWith("--docsearch-")
    );
}

/**
 * Check whether a custom property is one of the canonical Infima primary color
 * scale variables.
 */
export function isIfmColorPrimaryScaleVariable(propertyName: string): boolean {
    return arrayIncludes(
        requiredIfmColorPrimaryScaleVariables,
        propertyName as (typeof requiredIfmColorPrimaryScaleVariables)[number]
    );
}

/**
 * Replace legacy class-based color-mode selectors with Docusaurus data-theme
 * selectors.
 */
export function normalizeLegacyThemeColorModeSelectors(
    selector: string
): string {
    return selector.replaceAll(
        legacyThemeColorModeSelectorPattern,
        (matchedText, ...replacementArguments) => {
            const lastArgument = arrayAt(replacementArguments, -1);
            const groups =
                typeof lastArgument === "object" &&
                lastArgument !== null &&
                objectHasIn(lastArgument, "mode") &&
                objectHasIn(lastArgument, "prefix")
                    ? safeCastTo<{ mode?: unknown; prefix?: unknown }>(
                          lastArgument
                      )
                    : {};
            const prefix =
                typeof groups.prefix === "string" ? groups.prefix : "";
            const mode = groups.mode === "light" ? "light" : "dark";

            if (matchedText.length === 0) {
                return matchedText;
            }

            return `${prefix}[data-theme='${mode}']`;
        }
    );
}

/**
 * Split a selector list into trimmed individual selectors.
 */
export function normalizeSelectorList(selectorList: string): readonly string[] {
    return stringSplit(selectorList, ",")
        .map((selector) => selector.trim())
        .filter((selector) => selector.length > 0);
}

/**
 * Walk only declarations that belong to the same logical theme scope, allowing
 * nested at-rules but intentionally skipping nested rules.
 */
export function walkThemeScopeDeclarations(
    container: Readonly<AtRule | Rule>,
    onDeclaration: (declaration: Readonly<Declaration>) => void
): void {
    for (const childNode of container.nodes ?? []) {
        if (childNode.type === "decl") {
            onDeclaration(childNode);
            continue;
        }

        if (childNode.type === "atrule") {
            walkThemeScopeDeclarations(childNode, onDeclaration);
        }
    }
}
