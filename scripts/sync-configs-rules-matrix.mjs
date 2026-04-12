/**
 * @packageDocumentation
 * Synchronize or validate config docs from canonical Stylelint config metadata.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import * as builtPluginModule from "../dist/plugin.js";

/** @typedef {"all" | "recommended"} ConfigName */

/**
 * @typedef {Readonly<{
 *     description: string;
 *     recommended: boolean;
 *     url: string;
 * }>} RuleDocs
 */
/** @typedef {Readonly<{ docs?: RuleDocs; meta?: { fixable?: boolean } }>} RuleModule */
/** @typedef {Readonly<Record<string, RuleModule>>} RulesMap */

/**
 * @typedef {Readonly<
 *     Record<ConfigName, { rules?: Readonly<Record<string, boolean>> }>
 * >} ConfigMap
 */

const builtRules = /** @type {RulesMap} */ (builtPluginModule.rules ?? {});
const builtConfigs = /** @type {ConfigMap} */ (builtPluginModule.configs ?? {});
const sectionHeading = "## Rules in this config";
const configDocPathByName = {
    all: resolve(process.cwd(), "docs/rules/configs/all.md"),
    recommended: resolve(process.cwd(), "docs/rules/configs/recommended.md"),
};

/** @param {string} markdown */
const detectLineEnding = (markdown) =>
    markdown.includes("\r\n") ? "\r\n" : "\n";

/**
 * @param {string} markdown
 * @param {"\n" | "\r\n"} lineEnding
 */
const normalizeMarkdownLineEndings = (markdown, lineEnding) =>
    markdown.replace(/\r?\n/gv, lineEnding);

/**
 * @param {string} markdown
 *
 * @returns {{ endOffset: number; startOffset: number }}
 */
const getSectionBounds = (markdown) => {
    const startOffset = markdown.indexOf(sectionHeading);

    if (startOffset < 0) {
        return {
            endOffset: markdown.length,
            startOffset: markdown.length,
        };
    }

    const nextHeadingOffset = markdown.indexOf(
        "\n## ",
        startOffset + sectionHeading.length
    );

    return {
        endOffset: nextHeadingOffset < 0 ? markdown.length : nextHeadingOffset,
        startOffset,
    };
};

/** @param {RuleModule} ruleModule */
const getRuleFixIndicator = (ruleModule) =>
    ruleModule.meta?.fixable === true ? "🔧" : "—";

/**
 * @param {string} ruleId
 *
 * @returns {null | readonly [string, RuleModule]}
 */
const getRuleEntryFromId = (ruleId) => {
    const shortRuleName = ruleId.split("/").at(-1);

    if (!shortRuleName) {
        return null;
    }

    const ruleModule = builtRules[shortRuleName];

    if (ruleModule === undefined) {
        return null;
    }

    return [shortRuleName, ruleModule];
};

/**
 * @param {ConfigName} configName
 *
 * @returns {string}
 */
const generateRulesSection = (configName) => {
    const configuredRuleIds = Object.keys(
        builtConfigs[configName]?.rules ?? {}
    ).toSorted((left, right) => left.localeCompare(right));
    const ruleEntries = configuredRuleIds
        .map(getRuleEntryFromId)
        .filter((entry) => entry !== null);

    if (ruleEntries.length === 0) {
        return [
            sectionHeading,
            "",
            "The public rule catalog is currently empty, so this config only registers the package surface for now.",
            "",
        ].join("\n");
    }

    return [
        sectionHeading,
        "",
        "| Rule | Fix | Description |",
        "| --- | :-: | --- |",
        ...ruleEntries.map(([ruleName, ruleModule]) => {
            const docs = ruleModule.docs;

            if (docs === undefined) {
                throw new TypeError(
                    `Rule '${ruleName}' is missing docs metadata.`
                );
            }

            return `| [\`${ruleName}\`](${docs.url}) | ${getRuleFixIndicator(ruleModule)} | ${docs.description} |`;
        }),
        "",
    ].join("\n");
};

/**
 * @param {string} markdown
 * @param {string} sectionText
 */
const replaceSection = (markdown, sectionText) => {
    const { endOffset, startOffset } = getSectionBounds(markdown);

    if (startOffset === markdown.length) {
        return `${markdown.trimEnd()}\n\n${sectionText}\n`;
    }

    return (
        markdown.slice(0, startOffset) + sectionText + markdown.slice(endOffset)
    );
};

/**/

/**/

/**/

/**/

/**/

/**/

/**/

/**/

/**/

/**/
async function main() {
    const shouldWrite = process.argv.includes("--write");

    /** @type {readonly ConfigName[]} */
    const configNames = ["recommended", "all"];

    for (const configName of configNames) {
        const configDocPath = configDocPathByName[configName];
        const markdown = await readFile(configDocPath, "utf8");
        const lineEnding = detectLineEnding(markdown);
        const normalizedMarkdown = normalizeMarkdownLineEndings(
            markdown,
            lineEnding
        );
        const nextSection = normalizeMarkdownLineEndings(
            generateRulesSection(configName),
            lineEnding
        );
        const nextMarkdown = replaceSection(normalizedMarkdown, nextSection);

        if (nextMarkdown === normalizedMarkdown) {
            continue;
        }

        if (!shouldWrite) {
            throw new Error(
                `Config docs are out of sync for '${configName}'. Run: npm run sync:configs-rules-matrix -- --write`
            );
        }

        await writeFile(configDocPath, nextMarkdown, "utf8");
    }
}

void main();
