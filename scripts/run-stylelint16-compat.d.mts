export interface Stylelint16CompatCommandSpec {
    readonly args: readonly string[];
    readonly command: string;
    readonly environment?: Readonly<Record<string, string>>;
    readonly repositoryRootPath: string;
    readonly shell: boolean;
}

export function getNpmCommand(platform?: string): string;
export function getWindowsCommandShell(environment?: NodeJS.ProcessEnv): string;
export function isDirectExecution(input: {
    readonly argvEntry?: string | undefined;
    readonly currentImportUrl: string;
}): boolean;
export function createCompatibilityCheckCommands(input: {
    readonly nodeCommand?: string | undefined;
    readonly npmCommand?: string | undefined;
    readonly platform?: string | undefined;
    readonly repositoryRootPath?: string | undefined;
    readonly runtimeDirectoryPath: string;
    readonly stylelintCompatSmokeScriptPath?: string | undefined;
}): readonly Stylelint16CompatCommandSpec[];
export function runCommand(
    input: Stylelint16CompatCommandSpec & {
        readonly windowsCommandShell?: string | undefined;
    }
): void;
export function runStylelint16Compat(input?: {
    readonly mkdtempFn?: (prefix: string) => Promise<string>;
    readonly nodeCommand?: string | undefined;
    readonly npmCommand?: string | undefined;
    readonly platform?: string | undefined;
    readonly repositoryRootPath?: string | undefined;
    readonly rmFn?: typeof import("node:fs/promises").rm;
    readonly runCommandFn?: typeof runCommand;
    readonly stylelintCompatSmokeScriptPath?: string | undefined;
    readonly tmpDirectoryPath?: string | undefined;
    readonly windowsCommandShell?: string | undefined;
    readonly writeFileFn?: typeof import("node:fs/promises").writeFile;
}): Promise<void>;
export function runCli(): Promise<void>;
