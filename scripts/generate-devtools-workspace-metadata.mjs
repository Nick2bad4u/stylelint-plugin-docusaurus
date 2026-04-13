import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const repositoryPackageJsonPath = resolve(repositoryRoot, "package.json");
const outputPath = resolve(
    repositoryRoot,
    "docs",
    "docusaurus",
    "static",
    ".well-known",
    "appspecific",
    "com.chrome.devtools.json"
);
const canonicalUuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

/**
 * Check whether a value is a canonical UUID string.
 *
 * @param {unknown} value - Candidate UUID value.
 *
 * @returns {value is string} Whether the value is a canonical UUID.
 */
export function isValidUuid(value) {
    return typeof value === "string" && canonicalUuidPattern.test(value);
}

/**
 * Determine whether the CLI should force a new UUID.
 *
 * @param {readonly string[]} [cliArgs] - CLI arguments.
 *   Default is `process.argv.slice(2)`
 *
 * @returns {boolean} Whether a new UUID should be generated.
 */
export function shouldRegenerateUuid(cliArgs = process.argv.slice(2)) {
    return cliArgs.includes("--regenerate");
}

/**
 * Determine whether the current module is being executed directly.
 *
 * @param {object} [input] - Direct-execution detection input.
 * @param {string | undefined} [input.argvEntry] - Entry path
 *   from process arguments. Default is `process.argv[1]`
 * @param {string} [input.currentImportUrl] - Current module
 *   URL. Default is `import.meta.url`
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
 * Load the repository package.json contents with explicit filesystem and JSON
 * parse error handling.
 *
 * @param {string} [packageJsonPath] - Package.json
 *   path. Default is `repositoryPackageJsonPath`
 *
 * @returns {Record<string, unknown>} Parsed package.json object.
 */
export function loadRepositoryPackageJson(
    packageJsonPath = repositoryPackageJsonPath
) {
    if (!existsSync(packageJsonPath)) {
        throw new Error(
            `Cannot generate DevTools workspace metadata because package.json was not found at: ${packageJsonPath}`
        );
    }

    let packageJsonText;

    try {
        packageJsonText = readFileSync(packageJsonPath, "utf8");
    } catch (error) {
        throw new Error(
            `Failed to read repository package.json at: ${packageJsonPath}`,
            {
                cause: error,
            }
        );
    }

    try {
        return /** @type {Record<string, unknown>} */ (
            JSON.parse(packageJsonText)
        );
    } catch (error) {
        throw new Error(
            `Failed to parse repository package.json as valid JSON: ${packageJsonPath}`,
            {
                cause: error,
            }
        );
    }
}

/**
 * Read the existing metadata UUID if present and valid.
 *
 * @param {string} [metadataOutputPath] - Metadata file path. Default
 *   is `outputPath`
 *
 * @returns {string | undefined} Existing UUID value.
 */
export function readExistingUuid(metadataOutputPath = outputPath) {
    if (!existsSync(metadataOutputPath)) {
        return undefined;
    }

    let metadataText;

    try {
        metadataText = readFileSync(metadataOutputPath, "utf8");
    } catch (error) {
        throw new Error(
            `Failed to read existing DevTools workspace metadata file at: ${metadataOutputPath}. Fix the file or rerun with --regenerate to replace it.`,
            {
                cause: error,
            }
        );
    }

    let existingConfig;

    try {
        existingConfig = JSON.parse(metadataText);
    } catch (error) {
        throw new Error(
            `Failed to parse existing DevTools workspace metadata file as valid JSON: ${metadataOutputPath}. Fix the file or rerun with --regenerate to replace it.`,
            {
                cause: error,
            }
        );
    }

    const existingUuid = existingConfig?.workspace?.uuid;

    if (existingUuid === undefined) {
        throw new Error(
            `Existing DevTools workspace metadata file is missing workspace.uuid: ${metadataOutputPath}. Fix the file or rerun with --regenerate to replace it.`
        );
    }

    if (!isValidUuid(existingUuid)) {
        throw new Error(
            `Existing DevTools workspace metadata file contains an invalid workspace.uuid: ${metadataOutputPath}. Fix the file or rerun with --regenerate to replace it.`
        );
    }

    return existingUuid;
}

/**
 * Resolve the UUID to persist for the workspace metadata file.
 *
 * @param {object} input - UUID selection input.
 * @param {readonly string[]} [input.cliArgs] - CLI arguments. Default is
 *   `[]`
 * @param {string | undefined} [input.existingUuid] - Existing UUID value.
 * @param {() => string} [input.createUuid] - UUID factory. Default
 *   is `randomUUID`
 *
 * @returns {string} UUID to persist.
 */
export function selectWorkspaceUuid({
    cliArgs = [],
    createUuid = randomUUID,
    existingUuid,
} = {}) {
    if (shouldRegenerateUuid(cliArgs) || !isValidUuid(existingUuid)) {
        return createUuid();
    }

    return existingUuid;
}

/**
 * Serialize workspace metadata JSON.
 *
 * @param {object} input - Metadata serialization input.
 * @param {string} input.repositoryRootPath - Repository root path.
 * @param {string} input.workspaceUuid - UUID to persist.
 *
 * @returns {string} Metadata JSON text.
 */
export function createWorkspaceMetadataJson({
    repositoryRootPath,
    workspaceUuid,
}) {
    return `${JSON.stringify(
        {
            workspace: {
                root: repositoryRootPath.replaceAll("\\", "/"),
                uuid: workspaceUuid,
            },
        },
        null,
        4
    )}\n`;
}

/**
 * Generate the Chrome DevTools workspace metadata file.
 *
 * @param {object} [input] - Generation input.
 * @param {readonly string[]} [input.cliArgs] - CLI arguments. Default is
 *   `[]`
 * @param {() => string} [input.createUuid] - UUID factory. Default
 *   is `randomUUID`
 * @param {string} [input.metadataOutputPath] - Output file path.
 *   Default is `outputPath`
 * @param {string} [input.packageJsonPath]
 *   Package.json path. Default is `repositoryPackageJsonPath`
 * @param {string} [input.repositoryRootPath] - Repository root
 *   path. Default is `repositoryRoot`
 *
 * @returns {{
 *     metadataOutputPath: string;
 *     packageName: string;
 *     repositoryRoot: string;
 *     workspaceUuid: string;
 * }}
 *   Metadata generation result.
 */
export function generateDevToolsWorkspaceMetadata({
    cliArgs = [],
    createUuid = randomUUID,
    metadataOutputPath = outputPath,
    packageJsonPath = repositoryPackageJsonPath,
    repositoryRootPath = repositoryRoot,
} = {}) {
    const repositoryPackageJson = loadRepositoryPackageJson(packageJsonPath);
    const repositoryPackageName = repositoryPackageJson["name"];
    const regenerateUuid = shouldRegenerateUuid(cliArgs);
    const workspaceUuid = selectWorkspaceUuid({
        cliArgs,
        createUuid,
        existingUuid: regenerateUuid
            ? undefined
            : readExistingUuid(metadataOutputPath),
    });
    const packageName =
        typeof repositoryPackageName === "string" &&
        repositoryPackageName.length > 0
            ? repositoryPackageName
            : basename(repositoryRootPath);
    const metadataJson = createWorkspaceMetadataJson({
        repositoryRootPath,
        workspaceUuid,
    });

    try {
        mkdirSync(dirname(metadataOutputPath), { recursive: true });
        writeFileSync(metadataOutputPath, metadataJson);
    } catch (error) {
        throw new Error(
            `Failed to write DevTools workspace metadata file at: ${metadataOutputPath}`,
            {
                cause: error,
            }
        );
    }

    return {
        metadataOutputPath,
        packageName,
        repositoryRoot: repositoryRootPath,
        workspaceUuid,
    };
}

/**
 * Run the CLI entrypoint.
 *
 * @param {object} [input] - CLI input.
 * @param {readonly string[]} [input.cliArgs] - CLI
 *   arguments. Default is `process.argv.slice(2)`
 * @param {() => string} [input.createUuid] - UUID factory. Default
 *   is `randomUUID`
 * @param {{[input.logger][input.logger][input.logger][input.logger][input.logger][input.logger][input.logger][input.logger]
 *     error: (...args: readonly unknown[]) => void;
 *     log: (...args: readonly unknown[]) => void;
 * }} [input.logger=console]
 *   - Logger. Default is `console`
 * @param {string} [input.metadataOutputPath=outputPath] - Output file path.
 *   Default is `outputPath`
 * @param {string} [input.packageJsonPath=repositoryPackageJsonPath] -
 *   Package.json path. Default is `repositoryPackageJsonPath`
 * @param {string} [input.repositoryRootPath=repositoryRoot] - Repository root
 *   path. Default is `repositoryRoot`
 *
 * @returns {{
 *           metadataOutputPath: string;
 *           packageName: string;
 *           repositoryRoot: string;
 *           workspaceUuid: string;
 *       }
 *     | undefined}
 *   Metadata generation result.
 */
export function runCli({
    cliArgs = process.argv.slice(2),
    createUuid = randomUUID,
    logger = console,
    metadataOutputPath = outputPath,
    packageJsonPath = repositoryPackageJsonPath,
    repositoryRootPath = repositoryRoot,
} = {}) {
    try {
        const result = generateDevToolsWorkspaceMetadata({
            cliArgs,
            createUuid,
            metadataOutputPath,
            packageJsonPath,
            repositoryRootPath,
        });

        logger.log(
            `Wrote Chrome DevTools workspace metadata for ${result.packageName}.`
        );
        logger.log(`Metadata file: ${result.metadataOutputPath}`);
        logger.log(`Workspace root: ${result.repositoryRoot}`);
        logger.log(`Workspace UUID: ${result.workspaceUuid}`);
        logger.log(
            "Use `npm run docs:start:devtools` to serve the Docusaurus site on localhost with the metadata file available at /.well-known/appspecific/com.chrome.devtools.json."
        );
        logger.log(
            "Pass --regenerate to assign a new UUID (note: that disconnects any previously connected DevTools workspace for this checkout)."
        );

        return result;
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : String(error ?? "Unknown error");

        logger.error(message);
        process.exitCode = 1;
        return undefined;
    }
}

if (isDirectExecution()) {
    runCli({
        cliArgs: process.argv.slice(2),
        metadataOutputPath: outputPath,
        packageJsonPath: repositoryPackageJsonPath,
        repositoryRootPath: repositoryRoot,
    });
}
