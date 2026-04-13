import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import { isAllowedDocSearchRootScopeRule } from "../_internal/docsearch-root-scope.js";
import {
    getContainingRule,
    isDocsearchThemeCustomPropertyName,
} from "../_internal/docusaurus-theme-scope.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName(
    "require-docsearch-root-scope-for-docsearch-token-overrides"
);
const messages: {
    rejectedScope: (propertyName: string, selector: string) => string;
} = ruleMessages(ruleName, {
    rejectedScope: (propertyName: string, selector: string): string =>
        `Declare ${propertyName} on the .DocSearch root scope instead of selector "${selector}". Prefer selectors such as .DocSearch or [data-theme='dark'] .DocSearch for DocSearch token overrides.`,
});

const docs = {
    description:
        "Require DocSearch token overrides to live on the .DocSearch root scope instead of descendant or non-DocSearch selectors.",
    recommended: false,
    url: createRuleDocsUrl(
        "require-docsearch-root-scope-for-docsearch-token-overrides"
    ),
} as const;

/** Rule implementation for DocSearch-root token scoping. */
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
            if (!isDocsearchThemeCustomPropertyName(declaration.prop)) {
                return;
            }

            const containingRule = getContainingRule(declaration);

            if (!isDefined(containingRule)) {
                return;
            }

            if (isAllowedDocSearchRootScopeRule(containingRule)) {
                return;
            }

            report({
                message: messages.rejectedScope(
                    declaration.prop,
                    containingRule.selector
                ),
                node: declaration,
                result,
                ruleName,
                word: declaration.prop,
            });
        });
    };

/** Public rule definition for DocSearch-root token scoping. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
