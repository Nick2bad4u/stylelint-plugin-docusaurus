import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    findLegacyThemeColorModeSelector,
    normalizeLegacyThemeColorModeSelectors,
} from "../_internal/docusaurus-theme-scope.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("prefer-data-theme-color-mode");
const messages: {
    rejectedLegacySelector: (
        legacySelector: string,
        preferredSelector: string
    ) => string;
} = ruleMessages(ruleName, {
    rejectedLegacySelector: (
        legacySelector: string,
        preferredSelector: string
    ): string =>
        `Prefer ${preferredSelector} over legacy ${legacySelector} selectors in Docusaurus styles.`,
});

const docs = {
    description:
        "Prefer Docusaurus data-theme selectors over legacy theme-dark/theme-light classes.",
    recommended: true,
    url: createRuleDocsUrl("prefer-data-theme-color-mode"),
} as const;

/**
 * Resolve the preferred Docusaurus data-theme selector for one legacy color
 * mode class.
 */
function getPreferredSelector(
    legacySelector: ".theme-dark" | ".theme-light"
): string {
    return legacySelector === ".theme-light"
        ? "[data-theme='light']"
        : "[data-theme='dark']";
}

/**
 * Rule implementation for preferring Docusaurus data-theme color-mode
 * selectors.
 */
const ruleFunction: RuleBase<boolean, undefined> =
    (primary, _secondaryOptions, context) => (root, result) => {
        const isValid = validateOptions(result, ruleName, {
            actual: primary,
            possible: [true],
        });

        if (!isValid) {
            return;
        }

        root.walkRules((ruleNode) => {
            const legacySelector = findLegacyThemeColorModeSelector(
                ruleNode.selector
            );

            if (!isDefined(legacySelector)) {
                return;
            }

            const preferredSelector = getPreferredSelector(legacySelector);

            if (context.fix === true) {
                const nextSelector = normalizeLegacyThemeColorModeSelectors(
                    ruleNode.selector
                );

                if (nextSelector !== ruleNode.selector) {
                    ruleNode.selector = nextSelector;
                }

                return;
            }

            report({
                message: messages.rejectedLegacySelector(
                    legacySelector,
                    preferredSelector
                ),
                node: ruleNode,
                result,
                ruleName,
                word: legacySelector,
            });
        });
    };

/** Public rule definition for `prefer-data-theme-color-mode`. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        meta: {
            fixable: true,
        },
        rule: ruleFunction,
        ruleName,
    });

export default rule;
