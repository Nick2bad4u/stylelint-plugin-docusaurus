/**
 * @packageDocumentation
 * Shared helper for authoring statically typed Stylelint rules in this template.
 */
import type { Except } from "type-fest";

import stylelint, {
    type Rule,
    type RuleBase,
    type RuleMessages,
    type RuleMeta,
} from "stylelint";

/** Input contract for the shared Stylelint rule creator. */
export type CreateStylelintRuleOptions<
    P = unknown,
    S = Readonly<Record<string, never>> | undefined,
    M extends RuleMessages = RuleMessages,
> = Readonly<{
    docs: StylelintRuleDocs;
    messages: M;
    meta?: Readonly<Except<RuleMeta, "url"> & { url?: string }>;
    primaryOptionArray?: boolean;
    rule: RuleBase<P, S>;
    ruleName: string;
}>;

/** Fully assembled plugin object shape used by this template's rule registry. */
export type StylelintPluginRule<
    P = unknown,
    S = Readonly<Record<string, never>> | undefined,
    M extends RuleMessages = RuleMessages,
> = Readonly<{
    docs: StylelintRuleDocs;
    messages: M;
    meta: RuleMeta;
    rule: Rule<P, S, M>;
    ruleName: string;
}> &
    ReturnType<typeof stylelint.createPlugin>;

/** Nongeneric public rule contract used for heterogeneous runtime registries. */
export type StylelintPluginRuleContract = Readonly<{
    docs: StylelintRuleDocs;
    messages: RuleMessages;
    meta: RuleMeta;
    rule: Rule;
    ruleName: string;
}> &
    ReturnType<typeof stylelint.createPlugin>;

/** Static authored docs metadata carried alongside each rule definition. */
export type StylelintRuleDocs = Readonly<{
    description: string;
    recommended: boolean;
    url: string;
}>;

/**
 * Create a Stylelint plugin object while stamping the static runtime metadata
 * that Stylelint and this template expect.
 */
export const createStylelintRule = <
    P = unknown,
    S = Readonly<Record<string, never>> | undefined,
    M extends RuleMessages = RuleMessages,
>(
    options: CreateStylelintRuleOptions<P, S, M>
): StylelintPluginRule<P, S, M> => {
    const { docs, messages, rule, ruleName } = options;
    const meta: RuleMeta = {
        ...options.meta,
        url: options.meta?.url ?? docs.url,
    };
    const typedRule = rule as Rule<P, S, M>;

    typedRule.ruleName = ruleName;
    typedRule.messages = messages;
    typedRule.meta = meta;

    if (options.primaryOptionArray === true) {
        typedRule.primaryOptionArray = true;
    }

    const plugin = stylelint.createPlugin(ruleName, typedRule);

    return {
        ...plugin,
        docs,
        messages,
        meta,
        rule: typedRule,
        ruleName,
    };
};
