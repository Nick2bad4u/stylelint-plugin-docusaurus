import { isDefined } from "ts-extras";

import { getSelectors, parseSelectorList } from "./selector-parser-utils.js";
import { selectorHasScopeAnchor } from "./selector-scope-analysis.js";

/**
 * Find the first selector in a selector list that lacks an explicit local
 * isolation anchor.
 */
export function findFirstSelectorWithoutIsolationAnchor(
    selectorList: string,
    ancestorHasScopeAnchor: boolean
): string | undefined {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    for (const selector of getSelectors(parsedSelectorList)) {
        if (
            selectorHasScopeAnchor(selector, {
                ancestorHasScopeAnchor,
                includeGlobal: true,
            })
        ) {
            continue;
        }

        return selector.toString();
    }

    return undefined;
}
