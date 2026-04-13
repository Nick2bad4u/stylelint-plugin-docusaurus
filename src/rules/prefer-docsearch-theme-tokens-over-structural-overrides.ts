import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";
import type { StructuralTokenRecommendation } from "../_internal/docusaurus-selector-contracts.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import { cssValueHasCustomPropertyReference } from "../_internal/css-value-analysis.js";
import { getContainingRule } from "../_internal/docusaurus-theme-scope.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";
import { findStructuralTokenRecommendationMatch } from "../_internal/structural-token-recommendations.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName(
    "prefer-docsearch-theme-tokens-over-structural-overrides"
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
        `Prefer overriding ${tokenName} in a DocSearch theme scope instead of hard-coding ${propertyName} on selector "${selector}".`,
});

const docs = {
    description:
        "Prefer curated DocSearch theme tokens over hard-coded structural overrides on common DocSearch UI surfaces.",
    recommended: false,
    url: createRuleDocsUrl(
        "prefer-docsearch-theme-tokens-over-structural-overrides"
    ),
} as const;

const docsearchStructuralTokenRecommendations: readonly StructuralTokenRecommendation[] =
    [
        {
            properties: ["background", "background-color"],
            selectorClassNames: ["DocSearch-Button", "DocSearch-SearchBar"],
            tokenName: "--docsearch-searchbox-background",
        },
        {
            properties: ["color"],
            selectorClassNames: ["DocSearch-Button"],
            tokenName: "--docsearch-text-color",
        },
        {
            properties: ["background", "background-color"],
            selectorClassNames: ["DocSearch-Container"],
            tokenName: "--docsearch-container-background",
        },
        {
            properties: ["background", "background-color"],
            selectorClassNames: ["DocSearch-Modal"],
            tokenName: "--docsearch-modal-background",
        },
        {
            properties: ["background", "background-color"],
            selectorClassNames: ["DocSearch-Hit"],
            tokenName: "--docsearch-hit-background",
        },
        {
            properties: ["color"],
            selectorClassNames: ["DocSearch-Hit"],
            tokenName: "--docsearch-hit-color",
        },
        {
            properties: ["background", "background-color"],
            selectorClassNames: ["DocSearch-Footer"],
            tokenName: "--docsearch-footer-background",
        },
    ];

/** Rule implementation for preferring curated DocSearch theme tokens. */
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

            const recommendationMatch = findStructuralTokenRecommendationMatch(
                containingRule.selector,
                declaration.prop.toLowerCase(),
                docsearchStructuralTokenRecommendations
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

/** Public rule definition for curated DocSearch token preferences. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
