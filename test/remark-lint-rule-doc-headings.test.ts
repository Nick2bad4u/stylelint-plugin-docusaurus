import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { remark } from "remark";
import { VFile } from "vfile";
import { describe, expect, it } from "vitest";

import type { RemarkLintRuleDocHeadingsOptions } from "../scripts/remark-lint-rule-doc-headings.d.mts";
import remarkLintRuleDocHeadings from "../scripts/remark-lint-rule-doc-headings.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sampleRuleDocPath = resolve(repositoryRoot, "docs/rules/sample-rule.md");

type RuleDocMarkdownOverrides = {
    deprecatedSection?: string;
    furtherReadingSection?: string;
    includePackageDocumentation?: boolean;
    packageDocumentationSection?: string;
};

const createRuleDocMarkdown = (
    overrides: RuleDocMarkdownOverrides = {}
): string => {
    const {
        deprecatedSection = "Use [replacement](./replacement.md).",
        furtherReadingSection = "See the package documentation.",
        includePackageDocumentation = false,
        packageDocumentationSection = "Docusaurus package documentation:\n- https://example.com/docs",
    } = overrides;

    return [
        "# sample-rule",
        "",
        "## Targeted pattern scope",
        "Targets rule documentation structure.",
        "",
        "## What this rule reports",
        "Reports malformed helper-doc structures.",
        "",
        "## Why this rule exists",
        "Keeps rule docs consistent.",
        "",
        "## ❌ Incorrect",
        "Bad example.",
        "",
        "## ✅ Correct",
        "Good example.",
        "",
        "## Deprecated",
        deprecatedSection,
        "",
        ...(includePackageDocumentation
            ? [
                  "## Package documentation",
                  packageDocumentationSection,
                  "",
              ]
            : []),
        "## Further reading",
        furtherReadingSection,
        "",
        "> **Rule catalog ID:** R123",
        "",
    ].join("\n");
};

const lintRuleDoc = async (
    markdown: string,
    options: RemarkLintRuleDocHeadingsOptions = {}
): Promise<string[]> => {
    const file = new VFile({
        path: sampleRuleDocPath,
        value: markdown,
    });

    const processor = remark().use(remarkLintRuleDocHeadings, options ?? {});
    const result = await processor.process(file);

    return result.messages.flatMap((message) => {
        const messageOriginParts = [message.source, message.ruleId].filter(
            (part): part is string => typeof part === "string" && part !== ""
        );

        return messageOriginParts.length > 0
            ? [messageOriginParts.join(":")]
            : [];
    });
};

describe("remark-lint-rule-doc-headings", () => {
    it("reports a missing deprecated replacement link when the only link is inside fenced code", async () => {
        expect.hasAssertions();

        const ruleIds = await lintRuleDoc(
            createRuleDocMarkdown({
                deprecatedSection: [
                    "```md",
                    "[replacement](./replacement.md)",
                    "```",
                ].join("\n"),
            })
        );

        expect(ruleIds).toContain(
            "remark-lint:rule-doc-headings:deprecated-replacement-link"
        );
    });

    it("reports a missing deprecated replacement link when the only link is inside indented fenced code closed with a longer fence", async () => {
        expect.hasAssertions();

        const ruleIds = await lintRuleDoc(
            createRuleDocMarkdown({
                deprecatedSection: [
                    "   ```md",
                    "   [replacement](./replacement.md)",
                    "   ````",
                ].join("\n"),
            })
        );

        expect(ruleIds).toContain(
            "remark-lint:rule-doc-headings:deprecated-replacement-link"
        );
    });

    it("reports a missing rule catalog marker when the only marker line is inside fenced code", async () => {
        expect.hasAssertions();

        const ruleIds = await lintRuleDoc(
            createRuleDocMarkdown({
                furtherReadingSection: [
                    "```md",
                    "> **Rule catalog ID:** R999",
                    "```",
                ].join("\n"),
            }).replace(/\n> \*\*Rule catalog ID:\*\* R123\n/u, "\n"),
            {
                requireRuleCatalogId: true,
            }
        );

        expect(ruleIds).toContain(
            "remark-lint:rule-doc-headings:missing-rule-catalog-id"
        );
    });

    it("reports a missing package documentation label when the only label is inside inline code", async () => {
        expect.hasAssertions();

        const ruleIds = await lintRuleDoc(
            createRuleDocMarkdown({
                includePackageDocumentation: true,
                packageDocumentationSection:
                    "`Docusaurus package documentation:`\n- https://example.com/docs",
            }),
            {
                requirePackageDocumentationLabel: true,
            }
        );

        expect(ruleIds).toContain(
            "remark-lint:rule-doc-headings:package-docs-label"
        );
    });

    it("allows the stylelint config example heading to be disabled with the typed option key", async () => {
        expect.hasAssertions();

        const ruleIds = await lintRuleDoc(
            createRuleDocMarkdown().replace(
                "## Further reading\nSee the package documentation.",
                [
                    "## Further reading",
                    "See the package documentation.",
                    "",
                    "## Stylelint config example",
                    "```js",
                    "export default {};",
                    "```",
                ].join("\n")
            ),
            {
                headings: {
                    stylelintConfigExample: false,
                },
            }
        );

        expect(ruleIds).not.toContain("remark-lint:rule-doc-headings:order");
        expect(ruleIds).not.toContain(
            "remark-lint:rule-doc-headings:unknown-heading"
        );
    });
});
