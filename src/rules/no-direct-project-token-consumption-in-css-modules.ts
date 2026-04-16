import stylelint, { type RuleBase } from "stylelint";
import { isDefined, isEmpty } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import { findFirstCssVarCustomPropertyReference } from "../_internal/css-value-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";
import { isCssModuleRoot } from "../_internal/source-file-context.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName(
    "no-direct-project-token-consumption-in-css-modules"
);

const messages: {
    rejectedTokenUse: (
        tokenName: string,
        propertyName: string,
        prefix: string
    ) => string;
} = ruleMessages(ruleName, {
    rejectedTokenUse: (
        tokenName: string,
        propertyName: string,
        prefix: string
    ): string =>
        `Avoid consuming ${tokenName} (matching project token prefix "${prefix}") directly in CSS Modules declaration "${propertyName}". Alias the project token to a component-scoped custom property first, then consume that local alias.`,
});

const docs = {
    description:
        "Disallow direct project-scoped CSS custom property token consumption in CSS Modules declarations.",
    recommended: false,
    url: createRuleDocsUrl(
        "no-direct-project-token-consumption-in-css-modules"
    ),
} as const;

/** Secondary option contract for the project-token rule. */
type SecondaryOptions = Readonly<{
    tokenPrefixes: string[];
}>;

/**
 * Find the first project custom property consumed directly in a declaration
 * value, given the configured list of token prefixes.
 */
function findConsumedProjectToken(
    value: string,
    tokenPrefixes: readonly string[]
): undefined | { prefix: string; tokenName: string } {
    const tokenName = findFirstCssVarCustomPropertyReference(
        value,
        (propertyName) =>
            tokenPrefixes.some((prefix) => propertyName.startsWith(prefix))
    );

    if (!isDefined(tokenName)) {
        return undefined;
    }

    const matchedPrefix = tokenPrefixes.find((prefix) =>
        tokenName.startsWith(prefix)
    );

    if (!isDefined(matchedPrefix)) {
        return undefined;
    }

    return { prefix: matchedPrefix, tokenName };
}

/** Rule implementation for direct project token consumption in CSS Modules. */
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
                    tokenPrefixes: [
                        (value: unknown): boolean =>
                            typeof value === "string" &&
                            value.startsWith("--") &&
                            value.length > 2,
                    ],
                },
            }
        );

        if (
            !isValid ||
            !isCssModuleRoot(root) ||
            !isDefined(secondary) ||
            isEmpty(secondary.tokenPrefixes)
        ) {
            return;
        }

        const { tokenPrefixes } = secondary;

        root.walkDecls((declaration) => {
            if (declaration.prop.startsWith("--")) {
                return;
            }

            const consumed = findConsumedProjectToken(
                declaration.value,
                tokenPrefixes
            );

            if (!isDefined(consumed)) {
                return;
            }

            report({
                message: messages.rejectedTokenUse(
                    consumed.tokenName,
                    declaration.prop,
                    consumed.prefix
                ),
                node: declaration,
                result,
                ruleName,
                word: consumed.tokenName,
            });
        });
    };

/** Public rule definition for direct project token consumption in CSS Modules. */
const rule: StylelintPluginRule<boolean, SecondaryOptions, typeof messages> =
    createStylelintRule<boolean, SecondaryOptions, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
