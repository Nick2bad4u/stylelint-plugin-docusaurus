/* eslint-disable @typescript-eslint/no-use-before-define -- function declarations are intentionally grouped below exports for discoverability in this small analysis helper */
import { isDefined } from "ts-extras";

/**
 * Check whether a CSS value references one custom property via `var(...)`,
 * ignoring quoted text and comments.
 */
export function cssValueHasCustomPropertyReference(
    value: string,
    propertyName: string
): boolean {
    return isDefined(
        findFirstCssVarCustomPropertyReference(
            value,
            (candidatePropertyName) => candidatePropertyName === propertyName
        )
    );
}

/**
 * Check whether a CSS value contains one standalone identifier token outside
 * quoted text and comments.
 */
export function cssValueHasStandaloneIdentifier(
    value: string,
    identifier: string
): boolean {
    if (identifier.length === 0) {
        return false;
    }

    const sanitizedValue = stripCssStringsAndComments(value).toLowerCase();
    const normalizedIdentifier = identifier.toLowerCase();
    let searchIndex = 0;

    while (searchIndex < sanitizedValue.length) {
        const matchIndex = sanitizedValue.indexOf(
            normalizedIdentifier,
            searchIndex
        );

        if (matchIndex === -1) {
            return false;
        }

        const precedingCharacter = sanitizedValue[matchIndex - 1];
        const trailingCharacter =
            sanitizedValue[matchIndex + normalizedIdentifier.length];

        if (
            !isIdentifierCharacter(precedingCharacter) &&
            !isIdentifierCharacter(trailingCharacter)
        ) {
            return true;
        }

        searchIndex = matchIndex + 1;
    }

    return false;
}

/**
 * Find the first referenced custom property passed as the first `var(...)`
 * argument, ignoring quoted text and comments.
 */
export function findFirstCssVarCustomPropertyReference(
    value: string,
    predicate: (propertyName: string) => boolean = () => true
): string | undefined {
    const sanitizedValue = stripCssStringsAndComments(value);
    const customPropertyReferencePattern =
        /(?<![\w-])var\(\s*(?<propertyName>--[\w-]+)/giu;

    for (const match of sanitizedValue.matchAll(
        customPropertyReferencePattern
    )) {
        const propertyName = match.groups?.["propertyName"];

        if (!isDefined(propertyName) || !predicate(propertyName)) {
            continue;
        }

        return propertyName;
    }

    return undefined;
}

/** Check whether one character can participate in a CSS identifier. */
function isIdentifierCharacter(character: string | undefined): boolean {
    return typeof character === "string" && /[\w-]/u.test(character);
}

/** Skip one balanced parenthesized function body, including nested groups. */
function skipParenthesizedFunction(
    value: string,
    openingParenthesisIndex: number
): number {
    let depth = 0;

    for (
        let index = openingParenthesisIndex;
        index < value.length;
        index += 1
    ) {
        const currentCharacter = value[index];
        const nextCharacter = value[index + 1];

        if (currentCharacter === "\\") {
            index += 1;
            continue;
        }

        if (currentCharacter === '"' || currentCharacter === "'") {
            const quoteCharacter = currentCharacter;

            index += 1;

            while (index < value.length) {
                const quotedCharacter = value[index];

                if (quotedCharacter === "\\") {
                    index += 2;
                    continue;
                }

                if (quotedCharacter === quoteCharacter) {
                    break;
                }

                index += 1;
            }

            continue;
        }

        if (currentCharacter === "/" && nextCharacter === "*") {
            index += 2;

            while (index < value.length) {
                if (value[index] === "*" && value[index + 1] === "/") {
                    index += 1;
                    break;
                }

                index += 1;
            }

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
            return index + 1;
        }
    }

    return value.length;
}

/** Replace quoted strings and block comments with whitespace placeholders. */
function stripCssStringsAndComments(value: string): string {
    let sanitizedValue = "";
    let activeQuote: "'" | '"' | undefined = undefined;
    let index = 0;

    while (index < value.length) {
        const currentCharacter = value[index];
        const nextCharacter = value[index + 1];

        if (isDefined(activeQuote)) {
            if (currentCharacter === "\\") {
                sanitizedValue += " ";

                if (isDefined(nextCharacter)) {
                    sanitizedValue += " ";
                    index += 2;

                    continue;
                }

                index += 1;

                continue;
            }

            sanitizedValue += " ";

            if (currentCharacter === activeQuote) {
                activeQuote = undefined;
            }

            index += 1;

            continue;
        }

        if (currentCharacter === '"' || currentCharacter === "'") {
            activeQuote = currentCharacter;
            sanitizedValue += " ";
            index += 1;
            continue;
        }

        const urlFunctionEndIndex = tryConsumeNamedFunctionCall(
            value,
            index,
            "url"
        );

        if (isDefined(urlFunctionEndIndex)) {
            sanitizedValue += " ".repeat(urlFunctionEndIndex - index);
            index = urlFunctionEndIndex;

            continue;
        }

        if (currentCharacter === "/" && nextCharacter === "*") {
            sanitizedValue += "  ";
            index += 2;

            while (index < value.length) {
                const commentCharacter = value[index];
                const commentNextCharacter = value[index + 1];

                sanitizedValue += " ";

                if (commentCharacter === "*" && commentNextCharacter === "/") {
                    sanitizedValue += " ";
                    index += 1;
                    break;
                }

                index += 1;
            }

            index += 1;

            continue;
        }

        sanitizedValue += currentCharacter;
        index += 1;
    }

    return sanitizedValue;
}

/* eslint-enable @typescript-eslint/no-use-before-define -- restore default ordering checks outside this module */

/** Try to consume one named CSS function call at the current character index. */
function tryConsumeNamedFunctionCall(
    value: string,
    startIndex: number,
    functionName: string
): number | undefined {
    const functionNameEndIndex = startIndex + functionName.length;

    if (
        value.slice(startIndex, functionNameEndIndex).toLowerCase() !==
        functionName
    ) {
        return undefined;
    }

    if (isIdentifierCharacter(value[startIndex - 1])) {
        return undefined;
    }

    let index = functionNameEndIndex;

    while (
        value[index] === " " ||
        value[index] === "\n" ||
        value[index] === "\r" ||
        value[index] === "\t" ||
        value[index] === "\f"
    ) {
        index += 1;
    }

    if (value[index] !== "(") {
        return undefined;
    }

    return skipParenthesizedFunction(value, index);
}
