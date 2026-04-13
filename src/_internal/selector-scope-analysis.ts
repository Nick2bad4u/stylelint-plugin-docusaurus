import type { Rule } from "postcss";
import type { Node } from "postcss-selector-parser";

import {
    isLikelyDocusaurusGlobalThemeClassName,
    rootOnlyIgnoredAttributeNames,
    rootOnlyIgnoredIdNames,
} from "./docusaurus-selector-contracts.js";
import { getContainingRules } from "./docusaurus-theme-scope.js";
import {
    getSelectors,
    isInsideGlobalPseudo,
    type ParsedSelector,
    parseSelectorList,
} from "./selector-parser-utils.js";

/** Pseudo selectors whose nested selectors must not count as positive anchors. */
const nonPositiveScopeAnchorPseudoNames: ReadonlySet<string> = new Set([
    ":has",
    ":not",
]);

/** Options for deciding whether a selector has a meaningful scope anchor. */
export type SelectorScopeAnchorOptions = Readonly<{
    additionalAnchorClassNames?: ReadonlySet<string>;
    additionalIgnoredAttributeNames?: ReadonlySet<string>;
    ancestorHasScopeAnchor?: boolean;
    includeGlobal?: boolean;
}>;

/** Check whether any containing ancestor rule provides a useful scope anchor. */
export function ruleHasScopeAnchorInAncestors(
    ruleNode: Readonly<Rule>,
    options: Omit<SelectorScopeAnchorOptions, "ancestorHasScopeAnchor"> = {}
): boolean {
    return getContainingRules(ruleNode).some((ancestorRule) =>
        selectorListHasScopeAnchor(ancestorRule.selector, options)
    );
}

/**
 * Check whether a selector has a meaningful scope anchor such as a component
 * class, a stable Docusaurus wrapper, a custom id, or a non-root data
 * attribute.
 */
export function selectorHasScopeAnchor(
    selector: Readonly<ParsedSelector>,
    {
        additionalAnchorClassNames,
        additionalIgnoredAttributeNames,
        ancestorHasScopeAnchor = false,
        includeGlobal = false,
    }: SelectorScopeAnchorOptions = {}
): boolean {
    if (ancestorHasScopeAnchor) {
        return true;
    }

    let hasMeaningfulScopeAnchor = false;

    selector.walkClasses((classNode) => {
        if (shouldIgnoreScopeAnchorNode(classNode, includeGlobal)) {
            return;
        }

        if (
            additionalAnchorClassNames !== undefined &&
            additionalAnchorClassNames.has(classNode.value)
        ) {
            hasMeaningfulScopeAnchor = true;

            return false;
        }

        if (isLikelyDocusaurusGlobalThemeClassName(classNode.value)) {
            return;
        }

        hasMeaningfulScopeAnchor = true;

        return false;
    });

    if (hasMeaningfulScopeAnchor) {
        return true;
    }

    selector.walkIds((idNode) => {
        if (shouldIgnoreScopeAnchorNode(idNode, includeGlobal)) {
            return;
        }

        if (rootOnlyIgnoredIdNames.has(idNode.value)) {
            return;
        }

        hasMeaningfulScopeAnchor = true;

        return false;
    });

    if (hasMeaningfulScopeAnchor) {
        return true;
    }

    selector.walkAttributes((attributeNode) => {
        if (shouldIgnoreScopeAnchorNode(attributeNode, includeGlobal)) {
            return;
        }

        const attributeName = attributeNode.attribute.toLowerCase();

        if (rootOnlyIgnoredAttributeNames.has(attributeName)) {
            return;
        }

        if (
            additionalIgnoredAttributeNames !== undefined &&
            additionalIgnoredAttributeNames.has(attributeName)
        ) {
            return;
        }

        hasMeaningfulScopeAnchor = true;

        return false;
    });

    return hasMeaningfulScopeAnchor;
}

/** Check whether any selector in one selector list has a meaningful scope
anchor. */
export function selectorListHasScopeAnchor(
    selectorList: string,
    options: SelectorScopeAnchorOptions = {}
): boolean {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (parsedSelectorList === undefined) {
        return false;
    }

    return getSelectors(parsedSelectorList).some((selector) =>
        selectorHasScopeAnchor(selector, options)
    );
}

/** Check whether one selector node lives under any named ancestor pseudo. */
function hasNamedAncestorPseudo(
    node: Readonly<Node>,
    pseudoNames: ReadonlySet<string>
): boolean {
    let currentNode: Node | undefined = node.parent as Node | undefined;

    while (currentNode !== undefined) {
        const parentNode = currentNode.parent as Node | undefined;

        if (
            currentNode.type === "pseudo" &&
            pseudoNames.has(currentNode.value)
        ) {
            return true;
        }

        currentNode = parentNode;
    }

    return false;
}

/** Check whether one selector node should be ignored for positive scope
anchoring. */
function shouldIgnoreScopeAnchorNode(
    node: Readonly<Node>,
    includeGlobal: boolean
): boolean {
    if (!includeGlobal && isInsideGlobalPseudo(node)) {
        return true;
    }

    return hasNamedAncestorPseudo(node, nonPositiveScopeAnchorPseudoNames);
}
