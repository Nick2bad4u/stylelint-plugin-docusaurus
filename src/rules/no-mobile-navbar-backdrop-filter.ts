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
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";
import {
    getSelectors,
    parseSelectorList,
    selectorTrailingCompoundHasClass,
} from "../_internal/selector-parser-utils.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

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

/**
 * Check whether a declaration property is one of the supported backdrop-filter
 * variants.
 */
function isBackdropFilterProperty(propertyName: string): boolean {
    return setHas(backdropFilterProperties, propertyName.toLowerCase());
}

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
 * Check whether a declaration value is a safe backdrop-filter reset.
 */
function isSafeBackdropFilterResetValue(value: string): boolean {
    return setHas(safeBackdropFilterResetValues, value.trim().toLowerCase());
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

            if (
                isWithinMinimumWidthMediaQuery(
                    declaration,
                    docusaurusDesktopNavbarMinWidthPx
                )
            ) {
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
