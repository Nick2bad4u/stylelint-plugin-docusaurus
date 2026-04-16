import type { AtRule } from "postcss";

import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("require-font-face-local-src-before-remote");

const messages: {
    missingLocalSrc: () => string;
    remoteBeforeLocal: () => string;
} = ruleMessages(ruleName, {
    missingLocalSrc: (): string =>
        `@font-face \`src\` has no \`local()\` fallback. Add \`local("Font Name")\` before the \`url()\` source so that browsers use a locally installed font before fetching a remote one.`,
    remoteBeforeLocal: (): string =>
        `In @font-face \`src\`, \`url()\` sources appear before \`local()\` sources. Move all \`local()\` declarations before the first \`url()\` so that locally installed fonts are preferred.`,
});

const docs = {
    description:
        "Require `local()` sources to appear before `url()` sources in `@font-face` `src` declarations.",
    recommended: false,
    url: createRuleDocsUrl("require-font-face-local-src-before-remote"),
} as const;

/**
 * Regex that matches the opening of a `local(...)` function token in a CSS
 * value.
 */
const localFunctionPattern = /(?<![\w'-])local\s*\(/giu;

/** Regex that matches the opening of a `url(...)` function token in a CSS value. */
const urlFunctionPattern = /(?<![\w'-])url\s*\(/giu;

/** Classify occurrence positions of `local()` and `url()` in a CSS src value. */
type SrcAnalysis = Readonly<{
    firstLocalIndex: number | undefined;
    firstUrlIndex: number | undefined;
}>;

/** Find the first occurrence index of `local()` and `url()` in a src value. */
function analyzeSrcValue(srcValue: string): SrcAnalysis {
    let firstLocalIndex: number | undefined = undefined;
    let firstUrlIndex: number | undefined = undefined;

    for (const match of srcValue.matchAll(localFunctionPattern)) {
        // MatchAll returns matches in order; first match is at the lowest index
        firstLocalIndex ??= match.index;
    }

    for (const match of srcValue.matchAll(urlFunctionPattern)) {
        // MatchAll returns matches in order; first match is at the lowest index
        firstUrlIndex ??= match.index;
    }

    return { firstLocalIndex, firstUrlIndex };
}

/** Validate the `src` declaration value in one `@font-face` block. */
function validateFontFaceSrc(
    fontFaceAtRule: Readonly<AtRule>
): "missingLocal" | "remoteBeforeLocal" | undefined {
    let violation: "missingLocal" | "remoteBeforeLocal" | undefined = undefined;

    // eslint-disable-next-line sonarjs/no-invariant-returns -- all paths intentionally return false to stop postcss walkDecls after the first src declaration
    fontFaceAtRule.walkDecls(/^src$/iu, (decl) => {
        const { firstLocalIndex, firstUrlIndex } = analyzeSrcValue(decl.value);

        if (!isDefined(firstUrlIndex)) {
            return false;
        }

        if (!isDefined(firstLocalIndex)) {
            violation = "missingLocal";

            return false;
        }

        if (firstUrlIndex < firstLocalIndex) {
            violation = "remoteBeforeLocal";

            return false;
        }

        return false;
    });

    return violation;
}

/** Rule implementation for `local()` ordering in `@font-face src`. */
const ruleFunction: RuleBase<boolean, undefined> =
    (primary) => (root, result) => {
        const isValid = validateOptions(result, ruleName, {
            actual: primary,
            possible: [true],
        });

        if (!isValid) {
            return;
        }

        root.walkAtRules("font-face", (atRule) => {
            const violation = validateFontFaceSrc(atRule);

            if (!isDefined(violation)) {
                return;
            }

            report({
                message:
                    violation === "missingLocal"
                        ? messages.missingLocalSrc()
                        : messages.remoteBeforeLocal(),
                node: atRule,
                result,
                ruleName,
            });
        });
    };

/** Public rule definition for `local()` ordering in `@font-face src`. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
