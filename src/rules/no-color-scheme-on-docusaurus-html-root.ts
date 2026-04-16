import type { Rule } from "postcss";

import stylelint, { type RuleBase } from "stylelint";
import { isDefined, safeCastTo, setHas, stringSplit } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-color-scheme-on-docusaurus-html-root");

const messages: {
    rejectedColorScheme: (selector: string) => string;
} = ruleMessages(ruleName, {
    rejectedColorScheme: (selector: string): string =>
        `Avoid setting \`color-scheme\` on "${selector}". Docusaurus manages \`color-scheme\` through its \`<html>\` element and theme-switching logic; overriding it in CSS fights the framework and may cause visual artifacts when switching between light and dark mode.`,
});

const docs = {
    description:
        "Disallow `color-scheme` declarations on Docusaurus root selectors managed by the framework.",
    recommended: false,
    url: createRuleDocsUrl("no-color-scheme-on-docusaurus-html-root"),
} as const;

/**
 * Selectors that Docusaurus manages for color-scheme — overriding them from CSS
 * competes with the framework's theme-toggle logic.
 */
const managedRootSelectors: ReadonlySet<string> = new Set([
    ":root",
    '[data-theme="dark"]',
    '[data-theme="light"]',
    "[data-theme='dark']",
    "[data-theme='light']",
    "[data-theme]",
    "html",
    'html[data-theme="dark"]',
    'html[data-theme="light"]',
    "html[data-theme='dark']",
    "html[data-theme='light']",
    "html[data-theme]",
]);

/** Normalize a CSS selector for stable comparison. */
function normalizeSelector(selector: string): string {
    return selector.trim().replaceAll(/\s+/gu, " ");
}

/**
 * Check whether one selector string (which may be a comma-separated list)
 * contains any of the Docusaurus-managed root selectors.
 */
function selectorContainsManagedRoot(selector: string): string | undefined {
    for (const part of stringSplit(selector, ",")) {
        const normalized = normalizeSelector(part);

        if (setHas(managedRootSelectors, normalized)) {
            return normalized;
        }
    }

    return undefined;
}

/** Rule implementation for `color-scheme` on Docusaurus root selectors. */
const ruleFunction: RuleBase<boolean, undefined> =
    (primary) => (root, result) => {
        const isValid = validateOptions(result, ruleName, {
            actual: primary,
            possible: [true],
        });

        if (!isValid) {
            return;
        }

        root.walkDecls("color-scheme", (decl) => {
            const parentNode = decl.parent;

            if (!isDefined(parentNode) || parentNode.type !== "rule") {
                return;
            }

            const parentRule = safeCastTo<Rule>(parentNode);
            const matchedSelector = selectorContainsManagedRoot(
                parentRule.selector
            );

            if (!isDefined(matchedSelector)) {
                return;
            }

            report({
                message: messages.rejectedColorScheme(matchedSelector),
                node: decl,
                result,
                ruleName,
                word: "color-scheme",
            });
        });
    };

/** Public rule definition for `color-scheme` on Docusaurus root selectors. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
