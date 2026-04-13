/** Escape one string for safe use inside a regular expression. */
function escapeForRegularExpression(value: string): string {
    return value.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

/** Check whether one character can participate in a CSS identifier. */
function isIdentifierCharacter(character: string | undefined): boolean {
    return typeof character === "string" && /[A-Za-z0-9_-]/u.test(character);
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

/** Replace quoted strings and block comments with whitespace placeholders. */
function stripCssStringsAndComments(value: string): string {
    let sanitizedValue = "";
    let activeQuote: '"' | "'" | undefined;

    for (let index = 0; index < value.length; index += 1) {
        const currentCharacter = value[index];
        const nextCharacter = value[index + 1];

        if (activeQuote !== undefined) {
            if (currentCharacter === "\\") {
                sanitizedValue += " ";

                if (nextCharacter !== undefined) {
                    sanitizedValue += " ";
                    index += 1;
                }

                continue;
            }

            sanitizedValue += " ";

            if (currentCharacter === activeQuote) {
                activeQuote = undefined;
            }

            continue;
        }

        if (currentCharacter === '"' || currentCharacter === "'") {
            activeQuote = currentCharacter;
            sanitizedValue += " ";
            continue;
        }

        const urlFunctionEndIndex = tryConsumeNamedFunctionCall(
            value,
            index,
            "url"
        );

        if (urlFunctionEndIndex !== undefined) {
            sanitizedValue += " ".repeat(urlFunctionEndIndex - index);
            index = urlFunctionEndIndex - 1;
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

            continue;
        }

        sanitizedValue += currentCharacter;
    }

    return sanitizedValue;
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
        /(?<![A-Za-z0-9_-])var\(\s*(--[A-Za-z0-9_-]+)/giu;

    for (const match of sanitizedValue.matchAll(
        customPropertyReferencePattern
    )) {
        const propertyName = match[1];

        if (typeof propertyName !== "string" || !predicate(propertyName)) {
            continue;
        }

        return propertyName;
    }

    return undefined;
}

/**
 * Check whether a CSS value references one custom property via `var(...)`,
 * ignoring quoted text and comments.
 */
export function cssValueHasCustomPropertyReference(
    value: string,
    propertyName: string
): boolean {
    return (
        findFirstCssVarCustomPropertyReference(
            value,
            (candidatePropertyName) => candidatePropertyName === propertyName
        ) !== undefined
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
    const sanitizedValue = stripCssStringsAndComments(value);
    const identifierPattern = new RegExp(
        `(?<![A-Za-z0-9_-])${escapeForRegularExpression(identifier)}(?![A-Za-z0-9_-])`,
        "iu"
    );

    return identifierPattern.test(sanitizedValue);
}
