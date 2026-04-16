/* eslint-disable @typescript-eslint/no-use-before-define -- helper functions are defined below the public API for readability */
/* eslint-disable security/detect-unsafe-regex, sonarjs/slow-regex, regexp/no-super-linear-move -- interactive-pseudo and universal-selector regexes operate on short, controlled selector-string input */
import type { AtRule, Declaration, Root, Rule } from "postcss";
import type { Pseudo } from "postcss-selector-parser";

import stylelint, { type RuleBase } from "stylelint";
import { isDefined, setHas } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import { getContainingMediaQueries } from "../_internal/docusaurus-media-query.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";
import {
    getSelectors,
    parseSelectorList,
} from "../_internal/selector-parser-utils.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName(
    "require-reduced-motion-override-for-interactive-transitions"
);

const messages: {
    missingReducedMotionOverride: (
        selector: string,
        property: string
    ) => string;
} = ruleMessages(ruleName, {
    missingReducedMotionOverride: (
        selector: string,
        property: string
    ): string =>
        `Selector "${selector}" declares "${property}" in an interactive pseudo-class context but has no matching @media (prefers-reduced-motion: reduce) override. ` +
        `Add a "@media (prefers-reduced-motion: reduce) { ${selector} { ${property}: ... } }" companion block, or wrap this declaration inside "@media (prefers-reduced-motion: no-preference) { ... }".`,
});

const docs = {
    description:
        "Require a @media (prefers-reduced-motion) override for interactive selectors that declare transition or animation.",
    recommended: false,
    url: createRuleDocsUrl(
        "require-reduced-motion-override-for-interactive-transitions"
    ),
} as const;

/** Interactive pseudo-class names that imply user-triggered state transitions. */
const interactivePseudoNames: ReadonlySet<string> = new Set([
    "active",
    "focus",
    "focus-visible",
    "focus-within",
    "hover",
]);

/**
 * CSS motion properties whose presence on an interactive selector requires a
 * reduced-motion companion.
 */
const motionProperties: ReadonlySet<string> = new Set([
    "animation",
    "animation-duration",
    "animation-name",
    "transition",
    "transition-duration",
    "transition-property",
]);

/**
 * CSS values that do not actually produce motion — safe to declare on
 * interactive selectors without a reduced-motion companion.
 */
const safeMotionValues: ReadonlySet<string> = new Set([
    "0s",
    "inherit",
    "initial",
    "none",
    "revert",
    "unset",
]);

/**
 * Regex that strips interactive pseudo-classes from a selector string so a
 * "base selector" can be derived for reduced-motion companion matching.
 *
 * Matches `:hover`, `:focus`, `:focus-visible`, `:focus-within`, `:active`
 * (with or without arguments — e.g. `:is(:hover)`).
 */
const INTERACTIVE_PSEUDO_STRIP_REGEX =
    /::?(?:active|focus(?:-visible|-within)?|hover)(?:\([^)]*\))?/giu;

/**
 * Reduced-motion companion data collected from the root in one forward pass.
 */
interface ReducedMotionCoverage {
    /**
     * Normalized selectors that appear anywhere inside a `@media
     * (prefers-reduced-motion)` block.
     */
    readonly coveredSelectors: ReadonlySet<string>;

    /**
     * Whether any `@media (prefers-reduced-motion)` block contains a universal
     * (`*`, `*::before`, `*::after`) selector that explicitly disables
     * `transition` or `animation` — a common CSS reset pattern that covers all
     * interactive selectors in the file.
     */
    readonly hasGlobalMotionReset: boolean;
}

/**
 * Walk the root once and collect all reduced-motion companion data needed by
 * the second pass.
 */
function collectReducedMotionCoverage(root: Root): ReducedMotionCoverage {
    const coveredSelectors = new Set<string>();
    let hasGlobalMotionReset = false;

    root.walkAtRules("media", (atRule: AtRule) => {
        if (!isReducedMotionMediaParams(atRule.params)) {
            return;
        }

        atRule.walkRules((ruleNode: Rule) => {
            // Split comma-separated selector lists so each individual selector
            // is recorded independently, enabling exact and base-selector
            // matching regardless of how the companion was authored.
            const parsedList = parseSelectorList(ruleNode.selector);

            if (isDefined(parsedList)) {
                for (const selector of getSelectors(parsedList)) {
                    coveredSelectors.add(
                        normalizeSelector(selector.toString())
                    );
                }
            } else {
                // Fallback for unparseable selectors — store normalized whole.
                coveredSelectors.add(normalizeSelector(ruleNode.selector));
            }

            // Detect global reset: * { transition: none } or * { animation: none }
            if (hasGlobalMotionReset) {
                return;
            }

            const trimmedSelector = ruleNode.selector.trim();
            const isUniversalCoverage =
                trimmedSelector === "*" ||
                trimmedSelector === "*::before" ||
                trimmedSelector === "*::after" ||
                // Handles comma-separated universal list, e.g. "*, *::before, *::after"
                /^\*(?:\s*,\s*\*::(?:after|before))*\s*$/u.test(
                    trimmedSelector
                );

            if (!isUniversalCoverage) {
                return;
            }

            ruleNode.walkDecls((decl: Declaration) => {
                if (hasGlobalMotionReset) {
                    return;
                }

                const prop = decl.prop.toLowerCase();

                if (
                    (prop === "transition" || prop === "animation") &&
                    isSafeMotionValue(decl.value)
                ) {
                    hasGlobalMotionReset = true;
                }
            });
        });
    });

    return { coveredSelectors, hasGlobalMotionReset };
}

/**
 * Derive the "base selector" from an interactive-pseudo selector by removing
 * the interactive pseudo-class fragments.
 *
 * @example DeriveBaseSelector(".button:hover") → ".button"
 * deriveBaseSelector(".nav__link:focus-visible") → ".nav__link"
 * deriveBaseSelector("a:hover, button:focus") → "a, button"
 */
function deriveBaseSelector(selector: string): string {
    return normalizeSelector(
        selector.replaceAll(INTERACTIVE_PSEUDO_STRIP_REGEX, "")
    );
}

/**
 * Check whether a media-query params string is a `prefers-reduced-motion` query
 * (either `reduce` or `no-preference` variant).
 */
function isReducedMotionMediaParams(params: string): boolean {
    return /prefers-reduced-motion/iu.test(params);
}

/**
 * Check whether a CSS value is inert — i.e. does not produce visible motion.
 * Strips `!important` before comparing. Accepts explicit zero-duration forms
 * (`0s`, `0ms`, `0.0s`, etc.) but NOT non-zero durations such as `0.3s`.
 */
function isSafeMotionValue(value: string): boolean {
    const normalized = value
        .trim()
        .toLowerCase()
        .replace(/\s*!important\s*$/u, "")
        .trim();

    return (
        setHas(safeMotionValues, normalized) ||
        // Zero-duration: digit zero, optional all-zero decimal, optional unit.
        // Requires the decimal part to consist only of zeros to reject "0.3s".
        /^0+(?:\.0+)?(?:ms|s)?$/u.test(normalized)
    );
}

/**
 * Check whether an interactive-rule selector is covered by collected
 * reduced-motion companion data.
 *
 * Considers:
 *
 * 1. A global motion reset (universal selector override).
 * 2. An exact normalized selector match inside a reduced-motion block.
 * 3. A base-selector match (interactive pseudo stripped) inside a reduced-motion
 *    block.
 */
function isSelectorCovered(
    selector: string,
    coverage: ReducedMotionCoverage
): boolean {
    if (coverage.hasGlobalMotionReset) {
        return true;
    }

    const normalized = normalizeSelector(selector);

    if (setHas(coverage.coveredSelectors, normalized)) {
        return true;
    }

    // Fall back to base selector match: ".button:hover" → ".button"
    const base = deriveBaseSelector(selector);

    return base.length > 0 && setHas(coverage.coveredSelectors, base);
}

/**
 * Normalize a selector string for consistent Set-based membership checks. Trims
 * outer whitespace and collapses internal whitespace runs to a single space.
 */
function normalizeSelector(selector: string): string {
    return selector.trim().replaceAll(/\s+/gu, " ");
}

/**
 * Check whether a selector string contains at least one interactive
 * pseudo-class using a PostCSS selector-parser AST walk. Returns `false`
 * gracefully on unparseable input.
 */
function selectorHasInteractivePseudo(selector: string): boolean {
    const parsed = parseSelectorList(selector);

    if (!isDefined(parsed)) {
        return false;
    }

    let found = false;

    parsed.walkPseudos((pseudo: Pseudo): false | undefined => {
        if (found) {
            return false;
        }

        const pseudoName = pseudo.value.replace(/^::?/u, "").toLowerCase();

        if (setHas(interactivePseudoNames, pseudoName)) {
            found = true;

            return false;
        }

        return undefined;
    });

    return found;
}

/**
 * Rule implementation for
 * `require-reduced-motion-override-for-interactive-transitions`.
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

        // Pass 1 — collect all @media (prefers-reduced-motion) companion data.
        const coverage = collectReducedMotionCoverage(root);

        // Pass 2 — walk rules, flag uncovered interactive motion declarations.
        root.walkRules((ruleNode: Rule) => {
            // If this rule is already inside a @media (prefers-reduced-motion)
            // block it is explicitly part of the reduced-motion handling path.
            const containingMediaQueries = getContainingMediaQueries(ruleNode);

            if (
                containingMediaQueries.some((mq) =>
                    isReducedMotionMediaParams(mq.params)
                )
            ) {
                return;
            }

            if (!selectorHasInteractivePseudo(ruleNode.selector)) {
                return;
            }

            if (isSelectorCovered(ruleNode.selector, coverage)) {
                return;
            }

            ruleNode.walkDecls((decl: Declaration) => {
                const prop = decl.prop.toLowerCase();

                if (!setHas(motionProperties, prop)) {
                    return;
                }

                if (isSafeMotionValue(decl.value)) {
                    return;
                }

                report({
                    message: messages.missingReducedMotionOverride(
                        ruleNode.selector,
                        decl.prop
                    ),
                    node: decl,
                    result,
                    ruleName,
                });
            });
        });
    };

/**
 * Public rule definition for
 * `require-reduced-motion-override-for-interactive-transitions`.
 */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

/* eslint-enable @typescript-eslint/no-use-before-define -- restore default helper-order checks outside this module */
/* eslint-enable security/detect-unsafe-regex, sonarjs/slow-regex, regexp/no-super-linear-move -- restore default regex safety checks outside this module */
