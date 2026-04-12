/**
 * @packageDocumentation
 * Public plugin entrypoint for `stylelint-plugin-docusaurus` exports and
 * shareable config wiring.
 */
import type { Config, Plugin as StylelintPlugin } from "stylelint";

import { objectKeys, safeCastTo  } from "ts-extras";

import type { StylelintPluginRule } from "./_internal/create-stylelint-rule.js";

import {
    CONFIG_NAMES as configNamesValue,
    type DocusaurusConfigName as InternalDocusaurusConfigName,
    PACKAGE_NAME as packageNameValue,
    PACKAGE_VERSION as packageVersionValue,
    PLUGIN_NAMESPACE as pluginNamespaceValue,
} from "./_internal/plugin-constants.js";
import { docusaurusRules as docusaurusRulesValue } from "./_internal/rules-registry.js";

/** Public shareable config map exported by this package. */
export type DocusaurusConfigMap = Record<
    DocusaurusConfigName,
    DocusaurusShareableConfig
>;
/** Shareable config names exposed by this package. */
export type DocusaurusConfigName = InternalDocusaurusConfigName;
/** Public fully-qualified rule ids supported by this package. */
export type DocusaurusRuleId = `${typeof pluginNamespaceValue}/${string}`;

/** Public unqualified rule names supported by this package. */
export type DocusaurusRuleName = Extract<
    keyof typeof docusaurusRulesValue,
    string
>;

/** Shareable config shape exported by this package. */
export type DocusaurusShareableConfig = Config & {
    plugins: (string | StylelintPlugin)[];
    rules: NonNullable<Config["rules"]>;
};

/** Internal ordered registry entry tuple. */
type DocusaurusRuleEntry = readonly [string, StylelintPluginRule];
/** Internal runtime rule registry shape. */
type DocusaurusRulesMap = Readonly<Record<string, StylelintPluginRule>>;

/** Local package metadata values used to avoid import re-export warnings. */
const packageMetaName = packageNameValue;
const packageMetaNamespace = pluginNamespaceValue;
const packageMetaVersion = packageVersionValue;
/** Local rule registry alias used to avoid import re-export warnings. */
const runtimeRules = docusaurusRulesValue;
/** Local config-name alias used to avoid import re-export warnings. */
const publicConfigNames = configNamesValue;

/** Public package metadata exported alongside the plugin pack. */
export const meta: Readonly<{
    name: string;
    namespace: string;
    version: string;
}> = {
    name: packageMetaName,
    namespace: packageMetaNamespace,
    version: packageMetaVersion,
};

/** Public rule registry keyed by unqualified rule name. */
export const rules: DocusaurusRulesMap = runtimeRules;

/** Stable ordered unqualified rule names. */
export const ruleNames: readonly string[] = objectKeys(rules).toSorted(
    (left, right) => left.localeCompare(right)
);

/** Stable ordered registry entries used to derive configs and ids. */
const docusaurusRuleEntries: readonly DocusaurusRuleEntry[] = (() => {
    const entries: DocusaurusRuleEntry[] = [];

    for (const ruleName of ruleNames) {
        const rule = rules[ruleName];

        if (rule === undefined) {
            continue;
        }

        entries.push([ruleName, rule]);
    }

    return entries;
})();

/** Default plugin-pack export consumed by Stylelint. */
export const plugins = safeCastTo<readonly StylelintPlugin[]>(docusaurusRuleEntries.map(
    ([, rule]) => rule
));

/** Stable ordered fully qualified rule ids. */
export const ruleIds: readonly DocusaurusRuleId[] = docusaurusRuleEntries.map(
    ([, rule]) => rule.ruleName as DocusaurusRuleId
);

/** Rule ids included in the recommended shareable config. */
const recommendedRuleIds: readonly DocusaurusRuleId[] = docusaurusRuleEntries
    .filter(([, rule]) => rule.docs.recommended)
    .map(([, rule]) => rule.ruleName as DocusaurusRuleId);

/**
 * Build one shareable Stylelint config.
 *
 * @param enabledRuleIds - Rule ids to enable in the config.
 *
 * @returns Shareable Stylelint config.
 */
function createConfig(
    enabledRuleIds: readonly DocusaurusRuleId[]
): DocusaurusShareableConfig {
    return {
        plugins: [...plugins],
        rules: (() => {
            const rulesConfig: NonNullable<Config["rules"]> = {};

            for (const ruleId of enabledRuleIds) {
                rulesConfig[ruleId] = true;
            }

            return rulesConfig;
        })(),
    };
}

/** Shareable config exports exposed by the package. */
export const configs: DocusaurusConfigMap = {
    all: createConfig(ruleIds),
    recommended: createConfig(recommendedRuleIds),
};

/** Stable ordered shareable config names. */
export const configNames: readonly DocusaurusConfigName[] = publicConfigNames;

/** Default export consumed by Stylelint when the package is used as a plugin. */
export default plugins;
