import { isDefined } from "ts-extras";

/** Check whether one character is ASCII whitespace. */
function isAsciiWhitespace(character: string | undefined): boolean {
    return (
        character === " " ||
        character === "\n" ||
        character === "\r" ||
        character === "\t" ||
        character === "\f"
    );
}

/** Check whether one character can appear in a lightweight identifier scan. */
function isIdentifierCharacter(character: string | undefined): boolean {
    return typeof character === "string" && /[A-Za-z0-9_-]/u.test(character);
}

/** Check whether one character is an ASCII hex digit. */
function isAsciiHexDigit(character: string | undefined): boolean {
    return typeof character === "string" && /[0-9A-Fa-f]/u.test(character);
}

/** Consume one CSS escape sequence and return its decoded text plus next index. */
function consumeCssEscape(
    value: string,
    startIndex: number
): Readonly<{
    decodedText: string;
    nextIndex: number;
}> {
    if (value[startIndex] !== "\\") {
        return {
            decodedText: value[startIndex] ?? "",
            nextIndex: startIndex + 1,
        };
    }

    const escapedCharacter = value[startIndex + 1];

    if (escapedCharacter === undefined) {
        return {
            decodedText: "",
            nextIndex: value.length,
        };
    }

    let hexDigitIndex = startIndex + 1;

    while (
        hexDigitIndex < value.length &&
        hexDigitIndex - (startIndex + 1) < 6 &&
        isAsciiHexDigit(value[hexDigitIndex])
    ) {
        hexDigitIndex += 1;
    }

    if (hexDigitIndex > startIndex + 1) {
        let nextIndex = hexDigitIndex;

        if (isAsciiWhitespace(value[nextIndex])) {
            nextIndex += 1;
        }

        const decodedCodePoint = Number.parseInt(
            value.slice(startIndex + 1, hexDigitIndex),
            16
        );

        return {
            decodedText:
                decodedCodePoint === 0 ||
                decodedCodePoint > 0x10ffff ||
                Number.isNaN(decodedCodePoint)
                    ? "\uFFFD"
                    : String.fromCodePoint(decodedCodePoint),
            nextIndex,
        };
    }

    return {
        decodedText:
            escapedCharacter === "\n" ||
            escapedCharacter === "\r" ||
            escapedCharacter === "\f"
                ? ""
                : escapedCharacter,
        nextIndex: startIndex + 2,
    };
}

/** Skip over one quoted CSS string, including escaped characters. */
function skipQuotedString(value: string, startIndex: number): number {
    const quoteCharacter = value[startIndex];

    if (quoteCharacter !== '"' && quoteCharacter !== "'") {
        return startIndex;
    }

    let index = startIndex + 1;

    while (index < value.length) {
        const currentCharacter = value[index];

        if (currentCharacter === "\\") {
            index = consumeCssEscape(value, index).nextIndex;
            continue;
        }

        index += 1;

        if (currentCharacter === quoteCharacter) {
            return index;
        }
    }

    return value.length;
}

/** Skip over one CSS block comment. */
function skipBlockComment(value: string, startIndex: number): number {
    if (value[startIndex] !== "/" || value[startIndex + 1] !== "*") {
        return startIndex;
    }

    let index = startIndex + 2;

    while (index < value.length) {
        if (value[index] === "*" && value[index + 1] === "/") {
            return index + 2;
        }

        index += 1;
    }

    return value.length;
}

/** Skip any adjacent whitespace and block comments. */
function skipWhitespaceAndComments(value: string, startIndex: number): number {
    let index = startIndex;

    while (index < value.length) {
        if (isAsciiWhitespace(value[index])) {
            index += 1;
            continue;
        }

        if (value[index] === "/" && value[index + 1] === "*") {
            index = skipBlockComment(value, index);
            continue;
        }

        break;
    }

    return index;
}

/** Consume one CSS identifier-like token, decoding any valid escape sequences. */
function consumeEscapedIdentifier(
    value: string,
    startIndex: number
):
    | Readonly<{
          identifier: string;
          nextIndex: number;
      }>
    | undefined {
    let index = startIndex;
    let identifier = "";

    while (index < value.length) {
        const currentCharacter = value[index];

        if (currentCharacter === "\\") {
            const { decodedText, nextIndex } = consumeCssEscape(value, index);

            identifier += decodedText;
            index = nextIndex;
            continue;
        }

        if (!isIdentifierCharacter(currentCharacter)) {
            break;
        }

        identifier += currentCharacter;
        index += 1;
    }

    if (identifier.length === 0) {
        return undefined;
    }

    return {
        identifier,
        nextIndex: index,
    };
}

/** Find the matching closing parenthesis for one opening parenthesis. */
function findMatchingClosingParenthesis(
    value: string,
    openingParenthesisIndex: number
): number | undefined {
    if (value[openingParenthesisIndex] !== "(") {
        return undefined;
    }

    let depth = 0;

    for (
        let index = openingParenthesisIndex;
        index < value.length;
        index += 1
    ) {
        const currentCharacter = value[index];

        if (currentCharacter === '"' || currentCharacter === "'") {
            index = skipQuotedString(value, index) - 1;
            continue;
        }

        if (currentCharacter === "\\") {
            index = consumeCssEscape(value, index).nextIndex - 1;
            continue;
        }

        if (currentCharacter === "/" && value[index + 1] === "*") {
            index = skipBlockComment(value, index) - 1;
            continue;
        }

        if (currentCharacter === "(") {
            depth += 1;
            continue;
        }

        if (currentCharacter !== ")") {
            continue;
        }

        depth -= 1;

        if (depth === 0) {
            return index;
        }
    }

    return undefined;
}

/** Collapse one layer-name fragment by removing comments and insignificant
whitespace. */
function normalizeCascadeLayerNameText(value: string): string | undefined {
    let normalizedLayerName = "";

    for (let index = 0; index < value.length; index += 1) {
        const currentCharacter = value[index];

        if (currentCharacter === '"' || currentCharacter === "'") {
            index = skipQuotedString(value, index) - 1;
            continue;
        }

        if (currentCharacter === "\\") {
            const { decodedText, nextIndex } = consumeCssEscape(value, index);

            normalizedLayerName += decodedText;
            index = nextIndex - 1;
            continue;
        }

        if (currentCharacter === "/" && value[index + 1] === "*") {
            index = skipBlockComment(value, index) - 1;
            continue;
        }

        if (isAsciiWhitespace(currentCharacter)) {
            continue;
        }

        normalizedLayerName += currentCharacter;
    }

    return normalizedLayerName.length > 0 ? normalizedLayerName : undefined;
}

/** Split one raw parameter list on top-level commas. */
function splitTopLevelCommaSeparatedValues(value: string): readonly string[] {
    const segments: string[] = [];
    let depth = 0;
    let segmentStartIndex = 0;

    for (let index = 0; index < value.length; index += 1) {
        const currentCharacter = value[index];

        if (currentCharacter === '"' || currentCharacter === "'") {
            index = skipQuotedString(value, index) - 1;
            continue;
        }

        if (currentCharacter === "\\") {
            index = consumeCssEscape(value, index).nextIndex - 1;
            continue;
        }

        if (currentCharacter === "/" && value[index + 1] === "*") {
            index = skipBlockComment(value, index) - 1;
            continue;
        }

        if (currentCharacter === "(") {
            depth += 1;
            continue;
        }

        if (currentCharacter === ")") {
            depth = Math.max(0, depth - 1);
            continue;
        }

        if (currentCharacter === "," && depth === 0) {
            segments.push(value.slice(segmentStartIndex, index));
            segmentStartIndex = index + 1;
        }
    }

    segments.push(value.slice(segmentStartIndex));

    return segments
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);
}

/** Extract declared cascade layer names from one `@layer` parameter list. */
export function getDeclaredCascadeLayerNames(
    layerParameters: string
): readonly string[] {
    return splitTopLevelCommaSeparatedValues(layerParameters)
        .map((layerName) => normalizeCascadeLayerNameText(layerName))
        .filter(isDefined);
}

/** Extract named `layer(...)` targets from one `@import` parameter list. */
export function getImportedCascadeLayerNames(
    importParameters: string
): readonly string[] {
    const importedLayerNames: string[] = [];
    let index = 0;

    while (index < importParameters.length) {
        const currentCharacter = importParameters[index];

        if (currentCharacter === '"' || currentCharacter === "'") {
            index = skipQuotedString(importParameters, index);
            continue;
        }

        if (currentCharacter === "/" && importParameters[index + 1] === "*") {
            index = skipBlockComment(importParameters, index);
            continue;
        }

        if (
            currentCharacter !== "\\" &&
            !isIdentifierCharacter(currentCharacter)
        ) {
            index += 1;
            continue;
        }

        const consumedIdentifier = consumeEscapedIdentifier(
            importParameters,
            index
        );

        if (!isDefined(consumedIdentifier)) {
            index += 1;
            continue;
        }

        index = consumedIdentifier.nextIndex;

        const identifier = consumedIdentifier.identifier.toLowerCase();
        const functionOpenParenthesisIndex = skipWhitespaceAndComments(
            importParameters,
            index
        );

        if (importParameters[functionOpenParenthesisIndex] !== "(") {
            index = functionOpenParenthesisIndex;
            continue;
        }

        const functionCloseParenthesisIndex = findMatchingClosingParenthesis(
            importParameters,
            functionOpenParenthesisIndex
        );

        if (!isDefined(functionCloseParenthesisIndex)) {
            break;
        }

        if (identifier === "layer") {
            const normalizedLayerName = normalizeCascadeLayerNameText(
                importParameters.slice(
                    functionOpenParenthesisIndex + 1,
                    functionCloseParenthesisIndex
                )
            );

            if (isDefined(normalizedLayerName)) {
                importedLayerNames.push(normalizedLayerName);
            }
        }

        index = functionCloseParenthesisIndex + 1;
    }

    return importedLayerNames;
}
