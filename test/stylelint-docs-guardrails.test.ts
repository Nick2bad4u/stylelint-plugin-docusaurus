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

            for (const entry of commentBody
                .split(",")
                .map((item) => item.trim())) {
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

    it("keeps docs override rule strategy explicit and intentional", () => {
        expect.hasAssertions();

        const configFileContents = nodeFs.readFileSync(
            stylelintConfigFilePath,
            "utf8"
        );

        // Ensure the docs override block exists.
        expect(configFileContents).toContain("docs/docusaurus/**/*.{css,scss}");

        // Rules that are re-enabled globally in docs and then locally guarded where needed.
        expect(configFileContents).toContain(
            '"a11y/media-prefers-reduced-motion": true,'
        );
        expect(configFileContents).toContain(
            '"defensive-css/require-named-grid-lines": true,'
        );
        expect(configFileContents).toContain(
            '"no-descending-specificity": true,'
        );
        expect(configFileContents).toContain(
            '"plugin/no-low-performance-animation-properties": true,'
        );

        // Rules that remain disabled for docs because they require full config options
        // and/or conflict with Docusaurus/Infima conventions.
        expect(configFileContents).toContain('"order/properties-order": null,');
        expect(configFileContents).toContain('"scales/font-sizes": null,');
    });

    it("keeps custom.css file-level guards for rules that intentionally conflict there", () => {
        expect.hasAssertions();

        const disabledRules = getDisabledStylelintRulesFromFile(
            "docs/docusaurus/src/css/custom.css"
        );
        const disableLines = getStylelintDisableCommentLines(
            "docs/docusaurus/src/css/custom.css"
        );

        expect(disableLines.length).toBeGreaterThan(0);

        for (const disableLine of disableLines) {
            // Keep every disable comment justified with an inline reason.
            expect(disableLine).toContain(" -- ");
        }

        expect(disabledRules).toStrictEqual(
            expect.arrayContaining([
                "a11y/media-prefers-reduced-motion",
                "no-descending-specificity",
                "plugin/no-low-performance-animation-properties",
            ])
        );
        expect(disabledRules).toStrictEqual([
            "a11y/media-prefers-reduced-motion",
            "no-descending-specificity",
            "plugin/no-low-performance-animation-properties",
        ]);
    });

    it("keeps index.module.css file-level guards for rules that intentionally conflict there", () => {
        expect.hasAssertions();

        const disabledRules = getDisabledStylelintRulesFromFile(
            "docs/docusaurus/src/pages/index.module.css"
        );
        const disableLines = getStylelintDisableCommentLines(
            "docs/docusaurus/src/pages/index.module.css"
        );

        expect(disableLines.length).toBeGreaterThan(0);

        for (const disableLine of disableLines) {
            // Keep every disable comment justified with an inline reason.
            expect(disableLine).toContain(" -- ");
        }

        expect(disabledRules).toStrictEqual(
            expect.arrayContaining([
                "defensive-css/require-named-grid-lines",
                "plugin/no-low-performance-animation-properties",
            ])
        );
        expect(disabledRules).toStrictEqual([
            "defensive-css/require-named-grid-lines",
            "plugin/no-low-performance-animation-properties",
        ]);
    });
});
