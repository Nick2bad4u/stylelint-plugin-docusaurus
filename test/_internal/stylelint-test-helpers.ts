import stylelint, {
    type Config,
    type Plugin as StylelintPlugin,
} from "stylelint";

import plugins from "../../src/plugin";

/** Options for linting an in-memory stylesheet snippet in tests. */
export type LintWithConfigOptions = Readonly<{
    code: string;
    codeFilename?: string;
    config?: ConfigLike;
}>;

/** First result entry returned from `stylelint.lint(...)`. */
export type StylelintLintResult = Awaited<
    ReturnType<typeof stylelint.lint>
>["results"][number];
/** Config-like input accepted by the local Stylelint test helper. */
type ConfigLike = Omit<Config, "plugins"> & {
    plugins?: ConfigPluginEntry | readonly ConfigPluginEntry[];
};

/** One normalized plugin entry accepted by Stylelint config. */
type ConfigPluginEntry = string | StylelintPlugin;

/** Check whether a config plugin value is already an array form. */
function isConfigPluginEntryArray(
    value: Readonly<ConfigLike["plugins"]> | undefined
): value is readonly ConfigPluginEntry[] {
    return Array.isArray(value);
}

/** Default filename used to help Stylelint resolve syntax-sensitive behavior. */
const DEFAULT_CODE_FILENAME = "Component.module.css";

/**
 * Lint one in-memory stylesheet snippet with the repository's local plugin pack
 * registered by default.
 */
export async function lintWithConfig({
    code,
    codeFilename = DEFAULT_CODE_FILENAME,
    config,
}: LintWithConfigOptions): Promise<StylelintLintResult> {
    const mergedConfig: Config = {
        ...config,
        plugins: [...plugins, ...normalizePlugins(config?.plugins)],
        rules: {
            ...config?.rules,
        },
    };

    const lintResult = await stylelint.lint({
        code,
        codeFilename,
        config: mergedConfig,
    });
    const [firstResult] = lintResult.results;

    if (firstResult === undefined) {
        throw new TypeError(
            "Expected Stylelint to return at least one result."
        );
    }

    return firstResult;
}

/** Normalize config plugin entries to an array form. */
function normalizePlugins(
    plugins: Readonly<ConfigLike["plugins"]> | undefined
): readonly ConfigPluginEntry[] {
    if (plugins === undefined) {
        return [];
    }

    if (isConfigPluginEntryArray(plugins)) {
        return [...plugins];
    }

    return [plugins];
}

/** Extract warning texts for concise assertions in tests. */
export const getWarningTexts = (
    result: Readonly<StylelintLintResult>
): readonly string[] => result.warnings.map((warning) => warning.text);
