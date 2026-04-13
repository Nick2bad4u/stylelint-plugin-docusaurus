import type { AtRule, Declaration, Node, Rule } from "postcss";
import type {
    Attribute as SelectorAttribute,
    Node as SelectorNode,
    Pseudo as SelectorPseudo,
} from "postcss-selector-parser";

import selectorParser from "postcss-selector-parser";
import { arrayIncludes, isDefined, isEmpty, setHas, stringSplit  } from "ts-extras";

import {
    getLeadingSimpleSelectorNodes,
    getSelectors,
    type ParsedSelector,
    parseSelectorList,
} from "./selector-parser-utils.js";

/** Positive selector wrappers that can still represent a standalone root scope. */
const allowedThemeScopeWrapperPseudoNames: ReadonlySet<string> = new Set([
    ":global",
    ":is",
    ":where",
]);

/** Supported Docusaurus site color modes. */
export type DocusaurusColorMode = "dark" | "light";

/** Options for leading selector color-mode classification. */
type LeadingColorModeOptions = Readonly<{
    allowRootLight?: boolean;
}>;

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
 * Detect the first legacy class-based color-mode selector token in a selector.
 */
export function findLegacyThemeColorModeSelector(
    selector: string
): ".theme-dark" | ".theme-light" | undefined {
    const parsedSelectorList = parseSelectorList(selector);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    let resolvedLegacySelector: ".theme-dark" | ".theme-light" | undefined;

    parsedSelectorList.walkClasses((classNode) => {
        const colorMode = getLegacyThemeColorModeFromClassName(classNode.value);

        if (!isDefined(colorMode)) {
            return;
        }

        resolvedLegacySelector =
            colorMode === "light" ? ".theme-light" : ".theme-dark";

        return false;
    });

    if (isDefined(resolvedLegacySelector)) {
        return resolvedLegacySelector;
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
 * Find all containing PostCSS rules for a node, from the nearest rule outward.
 */
export function getContainingRules(node: Readonly<Node>): readonly Rule[] {
    const containingRules: Rule[] = [];
    let currentNode: Node | undefined = node.parent ?? undefined;

    while (isDefined(currentNode)) {
        if (currentNode.type === "rule") {
            containingRules.push(currentNode as Rule);
        }

        currentNode = currentNode.parent ?? undefined;
    }

    return containingRules;
}

/**
 * Resolve the explicit Docusaurus color mode from the leading root scope of one
 * selector.
 */
export function getLeadingDocusaurusColorMode(
    selector: string,
    options: LeadingColorModeOptions = {}
): DocusaurusColorMode | undefined {
    const parsedSelectorList = parseSelectorList(selector);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    const [parsedSelector] = getSelectors(parsedSelectorList);

    if (!isDefined(parsedSelector)) {
        return undefined;
    }

    return getColorModeFromLeadingNodes(
        getLeadingSimpleSelectorNodes(parsedSelector),
        options
    );
}

/**
 * Check whether every selector in a rule belongs to an allowed global theme
 * scope.
 */
export function isAllowedThemeScopeRule(rule: Readonly<Rule>): boolean {
    const selectors = normalizeSelectorList(rule.selector);

    return selectors.length > 0 && selectors.every(isAllowedThemeScopeSelector);
}

/**
 * Check whether a selector is an allowed global Docusaurus theme-token scope.
 */
export function isAllowedThemeScopeSelector(selector: string): boolean {
    const normalizedSelector = selector.trim();

    if (setHas(docusaurusThemeScopeSelectors, normalizedSelector)) {
        return true;
    }

    const parsedSelectorList = parseSelectorList(normalizedSelector);

    if (!isDefined(parsedSelectorList)) {
        return false;
    }

    const selectors = getSelectors(parsedSelectorList);
    const [firstSelector] = selectors;

    return (
        selectors.length === 1 &&
        isDefined(firstSelector) &&
        isStandaloneThemeScopeParsedSelector(firstSelector)
    );
}

/**
 * Check whether a custom property belongs to the DocSearch theming surface.
 */
export function isDocsearchThemeCustomPropertyName(
    propertyName: string
): boolean {
    return propertyName.startsWith("--docsearch-");
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
    const parsedSelectorList = parseSelectorList(selector);

    if (!isDefined(parsedSelectorList)) {
        return selector;
    }

    let hasReplacements = false;

    parsedSelectorList.walkClasses((classNode) => {
        const colorMode = getLegacyThemeColorModeFromClassName(classNode.value);

        if (!isDefined(colorMode)) {
            return;
        }

        const attributeNode = selectorParser.attribute({
            attribute: "data-theme",
            operator: "=",
            quoteMark: "'",
            raws: {},
            value: colorMode,
        });

        attributeNode.setValue(colorMode, {
            quoteMark: "'",
            smart: false,
        });

        classNode.replaceWith(attributeNode);

        hasReplacements = true;
    });

    return hasReplacements ? parsedSelectorList.toString() : selector;
}

/**
 * Split a selector list into trimmed individual selectors while preserving
 * commas that belong to nested selector functions such as `:is(...)`.
 */
export function normalizeSelectorList(selectorList: string): readonly string[] {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (isDefined(parsedSelectorList)) {
        return getSelectors(parsedSelectorList)
            .map((selector) => selector.toString().trim())
            .filter((selector) => selector.length > 0);
    }

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

/** Resolve leading compound-selector nodes to an explicit Docusaurus color mode. */
function getColorModeFromLeadingNodes(
    leadingNodes: readonly SelectorNode[],
    options: LeadingColorModeOptions
): DocusaurusColorMode | undefined {
    let hasRecognizedRootNode = false;
    let resolvedColorMode: DocusaurusColorMode | undefined;

    for (const selectorNode of leadingNodes) {
        if (selectorNode.type === "comment") {
            continue;
        }

        if (selectorNode.type === "tag") {
            if (selectorNode.value.toLowerCase() !== "html") {
                return undefined;
            }

            hasRecognizedRootNode = true;
            continue;
        }

        if (selectorNode.type === "attribute") {
            const colorMode = getDataThemeAttributeColorMode(selectorNode);

            if (!isDefined(colorMode)) {
                return undefined;
            }

            hasRecognizedRootNode = true;

            if (
                isDefined(resolvedColorMode) &&
                resolvedColorMode !== colorMode
            ) {
                return undefined;
            }

            resolvedColorMode = colorMode;
            continue;
        }

        if (selectorNode.type === "class") {
            const legacyColorMode = getLegacyThemeColorModeFromClassName(
                selectorNode.value
            );

            if (!isDefined(legacyColorMode)) {
                return undefined;
            }

            hasRecognizedRootNode = true;

            if (
                isDefined(resolvedColorMode) &&
                resolvedColorMode !== legacyColorMode
            ) {
                return undefined;
            }

            resolvedColorMode = legacyColorMode;
            continue;
        }

        if (selectorNode.type === "pseudo") {
            if (selectorNode.value === ":root") {
                if (options.allowRootLight !== true) {
                    return undefined;
                }

                hasRecognizedRootNode = true;

                if (
                    isDefined(resolvedColorMode) &&
                    resolvedColorMode !== "light"
                ) {
                    return undefined;
                }

                resolvedColorMode = "light";
                continue;
            }

            const pseudoColorMode = getColorModeFromPseudoFunction(
                selectorNode,
                options
            );

            if (!isDefined(pseudoColorMode)) {
                return undefined;
            }

            hasRecognizedRootNode = true;

            if (
                isDefined(resolvedColorMode) &&
                resolvedColorMode !== pseudoColorMode
            ) {
                return undefined;
            }

            resolvedColorMode = pseudoColorMode;
            continue;
        }

        return undefined;
    }

    return hasRecognizedRootNode ? resolvedColorMode : undefined;
}

/** Resolve one functional pseudo wrapper such as `:global(...)`/`:is(...)` to a
color mode. */
function getColorModeFromPseudoFunction(
    pseudoNode: Readonly<SelectorPseudo>,
    options: LeadingColorModeOptions
): DocusaurusColorMode | undefined {
    if (
        !allowedThemeScopeWrapperPseudoNames.has(pseudoNode.value) ||
        !Array.isArray(pseudoNode.nodes) ||
        isEmpty(pseudoNode.nodes)
    ) {
        return undefined;
    }

    let resolvedColorMode: DocusaurusColorMode | undefined;

    for (const nestedNode of pseudoNode.nodes) {
        if (nestedNode.type !== "selector") {
            continue;
        }

        const nestedColorMode = getColorModeFromLeadingNodes(
            getLeadingSimpleSelectorNodes(nestedNode),
            options
        );

        if (!isDefined(nestedColorMode)) {
            return undefined;
        }

        if (!isDefined(resolvedColorMode)) {
            resolvedColorMode = nestedColorMode;
            continue;
        }

        if (resolvedColorMode !== nestedColorMode) {
            return undefined;
        }
    }

    return resolvedColorMode;
}

/** Resolve one explicit `data-theme` attribute node to a color mode. */
function getDataThemeAttributeColorMode(
    attributeNode: Readonly<SelectorAttribute>
): DocusaurusColorMode | undefined {
    if (attributeNode.attribute.toLowerCase() !== "data-theme") {
        return undefined;
    }

    if (attributeNode.operator !== "=") {
        return undefined;
    }

    return attributeNode.value === "dark" || attributeNode.value === "light"
        ? attributeNode.value
        : undefined;
}

/** Resolve one exact legacy theme class name to its color mode. */
function getLegacyThemeColorModeFromClassName(
    className: string
): DocusaurusColorMode | undefined {
    if (className === "theme-light") {
        return "light";
    }

    if (className === "theme-dark") {
        return "dark";
    }

    return undefined;
}

/** Check whether one parsed selector is a standalone global theme scope. */
function isStandaloneThemeScopeParsedSelector(
    selector: Readonly<ParsedSelector>
): boolean {
    let hasMeaningfulNode = false;

    for (const selectorNode of selector.nodes) {
        if (selectorNode.type === "comment") {
            continue;
        }

        if (
            selectorNode.type === "combinator" ||
            selectorNode.type === "nesting"
        ) {
            return false;
        }

        if (selectorNode.type === "tag") {
            if (selectorNode.value.toLowerCase() !== "html") {
                return false;
            }

            hasMeaningfulNode = true;
            continue;
        }

        if (selectorNode.type === "attribute") {
            if (!isDefined(getDataThemeAttributeColorMode(selectorNode))) {
                return false;
            }

            hasMeaningfulNode = true;
            continue;
        }

        if (selectorNode.type !== "pseudo") {
            return false;
        }

        if (selectorNode.value === ":root") {
            hasMeaningfulNode = true;
            continue;
        }

        if (
            !allowedThemeScopeWrapperPseudoNames.has(selectorNode.value) ||
            !Array.isArray(selectorNode.nodes) ||
            isEmpty(selectorNode.nodes)
        ) {
            return false;
        }

        if (
            !selectorNode.nodes.every(
                (nestedNode) =>
                    nestedNode.type === "selector" &&
                    isStandaloneThemeScopeParsedSelector(nestedNode)
            )
        ) {
            return false;
        }

        hasMeaningfulNode = true;
    }

    return hasMeaningfulNode;
}
