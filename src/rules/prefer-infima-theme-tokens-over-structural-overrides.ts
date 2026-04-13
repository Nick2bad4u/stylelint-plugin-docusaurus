import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import { cssValueHasCustomPropertyReference } from "../_internal/css-value-analysis.js";
import type { StructuralTokenRecommendation } from "../_internal/docusaurus-selector-contracts.js";

import { structuralTokenRecommendations } from "../_internal/docusaurus-selector-contracts.js";
import { getContainingRule } from "../_internal/docusaurus-theme-scope.js";
import {
    getSelectors,
    getTrailingSimpleSelectorNodes,
    isInsideGlobalPseudo,
    parseSelectorList,
} from "../_internal/selector-parser-utils.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName(
    "prefer-infima-theme-tokens-over-structural-overrides"
);
const messages: {
    rejectedOverride: (
        propertyName: string,
        selector: string,
        tokenName: string
    ) => string;
} = ruleMessages(ruleName, {
    rejectedOverride: (
        propertyName: string,
        selector: string,
        tokenName: string
    ): string =>
        `Prefer overriding ${tokenName} in a global theme scope instead of hard-coding ${propertyName} on selector "${selector}".`,
});

const docs = {
    description:
        "Prefer curated Infima theme tokens over hard-coded structural overrides on common Docusaurus theme surfaces.",
    recommended: false,
    url: createRuleDocsUrl(
        "prefer-infima-theme-tokens-over-structural-overrides"
    ),
} as const;

/** Find the first structural-token recommendation that matches one selector. */
function findStructuralTokenRecommendation(
    selectorList: string,
    propertyName: string
):
    | Readonly<{
          recommendation: StructuralTokenRecommendation;
          selector: string;
      }>
    | undefined {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    for (const selector of getSelectors(parsedSelectorList)) {
        const trailingClassNames = getTrailingSimpleSelectorNodes(selector)
            .filter(
                (
                    selectorNode
                ): selectorNode is import("postcss-selector-parser").ClassName =>
                    selectorNode.type === "class" &&
                    !isInsideGlobalPseudo(selectorNode)
            )
            .map((classNode) => classNode.value);

        for (const recommendation of structuralTokenRecommendations) {
            if (!recommendation.properties.includes(propertyName)) {
                continue;
            }

            if (
                !trailingClassNames.some((className) =>
                    recommendation.selectorClassNames.includes(className)
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

/** Rule implementation for preferring curated Infima theme tokens. */
const ruleFunction: RuleBase<boolean, undefined> =
    (primary) => (root, result) => {
        const isValid = validateOptions(result, ruleName, {
            actual: primary,
            possible: [true],
        });

        if (!isValid) {
            return;
        }

        root.walkDecls((declaration) => {
            if (declaration.prop.startsWith("--")) {
                return;
            }

            const containingRule = getContainingRule(declaration);

            if (!isDefined(containingRule)) {
                return;
            }

            const recommendationMatch = findStructuralTokenRecommendation(
                containingRule.selector,
                declaration.prop.toLowerCase()
            );

            if (!isDefined(recommendationMatch)) {
                return;
            }

            if (
                cssValueHasCustomPropertyReference(
                    declaration.value,
                    recommendationMatch.recommendation.tokenName
                )
            ) {
                return;
            }

            report({
                message: messages.rejectedOverride(
                    declaration.prop,
                    recommendationMatch.selector,
                    recommendationMatch.recommendation.tokenName
                ),
                node: declaration,
                result,
                ruleName,
                word: declaration.prop,
            });
        });
    };

/** Public rule definition for curated Infima token preferences. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
