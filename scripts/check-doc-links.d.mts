export function stripMarkdownCode(content: string): string;

export function parsePositiveIntegerFlag(
    cliArgs: readonly string[],
    argumentName: string,
    fallbackValue: number,
    aliases?: readonly string[]
): number;

export function extractMarkdownLinkMatches(
    content: string
): readonly RegExpMatchArray[];

export function extractHtmlAnchorLinks(content: string): readonly string[];

export function stripOptionalMarkdownLinkTitle(rawLink: string): string;

export function normalizeLink(rawLink: string): string;

export function getPathCandidates(
    markdownPath: string,
    normalizedLink: string
): readonly string[];

export function resolveExistingPathCandidate(
    markdownPath: string,
    normalizedLink: string
): Promise<string | undefined>;
