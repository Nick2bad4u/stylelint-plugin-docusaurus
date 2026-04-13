import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import type { StylelintPluginRule } from "../_internal/create-stylelint-rule.js";

import { createStylelintRule } from "../_internal/create-stylelint-rule.js";
import {
    infimaSubcomponentAnchorClassNames,
    isTargetedInfimaSubcomponentClassName,
} from "../_internal/docusaurus-selector-contracts.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";
import {
    getClassNamesOutsideGlobal,
    getSelectors,
    parseSelectorList,
} from "../_internal/selector-parser-utils.js";
import {
    ruleHasScopeAnchorInAncestors,
    selectorHasScopeAnchor,
} from "../_internal/selector-scope-analysis.js";
import { isCssModuleRoot } from "../_internal/source-file-context.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = createRuleName("no-unanchored-infima-subcomponent-selectors");
const messages: {
    rejectedSelector: (infimaClassSelector: string, selector: string) => string;
} = ruleMessages(ruleName, {
    rejectedSelector: (infimaClassSelector: string, selector: string): string =>
        `Anchor Infima selector ${infimaClassSelector} under a stable Docusaurus wrapper or component-local selector instead of using brittle selector "${selector}" by itself.`,
});

const docs = {
    description:
        "Disallow unanchored Infima subcomponent selectors in global Docusaurus stylesheets.",
    recommended: false,
    url: createRuleDocsUrl("no-unanchored-infima-subcomponent-selectors"),
} as const;

/** Find the first unanchored Infima subcomponent selector in one selector list. */
function findUnanchoredInfimaSelector(
    selectorList: string,
    ancestorHasScopeAnchor: boolean
):
    | Readonly<{
          infimaClassSelector: string;
          selector: string;
      }>
    | undefined {
    const parsedSelectorList = parseSelectorList(selectorList);

    if (!isDefined(parsedSelectorList)) {
        return undefined;
    }

    for (const selector of getSelectors(parsedSelectorList)) {
        let targetedClassName: string | undefined = undefined;

        for (const cssClassName of getClassNamesOutsideGlobal(selector)) {
            if (!isTargetedInfimaSubcomponentClassName(cssClassName)) {
                continue;
            }

            targetedClassName = cssClassName;

            break;
        }

        if (!isDefined(targetedClassName)) {
            continue;
        }

        if (
            selectorHasScopeAnchor(selector, {
                additionalAnchorClassNames: infimaSubcomponentAnchorClassNames,
                ancestorHasScopeAnchor,
            })
        ) {
            continue;
        }

        return {
            infimaClassSelector: `.${targetedClassName}`,
            selector: selector.toString(),
        };
    }

    return undefined;
}

/** Rule implementation for unanchored Infima subcomponent selector hygiene. */
const ruleFunction: RuleBase<boolean, undefined> =
    (primary) => (root, result) => {
        const isValid = validateOptions(result, ruleName, {
            actual: primary,
            possible: [true],
        });

        if (!isValid || isCssModuleRoot(root)) {
            return;
        }

        root.walkRules((ruleNode) => {
            const invalidSelector = findUnanchoredInfimaSelector(
                ruleNode.selector,
                ruleHasScopeAnchorInAncestors(ruleNode, {
                    additionalAnchorClassNames:
                        infimaSubcomponentAnchorClassNames,
                })
            );

            if (!isDefined(invalidSelector)) {
                return;
            }

            report({
                message: messages.rejectedSelector(
                    invalidSelector.infimaClassSelector,
                    invalidSelector.selector
                ),
                node: ruleNode,
                result,
                ruleName,
                word: invalidSelector.infimaClassSelector,
            });
        });
    };

/** Public rule definition for Infima subcomponent selector anchoring. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule<boolean, undefined, typeof messages>({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;
