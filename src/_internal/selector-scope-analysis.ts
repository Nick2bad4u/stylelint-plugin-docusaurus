/* eslint-disable perfectionist/sort-modules -- exported function order is intentionally arranged to avoid no-use-before-define conflicts while keeping public API readable */
import type { Rule } from "postcss";
import type { Node } from "postcss-selector-parser";
import type { Except } from "type-fest";

import { isDefined, setHas } from "ts-extras";

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

/**
 * Check whether a selector has a meaningful scope anchor such as a component
 * class, a stable Docusaurus wrapper, a custom id, or a non-root data
 * attribute.
 */
function computeSelectorHasScopeAnchor(
    selector: Readonly<ParsedSelector>,
    {
        additionalAnchorClassNames,
        additionalIgnoredAttributeNames,
        ancestorHasScopeAnchor = false,
        includeGlobal = false,
    }: SelectorScopeAnchorOptions = {}
): boolean {
    /** Check whether one selector node lives under any named ancestor pseudo. */
    function hasNamedAncestorPseudo(
        node: Readonly<Node>,
        pseudoNames: ReadonlySet<string>
    ): boolean {
        let currentNode: Node | undefined = node.parent as Node | undefined;

        while (isDefined(currentNode)) {
            const parentNode = currentNode.parent as Node | undefined;

            if (
                currentNode.type === "pseudo" &&
                setHas(pseudoNames, currentNode.value)
            ) {
                return true;
            }

            currentNode = parentNode;
        }

        return false;
    }

    /**
     * Check whether one selector node should be ignored for positive scope
     * anchoring.
     */
    function shouldIgnoreScopeAnchorNode(
        node: Readonly<Node>,
        includeGlobalScope: boolean
    ): boolean {
        if (!includeGlobalScope && isInsideGlobalPseudo(node)) {
            return true;
        }

        return hasNamedAncestorPseudo(node, nonPositiveScopeAnchorPseudoNames);
    }

    if (ancestorHasScopeAnchor) {
        return true;
    }

    let hasMeaningfulScopeAnchor = false;

    selector.walkClasses((cssClassNode) => {
        if (hasMeaningfulScopeAnchor) {
            return;
        }

        if (shouldIgnoreScopeAnchorNode(cssClassNode, includeGlobal)) {
            return;
        }

        if (
            isDefined(additionalAnchorClassNames) &&
            setHas(additionalAnchorClassNames, cssClassNode.value)
        ) {
            hasMeaningfulScopeAnchor = true;

            return;
        }

        if (isLikelyDocusaurusGlobalThemeClassName(cssClassNode.value)) {
            return;
        }

        hasMeaningfulScopeAnchor = true;
    });

    if (hasMeaningfulScopeAnchor) {
        return true;
    }

    selector.walkIds((idNode) => {
        if (hasMeaningfulScopeAnchor) {
            return;
        }

        if (shouldIgnoreScopeAnchorNode(idNode, includeGlobal)) {
            return;
        }

        if (setHas(rootOnlyIgnoredIdNames, idNode.value)) {
            return;
        }

        hasMeaningfulScopeAnchor = true;
    });

    if (hasMeaningfulScopeAnchor) {
        return true;
    }

    selector.walkAttributes((attributeNode) => {
        if (hasMeaningfulScopeAnchor) {
            return;
        }

        if (shouldIgnoreScopeAnchorNode(attributeNode, includeGlobal)) {
            return;
        }

        const attributeName = attributeNode.attribute.toLowerCase();

        if (setHas(rootOnlyIgnoredAttributeNames, attributeName)) {
            return;
        }

        if (
            isDefined(additionalIgnoredAttributeNames) &&
            setHas(additionalIgnoredAttributeNames, attributeName)
        ) {
            return;
        }

        hasMeaningfulScopeAnchor = true;
    });

    return hasMeaningfulScopeAnchor;
}

/** Check whether any containing ancestor rule provides a useful scope anchor. */
export function ruleHasScopeAnchorInAncestors(
    ruleNode: Readonly<Rule>,
    options: Except<SelectorScopeAnchorOptions, "ancestorHasScopeAnchor"> = {}
): boolean {
    return getContainingRules(ruleNode).some((ancestorRule) => {
        const parsedSelectorList = parseSelectorList(ancestorRule.selector);

        if (!isDefined(parsedSelectorList)) {
            return false;
        }

        return getSelectors(parsedSelectorList).some((selector) =>
            computeSelectorHasScopeAnchor(selector, options)
        );
    });
}

/**
 * Check whether a selector has a meaningful scope anchor such as a component
 * class, a stable Docusaurus wrapper, a custom id, or a non-root data
 * attribute.
 */
export function selectorHasScopeAnchor(
    selector: Readonly<ParsedSelector>,
    options: SelectorScopeAnchorOptions = {}
): boolean {
    return computeSelectorHasScopeAnchor(selector, options);
}

/**
 * Check whether any selector in one selector list has a meaningful scope
 * anchor.
 */
export function selectorListHasScopeAnchor(
    selectorList: string,
    options: SelectorScopeAnchorOptions = {}
): boolean {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return false;
    }

    return getSelectors(parsedSelectorList).some((selector) =>
        computeSelectorHasScopeAnchor(selector, options)
    );
}

/* eslint-enable perfectionist/sort-modules -- restore default ordering checks outside this intentionally ordered module */
