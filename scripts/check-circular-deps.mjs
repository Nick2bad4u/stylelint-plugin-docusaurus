import madge from "madge";
import pc from "picocolors";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const defaultFileExtensions = [
    "ts",
    "tsx",
    "js",
    "jsx",
    "mjs",
    "cjs",
    "cts",
    "mts",
];
const excludedPathSegments = [
    "test",
    "dist",
    "node_modules",
    "cache",
    ".cache",
    "coverage",
    "build",
    "eslint-inspector",
    "temp",
    ".docusaurus",
];

/**
 * Escape a string for safe use inside a regular expression.
 *
 * @param {string} value - Raw string value.
 *
 * @returns {string} Escaped regular-expression fragment.
 */
export function escapeRegExp(value) {
    return value.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

/**
 * Create the shared Madge exclude pattern used by the circular-dependency
 * tooling.
 *
 * @returns {string} Regular-expression source text.
 */
export function createMadgeExcludePattern() {
    const excludedSegmentsPattern = excludedPathSegments
        .map((segment) => escapeRegExp(segment))
        .join("|");

    return String.raw`(^|[\\/])(${excludedSegmentsPattern})($|[\\/])|\.css$`;
}

/**
 * Create the exclude regular expression for Madge.
 *
 * @returns {RegExp} Exclude regular expression.
 */
export function createMadgeExcludeRegExp() {
    return new RegExp(createMadgeExcludePattern(), "u");
}

/**
 * Create the Madge options object for this repository.
 *
 * @param {object} [input] - Options input.
 * @param {string} [input.repositoryRootPath] - Repository root path. Default is
 *   `repositoryRoot`
 *
 * @returns {{
 *     excludeRegExp: RegExp[];
 *     fileExtensions: string[];
 *     tsConfig: string;
 * }}
 *   Madge options.
 */
export function createMadgeOptions({
    repositoryRootPath = repositoryRoot,
} = {}) {
    return {
        excludeRegExp: [createMadgeExcludeRegExp()],
        fileExtensions: defaultFileExtensions,
        tsConfig: resolve(repositoryRootPath, "tsconfig.json"),
    };
}

/**
 * Format circular-dependency paths for console output.
 *
 * @param {readonly (readonly string[])[]} circularDependencies - Circular
 *   dependency paths.
 *
 * @returns {readonly string[]} Formatted circular-dependency strings.
 */
export function formatCircularDependencies(circularDependencies) {
    return circularDependencies.map((dependencyPath) =>
        dependencyPath.join(" -> ")
    );
}

/**
 * Determine whether the current module is being executed directly.
 *
 * @param {object} [input] - Direct-execution detection input.
 * @param {string | undefined} [input.argvEntry] - Entry path. Defaults to
 *   `process.argv[1]`.
 * @param {string} [input.currentImportUrl] - Current module URL. Defaults to
 *   `import.meta.url`.
 *
 * @returns {boolean} Whether this module is the CLI entrypoint.
 */
export function isDirectExecution({
    argvEntry = process.argv[1],
    currentImportUrl = import.meta.url,
} = {}) {
    if (typeof argvEntry !== "string" || argvEntry.length === 0) {
        return false;
    }

    return pathToFileURL(resolve(argvEntry)).href === currentImportUrl;
}

/**
 * Run the circular-dependency CLI.
 *
 * @param {object} [input] - CLI input.
 * @param {(
 *     sourcePath: string,
 *     options: {
 *         excludeRegExp: RegExp[];
 *         fileExtensions: string[];
 *         tsConfig: string;
 *     }
 * ) => Promise<{ circular: () => readonly (readonly string[])[] }>} [input.analyzeWithMadge]
 *   - Madge analyzer. Defaults to `madge`.
 * @param {{
 *     error: (...args: readonly unknown[]) => void;
 *     log: (...args: readonly unknown[]) => void;
 * }} [input.logger]
 *   - Logger. Defaults to `console`.
 * @param {string} [input.repositoryRootPath] - Repository root path. Defaults
 *   to `repositoryRoot`.
 *
 * @returns {Promise<number>} Exit code.
 */
export async function runCli({
    analyzeWithMadge = madge,
    logger = console,
    repositoryRootPath = repositoryRoot,
} = {}) {
    try {
        const sourceDirectoryPath = resolve(repositoryRootPath, "src");
        const result = await analyzeWithMadge(
            sourceDirectoryPath,
            createMadgeOptions({ repositoryRootPath })
        );
        const circularDependencies = result.circular();

        if (circularDependencies.length === 0) {
            logger.log(`${pc.green("✔")} No circular dependency found!`);
            return 0;
        }

        logger.error(pc.red("Circular dependencies detected:"));

        for (const dependencyPath of formatCircularDependencies(
            circularDependencies
        )) {
            logger.error(`- ${dependencyPath}`);
        }

        return 1;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        logger.error(pc.red("Failed to analyze circular dependencies."));
        logger.error(message);
        return 1;
    }
}

if (isDirectExecution()) {
    const exitCode = await runCli({ repositoryRootPath: repositoryRoot });

    if (exitCode !== 0) {
        process.exitCode = exitCode;
    }
}
