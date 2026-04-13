import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    getLeadingDocusaurusColorMode,
    isIfmColorPrimaryScaleVariable,
    normalizeSelectorList,
    walkThemeScopeDeclarations,
} from "../_internal/docusaurus-theme-scope.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

type ColorMode = "dark" | "light";

const ruleName = createRuleName(
    "require-ifm-color-primary-scale-per-color-mode"
);
const messages: {
    missingModeScale: (missingScope: string, existingScope: string) => string;
} = ruleMessages(ruleName, {
    missingModeScale: (missingScope: string, existingScope: string): string =>
        `When customizing the Infima primary color scale in ${existingScope}, also define a matching primary scale in ${missingScope}.`,
});

const docs = {
    description:
        "Require matching Infima primary color-scale overrides for each Docusaurus color mode you customize.",
    recommended: false,
    url: createRuleDocsUrl("require-ifm-color-primary-scale-per-color-mode"),
} as const;

/** Classify one theme-scope selector to its Docusaurus color mode. */
function getThemeScopeColorMode(selector: string): ColorMode | undefined {
    return getLeadingDocusaurusColorMode(selector, {
        allowRootLight: true,
    }) as ColorMode | undefined;
}

/** Rule implementation for paired color-mode Infima primary-scale overrides. */
const ruleFunction: RuleBase<boolean, undefined> =
    (primary) => (root, result) => {
        const isValid = validateOptions(result, ruleName, {
            actual: primary,
            possible: [true],
        });

        if (!isValid) {
            return;
        }

        const modesWithPrimaryScale = new Set<ColorMode>();

        root.walkRules((ruleNode) => {
            const selectorModes = new Set<ColorMode>();

            for (const selector of normalizeSelectorList(ruleNode.selector)) {
                const selectorMode = getThemeScopeColorMode(selector);

                if (!isDefined(selectorMode)) {
                    continue;
                }

                selectorModes.add(selectorMode);
            }

            if (selectorModes.size === 0) {
                return;
            }

            let declaresPrimaryScaleVariable = false;

            walkThemeScopeDeclarations(ruleNode, (declaration) => {
                if (!isIfmColorPrimaryScaleVariable(declaration.prop)) {
                    return;
                }

                declaresPrimaryScaleVariable = true;
            });

            if (!declaresPrimaryScaleVariable) {
                return;
            }

            for (const selectorMode of selectorModes) {
                modesWithPrimaryScale.add(selectorMode);
            }
        });

        if (modesWithPrimaryScale.size <= 1) {
            const existingMode = modesWithPrimaryScale.has("dark")
                ? "dark"
                : "light";
            const missingMode = existingMode === "dark" ? "light" : "dark";

            if (modesWithPrimaryScale.size === 1) {
                report({
                    message: messages.missingModeScale(
                        missingMode === "dark"
                            ? "[data-theme='dark']"
                            : ":root or [data-theme='light']",
                        existingMode === "dark"
                            ? "[data-theme='dark']"
                            : ":root or [data-theme='light']"
                    ),
                    node: root,
                    result,
                    ruleName,
                });
            }
        }
    };

/** Public rule definition for paired color-mode Infima primary scales. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
