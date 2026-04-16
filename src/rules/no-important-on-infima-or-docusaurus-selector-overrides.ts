import type { Rule } from "postcss";

import stylelint, { type RuleBase } from "stylelint";
import { isDefined, safeCastTo } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import { isLikelyDocusaurusGlobalThemeClassName } from "../_internal/docusaurus-selector-contracts.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";
import {
    getClassNamesOutsideGlobal,
    getSelectors,
    parseSelectorList,
} from "../_internal/selector-parser-utils.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName(
    "no-important-on-infima-or-docusaurus-selector-overrides"
);

const messages: {
    rejectedImportant: (propertyName: string, selector: string) => string;
} = ruleMessages(ruleName, {
    rejectedImportant: (propertyName: string, selector: string): string =>
        `Avoid \`!important\` on "${propertyName}" inside "${selector}". Using \`!important\` on Infima or Docusaurus selectors bypasses the design-token cascade and prevents future framework upgrades from propagating. Use correct CSS specificity instead.`,
});

const docs = {
    description:
        "Disallow `!important` on declarations inside rules that target Infima or Docusaurus class selectors.",
    recommended: false,
    url: createRuleDocsUrl(
        "no-important-on-infima-or-docusaurus-selector-overrides"
    ),
} as const;

/**
 * Determine whether a selector list contains at least one selector that
 * references an Infima or Docusaurus global theme class name.
 *
 * Returns the first matching selector string, or `undefined`.
 */
function findInfimaOrDocusaurusSelector(
    selectorList: string
): string | undefined {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    for (const selector of getSelectors(parsedSelectorList)) {
        for (const cssClassName of getClassNamesOutsideGlobal(selector)) {
            if (isLikelyDocusaurusGlobalThemeClassName(cssClassName)) {
                return selector.toString();
            }
        }
    }

    return undefined;
}

/** Rule implementation for `!important` on Infima/Docusaurus selectors. */
const ruleFunction: RuleBase<boolean, undefined> =
    (primary) => (root, result) => {
        const isValid = validateOptions(result, ruleName, {
            actual: primary,
            possible: [true],
        });

        if (!isValid) {
            return;
        }

        root.walkDecls((decl) => {
            if (!decl.important) {
                return;
            }

            const parentNode = decl.parent;

            if (!isDefined(parentNode) || parentNode.type !== "rule") {
                return;
            }

            const parentRule = safeCastTo<Rule>(parentNode);
            const matchedSelector = findInfimaOrDocusaurusSelector(
                parentRule.selector
            );

            if (!isDefined(matchedSelector)) {
                return;
            }

            report({
                message: messages.rejectedImportant(decl.prop, matchedSelector),
                node: decl,
                result,
                ruleName,
                word: decl.prop,
            });
        });
    };

/** Public rule definition for `!important` on Infima/Docusaurus selectors. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
