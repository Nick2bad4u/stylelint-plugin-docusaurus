/**
 * @packageDocumentation
 * Shared helper for authoring statically typed Stylelint rules in this template.
 */
import stylelint, {
    type Rule,
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
    meta?: Readonly<Omit<RuleMeta, "url"> & { url?: string }>;
    primaryOptionArray?: boolean;
    rule: Rule<P, S, M>;
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

    rule.ruleName = ruleName;
    rule.messages = messages;
    rule.meta = meta;

    if (options.primaryOptionArray === true) {
        rule.primaryOptionArray = true;
    }

    const plugin = stylelint.createPlugin(ruleName, rule);

    return {
        ...plugin,
        docs,
        messages,
        meta,
        rule,
        ruleName,
    };
};
