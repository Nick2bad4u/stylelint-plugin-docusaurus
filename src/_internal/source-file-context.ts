import type { Root } from "postcss";

/** CSS Modules file-name pattern recognized by the plugin's stylesheet rules. */
const cssModuleFileNamePattern = /\.module\.(?:css|less|sass|scss)$/iu;

/** Resolve the normalized source file path for one PostCSS root. */
export function getSourceFilePath(root: Readonly<Root>): string | undefined {
    const filePath = root.source?.input.file;

    if (typeof filePath !== "string" || filePath.length === 0) {
        return undefined;
    }

    return filePath.replaceAll("\\", "/");
}

/** Check whether one source file path belongs to a CSS Modules stylesheet. */
export function isCssModuleFilePath(filePath: string | undefined): boolean {
    return (
        typeof filePath === "string" && cssModuleFileNamePattern.test(filePath)
    );
}

/** Check whether one PostCSS root originates from a CSS Modules stylesheet. */
export function isCssModuleRoot(root: Readonly<Root>): boolean {
    return isCssModuleFilePath(getSourceFilePath(root));
}

/** Normalize a source file path to slash-separated form for stable checks. */
export function normalizeSourceFilePath(filePath: string): string {
    return filePath.replaceAll("\\", "/");
}
