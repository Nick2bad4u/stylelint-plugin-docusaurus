/**
 * @packageDocumentation
 * Synchronize or validate Stylelint config documentation tables from canonical
 * built-plugin metadata.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

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
 *     Record<ConfigName, { rules?: Readonly<Record<string, unknown>> }>
 * >} ConfigMap
 */
/** @typedef {Readonly<{ legacyAlias?: boolean }>} RunCliOptions */

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
 *
 * @returns {string}
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
 *
 * @returns {string}
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

/**
 * Synchronize or validate the config rule-table sections in
 * `docs/rules/configs/*.md`.
 *
 * @param {Readonly<{ writeChanges: boolean }>} input
 *
 * @returns {Promise<Readonly<{ changed: boolean }>>}
 */
const syncConfigDocs = async ({ writeChanges }) => {
    /** @type {boolean} */
    let changed = false;

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

        changed = true;

        if (writeChanges) {
            await writeFile(configDocPath, nextMarkdown, "utf8");
        }
    }

    return { changed };
};

/**
 * CLI entrypoint for the config-rule-matrix synchronization script.
 *
 * @param {RunCliOptions} [options]
 *
 * @returns {Promise<void>}
 */
export async function runCli(options = {}) {
    const writeChanges = process.argv.includes("--write");
    const result = await syncConfigDocs({ writeChanges });

    if (!result.changed) {
        console.log("Config documentation tables are already synchronized.");
        return;
    }

    if (writeChanges) {
        const sourceLabel =
            options.legacyAlias === true
                ? "legacy preset alias"
                : "plugin metadata";
        console.log(
            `Config documentation tables synchronized from ${sourceLabel}.`
        );
        return;
    }

    console.error(
        "Config documentation tables are out of sync. Run: node scripts/sync-configs-rules-matrix.mjs --write"
    );
    process.exitCode = 1;
}

if (
    process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href
) {
    await runCli();
}
