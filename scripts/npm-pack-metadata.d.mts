export declare const isRecord: (
    value: unknown
) => value is Record<string, unknown>;

export declare function resolvePackedTarballFilename(metadata: unknown): string;

export declare function readPackedTarballFilename(
    metadataPath: string
): Promise<string>;

export declare function isDirectExecution(input?: {
    argvEntry?: string;
    currentImportUrl?: string;
}): boolean;
