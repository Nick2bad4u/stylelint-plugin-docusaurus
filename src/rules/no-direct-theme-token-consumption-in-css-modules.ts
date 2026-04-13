import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import { findFirstCssVarCustomPropertyReference } from "../_internal/css-value-analysis.js";
import { isDocusaurusThemeCustomPropertyName } from "../_internal/docusaurus-theme-scope.js";
import { isCssModuleRoot } from "../_internal/source-file-context.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName(
    "no-direct-theme-token-consumption-in-css-modules"
);
const messages: {
    rejectedTokenUse: (tokenName: string, propertyName: string) => string;
} = ruleMessages(ruleName, {
    rejectedTokenUse: (tokenName: string, propertyName: string): string =>
        `Avoid consuming ${tokenName} directly in CSS Modules declaration "${propertyName}". Alias the theme token to a component-scoped custom property first, then consume that local alias.`,
});

const docs = {
    description:
        "Disallow direct --ifm-* and --docsearch-* token consumption in CSS Modules declarations.",
    recommended: false,
    url: createRuleDocsUrl("no-direct-theme-token-consumption-in-css-modules"),
} as const;

/** Find the first global theme token consumed directly in a declaration value. */
function findConsumedThemeToken(value: string): string | undefined {
    return findFirstCssVarCustomPropertyReference(
        value,
        (propertyName) =>
            propertyName.startsWith("--docsearch-") ||
            propertyName.startsWith("--ifm-")
    );
}

/** Rule implementation for direct global token consumption in CSS Modules. */
const ruleFunction: RuleBase<boolean, undefined> =
    (primary) => (root, result) => {
        const isValid = validateOptions(result, ruleName, {
            actual: primary,
            possible: [true],
        });

        if (!isValid || !isCssModuleRoot(root)) {
            return;
        }

        root.walkDecls((declaration) => {
            if (declaration.prop.startsWith("--")) {
                return;
            }

            const consumedTokenName = findConsumedThemeToken(declaration.value);

            if (!isDefined(consumedTokenName)) {
                return;
            }

            if (!isDocusaurusThemeCustomPropertyName(consumedTokenName)) {
                return;
            }

            report({
                message: messages.rejectedTokenUse(
                    consumedTokenName,
                    declaration.prop
                ),
                node: declaration,
                result,
                ruleName,
                word: consumedTokenName,
            });
        });
    };

/** Public rule definition for direct token consumption in CSS Modules. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
