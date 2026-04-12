import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    getContainingRule,
    isAllowedThemeScopeRule,
    isDocusaurusThemeCustomPropertyName,
} from "../_internal/docusaurus-theme-scope.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-invalid-theme-custom-property-scope");
const messages: {
    rejectedScope: (propertyName: string, selector: string) => string;
} = ruleMessages(ruleName, {
    rejectedScope: (propertyName: string, selector: string): string =>
        `Declare ${propertyName} only in global Docusaurus theme scopes like :root or [data-theme='dark'], not within selector "${selector}".`,
});

const docs = {
    description:
        "Disallow declaring Docusaurus theme custom properties outside global theme scopes.",
    recommended: true,
    url: createRuleDocsUrl("no-invalid-theme-custom-property-scope"),
} as const;

/**
 * Rule implementation for validating global scope placement of Docusaurus theme
 * custom properties.
 */
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
            if (!isDocusaurusThemeCustomPropertyName(declaration.prop)) {
                return;
            }

            const containingRule = getContainingRule(declaration);

            if (!isDefined(containingRule)) {
                return;
            }

            if (isAllowedThemeScopeRule(containingRule)) {
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

/** Public rule definition for `no-invalid-theme-custom-property-scope`. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
