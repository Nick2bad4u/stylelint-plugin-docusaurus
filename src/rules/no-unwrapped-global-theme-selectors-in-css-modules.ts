import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

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
import { isCssModuleRoot } from "../_internal/source-file-context.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName(
    "no-unwrapped-global-theme-selectors-in-css-modules"
);
const messages: {
    rejectedSelector: (themeClassSelector: string, selector: string) => string;
} = ruleMessages(ruleName, {
    rejectedSelector: (themeClassSelector: string, selector: string): string =>
        `Wrap global Docusaurus selector ${themeClassSelector} in :global(...) inside CSS Modules. Selector "${selector}" currently relies on a runtime theme class that CSS Modules localize by default.`,
});

const docs = {
    description:
        "Disallow unwrapped Docusaurus and Infima global theme selectors inside CSS Modules.",
    recommended: true,
    url: createRuleDocsUrl(
        "no-unwrapped-global-theme-selectors-in-css-modules"
    ),
} as const;

/** Find the first unwrapped global theme class used inside a CSS Module rule. */
function findInvalidCssModuleSelector(selectorList: string):
    | Readonly<{
          selector: string;
          themeClassSelector: string;
      }>
    | undefined {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    for (const selector of getSelectors(parsedSelectorList)) {
        for (const themeClassName of getClassNamesOutsideGlobal(selector)) {
            if (!isLikelyDocusaurusGlobalThemeClassName(themeClassName)) {
                continue;
            }

            return {
                selector: selector.toString(),
                themeClassSelector: `.${themeClassName}`,
            };
        }
    }

    return undefined;
}

/** Rule implementation for CSS Modules global Docusaurus selector hygiene. */
const ruleFunction: RuleBase<boolean, undefined> =
    (primary) => (root, result) => {
        const isValid = validateOptions(result, ruleName, {
            actual: primary,
            possible: [true],
        });

        if (!isValid || !isCssModuleRoot(root)) {
            return;
        }

        root.walkRules((ruleNode) => {
            const invalidSelector = findInvalidCssModuleSelector(
                ruleNode.selector
            );

            if (!isDefined(invalidSelector)) {
                return;
            }

            report({
                message: messages.rejectedSelector(
                    invalidSelector.themeClassSelector,
                    invalidSelector.selector
                ),
                node: ruleNode,
                result,
                ruleName,
                word: invalidSelector.themeClassSelector,
            });
        });
    };

/** Public rule definition for CSS Modules global theme selector hygiene. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
