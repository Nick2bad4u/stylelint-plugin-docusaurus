export function escapeRegExp(value: string): string;

export function createMadgeExcludePattern(): string;

export function createMadgeExcludeRegExp(): RegExp;

export function createMadgeOptions(input?: {
    readonly repositoryRootPath?: string;
}): {
    readonly excludeRegExp: RegExp[];
    readonly fileExtensions: string[];
    readonly tsConfig: string;
};

export function formatCircularDependencies(
    circularDependencies: readonly (readonly string[])[]
): readonly string[];

export function isDirectExecution(input?: {
    readonly argvEntry?: string | undefined;
    readonly currentImportUrl?: string;
}): boolean;

export function runCli(input?: {
    readonly analyzeWithMadge?: (
        sourcePath: string,
        options: {
            excludeRegExp: RegExp[];
            fileExtensions: string[];
            tsConfig: string;
        }
    ) => Promise<{
        readonly circular: () => readonly (readonly string[])[];
    }>;
    readonly logger?: {
        readonly error: (...args: readonly unknown[]) => void;
        readonly log: (...args: readonly unknown[]) => void;
    };
    readonly repositoryRootPath?: string;
}): Promise<number>;
