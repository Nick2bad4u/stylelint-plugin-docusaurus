import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import { cssValueHasStandaloneIdentifier } from "../_internal/css-value-analysis.js";
import { getContainingRule } from "../_internal/docusaurus-theme-scope.js";
import {
    getSelectors,
    parseSelectorList,
} from "../_internal/selector-parser-utils.js";
import {
    ruleHasScopeAnchorInAncestors,
    selectorHasScopeAnchor,
} from "../_internal/selector-scope-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-revert-layer-outside-isolation-subtrees");
const messages: {
    rejectedSelector: (selector: string) => string;
} = ruleMessages(ruleName, {
    rejectedSelector: (selector: string): string =>
        `Use revert-layer only inside an explicit local isolation subtree. Selector "${selector}" is too broad because it is not anchored by a component wrapper, local id, or dedicated data attribute.`,
});

const docs = {
    description:
        "Disallow revert-layer usage outside explicitly isolated local subtrees.",
    recommended: false,
    url: createRuleDocsUrl("no-revert-layer-outside-isolation-subtrees"),
} as const;

/** Find the first selector in a list that lacks an explicit isolation anchor. */
function findBroadRevertLayerSelector(
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

/** Rule implementation for revert-layer isolation hygiene. */
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
            if (
                !cssValueHasStandaloneIdentifier(
                    declaration.value,
                    "revert-layer"
                )
            ) {
                return;
            }

            const containingRule = getContainingRule(declaration);

            if (!isDefined(containingRule)) {
                return;
            }

            const invalidSelector = findBroadRevertLayerSelector(
                containingRule.selector,
                ruleHasScopeAnchorInAncestors(containingRule, {
                    includeGlobal: true,
                })
            );

            if (!isDefined(invalidSelector)) {
                return;
            }

            report({
                message: messages.rejectedSelector(invalidSelector),
                node: declaration,
                result,
                ruleName,
                word: "revert-layer",
            });
        });
    };

/** Public rule definition for revert-layer isolation hygiene. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
