export const minimumSupportedStylelintRange: "^16.0.0";

export function isDirectExecution(input?: {
    readonly argvEntry?: string | undefined;
    readonly currentImportUrl?: string;
}): boolean;

export function readPackageJson(
    filePath?: string
): Promise<Record<string, unknown>>;

export function isRecord(value: unknown): value is Record<string, unknown>;

export function normalizeStylelintRange(range: unknown): string;

export function createPeerStylelintRange(input: {
    readonly devDependencyStylelintRange: unknown;
    readonly minimumRange?: string;
}): string;

export function synchronizePeerStylelintRange(input?: {
    readonly filePath?: string;
    readonly logger?: {
        readonly log: (...args: readonly unknown[]) => void;
    };
}): Promise<"updated" | "unchanged">;

export function runCli(input?: {
    readonly filePath?: string;
    readonly logger?: {
        readonly error: (...args: readonly unknown[]) => void;
        readonly log: (...args: readonly unknown[]) => void;
    };
}): Promise<number>;
