import type { AtRule } from "postcss";

import stylelint, { type RuleBase } from "stylelint";
import { arrayJoin, isDefined, setHas } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("require-font-display-on-font-face");

const messages: {
    missingFontDisplay: () => string;
    rejectedFontDisplayValue: (value: string, allowed: string) => string;
} = ruleMessages(ruleName, {
    missingFontDisplay: (): string =>
        `Missing \`font-display\` declaration in @font-face. Add \`font-display: swap\` (or your preferred value) to control font-loading behavior and prevent CLS/FOIT.`,
    rejectedFontDisplayValue: (value: string, allowed: string): string =>
        `The \`font-display\` value "${value}" is not in the allowed list: ${allowed}. Use one of the configured allowed values to ensure consistent font-loading behavior.`,
});

const docs = {
    description:
        "Require a `font-display` declaration in every `@font-face` block.",
    recommended: false,
    url: createRuleDocsUrl("require-font-display-on-font-face"),
} as const;

/** All valid CSS `font-display` keyword values. */
const allFontDisplayValues: ReadonlySet<string> = new Set([
    "auto",
    "block",
    "fallback",
    "optional",
    "swap",
]);

/** Secondary option contract for the require-font-display rule. */
type SecondaryOptions = Readonly<{
    allowedValues?: string[];
}>;

/** Default allowed `font-display` values when none are configured. */
const defaultAllowedValues: readonly string[] = [
    "block",
    "fallback",
    "optional",
    "swap",
];

/**
 * Find the `font-display` declaration value inside one `@font-face` rule, if
 * present. Returns `undefined` when no `font-display` declaration exists.
 */
function findFontDisplayValue(
    fontFaceAtRule: Readonly<AtRule>
): string | undefined {
    let foundValue: string | undefined = undefined;

    fontFaceAtRule.walkDecls("font-display", (decl) => {
        foundValue = decl.value.trim().toLowerCase();

        return false;
    });

    return foundValue;
}

/** Rule implementation for required `font-display` in `@font-face`. */
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
                    allowedValues: [
                        (value: unknown): boolean =>
                            typeof value === "string" &&
                            setHas(allFontDisplayValues, value),
                    ],
                },
            }
        );

        if (!isValid) {
            return;
        }

        const allowedValues = secondary?.allowedValues ?? defaultAllowedValues;
        const allowedValuesSet = new Set<string>(allowedValues);
        const allowedValuesText = arrayJoin(
            allowedValues.map((v) => `"${v}"`),
            ", "
        );

        root.walkAtRules("font-face", (atRule) => {
            const displayValue = findFontDisplayValue(atRule);

            if (!isDefined(displayValue)) {
                report({
                    message: messages.missingFontDisplay(),
                    node: atRule,
                    result,
                    ruleName,
                });

                return;
            }

            if (!setHas(allowedValuesSet, displayValue)) {
                report({
                    message: messages.rejectedFontDisplayValue(
                        displayValue,
                        allowedValuesText
                    ),
                    node: atRule,
                    result,
                    ruleName,
                    word: displayValue,
                });
            }
        });
    };

/** Public rule definition for required `font-display` in `@font-face`. */
const rule: StylelintPluginRule<boolean, SecondaryOptions, typeof messages> =
    createStylelintRule<boolean, SecondaryOptions, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
