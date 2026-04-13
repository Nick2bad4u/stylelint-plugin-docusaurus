export function isDirectExecution(input?: {
    readonly argvEntry?: string | undefined;
    readonly currentImportUrl?: string;
}): boolean;

export function getRepositoryRootPath(currentImportUrl?: string): string;

export function hasActionlintFlag(
    args: readonly string[],
    flag: string
): boolean;

export function hasAnyActionlintFlag(
    args: readonly string[],
    flags: readonly string[]
): boolean;

export function parseActionlintCliArgs(rawArgs?: readonly string[]): {
    readonly fileArgs: readonly string[];
    readonly overrideExcluded: boolean;
    readonly userArgs: readonly string[];
};

export function isActionlintPassThroughMode(
    userArgs: readonly string[]
): boolean;

export function resolveDefaultWorkflowTargets(input?: {
    readonly overrideExcluded?: boolean;
    readonly repoRootPath?: string;
    readonly readDirectoryEntries?: (directoryPath: string) => readonly {
        readonly isFile: () => boolean;
        readonly name: string;
    }[];
}): readonly string[];

export function createActionlintExecutionPlan(input?: {
    readonly rawArgs?: readonly string[];
    readonly repoRootPath?: string;
    readonly readDirectoryEntries?: (directoryPath: string) => readonly {
        readonly isFile: () => boolean;
        readonly name: string;
    }[];
}): {
    readonly overrideExcluded: boolean;
    readonly passThroughMode: boolean;
    readonly targetFiles: readonly string[];
    readonly useDefaultFiles: boolean;
    readonly userArgs: readonly string[];
};

export function runCli(input?: {
    readonly logger?: {
        readonly error: (...args: readonly unknown[]) => void;
        readonly log: (...args: readonly unknown[]) => void;
    };
    readonly rawArgs?: readonly string[];
    readonly repoRootPath?: string;
    readonly readDirectoryEntries?: (directoryPath: string) => readonly {
        readonly isFile: () => boolean;
        readonly name: string;
    }[];
    readonly spawnActionlint?: (
        command: string,
        args: readonly string[],
        options: { readonly stdio: "inherit" }
    ) => {
        readonly error?: unknown;
        readonly signal: string | null;
        readonly status: number | null;
    };
}): number;
