/* eslint-disable security/detect-unsafe-regex -- media-query param regex operates on short, controlled @media params input; exponential backtracking is not a real concern here */
import stylelint, { type RuleBase } from "stylelint";
import { isDefined, setHas } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-hardcoded-docusaurus-breakpoint-values");

const messages: {
    rejectedBreakpointValue: (value: string) => string;
} = ruleMessages(ruleName, {
    rejectedBreakpointValue: (value: string): string =>
        `Avoid hardcoding Docusaurus breakpoint value "${value}" directly in a @media query. Extract it to a CSS custom property or SCSS variable so all breakpoints stay in sync with the Docusaurus/Infima theme contract. Note: 996px is the JS mobile-toggle boundary — using a similar but wrong value like 992px silently desynchronizes CSS from the framework's JS behavior.`,
});

const docs = {
    description:
        "Disallow hardcoded pixel values in @media queries that match Docusaurus/Infima documented breakpoints.",
    recommended: false,
    url: createRuleDocsUrl("no-hardcoded-docusaurus-breakpoint-values"),
} as const;

/** Docusaurus/Infima documented breakpoint values (in pixels). */
const docusaurusBreakpointValues: ReadonlySet<string> = new Set([
    "576px",
    "768px",
    "992px",
    "996px",
    "997px",
    "1200px",
    "1400px",
]);

/** Secondary option contract for the hardcoded-breakpoint rule. */
type SecondaryOptions = Readonly<{
    ignoreBreakpoints?: string[];
}>;

/**
 * Extract all `px` dimension tokens from one media-query params string. Returns
 * an array of tuples [fullMatch, pixelValue].
 */
function extractMediaQueryPxValues(params: string): string[] {
    const pxValues: string[] = [];

    for (const match of params.matchAll(/\b(?<px>\d+(?:\.\d+)?)px\b/giu)) {
        const numericPart = match.groups?.["px"];

        if (isDefined(numericPart)) {
            pxValues.push(`${numericPart}px`);
        }
    }

    return pxValues;
}

/** Rule implementation for hardcoded Docusaurus breakpoint values. */
const ruleFunction: RuleBase<boolean, SecondaryOptions> =
    (primary, secondary) => (root, result) => {
        const isValid = validateOptions(
            result,
            ruleName,
            {
                actual: primary,
                possible: [true],
            },
            {
                actual: secondary,
                optional: true,
                possible: {
                    ignoreBreakpoints: [
                        (value: unknown): boolean =>
                            typeof value === "string" && value.length > 0,
                    ],
                },
            }
        );

        if (!isValid) {
            return;
        }

        const ignoreSet = new Set<string>(secondary?.ignoreBreakpoints);

        root.walkAtRules("media", (atRule) => {
            for (const pxValue of extractMediaQueryPxValues(atRule.params)) {
                if (!setHas(docusaurusBreakpointValues, pxValue)) {
                    continue;
                }

                if (setHas(ignoreSet, pxValue)) {
                    continue;
                }

                report({
                    message: messages.rejectedBreakpointValue(pxValue),
                    node: atRule,
                    result,
                    ruleName,
                    word: pxValue,
                });
            }
        });
    };

/** Public rule definition for hardcoded Docusaurus breakpoint values. */
const rule: StylelintPluginRule<boolean, SecondaryOptions, typeof messages> =
    createStylelintRule<boolean, SecondaryOptions, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

/* eslint-enable security/detect-unsafe-regex -- restore default regex safety checks outside this module */
