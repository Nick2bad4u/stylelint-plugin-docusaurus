import type { AtRule } from "postcss";

import stylelint, { type RuleBase } from "stylelint";
import { isDefined, isEmpty } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import { isLikelyDocusaurusGlobalThemeClassName } from "../_internal/docusaurus-selector-contracts.js";
import { isDocusaurusThemeCustomPropertyName } from "../_internal/docusaurus-theme-scope.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";
import {
    getSelectors,
    parseSelectorList,
    selectorHasClassInPositiveScope,
} from "../_internal/selector-parser-utils.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const prefersColorSchemeMediaFeaturePattern =
    /\(\s*prefers-color-scheme\s*:\s*(?<mode>dark|light)\s*\)/giu;

type DocusaurusPrefersColorSchemeMode = "dark" | "light";
type DocusaurusThemeOverrideContext =
    | Readonly<{
          kind: "selector";
          source: string;
      }>
    | Readonly<{
          kind: "theme-token";
          source: string;
      }>;

const ruleName = createRuleName("prefer-data-theme-over-prefers-color-scheme");
const messages: {
    rejectedSelectorMediaQuery: (
        preferredScope: string,
        mediaQuery: string,
        selector: string
    ) => string;
    rejectedThemeTokenMediaQuery: (
        preferredScope: string,
        mediaQuery: string,
        themeToken: string
    ) => string;
} = ruleMessages(ruleName, {
    rejectedSelectorMediaQuery: (
        preferredScope: string,
        mediaQuery: string,
        selector: string
    ): string =>
        `Prefer ${preferredScope} selector scopes over @media ${mediaQuery} when overriding Docusaurus theme surface selector "${selector}". Docusaurus color mode is exposed through root data-theme attributes rather than raw prefers-color-scheme media queries.`,
    rejectedThemeTokenMediaQuery: (
        preferredScope: string,
        mediaQuery: string,
        themeToken: string
    ): string =>
        `Prefer ${preferredScope} selector scopes over @media ${mediaQuery} when overriding Docusaurus theme token ${themeToken}. Move the token declaration under the site color-mode selector instead of relying on prefers-color-scheme.`,
});

const docs = {
    description:
        "Prefer Docusaurus data-theme selector scopes over prefers-color-scheme media queries when styling Docusaurus theme tokens or global theme surfaces.",
    recommended: true,
    url: createRuleDocsUrl("prefer-data-theme-over-prefers-color-scheme"),
} as const;

/** Find the first Docusaurus global theme selector in one selector list. */
function findRelevantThemeSurfaceSelector(
    selectorList: string
): string | undefined {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    for (const selector of getSelectors(parsedSelectorList)) {
        if (
            !selectorHasClassInPositiveScope(
                selector,
                isLikelyDocusaurusGlobalThemeClassName
            )
        ) {
            continue;
        }

        return selector.toString();
    }

    return undefined;
}

/** Resolve the explicit prefers-color-scheme modes used by one media query. */
function getExplicitPrefersColorSchemeModes(
    mediaQuery: string
): readonly DocusaurusPrefersColorSchemeMode[] {
    if (/\bnot\b/iu.test(mediaQuery)) {
        return [];
    }

    const modes = new Set<DocusaurusPrefersColorSchemeMode>();

    for (const match of mediaQuery.matchAll(
        prefersColorSchemeMediaFeaturePattern
    )) {
        const mode = match.groups?.["mode"];

        if (mode === "dark" || mode === "light") {
            modes.add(mode);
        }
    }

    return [...modes];
}

/** Resolve the preferred Docusaurus selector scope label for one media query. */
function getPreferredScope(
    modes: readonly DocusaurusPrefersColorSchemeMode[]
): string {
    const [firstMode] = modes;

    return modes.length === 1 && isDefined(firstMode)
        ? `[data-theme='${firstMode}']`
        : "[data-theme]";
}

/** Resolve the first Docusaurus-specific theme override inside one media rule. */
function resolveDocusaurusThemeOverrideContext(
    mediaRule: Readonly<AtRule>
): DocusaurusThemeOverrideContext | undefined {
    let resolvedContext: DocusaurusThemeOverrideContext | undefined = undefined;

    mediaRule.walkDecls((declaration) => {
        if (isDefined(resolvedContext)) {
            return;
        }

        if (!isDocusaurusThemeCustomPropertyName(declaration.prop)) {
            return;
        }

        resolvedContext = {
            kind: "theme-token",
            source: declaration.prop,
        };
    });

    mediaRule.walkRules((ruleNode) => {
        if (isDefined(resolvedContext)) {
            return;
        }

        const selector = findRelevantThemeSurfaceSelector(ruleNode.selector);

        if (!isDefined(selector)) {
            return;
        }

        resolvedContext = {
            kind: "selector",
            source: selector,
        };
    });

    return resolvedContext;
}

/** Rule implementation for Docusaurus color-mode selector scoping. */
const ruleFunction: RuleBase<boolean, undefined> =
    (primary) => (root, result) => {
        const isValid = validateOptions(result, ruleName, {
            actual: primary,
            possible: [true],
        });

        if (!isValid) {
            return;
        }

        root.walkAtRules("media", (mediaRule) => {
            const explicitModes = getExplicitPrefersColorSchemeModes(
                mediaRule.params
            );

            if (isEmpty(explicitModes)) {
                return;
            }

            const overrideContext =
                resolveDocusaurusThemeOverrideContext(mediaRule);

            if (!isDefined(overrideContext)) {
                return;
            }

            const preferredScope = getPreferredScope(explicitModes);

            report({
                message:
                    overrideContext.kind === "theme-token"
                        ? messages.rejectedThemeTokenMediaQuery(
                              preferredScope,
                              mediaRule.params,
                              overrideContext.source
                          )
                        : messages.rejectedSelectorMediaQuery(
                              preferredScope,
                              mediaRule.params,
                              overrideContext.source
                          ),
                node: mediaRule,
                result,
                ruleName,
                word: "prefers-color-scheme",
            });
        });
    };

/** Public rule definition for Docusaurus prefers-color-scheme guidance. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
