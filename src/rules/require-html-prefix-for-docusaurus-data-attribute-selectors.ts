import stylelint, { type RuleBase } from "stylelint";
import { isDefined, isEmpty, setHas } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    isLikelyDocusaurusGlobalThemeClassName,
    rootOnlyIgnoredIdNames,
} from "../_internal/docusaurus-selector-contracts.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";
import {
    classifyLeadingRootAttributeNode,
    getAttributeNodesOutsideGlobal,
    getIdNamesOutsideGlobal,
    getSelectors,
    parseSelectorList,
    selectorHasClassOutsideGlobal,
} from "../_internal/selector-parser-utils.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName(
    "require-html-prefix-for-docusaurus-data-attribute-selectors"
);
const messages: {
    rejectedSelector: (attributeName: string, selector: string) => string;
} = ruleMessages(ruleName, {
    rejectedSelector: (attributeName: string, selector: string): string =>
        `Prefix bare ${attributeName} selectors with html when styling Docusaurus global surfaces. Selector "${selector}" should start with html[${attributeName}] because Docusaurus query-string data attributes are injected on <html>.`,
});

const docs = {
    description:
        "Require an html prefix for bare Docusaurus root data-attribute selectors that target global theme surfaces.",
    recommended: true,
    url: createRuleDocsUrl(
        "require-html-prefix-for-docusaurus-data-attribute-selectors"
    ),
} as const;

/** Find the first bare html data-attribute selector targeting Docusaurus UI. */
function findMissingHtmlPrefixSelector(selectorList: string):
    | Readonly<{
          attributeName: string;
          selector: string;
      }>
    | undefined {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    for (const selector of getSelectors(parsedSelectorList)) {
        const relevantAttributeMatches = getAttributeNodesOutsideGlobal(
            selector
        )
            .filter((attributeNode) => {
                const attributeName = attributeNode.attribute.toLowerCase();

                return (
                    attributeName.startsWith("data-") &&
                    attributeName !== "data-theme"
                );
            })
            .map((attributeNode) => ({
                attributeName: attributeNode.attribute.toLowerCase(),
                kind: classifyLeadingRootAttributeNode(attributeNode, {
                    allowRootPseudo: true,
                }),
            }))
            .filter((attributeMatch) => isDefined(attributeMatch.kind));

        if (isEmpty(relevantAttributeMatches)) {
            continue;
        }

        const hasGlobalDocusaurusTarget =
            selectorHasClassOutsideGlobal(selector, (cssClassName) =>
                isLikelyDocusaurusGlobalThemeClassName(cssClassName)
            ) ||
            getIdNamesOutsideGlobal(selector).some((idName) =>
                setHas(rootOnlyIgnoredIdNames, idName)
            );

        if (!hasGlobalDocusaurusTarget) {
            continue;
        }

        let bareAttributeMatch:
            | (typeof relevantAttributeMatches)[number]
            | undefined = undefined;

        for (const attributeMatch of relevantAttributeMatches) {
            if (attributeMatch.kind !== "bare") {
                continue;
            }

            bareAttributeMatch = attributeMatch;

            break;
        }

        if (!isDefined(bareAttributeMatch)) {
            continue;
        }

        return {
            attributeName: bareAttributeMatch.attributeName,
            selector: selector.toString(),
        };
    }

    return undefined;
}

/** Rule implementation for html-prefixed Docusaurus data-attribute selectors. */
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
            const invalidSelector = findMissingHtmlPrefixSelector(
                ruleNode.selector
            );

            if (!isDefined(invalidSelector)) {
                return;
            }

            report({
                message: messages.rejectedSelector(
                    invalidSelector.attributeName,
                    invalidSelector.selector
                ),
                node: ruleNode,
                result,
                ruleName,
                word: invalidSelector.attributeName,
            });
        });
    };

/** Public rule definition for html-prefixed Docusaurus data attributes. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
