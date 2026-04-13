import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    findClassAttributeFragmentMatch,
    getSelectors,
    parseSelectorList,
} from "../_internal/selector-parser-utils.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("prefer-stable-docusaurus-theme-class-names");
const messages: {
    rejectedAttributeSelector: (
        attributeSelector: string,
        stableThemeClassName: string
    ) => string;
} = ruleMessages(ruleName, {
    rejectedAttributeSelector: (
        attributeSelector: string,
        stableThemeClassName: string
    ): string =>
        `Prefer stable Docusaurus theme class ${stableThemeClassName} over brittle selector ${attributeSelector}. Docusaurus documents those stable theme classes as the maintainable customization surface.`,
});

const docs = {
    description:
        "Prefer documented stable Docusaurus theme class names over attribute-selector fallbacks for known theme components.",
    recommended: false,
    url: createRuleDocsUrl("prefer-stable-docusaurus-theme-class-names"),
} as const;

/**
 * Known generated CSS-module base names that have official stable Docusaurus
 * theme class equivalents on the same element.
 */
const stableThemeClassMappings = new Map<string, string>([
    ["announcementBar", ".theme-announcement-bar"],
    ["backToTopButton", ".theme-back-to-top-button"],
    ["codeBlockContainer", ".theme-code-block"],
    ["tocMobile", ".theme-doc-toc-mobile"],
]);

/**
 * Find the first attribute selector that should be replaced by a stable
 * Docusaurus theme class.
 */
function findStableThemeClassOpportunity(selectorList: string):
    | Readonly<{
          attributeSelector: string;
          stableThemeClassName: string;
      }>
    | undefined {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    for (const selector of getSelectors(parsedSelectorList)) {
        const attributeMatch = findClassAttributeFragmentMatch(
            selector,
            stableThemeClassMappings.keys(),
            { includeGlobal: true }
        );

        if (!isDefined(attributeMatch)) {
            continue;
        }

        const stableThemeClassName = stableThemeClassMappings.get(
            attributeMatch.fragment
        );

        if (!isDefined(stableThemeClassName)) {
            continue;
        }

        return {
            attributeSelector: attributeMatch.attributeSelector,
            stableThemeClassName,
        };
    }

    return undefined;
}

/**
 * Rule implementation for preferring stable Docusaurus theme class names over
 * attribute-selector fallbacks.
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
            const stableThemeClassOpportunity = findStableThemeClassOpportunity(
                ruleNode.selector
            );

            if (!isDefined(stableThemeClassOpportunity)) {
                return;
            }

            report({
                message: messages.rejectedAttributeSelector(
                    stableThemeClassOpportunity.attributeSelector,
                    stableThemeClassOpportunity.stableThemeClassName
                ),
                node: ruleNode,
                result,
                ruleName,
                word: stableThemeClassOpportunity.attributeSelector,
            });
        });
    };

/** Public rule definition for `prefer-stable-docusaurus-theme-class-names`. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
