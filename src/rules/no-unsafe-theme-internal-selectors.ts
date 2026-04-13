import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import { unsafeThemeInternalSelectorFragments } from "../_internal/docusaurus-selector-contracts.js";
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

const ruleName = createRuleName("no-unsafe-theme-internal-selectors");
const messages: {
    rejectedSelector: (attributeSelector: string, fragment: string) => string;
} = ruleMessages(ruleName, {
    rejectedSelector: (attributeSelector: string, fragment: string): string =>
        `Avoid targeting internal Docusaurus selector fragment ${fragment} via ${attributeSelector}. Docusaurus does not document a stable CSS contract for that surface; prefer swizzling or a public stable theme class instead.`,
});

const docs = {
    description:
        "Disallow curated unsafe Docusaurus internal selector fallbacks that have no documented stable CSS contract.",
    recommended: false,
    url: createRuleDocsUrl("no-unsafe-theme-internal-selectors"),
} as const;

/** Find the first unsafe internal selector fallback used in one selector list. */
function findUnsafeInternalSelector(selectorList: string):
    | Readonly<{
          attributeSelector: string;
          fragment: string;
      }>
    | undefined {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    for (const selector of getSelectors(parsedSelectorList)) {
        const attributeMatch = findClassAttributeFragmentMatch(
            selector,
            unsafeThemeInternalSelectorFragments,
            { includeGlobal: true }
        );

        if (!isDefined(attributeMatch)) {
            continue;
        }

        return attributeMatch;
    }

    return undefined;
}

/** Rule implementation for unsafe Docusaurus internal selector fallbacks. */
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
            const invalidSelector = findUnsafeInternalSelector(
                ruleNode.selector
            );

            if (!isDefined(invalidSelector)) {
                return;
            }

            report({
                message: messages.rejectedSelector(
                    invalidSelector.attributeSelector,
                    invalidSelector.fragment
                ),
                node: ruleNode,
                result,
                ruleName,
                word: invalidSelector.attributeSelector,
            });
        });
    };

/** Public rule definition for unsafe internal Docusaurus selector fallbacks. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
