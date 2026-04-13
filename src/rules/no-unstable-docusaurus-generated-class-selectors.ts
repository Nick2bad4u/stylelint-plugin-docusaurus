import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
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

/* eslint-disable @typescript-eslint/no-use-before-define -- This file keeps hoisted helper declarations in module-sorted order to satisfy the repository's ordering rules. */

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName(
    "no-unstable-docusaurus-generated-class-selectors"
);
const messages: {
    rejectedGeneratedClassSelector: (
        generatedSelectorName: string,
        suggestedAttributeSelector: string
    ) => string;
} = ruleMessages(ruleName, {
    rejectedGeneratedClassSelector: (
        generatedSelectorName: string,
        suggestedAttributeSelector: string
    ): string =>
        `Avoid exact generated class selector .${generatedSelectorName}. Docusaurus CSS module hashes are implementation details and may change between releases. Prefer a stable theme class name or a resilient selector like ${suggestedAttributeSelector} when no stable class name exists.`,
});

const docs = {
    description:
        "Disallow exact selectors that target Docusaurus theme CSS-module class names with unstable hash suffixes.",
    recommended: false,
    url: createRuleDocsUrl("no-unstable-docusaurus-generated-class-selectors"),
} as const;

/**
 * Find the first unstable generated class selector in one selector list.
 */
function findUnstableGeneratedClassSelector(selectorList: string):
    | Readonly<{
          generatedSelectorName: string;
          suggestedAttributeSelector: string;
      }>
    | undefined {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    for (const selector of getSelectors(parsedSelectorList)) {
        for (const generatedSelectorName of getClassNamesOutsideGlobal(
            selector
        )) {
            const suggestedAttributeSelector =
                getGeneratedClassSelectorSuggestion(generatedSelectorName);

            if (!isDefined(suggestedAttributeSelector)) {
                continue;
            }

            return {
                generatedSelectorName,
                suggestedAttributeSelector,
            };
        }
    }

    return undefined;
}

/**
 * Check whether one class token looks like a Docusaurus generated CSS-module
 * class name with an unstable hash suffix.
 */
function getGeneratedClassSelectorSuggestion(
    generatedSelectorName: string
): string | undefined {
    if (generatedSelectorName.includes("__")) {
        return undefined;
    }

    const lastUnderscoreIndex = generatedSelectorName.lastIndexOf("_");

    if (
        lastUnderscoreIndex <= 0 ||
        lastUnderscoreIndex === generatedSelectorName.length - 1
    ) {
        return undefined;
    }

    const baseName = generatedSelectorName.slice(0, lastUnderscoreIndex);
    const suffix = generatedSelectorName.slice(lastUnderscoreIndex + 1);

    if (baseName.length < 3) {
        return undefined;
    }

    if (!isGeneratedHashSuffix(suffix)) {
        return undefined;
    }

    return `[class*='${baseName}']`;
}

/**
 * Check whether a suffix looks like a generated CSS-module hash fragment.
 */
function isGeneratedHashSuffix(suffix: string): boolean {
    if (suffix.length < 3 || suffix.length > 8) {
        return false;
    }

    let containsUppercaseLetterOrDigit = false;

    for (const character of suffix) {
        if (!/^[\w-]$/u.test(character)) {
            return false;
        }

        if (
            (character >= "A" && character <= "Z") ||
            (character >= "0" && character <= "9")
        ) {
            containsUppercaseLetterOrDigit = true;
        }
    }

    return containsUppercaseLetterOrDigit;
}

/* eslint-enable @typescript-eslint/no-use-before-define -- Helper block ends here. */

/**
 * Rule implementation for discouraging brittle Docusaurus generated class
 * selectors in global custom CSS.
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

        if (isCssModuleRoot(root)) {
            return;
        }

        root.walkRules((ruleNode) => {
            const generatedSelectorMatch = findUnstableGeneratedClassSelector(
                ruleNode.selector
            );

            if (!isDefined(generatedSelectorMatch)) {
                return;
            }

            report({
                message: messages.rejectedGeneratedClassSelector(
                    generatedSelectorMatch.generatedSelectorName,
                    generatedSelectorMatch.suggestedAttributeSelector
                ),
                node: ruleNode,
                result,
                ruleName,
                word: generatedSelectorMatch.generatedSelectorName,
            });
        });
    };

/**
 * Public rule definition for
 * `no-unstable-docusaurus-generated-class-selectors`.
 */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
