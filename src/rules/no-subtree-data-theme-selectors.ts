import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    classifyLeadingRootAttributeNode,
    getAttributeNodesOutsideGlobal,
    getSelectors,
    parseSelectorList,
} from "../_internal/selector-parser-utils.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-subtree-data-theme-selectors");
const messages: {
    rejectedSelector: (selector: string) => string;
} = ruleMessages(ruleName, {
    rejectedSelector: (selector: string): string =>
        `Do not target [data-theme] on a descendant subtree with selector "${selector}". Docusaurus sets data-theme on <html>, so selectors should start with [data-theme='dark'] or html[data-theme='dark'].`,
});

const docs = {
    description:
        "Disallow subtree-scoped data-theme selectors that do not start from the Docusaurus root color-mode attribute.",
    recommended: true,
    url: createRuleDocsUrl("no-subtree-data-theme-selectors"),
} as const;

/** Find the first subtree-scoped `[data-theme]` selector in a selector list. */
function findSubtreeDataThemeSelector(
    selectorList: string
): string | undefined {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    for (const selector of getSelectors(parsedSelectorList)) {
        const dataThemeAttributes = getAttributeNodesOutsideGlobal(
            selector
        ).filter(
            (attributeNode) =>
                attributeNode.attribute.toLowerCase() === "data-theme"
        );

        if (dataThemeAttributes.length === 0) {
            continue;
        }

        if (
            dataThemeAttributes.every((attributeNode) =>
                isDefined(
                    classifyLeadingRootAttributeNode(attributeNode, {
                        allowRootPseudo: true,
                    })
                )
            )
        ) {
            continue;
        }

        return selector.toString();
    }

    return undefined;
}

/** Rule implementation for Docusaurus data-theme subtree misuse. */
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
            const invalidSelector = findSubtreeDataThemeSelector(
                ruleNode.selector
            );

            if (!isDefined(invalidSelector)) {
                return;
            }

            report({
                message: messages.rejectedSelector(invalidSelector),
                node: ruleNode,
                result,
                ruleName,
                word: "[data-theme",
            });
        });
    };

/** Public rule definition for Docusaurus data-theme subtree misuse. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
