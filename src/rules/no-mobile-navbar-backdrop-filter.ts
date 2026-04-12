import type { AtRule, Node } from "postcss";

import stylelint, { type RuleBase } from "stylelint";
import { isDefined, isFinite, setHas } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    getContainingRule,
    normalizeSelectorList,
} from "../_internal/docusaurus-theme-scope.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

/* eslint-disable @typescript-eslint/no-use-before-define -- This file keeps hoisted helper declarations in module-sorted order to satisfy the repository's ordering rules. */

const { report, ruleMessages, validateOptions } = stylelint.utils;

/**
 * Default Docusaurus desktop navbar breakpoint used by Infima and
 * theme-classic.
 */
const docusaurusDesktopNavbarMinWidthPx = 997;

const ruleName = createRuleName("no-mobile-navbar-backdrop-filter");
const messages: {
    rejectedBackdropFilter: (propertyName: string, selector: string) => string;
} = ruleMessages(ruleName, {
    rejectedBackdropFilter: (propertyName: string, selector: string): string =>
        `Avoid ${propertyName} in selector "${selector}" because Docusaurus renders the mobile sidebar inside the navbar below ${docusaurusDesktopNavbarMinWidthPx}px. Move the blur to a different element or guard it with @media (min-width: ${docusaurusDesktopNavbarMinWidthPx}px).`,
});

const docs = {
    description:
        "Disallow backdrop-filter on Docusaurus navbar selectors unless it is guarded behind the desktop breakpoint.",
    recommended: true,
    url: createRuleDocsUrl("no-mobile-navbar-backdrop-filter"),
} as const;
/** Parsed CSS length represented in pixels. */
type ParsedLength = Readonly<{
    pixels: number;
}>;
/** Supported CSS length units recognized by the navbar media-query helper. */
type SupportedLengthUnit = "em" | "px" | "rem";

/** Backdrop-filter declarations that intentionally reset the property. */
const safeBackdropFilterResetValues = new Set([
    "initial",
    "none",
    "unset",
]);
/** Backdrop-filter properties that can affect the Docusaurus mobile sidebar. */
const backdropFilterProperties = new Set([
    "-webkit-backdrop-filter",
    "backdrop-filter",
]);
/** Whitespace characters used by CSS media-query parsing helpers. */
const whitespaceCharacters = new Set([
    "\t",
    "\n",
    "\f",
    "\r",
    " ",
]);

/**
 * Collect desktop-width candidates that appear after one textual media-query
 * prefix such as `min-width:`.
 */
function collectMinimumWidthsAfterPrefix(
    normalizedMediaQuery: string,
    prefix: string
): readonly number[] {
    const widthsPx: number[] = [];
    let searchFrom = 0;

    while (searchFrom < normalizedMediaQuery.length) {
        const prefixIndex = normalizedMediaQuery.indexOf(prefix, searchFrom);

        if (prefixIndex === -1) {
            break;
        }

        const parsedLength = parseLengthAt(
            normalizedMediaQuery,
            prefixIndex + prefix.length
        );

        if (isDefined(parsedLength)) {
            widthsPx.push(parsedLength.pixels);
        }

        searchFrom = prefixIndex + prefix.length;
    }

    return widthsPx;
}

/**
 * Collect desktop-width candidates that appear before one textual media-query
 * suffix such as `<= width`.
 */
function collectMinimumWidthsBeforeSuffix(
    normalizedMediaQuery: string,
    suffix: string
): readonly number[] {
    const widthsPx: number[] = [];
    let searchFrom = 0;

    while (searchFrom < normalizedMediaQuery.length) {
        const suffixIndex = normalizedMediaQuery.indexOf(suffix, searchFrom);

        if (suffixIndex === -1) {
            break;
        }

        const parsedLength = parseLengthEndingAt(
            normalizedMediaQuery,
            suffixIndex
        );

        if (isDefined(parsedLength)) {
            widthsPx.push(parsedLength.pixels);
        }

        searchFrom = suffixIndex + suffix.length;
    }

    return widthsPx;
}

/**
 * Extract CSS class tokens from one selector fragment.
 */
function extractSelectorCssTokens(selector: string): readonly string[] {
    const cssTokens = new Set<string>();
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
            cssTokens.add(tokenText);
        }

        index = cursor;
    }

    return [...cssTokens];
}

/**
 * Collect ancestor `@media` rules for a node.
 */
function getContainingMediaQueries(node: Readonly<Node>): readonly AtRule[] {
    const mediaQueries: AtRule[] = [];
    let currentNode: Node | undefined = node.parent ?? undefined;

    while (isDefined(currentNode)) {
        if (currentNode.type === "atrule") {
            const atRule = currentNode as AtRule;

            if (atRule.name.toLowerCase() === "media") {
                mediaQueries.push(atRule);
            }
        }

        currentNode = currentNode.parent ?? undefined;
    }

    return mediaQueries;
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
 * Check whether a declaration property is one of the supported backdrop-filter
 * variants.
 */
function isBackdropFilterProperty(propertyName: string): boolean {
    return setHas(backdropFilterProperties, propertyName.toLowerCase());
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
 * Check whether a CSS token targets the Docusaurus navbar element itself.
 */
function isNavbarTargetCssToken(cssToken: string): boolean {
    return cssToken === "navbar" || cssToken.startsWith("navbar--");
}

/**
 * Check whether a declaration value is a safe backdrop-filter reset.
 */
function isSafeBackdropFilterResetValue(value: string): boolean {
    return setHas(safeBackdropFilterResetValues, value.trim().toLowerCase());
}

/**
 * Check whether a character is CSS whitespace.
 */
function isWhitespaceCharacter(character: string): boolean {
    return setHas(whitespaceCharacters, character);
}

/**
 * Check whether a node is nested inside a desktop-only media query that keeps
 * the rule off Docusaurus's mobile navbar breakpoint.
 */
function isWithinDesktopNavbarMediaQuery(
    node: Readonly<Node>,
    minimumWidthPx: number = docusaurusDesktopNavbarMinWidthPx
): boolean {
    return getContainingMediaQueries(node).some((mediaQuery) =>
        mediaQueryHasMinimumWidth(mediaQuery.params, minimumWidthPx)
    );
}

/**
 * Check whether a media-query string includes a supported desktop `min-width`
 * guard at or above the requested threshold.
 */
function mediaQueryHasMinimumWidth(
    mediaQuery: string,
    minimumWidthPx: number
): boolean {
    const normalizedMediaQuery = normalizeMediaQueryText(mediaQuery);
    const minimumWidthsPx = [
        ...collectMinimumWidthsAfterPrefix(normalizedMediaQuery, "min-width:"),
        ...collectMinimumWidthsAfterPrefix(normalizedMediaQuery, "width >="),
        ...collectMinimumWidthsBeforeSuffix(normalizedMediaQuery, "<= width"),
    ];

    return minimumWidthsPx.some((widthPx) => widthPx >= minimumWidthPx);
}

/**
 * Collapse CSS media-query whitespace so text scanning can match stable
 * patterns such as `width >=` and `<= width`.
 */
function normalizeMediaQueryText(mediaQuery: string): string {
    let normalizedText = "";
    let previousWasWhitespace = false;

    for (const character of mediaQuery.toLowerCase()) {
        if (isWhitespaceCharacter(character)) {
            if (!previousWasWhitespace) {
                normalizedText += " ";
                previousWasWhitespace = true;
            }

            continue;
        }

        normalizedText += character;
        previousWasWhitespace = false;
    }

    return normalizedText.trim();
}

/**
 * Parse a CSS length immediately after a textual marker.
 */
function parseLengthAt(
    text: string,
    startIndex: number
): ParsedLength | undefined {
    let index = skipWhitespace(text, startIndex);
    let numericText = "";
    let hasDecimalPoint = false;

    while (index < text.length) {
        const character = text[index];

        if (!isDefined(character)) {
            break;
        }

        if (isAsciiDigit(character)) {
            numericText += character;
            index += 1;
            continue;
        }

        if (character === "." && !hasDecimalPoint) {
            numericText += character;
            hasDecimalPoint = true;
            index += 1;
            continue;
        }

        break;
    }

    if (numericText.length === 0 || numericText === ".") {
        return undefined;
    }

    index = skipWhitespace(text, index);

    const unitText =
        text.slice(index, index + 3) === "rem"
            ? "rem"
            : text.slice(index, index + 2) === "px"
              ? "px"
              : text.slice(index, index + 2) === "em"
                ? "em"
                : undefined;

    if (!isDefined(unitText)) {
        return undefined;
    }

    const pixels = toPixels(numericText, unitText);

    if (!isDefined(pixels)) {
        return undefined;
    }

    return {
        pixels,
    };
}

/**
 * Parse a CSS length immediately before a textual suffix such as `<= width`.
 */
function parseLengthEndingAt(
    text: string,
    endIndex: number
): ParsedLength | undefined {
    let index = endIndex - 1;

    while (index >= 0) {
        const character = text[index];

        if (!isDefined(character) || !isWhitespaceCharacter(character)) {
            break;
        }

        index -= 1;
    }

    const unitText =
        index >= 2 && text.slice(index - 2, index + 1) === "rem"
            ? "rem"
            : index >= 1 && text.slice(index - 1, index + 1) === "px"
              ? "px"
              : index >= 1 && text.slice(index - 1, index + 1) === "em"
                ? "em"
                : undefined;

    if (!isDefined(unitText)) {
        return undefined;
    }

    index -= unitText.length;

    while (index >= 0) {
        const character = text[index];

        if (!isDefined(character) || !isWhitespaceCharacter(character)) {
            break;
        }

        index -= 1;
    }

    const numericEnd = index + 1;

    while (index >= 0) {
        const character = text[index];

        if (!isDefined(character)) {
            break;
        }

        if (isAsciiDigit(character) || character === ".") {
            index -= 1;
            continue;
        }

        break;
    }

    const numericText = text.slice(index + 1, numericEnd);

    if (numericText.length === 0 || numericText === ".") {
        return undefined;
    }

    const pixels = toPixels(numericText, unitText);

    if (!isDefined(pixels)) {
        return undefined;
    }

    return {
        pixels,
    };
}

/**
 * Check whether a selector list targets the Docusaurus navbar element.
 */
function selectorTargetsDocusaurusNavbar(selectorList: string): boolean {
    return normalizeSelectorList(selectorList).some((selector) =>
        extractSelectorCssTokens(selector).some((cssToken) =>
            isNavbarTargetCssToken(cssToken)
        )
    );
}

/**
 * Skip CSS whitespace in one string from the provided index.
 */
function skipWhitespace(text: string, startIndex: number): number {
    let index = startIndex;

    while (index < text.length) {
        const character = text[index];

        if (!isDefined(character) || !isWhitespaceCharacter(character)) {
            return index;
        }

        index += 1;
    }

    return index;
}

/**
 * Convert a supported CSS length into pixels.
 */
function toPixels(
    valueText: string,
    unitText: SupportedLengthUnit
): number | undefined {
    const numericValue = Number.parseFloat(valueText);

    if (!isFinite(numericValue)) {
        return undefined;
    }

    if (unitText === "px") {
        return numericValue;
    }

    if (unitText === "em" || unitText === "rem") {
        return numericValue * 16;
    }

    return undefined;
}

/* eslint-enable @typescript-eslint/no-use-before-define -- Helper block ends here. */

/**
 * Rule implementation for preventing mobile-breaking backdrop filters on the
 * Docusaurus navbar.
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

        root.walkDecls((declaration) => {
            if (!isBackdropFilterProperty(declaration.prop)) {
                return;
            }

            if (isSafeBackdropFilterResetValue(declaration.value)) {
                return;
            }

            const containingRule = getContainingRule(declaration);

            if (!isDefined(containingRule)) {
                return;
            }

            if (!selectorTargetsDocusaurusNavbar(containingRule.selector)) {
                return;
            }

            if (isWithinDesktopNavbarMediaQuery(declaration)) {
                return;
            }

            report({
                message: messages.rejectedBackdropFilter(
                    declaration.prop,
                    containingRule.selector
                ),
                node: declaration,
                result,
                ruleName,
                word: declaration.prop,
            });
        });
    };

/** Public rule definition for `no-mobile-navbar-backdrop-filter`. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
