import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import { normalizeSelectorList } from "../_internal/docusaurus-theme-scope.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("prefer-data-theme-docsearch-overrides");
const messages: {
    rejectedNavbarDarkDocSearchSelector: (selector: string) => string;
} = ruleMessages(ruleName, {
    rejectedNavbarDarkDocSearchSelector: (selector: string): string =>
        `Prefer an explicit [data-theme='dark'] or [data-theme='light'] scope over selector "${selector}" when overriding DocSearch styles. .navbar--dark reflects navbar style, not the site's active color mode.`,
});

const docs = {
    description:
        "Prefer [data-theme] selectors over .navbar--dark when overriding DocSearch styles.",
    recommended: false,
    url: createRuleDocsUrl("prefer-data-theme-docsearch-overrides"),
} as const;

/**
 * Find the first selector that uses `.navbar--dark` as a DocSearch color-mode
 * proxy without any explicit site `data-theme` scope.
 */
function findInvalidDocSearchOverrideSelector(
    selectorList: string
): string | undefined {
    for (const selector of normalizeSelectorList(selectorList)) {
        if (!selector.includes(".navbar--dark")) {
            continue;
        }

        if (!selector.includes(".DocSearch")) {
            continue;
        }

        if (selector.includes("[data-theme")) {
            continue;
        }

        return selector;
    }

    return undefined;
}

/**
 * Rule implementation for preferring site color-mode selectors when customizing
 * DocSearch UI styles.
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
            const invalidSelector = findInvalidDocSearchOverrideSelector(
                ruleNode.selector
            );

            if (!isDefined(invalidSelector)) {
                return;
            }

            report({
                message:
                    messages.rejectedNavbarDarkDocSearchSelector(
                        invalidSelector
                    ),
                node: ruleNode,
                result,
                ruleName,
                word: ".navbar--dark",
            });
        });
    };

/** Public rule definition for `prefer-data-theme-docsearch-overrides`. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
