#!/usr/bin/env node

/**
 * @remarks
 * This script is intended for compatibility-matrix jobs that temporarily
 * install an older supported Stylelint major (for example 16.x) before running
 * the smoke check. We intentionally do not target Stylelint 15 because the
 * first officially supported ESM plugin line starts at Stylelint 16.
 *
 * @packageDocumentation
 * Smoke test the built plugin against an installed Stylelint runtime.
 */
// @ts-check

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import process from "node:process";

import pc from "picocolors";
import stylelint from "stylelint";

import * as builtPluginModule from "../dist/plugin.js";

const plugin = builtPluginModule.default;
const { configNames, configs, meta, ruleIds, ruleNames, rules } =
    builtPluginModule;

const require = createRequire(import.meta.url);
const expectedStylelintMajorArgumentPrefix = "--expect-stylelint-major=";
const stylelintPackageJsonPath = require.resolve("stylelint/package.json");

/**
 * @typedef {Readonly<{
 *     code: string;
 *     config: import("stylelint").Config;
 *     name: string;
 * }>} ConfigScenario
 */

/**
 * @param {readonly string[]} argv
 *
 * @returns {number | undefined}
 */
function parseExpectedStylelintMajor(argv) {
    const matchingArgument = argv.find((argument) =>
        argument.startsWith(expectedStylelintMajorArgumentPrefix)
    );

    if (matchingArgument === undefined) {
        return undefined;
    }

    const majorString = matchingArgument.slice(
        expectedStylelintMajorArgumentPrefix.length
    );

    if (majorString.length === 0) {
        throw new Error(
            `Missing Stylelint major value in argument: ${matchingArgument}`
        );
    }

    const majorValue = Number.parseInt(majorString, 10);

    if (Number.isNaN(majorValue)) {
        throw new Error(
            `Invalid Stylelint major value in argument: ${matchingArgument}`
        );
    }

    return majorValue;
}

/**
 * @returns {string}
 */
function getStylelintRuntimeVersion() {
    const packageJsonText = readFileSync(stylelintPackageJsonPath, "utf8");
    const packageJson = /** @type {{ version?: unknown }} */ (
        JSON.parse(packageJsonText)
    );

    if (
        typeof packageJson.version !== "string" ||
        packageJson.version.length === 0
    ) {
        throw new Error("Unable to determine Stylelint runtime version.");
    }

    return packageJson.version;
}

/**
 * @param {number | undefined} expectedMajor
 */
function assertStylelintMajor(expectedMajor) {
    const runtimeVersion = getStylelintRuntimeVersion();
    const [runtimeMajorText] = runtimeVersion.split(".", 1);

    if (runtimeMajorText === undefined || runtimeMajorText.length === 0) {
        throw new Error(
            `Unable to parse Stylelint runtime version: ${runtimeVersion}`
        );
    }

    const runtimeMajor = Number.parseInt(runtimeMajorText, 10);

    if (Number.isNaN(runtimeMajor)) {
        throw new Error(
            `Unable to parse Stylelint runtime version: ${runtimeVersion}`
        );
    }

    if (expectedMajor !== undefined && runtimeMajor !== expectedMajor) {
        throw new Error(
            `Expected Stylelint major ${expectedMajor}, but detected ${runtimeVersion}.`
        );
    }

    console.log(
        `${pc.green("✓")} Stylelint runtime ${pc.bold(runtimeVersion)} detected for compatibility smoke checks.`
    );
}

/**/

/**/

/**/

/**/

/**/
function assertPluginSurface() {
    if (!Array.isArray(plugin)) {
        throw new TypeError(
            "Default plugin export must be an array (plugin pack)."
        );
    }

    if (typeof meta.name !== "string" || meta.name.length === 0) {
        throw new TypeError("Plugin metadata is missing a package name.");
    }

    if (meta.namespace !== "docusaurus") {
        throw new TypeError(
            `Expected plugin namespace 'docusaurus', received '${meta.namespace}'.`
        );
    }

    if (!Array.isArray(configNames) || configNames.length === 0) {
        throw new TypeError("Config names export is unavailable.");
    }

    if (ruleNames.length !== ruleIds.length) {
        throw new TypeError("Rule names and rule ids are out of sync.");
    }

    for (const [ruleName, ruleDefinition] of Object.entries(rules)) {
        if (!ruleDefinition.ruleName.includes("/")) {
            throw new TypeError(
                `Rule '${ruleName}' is missing a namespaced ruleName.`
            );
        }
    }

    console.log(
        `${pc.green("✓")} Plugin surface exports are structurally valid.`
    );
}

/**
 * @param {ConfigScenario} scenario
 *
 * @returns {Promise<void>}
 */
async function runConfigScenario({ code, config, name }) {
    const lintResult = await stylelint.lint({
        code,
        codeFilename: "Component.module.css",
        config,
    });
    const [result] = lintResult.results;

    if (result === undefined) {
        throw new Error(`${name}: Stylelint did not return a result.`);
    }

    if (result.parseErrors.length > 0) {
        throw new Error(
            `${name}: encountered parse errors (${result.parseErrors.length}).`
        );
    }

    if (result.invalidOptionWarnings.length > 0) {
        throw new Error(
            `${name}: encountered invalid option warnings (${result.invalidOptionWarnings.length}).`
        );
    }

    if (result.warnings.length > 0) {
        throw new Error(
            `${name}: expected zero warnings, received ${result.warnings.length}.`
        );
    }

    console.log(
        `${pc.green("✓")} ${pc.bold(name)} completed without warnings.`
    );
}

/**
 * @returns {readonly ConfigScenario[]}
 */
function createScenarios() {
    const baselineCss = `
.heroBanner {
    color: var(--ifm-color-primary);
}
`.trim();

    return [
        {
            code: baselineCss,
            config: {
                plugins: Array.from(plugin),
                rules: {},
            },
            name: "direct-plugin-pack",
        },
        {
            code: baselineCss,
            config: {
                ...configs.recommended,
                plugins: Array.from(configs.recommended.plugins),
                rules: {
                    ...configs.recommended.rules,
                },
            },
            name: "recommended-config",
        },
        {
            code: baselineCss,
            config: {
                ...configs.all,
                plugins: Array.from(configs.all.plugins),
                rules: {
                    ...configs.all.rules,
                },
            },
            name: "all-config",
        },
    ];
}

const expectedStylelintMajor = parseExpectedStylelintMajor(
    process.argv.slice(2)
);

console.log(
    pc.bold(pc.cyan("Running Stylelint compatibility smoke checks..."))
);
assertStylelintMajor(expectedStylelintMajor);
assertPluginSurface();

for (const scenario of createScenarios()) {
    await runConfigScenario(scenario);
}

console.log(pc.bold(pc.green("Stylelint compatibility smoke checks passed.")));
