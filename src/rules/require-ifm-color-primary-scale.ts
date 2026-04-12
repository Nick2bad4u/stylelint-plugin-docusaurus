import stylelint, { type RuleBase } from "stylelint";
import { arrayJoin, isEmpty, setHas } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    isAllowedThemeScopeRule,
    isIfmColorPrimaryScaleVariable,
    requiredIfmColorPrimaryScaleVariables,
    walkThemeScopeDeclarations,
} from "../_internal/docusaurus-theme-scope.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("require-ifm-color-primary-scale");
const messages: {
    expectedFullScale: (selector: string, missingVariables: string) => string;
} = ruleMessages(ruleName, {
    expectedFullScale: (selector: string, missingVariables: string): string =>
        `When overriding Infima primary color variables in ${selector}, also define the full recommended primary scale. Missing: ${missingVariables}.`,
});

const docs = {
    description:
        "Require the full recommended Infima primary color scale when overriding --ifm-color-primary.",
    recommended: false,
    url: createRuleDocsUrl("require-ifm-color-primary-scale"),
} as const;

/**
 * Rule implementation for checking the full Infima primary color scale.
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

        root.walkRules((ruleNode) => {
            if (!isAllowedThemeScopeRule(ruleNode)) {
                return;
            }

            const declaredVariables = new Set<
                (typeof requiredIfmColorPrimaryScaleVariables)[number]
            >();

            walkThemeScopeDeclarations(ruleNode, (declaration) => {
                if (!isIfmColorPrimaryScaleVariable(declaration.prop)) {
                    return;
                }

                declaredVariables.add(
                    declaration.prop as (typeof requiredIfmColorPrimaryScaleVariables)[number]
                );
            });

            if (declaredVariables.size === 0) {
                return;
            }

            const missingVariables =
                requiredIfmColorPrimaryScaleVariables.filter(
                    (propertyName) => !setHas(declaredVariables, propertyName)
                );

            if (isEmpty(missingVariables)) {
                return;
            }

            report({
                message: messages.expectedFullScale(
                    ruleNode.selector,
                    arrayJoin(missingVariables, ", ")
                ),
                node: ruleNode,
                result,
                ruleName,
            });
        });
    };

/** Public rule definition for `require-ifm-color-primary-scale`. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
