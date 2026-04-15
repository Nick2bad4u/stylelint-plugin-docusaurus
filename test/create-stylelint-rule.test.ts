import { describe, expect, it } from "vitest";

import { createStylelintRule } from "../src/_internal/create-stylelint-rule.js";

describe("createStylelintRule helper", () => {
    it("sets primaryOptionArray on the rule when the option is true", () => {
        expect.hasAssertions();

        // A minimal rule implementation — just needs to satisfy the RuleBase<> signature
        const minimalRule = () => () => {};

        const result = createStylelintRule({
            docs: {
                description: "Test rule for primaryOptionArray coverage",
                recommended: false,
                url: "https://example.com/docs/rules/test-rule",
            },
            messages: {
                testMessage: "Test message",
            },
            primaryOptionArray: true,
            rule: minimalRule as Parameters<
                typeof createStylelintRule
            >[0]["rule"],
            ruleName: "test/primary-option-array",
        });

        expect(result.rule.primaryOptionArray).toBe(true);
    });

    it("does not set primaryOptionArray when the option is absent", () => {
        expect.hasAssertions();

        const minimalRule = () => () => {};

        const result = createStylelintRule({
            docs: {
                description: "Test rule without primaryOptionArray",
                recommended: false,
                url: "https://example.com/docs/rules/test-rule-no-array",
            },
            messages: {
                testMessage: "Test message",
            },
            rule: minimalRule as Parameters<
                typeof createStylelintRule
            >[0]["rule"],
            ruleName: "test/no-primary-option-array",
        });

        // When not specified, the property should not be explicitly set to true
        expect(result.rule.primaryOptionArray).not.toBe(true);
    });

    it("stamps ruleName, messages, and meta on the returned rule", () => {
        expect.hasAssertions();

        const minimalRule = () => () => {};
        const messages = { badUsage: "Bad usage detected." };

        const result = createStylelintRule({
            docs: {
                description: "Test rule for metadata coverage",
                recommended: false,
                url: "https://example.com/docs/rules/test-meta",
            },
            messages,
            rule: minimalRule as Parameters<
                typeof createStylelintRule
            >[0]["rule"],
            ruleName: "test/meta-stamp",
        });

        expect(result.ruleName).toBe("test/meta-stamp");
        expect(result.messages).toBe(messages);
        expect(result.meta.url).toBe(
            "https://example.com/docs/rules/test-meta"
        );
    });

    it("uses meta.url when explicitly provided in meta option", () => {
        expect.hasAssertions();

        const minimalRule = () => () => {};

        const result = createStylelintRule({
            docs: {
                description: "Test rule with explicit meta url",
                recommended: false,
                url: "https://example.com/docs/rules/fallback",
            },
            messages: {},
            meta: { url: "https://example.com/docs/rules/override" },
            rule: minimalRule as Parameters<
                typeof createStylelintRule
            >[0]["rule"],
            ruleName: "test/meta-url-override",
        });

        expect(result.meta.url).toBe("https://example.com/docs/rules/override");
    });
});
