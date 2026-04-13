import type { Rule } from "postcss";

import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";
import type { ParsedSelector } from "../_internal/selector-parser-utils.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import { isLikelyDocusaurusGlobalThemeClassName } from "../_internal/docusaurus-selector-contracts.js";
import {
    getLeadingDocusaurusColorMode,
    isAllowedThemeScopeSelector,
    isDocusaurusThemeCustomPropertyName,
    walkThemeScopeDeclarations,
} from "../_internal/docusaurus-theme-scope.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";
import {
    getSelectors,
    isInsideGlobalPseudo,
    parseSelectorList,
    selectorHasClassOutsideGlobal,
} from "../_internal/selector-parser-utils.js";
import {
    ruleHasScopeAnchorInAncestors,
    selectorHasScopeAnchor,
} from "../_internal/selector-scope-analysis.js";
import { isCssModuleRoot } from "../_internal/source-file-context.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

type InvalidCssModuleOverride = Readonly<{
    selector: string;
    signal: string;
}>;

const ruleName = createRuleName(
    "require-local-anchor-for-global-theme-overrides-in-css-modules"
);
const messages: {
    rejectedSelector: (signal: string, selector: string) => string;
} = ruleMessages(ruleName, {
    rejectedSelector: (signal: string, selector: string): string =>
        `Anchor global Docusaurus override ${signal} to a local class, id, or non-root data-* wrapper inside CSS Modules. Selector "${selector}" currently acts as hidden global CSS instead of component-local styling.`,
});

const docs = {
    description:
        "Require a local selector anchor when overriding Docusaurus global theme surfaces inside CSS Modules.",
    recommended: true,
    url: createRuleDocsUrl(
        "require-local-anchor-for-global-theme-overrides-in-css-modules"
    ),
} as const;

/** Find one explicit leading Docusaurus root data-theme scope. */
function findRootDataThemeSignal(selectorText: string): string | undefined {
    if (!selectorText.includes("data-theme")) {
        return undefined;
    }

    const colorMode = getLeadingDocusaurusColorMode(selectorText, {
        allowRootLight: true,
    });

    return isDefined(colorMode) ? `[data-theme='${colorMode}']` : undefined;
}

/** Find one wrapped global Docusaurus theme class in a selector. */
function findWrappedGlobalThemeClassSignal(
    selector: Readonly<ParsedSelector>
): string | undefined {
    let resolvedSignal: string | undefined = undefined;

    selector.walkClasses((selectorClassNode) => {
        if (isDefined(resolvedSignal)) {
            return;
        }

        if (!isInsideGlobalPseudo(selectorClassNode)) {
            return;
        }

        if (!isLikelyDocusaurusGlobalThemeClassName(selectorClassNode.value)) {
            return;
        }

        resolvedSignal = `:global(.${selectorClassNode.value})`;
    });

    return resolvedSignal;
}

/** Resolve the first hidden global Docusaurus override selector in a CSS Module. */
function resolveInvalidCssModuleOverride(
    selectorList: string,
    {
        ancestorHasScopeAnchor,
        declaresThemeToken,
    }: Readonly<{
        ancestorHasScopeAnchor: boolean;
        declaresThemeToken: boolean;
    }>
): InvalidCssModuleOverride | undefined {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    for (const selector of getSelectors(parsedSelectorList)) {
        if (
            selectorHasScopeAnchor(selector, {
                ancestorHasScopeAnchor,
                includeGlobal: false,
            })
        ) {
            continue;
        }

        if (
            selectorHasClassOutsideGlobal(
                selector,
                isLikelyDocusaurusGlobalThemeClassName
            )
        ) {
            continue;
        }

        const wrappedGlobalThemeClassSignal =
            findWrappedGlobalThemeClassSignal(selector);

        if (isDefined(wrappedGlobalThemeClassSignal)) {
            return {
                selector: selector.toString(),
                signal: wrappedGlobalThemeClassSignal,
            };
        }

        const rootDataThemeSignal = findRootDataThemeSignal(
            selector.toString()
        );

        if (isDefined(rootDataThemeSignal)) {
            return {
                selector: selector.toString(),
                signal: rootDataThemeSignal,
            };
        }

        if (
            declaresThemeToken &&
            isAllowedThemeScopeSelector(selector.toString())
        ) {
            return {
                selector: selector.toString(),
                signal: selector.toString(),
            };
        }
    }

    return undefined;
}

/** Check whether one CSS rule declares a Docusaurus theme token. */
function ruleDeclaresDocusaurusThemeToken(ruleNode: Readonly<Rule>): boolean {
    let declaresThemeToken = false;

    walkThemeScopeDeclarations(ruleNode, (declaration) => {
        if (!isDocusaurusThemeCustomPropertyName(declaration.prop)) {
            return;
        }

        declaresThemeToken = true;
    });

    return declaresThemeToken;
}

/** Rule implementation for CSS Modules local-anchor requirements. */
const ruleFunction: RuleBase<boolean, undefined> =
    (primary) => (root, result) => {
        const isValid = validateOptions(result, ruleName, {
            actual: primary,
            possible: [true],
        });

        if (!isValid || !isCssModuleRoot(root)) {
            return;
        }

        root.walkRules((ruleNode) => {
            const invalidOverride = resolveInvalidCssModuleOverride(
                ruleNode.selector,
                {
                    ancestorHasScopeAnchor: ruleHasScopeAnchorInAncestors(
                        ruleNode,
                        {
                            includeGlobal: false,
                        }
                    ),
                    declaresThemeToken:
                        ruleDeclaresDocusaurusThemeToken(ruleNode),
                }
            );

            if (!isDefined(invalidOverride)) {
                return;
            }

            report({
                message: messages.rejectedSelector(
                    invalidOverride.signal,
                    invalidOverride.selector
                ),
                node: ruleNode,
                result,
                ruleName,
                word: invalidOverride.signal,
            });
        });
    };

/** Public rule definition for CSS Modules global-theme local anchoring. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
