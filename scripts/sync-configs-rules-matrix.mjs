/**
 * @packageDocumentation
 * Synchronize or validate Stylelint config documentation tables from canonical
 * built-plugin metadata.
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
/** @typedef {Readonly<{ docs?: RuleDocs; meta?: { fixable?: boolean } }>} RuleModule */
/** @typedef {Readonly<Record<string, RuleModule>>} RulesMap */

/**
 * @typedef {Readonly<
 *     Record<string, { rules?: Readonly<Record<string, unknown>> }>
 * >} ConfigMap
 */

/**
 * @typedef {Readonly<{
 *     configNames?: unknown;
 *     configs?: ConfigMap;
 *     rules?: RulesMap;
 * }>} BuiltPluginModule
 */

/**
 * @typedef {Readonly<{
 *     configNames: readonly string[];
 *     configs: ConfigMap;
 *     rules: RulesMap;
 * }>} ConfigMatrixMetadata
 */
/** @typedef {Readonly<{ legacyAlias?: boolean }>} RunCliOptions */
/** @typedef {Readonly<{ configDocPath: string; configName: string }>} ConfigDocTarget */

const scriptsDirectoryPath = dirname(fileURLToPath(import.meta.url));
const repositoryRootPath = resolve(scriptsDirectoryPath, "..");
const builtPluginModulePath = resolve(repositoryRootPath, "dist", "plugin.js");

/**
 * @param {unknown} configNamesValue
 * @param {ConfigMap} configs
 *
 * @returns {readonly string[]}
 */
export function normalizeConfigNames(configNamesValue, configs) {
    if (Array.isArray(configNamesValue)) {
        const explicitConfigNames = configNamesValue.filter(
            /** @returns {candidate is string} */
            (candidate) => typeof candidate === "string" && candidate !== ""
        );

        if (explicitConfigNames.length > 0) {
            return [...new Set(explicitConfigNames)];
        }
    }

    return Object.keys(configs).toSorted((left, right) =>
        left.localeCompare(right)
    );
}
const sectionHeading = "## Rules in this config";

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
 * @param {readonly string[]} cliArgs
 *
 * @returns {{ writeChanges: boolean }}
 */
export const parseCliArgs = (cliArgs) => {
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

/**
 * @param {Readonly<{
 *     builtPluginPath?: string;
 *     importModule?: (modulePath: string) => Promise<BuiltPluginModule>;
 * }>} [input]
 *
 * @returns {Promise<ConfigMatrixMetadata>}
 */
export const loadBuiltPluginMetadata = async ({
    builtPluginPath = builtPluginModulePath,
    importModule = async (modulePath) =>
        /** @type {Promise<BuiltPluginModule>} */ (
            import(pathToFileURL(modulePath).href)
        ),
} = {}) => {
    try {
        const builtPluginModule = await importModule(builtPluginPath);
        const configs = /** @type {ConfigMap} */ (
            builtPluginModule.configs ?? {}
        );

        return {
            configNames: normalizeConfigNames(
                builtPluginModule.configNames,
                configs
            ),
            configs,
            rules: /** @type {RulesMap} */ (builtPluginModule.rules ?? {}),
        };
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
 * @param {string} configName
 * @param {string} [repositoryRoot]
 *
 * @returns {string}
 */
export const getConfigDocPath = (
    configName,
    repositoryRoot = repositoryRootPath
) => resolve(repositoryRoot, "docs/rules/configs", `${configName}.md`);

/**
 * @param {Readonly<{
 *     configNames: readonly string[];
 *     hasDocFile?: (path: string) => Promise<boolean>;
 *     repositoryRoot?: string;
 * }>} input
 *
 * @returns {Promise<readonly ConfigDocTarget[]>}
 */
export const resolveConfigDocTargets = async ({
    configNames,
    hasDocFile = async (path) => {
        try {
            await readFile(path, "utf8");
            return true;
        } catch {
            return false;
        }
    },
    repositoryRoot = repositoryRootPath,
}) => {
    /** @type {ConfigDocTarget[]} */
    const targets = [];

    for (const configName of configNames) {
        const configDocPath = getConfigDocPath(configName, repositoryRoot);

        if (!(await hasDocFile(configDocPath))) {
            throw new Error(
                `Missing config documentation file for exported config '${configName}': ${configDocPath}`
            );
        }

        targets.push({
            configDocPath,
            configName,
        });
    }

    return targets;
};

/**
 * @param {Readonly<{
 *     configName: string;
 *     configs: ConfigMap;
 *     rules: RulesMap;
 * }>} input
 *
 * @returns {string}
 */
export const generateRulesSectionFromConfig = ({
    configName,
    configs,
    rules,
}) => {
    if (!(configName in configs)) {
        throw new Error(
            `Exported config '${configName}' is missing from the built plugin config map.`
        );
    }

    const configuredRuleIds = Object.keys(
        configs[configName]?.rules ?? {}
    ).toSorted((left, right) => left.localeCompare(right));

    /** @type {(readonly [string, RuleModule])[]} */
    const ruleEntries = [];

    for (const ruleId of configuredRuleIds) {
        const shortRuleName = ruleId.split("/").at(-1);

        if (!shortRuleName) {
            continue;
        }

        const ruleModule = rules[shortRuleName];

        if (ruleModule === undefined) {
            continue;
        }

        ruleEntries.push([shortRuleName, ruleModule]);
    }

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

            return `| [\`${ruleName}\`](${docs.url}) | ${getRuleFixIndicator(ruleModule)} | ${escapeMarkdownTableCell(docs.description)} |`;
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
 * @param {Readonly<{
 *     hasDocFile?: ((path: string) => Promise<boolean>) | undefined;
 *     loadPluginMetadata?: (() => Promise<ConfigMatrixMetadata>) | undefined;
 *     metadata?: ConfigMatrixMetadata | undefined;
 *     readFileFn?:
 *         | ((filePath: string, encoding: "utf8") => Promise<string>)
 *         | undefined;
 *     repositoryRootPath?: string | undefined;
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
 * @returns {Promise<
 *     Readonly<{ changed: boolean; updatedFilePaths: readonly string[] }>
 * >}
 */
export const syncConfigDocs = async ({
    hasDocFile,
    loadPluginMetadata = async () => loadBuiltPluginMetadata(),
    metadata,
    readFileFn = readFile,
    repositoryRootPath: targetRepositoryRootPath = repositoryRootPath,
    writeChanges,
    writeFileFn = writeFile,
}) => {
    /** @type {boolean} */
    let changed = false;
    /** @type {string[]} */
    const updatedFilePaths = [];

    const activeMetadata = metadata ?? (await loadPluginMetadata());
    /** @type {Parameters<typeof resolveConfigDocTargets>[0]} */
    const resolveTargetsInput =
        hasDocFile === undefined
            ? {
                  configNames: activeMetadata.configNames,
                  repositoryRoot: targetRepositoryRootPath,
              }
            : {
                  configNames: activeMetadata.configNames,
                  hasDocFile,
                  repositoryRoot: targetRepositoryRootPath,
              };

    const configTargets = await resolveConfigDocTargets(resolveTargetsInput);

    for (const { configDocPath, configName } of configTargets) {
        const markdown = await readFileFn(configDocPath, "utf8");
        const lineEnding = detectLineEnding(markdown);
        const normalizedMarkdown = normalizeMarkdownLineEndings(
            markdown,
            lineEnding
        );
        const nextSection = normalizeMarkdownLineEndings(
            generateRulesSectionFromConfig({
                configName,
                configs: activeMetadata.configs,
                rules: activeMetadata.rules,
            }),
            lineEnding
        );
        const nextMarkdown = replaceSection(normalizedMarkdown, nextSection);

        if (nextMarkdown === normalizedMarkdown) {
            continue;
        }

        changed = true;

        if (!writeChanges) {
            throw new Error(
                "Config documentation tables are out of sync. Run: node scripts/sync-configs-rules-matrix.mjs --write"
            );
        }

        await writeFileFn(configDocPath, nextMarkdown, "utf8");
        updatedFilePaths.push(configDocPath);
    }

    return {
        changed,
        updatedFilePaths,
    };
};

/**
 * CLI entrypoint for the config-rule-matrix synchronization script.
 *
 * @param {Readonly<{
 *     cliArgs?: readonly string[] | undefined;
 *     legacyAlias?: boolean | undefined;
 *     loadPluginMetadata?: (() => Promise<ConfigMatrixMetadata>) | undefined;
 *     repositoryRootPath?: string | undefined;
 * }>} [options]
 *
 * @returns {Promise<void>}
 */
export async function runCli({
    cliArgs = process.argv.slice(2),
    legacyAlias = false,
    loadPluginMetadata,
    repositoryRootPath: cliRepositoryRootPath = repositoryRootPath,
} = {}) {
    const { writeChanges } = parseCliArgs(cliArgs);
    const result = await syncConfigDocs({
        loadPluginMetadata,
        repositoryRootPath: cliRepositoryRootPath,
        writeChanges,
    });

    if (!result.changed) {
        console.log("Config documentation tables are already synchronized.");
        return;
    }

    const sourceLabel =
        legacyAlias === true ? "legacy preset alias" : "plugin metadata";
    console.log(
        `Config documentation tables synchronized from ${sourceLabel}.`
    );
}

if (
    isDirectExecution({
        argvEntry: process.argv[1],
        currentImportUrl: import.meta.url,
    })
) {
    try {
        await runCli();
    } catch (error) {
        console.error(
            "Failed to synchronize config documentation tables:",
            error
        );
        process.exitCode = 1;
    }
}
