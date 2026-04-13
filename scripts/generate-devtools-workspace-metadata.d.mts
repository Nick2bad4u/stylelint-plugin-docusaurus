export function isValidUuid(value: unknown): value is string;

export function shouldRegenerateUuid(cliArgs?: readonly string[]): boolean;

export function isDirectExecution(input?: {
    readonly argvEntry?: string | undefined;
    readonly currentImportUrl?: string;
}): boolean;

export function loadRepositoryPackageJson(
    packageJsonPath?: string
): Record<string, unknown>;

export function readExistingUuid(
    metadataOutputPath?: string
): string | undefined;

export function selectWorkspaceUuid(input?: {
    readonly cliArgs?: readonly string[];
    readonly createUuid?: () => string;
    readonly existingUuid?: string | undefined;
}): string;

export function createWorkspaceMetadataJson(input: {
    readonly repositoryRootPath: string;
    readonly workspaceUuid: string;
}): string;

export function generateDevToolsWorkspaceMetadata(input?: {
    readonly cliArgs?: readonly string[];
    readonly createUuid?: () => string;
    readonly metadataOutputPath?: string;
    readonly packageJsonPath?: string;
    readonly repositoryRootPath?: string;
}): {
    readonly metadataOutputPath: string;
    readonly packageName: string;
    readonly repositoryRoot: string;
    readonly workspaceUuid: string;
};

export function runCli(input?: {
    readonly cliArgs?: readonly string[];
    readonly createUuid?: () => string;
    readonly logger?: {
        readonly error: (...args: readonly unknown[]) => void;
        readonly log: (...args: readonly unknown[]) => void;
    };
    readonly metadataOutputPath?: string;
    readonly packageJsonPath?: string;
    readonly repositoryRootPath?: string;
}):
    | {
          readonly metadataOutputPath: string;
          readonly packageName: string;
          readonly repositoryRoot: string;
          readonly workspaceUuid: string;
      }
    | undefined;
