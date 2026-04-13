export interface TypedocExecutionPlan {
    readonly configFile: string;
    readonly docsWorkspaceDirectory: string;
    readonly docsWorkspaceRelativePath: string;
    readonly repositoryRoot: string;
    readonly useTemporaryDrive: boolean;
}

export function getConfigFileName(cliArgs: readonly string[]): string;

export function getTemporaryDriveRoots(): readonly string[];

export function selectRepositoryTemporarySubstMappings(
    repositoryRoot: string,
    mappings?: ReadonlyArray<{
        readonly driveRoot: string;
        readonly targetPath: string;
    }>,
    temporaryDriveRoots?: readonly string[]
): ReadonlyArray<{
    readonly driveRoot: string;
    readonly targetPath: string;
}>;

export function createTypedocExecutionPlan(input?: {
    readonly cliArgs?: readonly string[];
    readonly docsWorkspaceDirectory?: string;
    readonly platform?: NodeJS.Platform;
    readonly repositoryRoot?: string;
}): TypedocExecutionPlan;

export function runCli(input?: {
    readonly cliArgs?: readonly string[];
    readonly docsWorkspaceDirectory?: string;
    readonly platform?: NodeJS.Platform;
    readonly repositoryRoot?: string;
}): void;
