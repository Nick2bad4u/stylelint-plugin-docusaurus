import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    getLeadingDocusaurusColorMode,
    isDocsearchThemeCustomPropertyName,
    normalizeSelectorList,
    walkThemeScopeDeclarations,
} from "../_internal/docusaurus-theme-scope.js";
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

type ColorMode = "dark" | "light";

const ruleName = createRuleName("require-docsearch-color-mode-pairs");
const messages: {
    missingModeOverrides: (
        missingScope: string,
        existingScope: string
    ) => string;
} = ruleMessages(ruleName, {
    missingModeOverrides: (
        missingScope: string,
        existingScope: string
    ): string =>
        `When overriding DocSearch tokens in ${existingScope}, also provide a matching DocSearch token block in ${missingScope}.`,
});

const docs = {
    description:
        "Require paired light/dark DocSearch token override blocks when customizing DocSearch by color mode.",
    recommended: false,
    url: createRuleDocsUrl("require-docsearch-color-mode-pairs"),
} as const;

/** Classify one DocSearch selector to its explicit Docusaurus color mode. */
function getDocSearchColorMode(selector: string): ColorMode | undefined {
    const parsedSelectorList = parseSelectorList(selector);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    const [parsedSelector] = getSelectors(parsedSelectorList);

    if (!isDefined(parsedSelector)) {
        return undefined;
    }

    if (
        !selectorTrailingCompoundHasClass(
            parsedSelector,
            (className) => className === "DocSearch"
        )
    ) {
        return undefined;
    }

    return getLeadingDocusaurusColorMode(selector) as ColorMode | undefined;
}

/** Rule implementation for paired light/dark DocSearch overrides. */
const ruleFunction: RuleBase<boolean, undefined> =
    (primary) => (root, result) => {
        const isValid = validateOptions(result, ruleName, {
            actual: primary,
            possible: [true],
        });

        if (!isValid) {
            return;
        }

        const modesWithDocSearchOverrides = new Set<ColorMode>();

        root.walkRules((ruleNode) => {
            const selectorModes = new Set<ColorMode>();

            for (const selector of normalizeSelectorList(ruleNode.selector)) {
                const colorMode = getDocSearchColorMode(selector);

                if (!isDefined(colorMode)) {
                    continue;
                }

                selectorModes.add(colorMode);
            }

            if (selectorModes.size === 0) {
                return;
            }

            let declaresDocSearchToken = false;

            walkThemeScopeDeclarations(ruleNode, (declaration) => {
                if (!isDocsearchThemeCustomPropertyName(declaration.prop)) {
                    return;
                }

                declaresDocSearchToken = true;
            });

            if (!declaresDocSearchToken) {
                return;
            }

            for (const selectorMode of selectorModes) {
                modesWithDocSearchOverrides.add(selectorMode);
            }
        });

        if (modesWithDocSearchOverrides.size <= 1) {
            const existingMode = modesWithDocSearchOverrides.has("dark")
                ? "dark"
                : "light";
            const missingMode = existingMode === "dark" ? "light" : "dark";

            if (modesWithDocSearchOverrides.size === 1) {
                report({
                    message: messages.missingModeOverrides(
                        missingMode === "dark"
                            ? "[data-theme='dark'] .DocSearch"
                            : "[data-theme='light'] .DocSearch",
                        existingMode === "dark"
                            ? "[data-theme='dark'] .DocSearch"
                            : "[data-theme='light'] .DocSearch"
                    ),
                    node: root,
                    result,
                    ruleName,
                });
            }
        }
    };

/** Public rule definition for paired DocSearch color-mode overrides. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
