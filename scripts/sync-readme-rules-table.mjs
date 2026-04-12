/**
 * @packageDocumentation
 * Synchronize or validate the README rules section from canonical Stylelint rule metadata.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import * as builtPluginModule from "../dist/plugin.js";

/**
 * @typedef {Readonly<{
 *     description: string;
 *     recommended: boolean;
 *     url: string;
 * }>} RuleDocs
 */

/**
 * @typedef {Readonly<{
 *     docs?: RuleDocs;
 *     meta?: { fixable?: boolean; url?: string };
 *     ruleName?: string;
 * }>} RuleModule
 */
/** @typedef {Readonly<Record<string, RuleModule>>} RulesMap */

const rulesSectionHeading = "## Rules";
const readmePath = resolve(process.cwd(), "README.md");
const builtRules = /** @type {RulesMap} */ (builtPluginModule.rules ?? {});

/** @param {string} markdown */
const detectLineEnding = (markdown) =>
    markdown.includes("\r\n") ? "\r\n" : "\n";

/**
 * @param {string} markdown
 * @param {"\n" | "\r\n"} lineEnding
 */
const normalizeMarkdownLineEndings = (markdown, lineEnding) =>
    markdown.replace(/\r?\n/gv, lineEnding);

/** @param {string} markdown */
const getReadmeRulesSectionBounds = (markdown) => {
    const startOffset = markdown.indexOf(rulesSectionHeading);

    if (startOffset < 0) {
        throw new Error("README.md is missing the '## Rules' section heading.");
    }

    const nextHeadingOffset = markdown.indexOf(
        "\n## ",
        startOffset + rulesSectionHeading.length
    );

    return {
        endOffset: nextHeadingOffset < 0 ? markdown.length : nextHeadingOffset,
        startOffset,
    };
};

/** @param {RuleModule} ruleModule */
const getRuleFixIndicator = (ruleModule) =>
    ruleModule.meta?.fixable === true ? "🔧" : "—";

/** @param {RuleModule} ruleModule */
const getConfigIndicator = (ruleModule) =>
    ruleModule.docs?.recommended === true ? "recommended, all" : "all";

/** @param {readonly [string, RuleModule]} entry */
const toRuleTableRow = ([ruleName, ruleModule]) => {
    const docs = ruleModule.docs;

    if (docs === undefined) {
        throw new TypeError(`Rule '${ruleName}' is missing docs metadata.`);
    }

    return `| [\`${ruleName}\`](${docs.url}) | ${getRuleFixIndicator(ruleModule)} | ${getConfigIndicator(ruleModule)} | ${docs.description} |`;
};

/** @param {RulesMap} rules */
export const generateReadmeRulesSectionFromRules = (rules) => {
    const ruleEntries = Object.entries(rules).toSorted(([left], [right]) =>
        left.localeCompare(right)
    );

    if (ruleEntries.length === 0) {
        return [
            "## Rules",
            "",
            "The public `docusaurus/*` rule catalog is currently empty on purpose.",
            "",
            "This repository already ships the runtime, tests, docs, and build scaffolding required for future Docusaurus-specific Stylelint rules.",
            "",
        ].join("\n");
    }

    return [
        "## Rules",
        "",
        "| Rule | Fix | Configs | Description |",
        "| --- | :-: | --- | --- |",
        ...ruleEntries.map(toRuleTableRow),
        "",
    ].join("\n");
};

/**
 * Synchronize or validate the README rules section against the built plugin's
 * canonical rule metadata.
 *
 * @returns {Promise<void>}
 */
async function main() {
    const shouldWrite = process.argv.includes("--write");
    const readmeMarkdown = await readFile(readmePath, "utf8");
    const lineEnding = detectLineEnding(readmeMarkdown);
    const normalizedReadme = normalizeMarkdownLineEndings(
        readmeMarkdown,
        lineEnding
    );
    const nextRulesSection = normalizeMarkdownLineEndings(
        generateReadmeRulesSectionFromRules(builtRules),
        lineEnding
    );
    const { endOffset, startOffset } =
        getReadmeRulesSectionBounds(normalizedReadme);
    const nextReadme =
        normalizedReadme.slice(0, startOffset) +
        nextRulesSection +
        normalizedReadme.slice(endOffset);

    if (nextReadme === normalizedReadme) {
        return;
    }

    if (!shouldWrite) {
        throw new Error(
            "README rules section is out of sync. Run: npm run sync:readme-rules-table:write"
        );
    }

    await writeFile(readmePath, nextReadme, "utf8");
}

if (
    process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href
) {
    await main();
}
