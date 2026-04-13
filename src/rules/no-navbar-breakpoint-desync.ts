import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    docusaurusDesktopNavbarMinWidthPx,
    docusaurusMobileMaxWidthPx,
    extractWidthBreakpointConstraints,
    getContainingMediaQueries,
    isDefaultDocusaurusNavbarBreakpoint,
    type WidthBreakpointConstraint,
} from "../_internal/docusaurus-media-query.js";
import {
    getSelectors,
    parseSelectorList,
    selectorTrailingCompoundHasClass,
} from "../_internal/selector-parser-utils.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-navbar-breakpoint-desync");
const messages: {
    rejectedBreakpoint: (breakpointText: string, selector: string) => string;
} = ruleMessages(ruleName, {
    rejectedBreakpoint: (breakpointText: string, selector: string): string =>
        `Avoid custom breakpoint ${breakpointText} for selector "${selector}". Docusaurus switches navbar/sidebar logic at ${docusaurusMobileMaxWidthPx}px/${docusaurusDesktopNavbarMinWidthPx}px; changing CSS breakpoints for those mobile surfaces can desync CSS from the theme's JS behavior unless you swizzle the matching components.`,
});

const docs = {
    description:
        "Disallow custom CSS breakpoints for Docusaurus mobile navbar/sidebar surfaces that can desync from the built-in JS breakpoint.",
    recommended: false,
    url: createRuleDocsUrl("no-navbar-breakpoint-desync"),
} as const;

/** Mobile-navbar surfaces whose CSS breakpoints must stay aligned with JS. */
const navbarResponsiveSurfaceClassNames = new Set([
    "navbar-sidebar",
    "navbar-sidebar--show",
    "navbar__toggle",
    "theme-layout-navbar-sidebar",
]);

/** Format one pixel breakpoint for readable diagnostics. */
function formatPixels(pixels: number): string {
    return Number.isInteger(pixels) ? `${pixels}px` : `${pixels.toFixed(2)}px`;
}

/** Find the first responsive navbar/sidebar selector in one selector list. */
function findResponsiveNavbarSelector(
    selectorList: string
): string | undefined {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    for (const selector of getSelectors(parsedSelectorList)) {
        if (
            !selectorTrailingCompoundHasClass(selector, (className) =>
                navbarResponsiveSurfaceClassNames.has(className)
            )
        ) {
            continue;
        }

        return selector.toString();
    }

    return undefined;
}

/** Find the first non-default Docusaurus breakpoint in a media-query chain. */
function findNonDefaultNavbarBreakpoint(
    mediaQueries: readonly import("postcss").AtRule[]
): WidthBreakpointConstraint | undefined {
    for (const mediaQuery of mediaQueries) {
        for (const constraint of extractWidthBreakpointConstraints(
            mediaQuery.params
        )) {
            if (isDefaultDocusaurusNavbarBreakpoint(constraint)) {
                continue;
            }

            return constraint;
        }
    }

    return undefined;
}

/** Rule implementation for Docusaurus navbar breakpoint desynchronization. */
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
            const responsiveSelector = findResponsiveNavbarSelector(
                ruleNode.selector
            );

            if (!isDefined(responsiveSelector)) {
                return;
            }

            const nonDefaultBreakpoint = findNonDefaultNavbarBreakpoint(
                getContainingMediaQueries(ruleNode)
            );

            if (!isDefined(nonDefaultBreakpoint)) {
                return;
            }

            report({
                message: messages.rejectedBreakpoint(
                    formatPixels(nonDefaultBreakpoint.pixels),
                    responsiveSelector
                ),
                node: ruleNode,
                result,
                ruleName,
            });
        });
    };

/** Public rule definition for Docusaurus navbar breakpoint desynchronization. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
