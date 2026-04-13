import type { Rule } from "postcss";

import { isDefined } from "ts-extras";

import {
    getSelectors,
    parseSelectorList,
    selectorTrailingCompoundHasClass,
} from "./selector-parser-utils.js";

/**
 * Check whether every selector in a rule scopes DocSearch token declarations to
 * the `.DocSearch` root UI surface.
 */
export function isAllowedDocSearchRootScopeRule(
    ruleNode: Readonly<Rule>
): boolean {
    const parsedSelectorList = parseSelectorList(ruleNode.selector);

    if (!isDefined(parsedSelectorList)) {
        return false;
    }

    const selectors = getSelectors(parsedSelectorList);

    return (
        selectors.length > 0 &&
        selectors.every((selector) =>
            selectorTrailingCompoundHasClass(
                selector,
                (selectorName) => selectorName === "DocSearch"
            )
        )
    );
}
