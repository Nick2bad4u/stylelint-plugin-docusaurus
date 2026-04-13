import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    getContainingRule,
    isAllowedThemeScopeRule,
    isDocsearchThemeCustomPropertyName,
    isDocusaurusThemeCustomPropertyName,
} from "../_internal/docusaurus-theme-scope.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";
import {
    getSelectors,
    parseSelectorList,
    selectorTrailingCompoundHasClass,
} from "../_internal/selector-parser-utils.js";

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
        "Disallow declaring Docusaurus theme custom properties outside global theme scopes, except for DocSearch variables scoped to the DocSearch UI.",
    recommended: true,
    url: createRuleDocsUrl("no-invalid-theme-custom-property-scope"),
} as const;

/** Boundary-aware fallback for exact `.DocSearch` root class detection. */
const docSearchRootClassPattern =
    /(^|[^\w-])\.DocSearch(?![\w-])/u;

/**
 * Check whether every selector in a rule scopes DocSearch variables to the
 * DocSearch UI surface.
 */
function isAllowedDocSearchScopeRule(
    ruleNode: Readonly<import("postcss").Rule>
): boolean {
    const parsedSelectorList = parseSelectorList(ruleNode.selector);

    if (isDefined(parsedSelectorList)) {
        const selectors = getSelectors(parsedSelectorList);

        return (
            selectors.length > 0 &&
            selectors.every((selector) =>
                selectorTrailingCompoundHasClass(
                    selector,
                    (className) => className === "DocSearch"
                )
            )
        );
    }

    return docSearchRootClassPattern.test(ruleNode.selector);
}

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

            if (isDocsearchThemeCustomPropertyName(declaration.prop) && (
                    isAllowedThemeScopeRule(containingRule) ||
                    isAllowedDocSearchScopeRule(containingRule)
                )) {
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
