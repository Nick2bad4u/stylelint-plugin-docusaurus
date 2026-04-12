import type { Root } from "postcss";

import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import { normalizeSelectorList } from "../_internal/docusaurus-theme-scope.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

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
 * Extract class tokens from one selector string.
 */
function extractSelectorNames(selector: string): readonly string[] {
    const selectorNames = new Set<string>();
    let index = 0;

    while (index < selector.length) {
        const currentCharacter = selector[index];

        if (currentCharacter !== ".") {
            index += 1;
            continue;
        }

        const firstTokenCharacter = selector[index + 1];

        if (
            !isDefined(firstTokenCharacter) ||
            !isCssIdentifierStart(firstTokenCharacter)
        ) {
            index += 1;
            continue;
        }

        let cursor = index + 1;
        let tokenText = "";

        while (cursor < selector.length) {
            const tokenCharacter = selector[cursor];

            if (
                !isDefined(tokenCharacter) ||
                !isCssIdentifierContinuation(tokenCharacter)
            ) {
                break;
            }

            tokenText += tokenCharacter;
            cursor += 1;
        }

        if (tokenText.length > 0) {
            selectorNames.add(tokenText);
        }

        index = cursor;
    }

    return [...selectorNames];
}

/**
 * Find the first unstable generated class selector in one selector list.
 */
function findUnstableGeneratedClassSelector(selectorList: string):
    | Readonly<{
          generatedSelectorName: string;
          suggestedAttributeSelector: string;
      }>
    | undefined {
    for (const selector of normalizeSelectorList(selectorList)) {
        for (const generatedSelectorName of extractSelectorNames(selector)) {
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
 * Check whether a character is an ASCII digit.
 */
function isAsciiDigit(character: string): boolean {
    return character >= "0" && character <= "9";
}

/**
 * Check whether a character is an ASCII letter.
 */
function isAsciiLetter(character: string): boolean {
    const codePoint = character.codePointAt(0);

    if (!isDefined(codePoint)) {
        return false;
    }

    return (
        (codePoint >= 65 && codePoint <= 90) ||
        (codePoint >= 97 && codePoint <= 122)
    );
}

/**
 * Check whether a character can continue a CSS class token.
 */
function isCssIdentifierContinuation(character: string): boolean {
    return isCssIdentifierStart(character) || isAsciiDigit(character);
}

/**
 * Check whether a character can start a CSS class token.
 */
function isCssIdentifierStart(character: string): boolean {
    return character === "-" || character === "_" || isAsciiLetter(character);
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
        if (!isCssIdentifierContinuation(character)) {
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

/**
 * Check whether the current stylesheet is a CSS module source file.
 */
function isModuleStylesheet(root: Readonly<Root>): boolean {
    const filePath = root.source?.input.file;

    if (!isDefined(filePath)) {
        return false;
    }

    const normalizedPath = filePath.toLowerCase();

    return (
        normalizedPath.endsWith(".module.css") ||
        normalizedPath.endsWith(".module.scss") ||
        normalizedPath.endsWith(".module.sass") ||
        normalizedPath.endsWith(".module.less")
    );
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

        if (isModuleStylesheet(root)) {
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
