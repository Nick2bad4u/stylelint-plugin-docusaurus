import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import { cssValueHasStandaloneIdentifier } from "../_internal/css-value-analysis.js";
import { getContainingRule } from "../_internal/docusaurus-theme-scope.js";
import { findFirstSelectorWithoutIsolationAnchor } from "../_internal/isolation-subtree-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";
import { ruleHasScopeAnchorInAncestors } from "../_internal/selector-scope-analysis.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const broadAllResetKeywords = [
    "initial",
    "revert",
    "unset",
] as const;

const ruleName = createRuleName(
    "no-broad-all-resets-outside-isolation-subtrees"
);
const messages: {
    rejectedSelector: (keyword: string, selector: string) => string;
} = ruleMessages(ruleName, {
    rejectedSelector: (keyword: string, selector: string): string =>
        `Use all: ${keyword} only inside an explicit local isolation subtree. Selector "${selector}" is too broad because it is not anchored by a component wrapper, local id, or dedicated data attribute.`,
});

const docs = {
    description:
        "Disallow broad all: initial|revert|unset resets outside explicitly isolated local subtrees.",
    recommended: false,
    url: createRuleDocsUrl("no-broad-all-resets-outside-isolation-subtrees"),
} as const;

/** Find the first broad all-reset keyword in one declaration value. */
function findBroadAllResetKeyword(
    declarationValue: string
): (typeof broadAllResetKeywords)[number] | undefined {
    for (const keyword of broadAllResetKeywords) {
        if (cssValueHasStandaloneIdentifier(declarationValue, keyword)) {
            return keyword;
        }
    }

    return undefined;
}

/** Rule implementation for broad all-reset isolation hygiene. */
const ruleFunction: RuleBase<boolean, undefined> =
    (primary) => (root, result) => {
        const isValid = validateOptions(result, ruleName, {
            actual: primary,
            possible: [true],
        });

        if (!isValid) {
            return;
        }

        root.walkDecls("all", (declaration) => {
            const broadResetKeyword = findBroadAllResetKeyword(
                declaration.value
            );

            if (!isDefined(broadResetKeyword)) {
                return;
            }

            const containingRule = getContainingRule(declaration);

            if (!isDefined(containingRule)) {
                return;
            }

            const invalidSelector = findFirstSelectorWithoutIsolationAnchor(
                containingRule.selector,
                ruleHasScopeAnchorInAncestors(containingRule, {
                    includeGlobal: true,
                })
            );

            if (!isDefined(invalidSelector)) {
                return;
            }

            report({
                message: messages.rejectedSelector(
                    broadResetKeyword,
                    invalidSelector
                ),
                node: declaration,
                result,
                ruleName,
                word: broadResetKeyword,
            });
        });
    };

/** Public rule definition for broad all-reset isolation hygiene. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
