import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import {
    getDeclaredCascadeLayerNames,
    getImportedCascadeLayerNames,
} from "../_internal/cascade-layer-analysis.js";
import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import { reservedDocusaurusCascadeLayerPrefix } from "../_internal/docusaurus-selector-contracts.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-docusaurus-layer-name-collisions");
const messages: {
    rejectedLayerName: (layerName: string) => string;
} = ruleMessages(ruleName, {
    rejectedLayerName: (layerName: string): string =>
        `Avoid author-defined cascade layer name "${layerName}". The ${reservedDocusaurusCascadeLayerPrefix} prefix is reserved for Docusaurus-managed layers such as ${reservedDocusaurusCascadeLayerPrefix}.infima.`,
});

const docs = {
    description:
        "Disallow author-defined cascade layer names that collide with reserved Docusaurus-managed layer prefixes.",
    recommended: false,
    url: createRuleDocsUrl("no-docusaurus-layer-name-collisions"),
} as const;

/** Find the first reserved Docusaurus layer name in one parsed name list. */
function findReservedLayerName(
    layerNames: readonly string[]
): string | undefined {
    for (const layerName of layerNames) {
        if (
            layerName === reservedDocusaurusCascadeLayerPrefix ||
            layerName.startsWith(`${reservedDocusaurusCascadeLayerPrefix}.`)
        ) {
            return layerName;
        }
    }

    return undefined;
}

/** Rule implementation for reserved Docusaurus cascade-layer names. */
const ruleFunction: RuleBase<boolean, undefined> =
    (primary) => (root, result) => {
        const isValid = validateOptions(result, ruleName, {
            actual: primary,
            possible: [true],
        });

        if (!isValid) {
            return;
        }

        root.walkAtRules((atRule) => {
            const atRuleName = atRule.name.toLowerCase();

            if (atRuleName === "layer") {
                const reservedLayerName = findReservedLayerName(
                    getDeclaredCascadeLayerNames(atRule.params)
                );

                if (!isDefined(reservedLayerName)) {
                    return;
                }

                report({
                    message: messages.rejectedLayerName(reservedLayerName),
                    node: atRule,
                    result,
                    ruleName,
                    word: reservedLayerName,
                });

                return;
            }

            if (atRuleName !== "import") {
                return;
            }

            const reservedLayerName = findReservedLayerName(
                getImportedCascadeLayerNames(atRule.params)
            );

            if (!isDefined(reservedLayerName)) {
                return;
            }

            report({
                message: messages.rejectedLayerName(reservedLayerName),
                node: atRule,
                result,
                ruleName,
                word: reservedLayerName,
            });
        });
    };

/** Public rule definition for reserved Docusaurus layer names. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
