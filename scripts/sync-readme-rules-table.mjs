/**
 * @packageDocumentation
 * Synchronize or validate the README rules section from canonical Stylelint rule metadata.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { escapeMarkdownTableCell } from "./_internal/escape-markdown-table-cell.mjs";

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
const scriptsDirectoryPath = dirname(fileURLToPath(import.meta.url));
const repositoryRootPath = resolve(scriptsDirectoryPath, "..");
const builtPluginModulePath = resolve(repositoryRootPath, "dist", "plugin.js");

/**
 * @param {string} [repositoryRoot]
 *
 * @returns {string}
 */
export const getReadmePath = (repositoryRoot = repositoryRootPath) =>
    resolve(repositoryRoot, "README.md");

/**
 * @param {Readonly<{
 *     argvEntry?: string | undefined;
 *     currentImportUrl: string;
 * }>} input
 *
 * @returns {boolean}
 */
export const isDirectExecution = ({ argvEntry, currentImportUrl }) =>
    typeof argvEntry === "string" &&
    pathToFileURL(resolve(argvEntry)).href === currentImportUrl;

/**
 * @param {Readonly<{
 *     builtPluginPath?: string;
 *     importModule?: (
 *         modulePath: string
 *     ) => Promise<Readonly<{ rules?: RulesMap | undefined }>>;
 * }>} [input]
 *
 * @returns {Promise<RulesMap>}
 */
export const loadBuiltRules = async ({
    builtPluginPath = builtPluginModulePath,
    importModule = async () =>
        /** @type {Promise<Readonly<{ rules?: RulesMap | undefined }>>} */ (
            // eslint-disable-next-line no-unsanitized/method -- builtPluginPath is a trusted repository-local build artifact path
            import(pathToFileURL(builtPluginPath).href)
        ),
} = {}) => {
    try {
        const builtPluginModule = await importModule(builtPluginPath);

        return /** @type {RulesMap} */ (builtPluginModule.rules ?? {});
    } catch (error) {
        throw new Error(
            [
                `Failed to load built plugin metadata from ${builtPluginPath}.`,
                "Run: npm run build",
            ].join(" "),
            { cause: error }
        );
    }
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

/**
 * @param {string} markdown
 * @param {string} nextRulesSection
 *
 * @returns {string}
 */
const replaceReadmeRulesSection = (markdown, nextRulesSection) => {
    const { endOffset, startOffset } = getReadmeRulesSectionBounds(markdown);

    return (
        markdown.slice(0, startOffset) +
        nextRulesSection +
        markdown.slice(endOffset)
    );
};

/**
 * @param {readonly string[]} cliArgs
 *
 * @returns {{ writeChanges: boolean }}
 */
const parseCliArgs = (cliArgs) => {
    /** @type {boolean} */
    let writeChanges = false;

    for (const cliArg of cliArgs) {
        if (cliArg === "--write") {
            writeChanges = true;
            continue;
        }

        throw new TypeError(`Unknown argument: ${cliArg}`);
    }

    return { writeChanges };
};

/** @param {RuleModule} ruleModule */
const getRuleFixIndicator = (ruleModule) =>
    ruleModule.meta?.fixable === true ? "🔧" : "—";

/**
 * Returns the emoji preset-key badge(s) for a rule.
 *
 * Mapping:
 *
 * - 🟢 = `docusaurus.configs.recommended`
 * - 🟣 = `docusaurus.configs.all`
 * - 🛡️ = `docusaurus.configs["docusaurus-docs-safe"]` (mirrors recommended)
 *
 * Rules in `recommended` are also in `docusaurus-docs-safe`, so they show all
 * three badges. Rules only in `all` show just 🟣.
 *
 * @param {RuleModule} ruleModule
 *
 * @returns {string}
 */
const getPresetKeyIndicator = (ruleModule) =>
    ruleModule.docs?.recommended === true ? "🟢 🛡️ 🟣" : "🟣";

/**
 * Legend block prepended to the Rules section.
 *
 * Each line in this constant must use plain `\n` — line-ending normalisation is
 * applied later by `generateReadmeRulesSectionFromRules`.
 */
const RULES_SECTION_LEGEND = [
    "**Fix legend:**",
    "",
    "- 🔧 = autofixable",
    "- — = report only",
    "",
    "**Preset key legend:**",
    "",
    "- 🟢 — `docusaurus.configs.recommended`",
    "- 🟣 — `docusaurus.configs.all`",
    '- 🛡️ — `docusaurus.configs["docusaurus-docs-safe"]`',
].join("\n");

/** @param {readonly [string, RuleModule]} entry */
const toRuleTableRow = ([ruleName, ruleModule]) => {
    const docs = ruleModule.docs;

    if (docs === undefined) {
        throw new TypeError(`Rule '${ruleName}' is missing docs metadata.`);
    }

    return `| [\`${ruleName}\`](${docs.url}) | ${getRuleFixIndicator(ruleModule)} | ${getPresetKeyIndicator(ruleModule)} | ${escapeMarkdownTableCell(docs.description)} |`;
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
        RULES_SECTION_LEGEND,
        "",
        "| Rule | Fix | Preset key | Description |",
        "| --- | :-: | --- | --- |",
        ...ruleEntries.map(toRuleTableRow),
        "",
    ].join("\n");
};

/**
 * Synchronize or validate the README rules section against canonical rule
 * metadata.
 *
 * @param {Readonly<{
 *     loadRules?: (() => Promise<RulesMap>) | undefined;
 *     readFileFn?:
 *         | ((filePath: string, encoding: "utf8") => Promise<string>)
 *         | undefined;
 *     readmeFilePath?: string | undefined;
 *     repositoryRootPath?: string | undefined;
 *     rules?: RulesMap | undefined;
 *     writeChanges: boolean;
 *     writeFileFn?:
 *         | ((
 *               filePath: string,
 *               contents: string,
 *               encoding: "utf8"
 *           ) => Promise<void>)
 *         | undefined;
 * }>} input
 *
 * @returns {Promise<Readonly<{ changed: boolean; readmeFilePath: string }>>}
 */
export const syncReadmeRulesTable = async ({
    loadRules = async () => loadBuiltRules(),
    readFileFn = readFile,
    repositoryRootPath: targetRepositoryRootPath = repositoryRootPath,
    readmeFilePath = getReadmePath(targetRepositoryRootPath),
    rules,
    writeChanges,
    writeFileFn = writeFile,
}) => {
    const resolvedReadmeFilePath =
        readmeFilePath ?? getReadmePath(targetRepositoryRootPath);
    const readmeMarkdown = await readFileFn(resolvedReadmeFilePath, "utf8");
    const activeRules = rules ?? (await loadRules());
    const lineEnding = detectLineEnding(readmeMarkdown);
    const normalizedReadme = normalizeMarkdownLineEndings(
        readmeMarkdown,
        lineEnding
    );
    const nextRulesSection = normalizeMarkdownLineEndings(
        generateReadmeRulesSectionFromRules(activeRules),
        lineEnding
    );
    const nextReadme = replaceReadmeRulesSection(
        normalizedReadme,
        nextRulesSection
    );

    if (nextReadme === normalizedReadme) {
        return {
            changed: false,
            readmeFilePath: resolvedReadmeFilePath,
        };
    }

    if (!writeChanges) {
        throw new Error(
            "README rules section is out of sync. Run: npm run sync:readme-rules-table:write"
        );
    }

    await writeFileFn(resolvedReadmeFilePath, nextReadme, "utf8");

    return {
        changed: true,
        readmeFilePath: resolvedReadmeFilePath,
    };
};

/**
 * CLI entrypoint for the README rules-table synchronization script.
 *
 * @param {Readonly<{
 *     cliArgs?: readonly string[] | undefined;
 *     loadRules?: (() => Promise<RulesMap>) | undefined;
 *     repositoryRootPath?: string | undefined;
 * }>} [input]
 *
 * @returns {Promise<void>}
 */
export const runCli = async ({
    cliArgs = process.argv.slice(2),
    loadRules,
    repositoryRootPath: cliRepositoryRootPath = repositoryRootPath,
} = {}) => {
    const { writeChanges } = parseCliArgs(cliArgs);
    const result = await syncReadmeRulesTable({
        loadRules,
        repositoryRootPath: cliRepositoryRootPath,
        writeChanges,
    });

    if (!result.changed) {
        console.log("README rules section is already synchronized.");
        return;
    }

    console.log(`README rules section synchronized: ${result.readmeFilePath}`);
};

if (
    isDirectExecution({
        argvEntry: process.argv[1],
        currentImportUrl: import.meta.url,
    })
) {
    try {
        await runCli();
    } catch (error) {
        console.error("Failed to synchronize README rules section:", error);
        process.exitCode = 1;
    }
}
