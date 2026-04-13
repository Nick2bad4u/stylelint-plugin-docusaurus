import stylelint, { type RuleBase } from "stylelint";
import { arrayFind, isDefined  } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    isDocusaurusContentElementName,
    stableDocusaurusThemeClassNames,
} from "../_internal/docusaurus-selector-contracts.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";
import {
    getSelectors,
    getTypeNamesOutsideGlobal,
    parseSelectorList,
} from "../_internal/selector-parser-utils.js";
import {
    ruleHasScopeAnchorInAncestors,
    selectorHasScopeAnchor,
} from "../_internal/selector-scope-analysis.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-unscoped-content-element-overrides");
const messages: {
    rejectedSelector: (elementName: string, selector: string) => string;
} = ruleMessages(ruleName, {
    rejectedSelector: (elementName: string, selector: string): string =>
        `Scope ${elementName} overrides under a Docusaurus content wrapper or component-local selector instead of using unscoped selector "${selector}". Prefer wrappers such as .theme-doc-markdown, .markdown, .docs-doc-page, .blog-wrapper, or .mdx-page.`,
});

const docs = {
    description:
        "Disallow unscoped content-element overrides that leak across the whole Docusaurus site.",
    recommended: false,
    url: createRuleDocsUrl("no-unscoped-content-element-overrides"),
} as const;

/** Find the first unscoped content-element selector in one selector list. */
function findUnscopedContentElementSelector(
    selectorList: string,
    ancestorHasScopeAnchor: boolean
):
    | Readonly<{
          elementName: string;
          selector: string;
      }>
    | undefined {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    for (const selector of getSelectors(parsedSelectorList)) {
        if (
            selectorHasScopeAnchor(selector, {
                additionalAnchorClassNames: stableDocusaurusThemeClassNames,
                ancestorHasScopeAnchor,
                includeGlobal: true,
            })
        ) {
            continue;
        }

        const contentElementName = arrayFind(getTypeNamesOutsideGlobal(selector), (typeName) => isDocusaurusContentElementName(typeName));

        if (!isDefined(contentElementName)) {
            continue;
        }

        return {
            elementName: contentElementName,
            selector: selector.toString(),
        };
    }

    return undefined;
}

/** Rule implementation for content-element scope hygiene. */
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
            const invalidSelector = findUnscopedContentElementSelector(
                ruleNode.selector,
                ruleHasScopeAnchorInAncestors(ruleNode, {
                    additionalAnchorClassNames: stableDocusaurusThemeClassNames,
                    includeGlobal: true,
                })
            );

            if (!isDefined(invalidSelector)) {
                return;
            }

            report({
                message: messages.rejectedSelector(
                    invalidSelector.elementName,
                    invalidSelector.selector
                ),
                node: ruleNode,
                result,
                ruleName,
                word: invalidSelector.elementName,
            });
        });
    };

/** Public rule definition for content-element scope hygiene. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
