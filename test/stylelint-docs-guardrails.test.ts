import * as nodeFs from "node:fs";
import { describe, expect, it } from "vitest";

const stylelintConfigFilePath = "stylelint.config.mjs";

function getDisabledStylelintRulesFromFile(
    filePath: string
): readonly string[] {
    const fileContents = nodeFs.readFileSync(filePath, "utf8");
    const ruleNames: string[] = [];

    for (const line of fileContents.split(/\r?\n/v)) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith("/* stylelint-disable ")) {
            const commentBody =
                trimmedLine
                    .slice("/* stylelint-disable ".length)
                    .split("--", 1)[0]
                    ?.split("*/", 1)[0]
                    ?.trim() ?? "";

            const disabledRules = commentBody
                .split(",")
                .map((item) => item.trim());

            for (const entry of disabledRules) {
                if (entry.length > 0) {
                    ruleNames.push(entry);
                }
            }
        }
    }

    return [...new Set(ruleNames)];
}

function getStylelintDisableCommentLines(filePath: string): readonly string[] {
    const fileContents = nodeFs.readFileSync(filePath, "utf8");
    const disableLines: string[] = [];

    for (const line of fileContents.split(/\r?\n/v)) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith("/* stylelint-disable ")) {
            disableLines.push(trimmedLine);
        }
    }

    return disableLines;
}

describe("docs stylelint guardrails", () => {
    it("keeps docs guardrail scripts wired into package scripts and release verification", () => {
        expect.hasAssertions();

        const packageJsonContents = nodeFs.readFileSync("package.json", "utf8");

        expect(packageJsonContents).toContain(
            '"test:docs-guardrails": "vitest run test/stylelint-docs-guardrails.test.ts"'
        );
        expect(packageJsonContents).toContain("npm run test:docs-guardrails");
    });

    it("keeps stylelint config delegated to shared config", () => {
        expect.hasAssertions();

        const configFileContents = nodeFs.readFileSync(
            stylelintConfigFilePath,
            "utf8"
        );

        expect(configFileContents).toContain(
            'import sharedConfig from "stylelint-config-nick2bad4u";'
        );
        expect(configFileContents).toContain("const stylelintConfig = {");
        expect(configFileContents).toContain("...sharedConfig,");
        expect(configFileContents).not.toContain(
            "docs/docusaurus/**/*.{css,scss}"
        );
    });

    it("does not keep stale file-level stylelint disables in custom.css", () => {
        expect.hasAssertions();

        const disabledRules = getDisabledStylelintRulesFromFile(
            "docs/docusaurus/src/css/custom.css"
        );
        const disableLines = getStylelintDisableCommentLines(
            "docs/docusaurus/src/css/custom.css"
        );

        expect(disableLines).toStrictEqual([]);
        expect(disabledRules).toStrictEqual([]);
    });

    it("does not keep stale file-level stylelint disables in index.module.css", () => {
        expect.hasAssertions();

        const disabledRules = getDisabledStylelintRulesFromFile(
            "docs/docusaurus/src/pages/index.module.css"
        );
        const disableLines = getStylelintDisableCommentLines(
            "docs/docusaurus/src/pages/index.module.css"
        );

        expect(disableLines).toStrictEqual([]);
        expect(disabledRules).toStrictEqual([]);
    });
});
