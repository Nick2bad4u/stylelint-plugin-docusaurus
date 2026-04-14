import type { AtRule, Node } from "postcss";

import { isDefined, isFinite, setHas } from "ts-extras";

/* eslint-disable @typescript-eslint/no-use-before-define -- this module keeps exported parsing utilities first and local helpers below for API readability */
/* eslint-disable security/detect-unsafe-regex, sonarjs/slow-regex, regexp/no-super-linear-move -- media-query matcher regexes are constrained to short parser input and do not process unbounded attacker-controlled payloads */

/** Default Docusaurus desktop/mobile breakpoint boundary in pixels. */
export const docusaurusDesktopNavbarMinWidthPx = 997;
/** Default Docusaurus mobile max-width boundary in pixels. */
export const docusaurusMobileMaxWidthPx = 996;

/** One supported width constraint extracted from a media query. */
export type WidthBreakpointConstraint = Readonly<{
    inclusive: boolean;
    kind: "max" | "min";
    pixels: number;
}>;

/** Parsed CSS length represented in pixels. */
type ParsedLength = Readonly<{
    pixels: number;
}>;

/** Supported CSS length units for lightweight media-query parsing. */
type SupportedLengthUnit = "em" | "px" | "rem";

/** Media types that are compatible with normal screen-width gating logic. */
const screenCompatibleMediaTypes: ReadonlySet<string> = new Set([
    "all",
    "screen",
]);

/** Extract supported width constraints from one media-query string. */
export function extractWidthBreakpointConstraints(
    mediaQuery: string
): readonly WidthBreakpointConstraint[] {
    const widthConstraints: WidthBreakpointConstraint[] = [];

    for (const match of mediaQuery.matchAll(
        /(?<kind>max|min)-width\s*:\s*(?<numericText>\d+(?:\.\d+)?)\s*(?<unitText>em|px|rem)/giu
    )) {
        const kind = match.groups?.["kind"];
        const parsedLength = parseLengthMatch(
            match.groups?.["numericText"],
            match.groups?.["unitText"]
        );

        if (!isDefined(kind) || !isDefined(parsedLength)) {
            continue;
        }

        widthConstraints.push({
            inclusive: true,
            kind: kind === "min" ? "min" : "max",
            pixels: parsedLength.pixels,
        });
    }

    for (const match of mediaQuery.matchAll(
        /width\s*(?<operatorText><=|<|>=|>)\s*(?<numericText>\d+(?:\.\d+)?)\s*(?<unitText>em|px|rem)/giu
    )) {
        const operatorText = match.groups?.["operatorText"];
        const parsedLength = parseLengthMatch(
            match.groups?.["numericText"],
            match.groups?.["unitText"]
        );

        if (!isDefined(operatorText) || !isDefined(parsedLength)) {
            continue;
        }

        const constraint = createTrailingWidthConstraint(
            operatorText,
            parsedLength.pixels
        );

        if (!isDefined(constraint)) {
            continue;
        }

        widthConstraints.push(constraint);
    }

    for (const match of mediaQuery.matchAll(
        /(?<numericText>\d+(?:\.\d+)?)\s*(?<unitText>em|px|rem)\s*(?<operatorText><=|<|>=|>)\s*width/giu
    )) {
        const operatorText = match.groups?.["operatorText"];
        const parsedLength = parseLengthMatch(
            match.groups?.["numericText"],
            match.groups?.["unitText"]
        );

        if (!isDefined(operatorText) || !isDefined(parsedLength)) {
            continue;
        }

        const constraint = createLeadingWidthConstraint(
            operatorText,
            parsedLength.pixels
        );

        if (!isDefined(constraint)) {
            continue;
        }

        widthConstraints.push(constraint);
    }

    return widthConstraints;
}

/** Collect ancestor `@media` rules for a node. */
export function getContainingMediaQueries(
    node: Readonly<Node>
): readonly AtRule[] {
    const mediaQueries: AtRule[] = [];
    let currentNode: Node | undefined = node.parent ?? undefined;

    while (isDefined(currentNode)) {
        if (currentNode.type === "atrule") {
            const atRule = currentNode as AtRule;

            if (atRule.name.toLowerCase() === "media") {
                mediaQueries.push(atRule);
            }
        }

        currentNode = currentNode.parent ?? undefined;
    }

    return mediaQueries;
}

/** Check whether one width constraint matches the documented Docusaurus cutoffs. */
export function isDefaultDocusaurusNavbarBreakpoint(
    constraint: Readonly<WidthBreakpointConstraint>
): boolean {
    if (constraint.kind === "max") {
        const expectedPixels = constraint.inclusive
            ? docusaurusMobileMaxWidthPx
            : docusaurusDesktopNavbarMinWidthPx;

        return Math.abs(constraint.pixels - expectedPixels) < 0.01;
    }

    const expectedPixels = constraint.inclusive
        ? docusaurusDesktopNavbarMinWidthPx
        : docusaurusMobileMaxWidthPx;

    return Math.abs(constraint.pixels - expectedPixels) < 0.01;
}

/**
 * Check whether one node is nested inside an ancestor `@media` rule that
 * guarantees widths at or above the requested minimum.
 */
export function isWithinMinimumWidthMediaQuery(
    node: Readonly<Node>,
    minimumWidthPx: number
): boolean {
    return getContainingMediaQueries(node).some((mediaQuery) =>
        mediaQueryProvidesMinimumWidth(mediaQuery.params, minimumWidthPx)
    );
}

/**
 * Check whether one media-query string includes a minimum-width guard at or
 * above the requested threshold.
 */
export function mediaQueryProvidesMinimumWidth(
    mediaQuery: string,
    minimumWidthPx: number
): boolean {
    return splitTopLevelMediaQueryBranches(mediaQuery).some(
        (mediaQueryBranch) => {
            if (isNegatedMediaQueryBranch(mediaQueryBranch)) {
                return false;
            }

            if (
                !mediaQueryBranchUsesScreenCompatibleMediaType(mediaQueryBranch)
            ) {
                return false;
            }

            return extractWidthBreakpointConstraints(mediaQueryBranch).some(
                (constraint) =>
                    widthConstraintProvidesMinimumWidth(
                        constraint,
                        minimumWidthPx
                    )
            );
        }
    );
}

/**
 * Check whether one extracted width constraint guarantees widths at or above a
 * requested minimum.
 *
 * Docusaurus theme logic switches at integer CSS-pixel cutoffs, so exclusive
 * minimum constraints such as `width > 996px` still count as a valid desktop
 * guard for a 997px threshold.
 */
export function widthConstraintProvidesMinimumWidth(
    constraint: Readonly<WidthBreakpointConstraint>,
    minimumWidthPx: number
): boolean {
    if (constraint.kind !== "min") {
        return false;
    }

    const guaranteedMinimumWidthPx = constraint.inclusive
        ? constraint.pixels
        : Math.floor(constraint.pixels) + 1;

    return guaranteedMinimumWidthPx >= minimumWidthPx;
}

/** Create one width constraint from `value <op> width` syntax. */
function createLeadingWidthConstraint(
    operatorText: string,
    pixels: number
): undefined | WidthBreakpointConstraint {
    if (operatorText === "<=") {
        return { inclusive: true, kind: "min", pixels };
    }

    if (operatorText === "<") {
        return { inclusive: false, kind: "min", pixels };
    }

    if (operatorText === ">=") {
        return { inclusive: true, kind: "max", pixels };
    }

    if (operatorText === ">") {
        return { inclusive: false, kind: "max", pixels };
    }

    return undefined;
}

/** Create one width constraint from `width <op> value` syntax. */
function createTrailingWidthConstraint(
    operatorText: string,
    pixels: number
): undefined | WidthBreakpointConstraint {
    if (operatorText === ">=") {
        return { inclusive: true, kind: "min", pixels };
    }

    if (operatorText === ">") {
        return { inclusive: false, kind: "min", pixels };
    }

    if (operatorText === "<=") {
        return { inclusive: true, kind: "max", pixels };
    }

    if (operatorText === "<") {
        return { inclusive: false, kind: "max", pixels };
    }

    return undefined;
}

/** Check whether one top-level media-query branch is explicitly negated. */
function isNegatedMediaQueryBranch(mediaQueryBranch: string): boolean {
    return /^\s*not\b/iu.test(mediaQueryBranch);
}

/**
 * Check whether one top-level media-query branch targets a screen-compatible
 * media type when it declares an explicit media type at all.
 */
function mediaQueryBranchUsesScreenCompatibleMediaType(
    mediaQueryBranch: string
): boolean {
    const normalizedMediaQueryBranch = mediaQueryBranch.trim().toLowerCase();
    const mediaQueryBranchWithoutOnlyPrefix =
        normalizedMediaQueryBranch.startsWith("only ")
            ? normalizedMediaQueryBranch.slice(5).trimStart()
            : normalizedMediaQueryBranch;

    if (
        mediaQueryBranchWithoutOnlyPrefix.length === 0 ||
        mediaQueryBranchWithoutOnlyPrefix.startsWith("(")
    ) {
        return true;
    }

    let mediaTypeToken = "";

    for (const character of mediaQueryBranchWithoutOnlyPrefix) {
        const isAlphaCharacter = character >= "a" && character <= "z";

        if (!isAlphaCharacter && character !== "-") {
            break;
        }

        mediaTypeToken += character;
    }

    if (mediaTypeToken.length === 0) {
        return true;
    }

    const mediaTypeSuffix = mediaQueryBranchWithoutOnlyPrefix.slice(
        mediaTypeToken.length
    );

    if (mediaTypeSuffix.length > 0 && !/^\s+and\b/iu.test(mediaTypeSuffix)) {
        return true;
    }

    return setHas(screenCompatibleMediaTypes, mediaTypeToken);
}

/** Parse a CSS length token from a regex match tuple. */
function parseLengthMatch(
    numericText: string | undefined,
    unitText: string | undefined
): ParsedLength | undefined {
    if (!isDefined(numericText) || !isDefined(unitText)) {
        return undefined;
    }

    const numericValue = Number(numericText);

    if (!isFinite(numericValue)) {
        return undefined;
    }

    if (unitText !== "em" && unitText !== "px" && unitText !== "rem") {
        return undefined;
    }

    return {
        pixels: toPixels(numericValue, unitText),
    };
}

/** Split one comma-separated media-query list at top-level commas only. */
function splitTopLevelMediaQueryBranches(
    mediaQuery: string
): readonly string[] {
    const branches: string[] = [];
    let currentBranch = "";
    let parenthesisDepth = 0;

    for (const character of mediaQuery) {
        if (character === "(") {
            parenthesisDepth += 1;
        } else if (character === ")" && parenthesisDepth > 0) {
            parenthesisDepth -= 1;
        }

        if (character === "," && parenthesisDepth === 0) {
            const normalizedBranch = currentBranch.trim();

            if (normalizedBranch.length > 0) {
                branches.push(normalizedBranch);
            }

            currentBranch = "";
            continue;
        }

        currentBranch += character;
    }

    const normalizedBranch = currentBranch.trim();

    if (normalizedBranch.length > 0) {
        branches.push(normalizedBranch);
    }

    return branches;
}

/** Convert a CSS length and unit to pixels using the standard 16px base. */
function toPixels(value: number, unit: SupportedLengthUnit): number {
    if (unit === "px") {
        return value;
    }

    return value * 16;
}

/* eslint-enable @typescript-eslint/no-use-before-define -- restore default helper-order checks outside this module */
/* eslint-enable security/detect-unsafe-regex, sonarjs/slow-regex, regexp/no-super-linear-move -- restore default regex safety checks outside this module */
