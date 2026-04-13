/**
 * @typedef {{
 *     readonly fenceCharacter: "`" | "~";
 *     readonly minimumFenceLength: number;
 * }} FencedCodeBlockState
 */

/**
 * @param {string} line
 *
 * @returns {FencedCodeBlockState | undefined}
 */
function parseOpeningFence(line) {
    const openingFenceMatch =
        /^(?: {0,3})(?<fence>`{3,}|~{3,})(?<rest>[^\r\n]*)$/u.exec(line);

    if (openingFenceMatch?.groups === undefined) {
        return undefined;
    }

    const fence = openingFenceMatch.groups["fence"];

    if (fence === undefined) {
        return undefined;
    }

    const rest = openingFenceMatch.groups["rest"] ?? "";
    const fenceCharacter = /** @type {"`" | "~"} */ (fence[0]);

    if (fenceCharacter === "`" && rest.includes("`")) {
        return undefined;
    }

    return {
        fenceCharacter,
        minimumFenceLength: fence.length,
    };
}

/**
 * @param {string} line
 * @param {FencedCodeBlockState} fencedCodeBlockState
 *
 * @returns {boolean}
 */
function isClosingFence(line, fencedCodeBlockState) {
    const closingFenceMatch = /^(?: {0,3})(?<fence>`{3,}|~{3,})[ \t]*$/u.exec(
        line
    );

    if (closingFenceMatch?.groups === undefined) {
        return false;
    }

    const fence = closingFenceMatch.groups["fence"];

    if (fence === undefined) {
        return false;
    }

    return (
        fence[0] === fencedCodeBlockState.fenceCharacter &&
        fence.length >= fencedCodeBlockState.minimumFenceLength
    );
}

/**
 * @param {string} content
 *
 * @returns {string}
 */
function stripFencedCodeBlocks(content) {
    const lines = content.split(/(?<=\n)/u);

    /** @type {FencedCodeBlockState | undefined} */
    let fencedCodeBlockState;
    let sanitizedContent = "";

    for (const line of lines) {
        const lineWithoutTrailingLineBreak = line.replace(/\r?\n$/u, "");

        if (fencedCodeBlockState !== undefined) {
            if (
                isClosingFence(
                    lineWithoutTrailingLineBreak,
                    fencedCodeBlockState
                )
            ) {
                fencedCodeBlockState = undefined;
            }

            continue;
        }

        const openingFence = parseOpeningFence(lineWithoutTrailingLineBreak);

        if (openingFence !== undefined) {
            fencedCodeBlockState = openingFence;
            continue;
        }

        sanitizedContent += line;
    }

    return sanitizedContent;
}

/**
 * Remove fenced code blocks and inline code spans so markdown-like text inside
 * examples does not get treated as real prose content.
 *
 * @param {string} content
 *
 * @returns {string}
 */
export function stripMarkdownCode(content) {
    const contentWithoutFencedCodeBlocks = stripFencedCodeBlocks(content);

    let sanitizedContent = "";

    for (
        let characterIndex = 0;
        characterIndex < contentWithoutFencedCodeBlocks.length;
    ) {
        if (contentWithoutFencedCodeBlocks[characterIndex] !== "`") {
            sanitizedContent += contentWithoutFencedCodeBlocks[characterIndex];
            characterIndex += 1;
            continue;
        }

        let tickCount = 1;

        while (
            contentWithoutFencedCodeBlocks[characterIndex + tickCount] === "`"
        ) {
            tickCount += 1;
        }

        const tickSequence = "`".repeat(tickCount);
        const closingTickOffset = contentWithoutFencedCodeBlocks.indexOf(
            tickSequence,
            characterIndex + tickCount
        );

        if (closingTickOffset === -1) {
            sanitizedContent += tickSequence;
            characterIndex += tickCount;
            continue;
        }

        sanitizedContent += " ".repeat(
            closingTickOffset + tickCount - characterIndex
        );
        characterIndex = closingTickOffset + tickCount;
    }

    return sanitizedContent;
}
