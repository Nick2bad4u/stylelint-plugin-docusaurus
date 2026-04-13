import { arrayIncludes, isDefined } from "ts-extras";

import type { StructuralTokenRecommendation } from "./docusaurus-selector-contracts.js";

import {
    getSelectors,
    parseSelectorList,
    selectorTrailingCompoundHasClass,
} from "./selector-parser-utils.js";

/** One selector/property match against a curated structural token rule. */
export type StructuralTokenRecommendationMatch = Readonly<{
    recommendation: StructuralTokenRecommendation;
    selector: string;
}>;

/**
 * Find the first structural-token recommendation that matches one selector and
 * declaration property.
 */
export function findStructuralTokenRecommendationMatch(
    selectorList: string,
    propertyName: string,
    recommendations: readonly StructuralTokenRecommendation[]
): StructuralTokenRecommendationMatch | undefined {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    for (const selector of getSelectors(parsedSelectorList)) {
        for (const recommendation of recommendations) {
            if (!arrayIncludes(recommendation.properties, propertyName)) {
                continue;
            }

            if (
                !recommendation.selectorClassNames.some((targetClassName) =>
                    selectorTrailingCompoundHasClass(
                        selector,
                        (selectorClassName) =>
                            selectorClassName === targetClassName
                    )
                )
            ) {
                continue;
            }

            return {
                recommendation,
                selector: selector.toString(),
            };
        }
    }

    return undefined;
}
