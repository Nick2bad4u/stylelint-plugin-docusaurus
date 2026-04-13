import stylelint, { type RuleBase } from "stylelint";
import { isDefined, setHas } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    docusaurusDesktopNavbarMinWidthPx,
    isWithinMinimumWidthMediaQuery,
} from "../_internal/docusaurus-media-query.js";
import { getContainingRule } from "../_internal/docusaurus-theme-scope.js";
import {
    getSelectors,
    parseSelectorList,
    selectorTrailingCompoundHasClass,
} from "../_internal/selector-parser-utils.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

/* eslint-disable @typescript-eslint/no-use-before-define -- This file keeps hoisted helper declarations in module-sorted order to satisfy the repository's ordering rules. */

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-mobile-navbar-stacking-context-traps");
const messages: {
    rejectedContainingBlockProperty: (
        propertyName: string,
        selector: string,
        value: string
    ) => string;
} = ruleMessages(ruleName, {
    rejectedContainingBlockProperty: (
        propertyName: string,
        selector: string,
        value: string
    ): string =>
        `Avoid ${propertyName}: ${value} in selector "${selector}" because Docusaurus renders a fixed mobile sidebar and backdrop inside the navbar below ${docusaurusDesktopNavbarMinWidthPx}px. This can create a containing block or stacking-context trap that breaks the mobile overlay. Prefer styling a child element or guard it with @media (min-width: ${docusaurusDesktopNavbarMinWidthPx}px).`,
});

const docs = {
    description:
        "Disallow containing-block and stacking-context properties on Docusaurus navbar selectors unless they are guarded behind the desktop breakpoint.",
    recommended: false,
    url: createRuleDocsUrl("no-mobile-navbar-stacking-context-traps"),
} as const;

/** Whitespace characters used by CSS media-query parsing helpers. */
const whitespaceCharacters = new Set([
    "\t",
    "\n",
    "\f",
    "\r",
    " ",
]);
/**
 * Properties that can create containing blocks or stacking contexts for the
 * mobile navbar subtree.
 */
const riskyNavbarProperties = new Set([
    "contain",
    "filter",
    "perspective",
    "transform",
    "will-change",
]);
/** Reset values that are safe for transform-like properties. */
const safePropertyResetValues = new Set([
    "initial",
    "none",
    "unset",
]);
/** Will-change tokens that are risky for the Docusaurus mobile navbar subtree. */
const riskyWillChangeTokens = new Set([
    "filter",
    "perspective",
    "transform",
]);
/** Containment keywords that are risky for the Docusaurus mobile navbar subtree. */
const riskyContainTokens = new Set([
    "content",
    "layout",
    "paint",
    "strict",
]);

/**
 * Check whether a CSS token targets the Docusaurus navbar element itself.
 */
function isNavbarTargetCssToken(cssToken: string): boolean {
    return (
        cssToken === "navbar" ||
        cssToken.startsWith("navbar--") ||
        cssToken === "theme-layout-navbar"
    );
}

/**
 * Split one comma-separated token list while trimming empty entries.
 */
function splitCommaSeparatedTokens(value: string): readonly string[] {
    const tokens: string[] = [];

    let currentToken = "";

    for (const character of value) {
        if (character === ",") {
            const normalizedToken = currentToken.trim();

            if (normalizedToken.length > 0) {
                tokens.push(normalizedToken);
            }

            currentToken = "";
            continue;
        }

        currentToken += character;
    }

    const normalizedToken = currentToken.trim();

    if (normalizedToken.length > 0) {
        tokens.push(normalizedToken);
    }

    return tokens;
}

/**
 * Split one whitespace-separated token list while trimming empty entries.
 */
function splitWhitespaceSeparatedTokens(value: string): readonly string[] {
    const tokens: string[] = [];
    let currentToken = "";

    for (const character of value) {
        if (isWhitespaceCharacter(character)) {
            if (currentToken.length > 0) {
                tokens.push(currentToken);
                currentToken = "";
            }

            continue;
        }

        currentToken += character;
    }

    if (currentToken.length > 0) {
        tokens.push(currentToken);
    }

    return tokens;
}

/**
 * Check whether a property is one of the risky navbar containing-block or
 * stacking-context properties.
 */
function isRiskyNavbarProperty(propertyName: string): boolean {
    return setHas(riskyNavbarProperties, propertyName.toLowerCase());
}

/**
 * Check whether a declaration value is risky for one navbar property.
 */
function isRiskyNavbarPropertyValue(
    propertyName: string,
    value: string
): boolean {
    const normalizedPropertyName = propertyName.toLowerCase();
    const normalizedValue = value.trim().toLowerCase();

    if (setHas(safePropertyResetValues, normalizedValue)) {
        return false;
    }

    if (normalizedPropertyName === "will-change") {
        const tokens = splitCommaSeparatedTokens(normalizedValue);

        return tokens.some((token) => setHas(riskyWillChangeTokens, token));
    }

    if (normalizedPropertyName === "contain") {
        const tokens = splitWhitespaceSeparatedTokens(normalizedValue);

        return tokens.some((token) => setHas(riskyContainTokens, token));
    }

    return true;
}

/**
 * Check whether a character is CSS whitespace.
 */
function isWhitespaceCharacter(character: string): boolean {
    return setHas(whitespaceCharacters, character);
}

/**
 * Check whether a selector list targets the Docusaurus navbar element.
 */
function selectorTargetsDocusaurusNavbar(selectorList: string): boolean {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return false;
    }

    return getSelectors(parsedSelectorList).some((selector) =>
        selectorTrailingCompoundHasClass(selector, isNavbarTargetCssToken)
    );
}

/* eslint-enable @typescript-eslint/no-use-before-define -- Helper block ends here. */

/**
 * Rule implementation for avoiding navbar properties that can trap the mobile
 * sidebar and backdrop inside a new containing block or stacking context.
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
            if (!isRiskyNavbarProperty(declaration.prop)) {
                return;
            }

            if (
                !isRiskyNavbarPropertyValue(declaration.prop, declaration.value)
            ) {
                return;
            }

            const containingRule = getContainingRule(declaration);

            if (!isDefined(containingRule)) {
                return;
            }

            if (!selectorTargetsDocusaurusNavbar(containingRule.selector)) {
                return;
            }

            if (
                isWithinMinimumWidthMediaQuery(
                    declaration,
                    docusaurusDesktopNavbarMinWidthPx
                )
            ) {
                return;
            }

            report({
                message: messages.rejectedContainingBlockProperty(
                    declaration.prop,
                    containingRule.selector,
                    declaration.value
                ),
                node: declaration,
                result,
                ruleName,
                word: declaration.prop,
            });
        });
    };

/** Public rule definition for `no-mobile-navbar-stacking-context-traps`. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
