import type { AtRule, Node } from "postcss";

import { isDefined } from "ts-extras";

/** Default Docusaurus desktop/mobile breakpoint boundary in pixels. */
export const docusaurusDesktopNavbarMinWidthPx = 997;
/** Default Docusaurus mobile max-width boundary in pixels. */
export const docusaurusMobileMaxWidthPx = 996;

/** Parsed CSS length represented in pixels. */
type ParsedLength = Readonly<{
    pixels: number;
}>;

/** One supported width constraint extracted from a media query. */
export type WidthBreakpointConstraint = Readonly<{
    inclusive: boolean;
    kind: "max" | "min";
    pixels: number;
}>;

/** Supported CSS length units for lightweight media-query parsing. */
type SupportedLengthUnit = "em" | "px" | "rem";

/** Media types that are compatible with normal screen-width gating logic. */
const screenCompatibleMediaTypes: ReadonlySet<string> = new Set([
    "all",
    "screen",
]);

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

/** Convert a CSS length and unit to pixels using the standard 16px base. */
function toPixels(value: number, unit: SupportedLengthUnit): number {
    if (unit === "px") {
        return value;
    }

    return value * 16;
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
    const explicitMediaTypeMatch =
        /^\s*(?:only\s+)?([a-z-]+)(?:\s+and\b|\s*$)/iu.exec(mediaQueryBranch);

    if (!isDefined(explicitMediaTypeMatch?.[1])) {
        return true;
    }

    return screenCompatibleMediaTypes.has(
        explicitMediaTypeMatch[1].toLowerCase()
    );
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

    if (!Number.isFinite(numericValue)) {
        return undefined;
    }

    if (unitText !== "em" && unitText !== "px" && unitText !== "rem") {
        return undefined;
    }

    return {
        pixels: toPixels(numericValue, unitText),
    };
}

/** Create one width constraint from `width <op> value` syntax. */
function createTrailingWidthConstraint(
    operatorText: string,
    pixels: number
): WidthBreakpointConstraint | undefined {
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

/** Create one width constraint from `value <op> width` syntax. */
function createLeadingWidthConstraint(
    operatorText: string,
    pixels: number
): WidthBreakpointConstraint | undefined {
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

/** Extract supported width constraints from one media-query string. */
export function extractWidthBreakpointConstraints(
    mediaQuery: string
): readonly WidthBreakpointConstraint[] {
    const widthConstraints: WidthBreakpointConstraint[] = [];

    for (const match of mediaQuery.matchAll(
        /(min|max)-width\s*:\s*([\d.]+)\s*(px|rem|em)/giu
    )) {
        const parsedLength = parseLengthMatch(match[2], match[3]);

        if (!isDefined(parsedLength)) {
            continue;
        }

        widthConstraints.push({
            inclusive: true,
            kind: match[1] === "min" ? "min" : "max",
            pixels: parsedLength.pixels,
        });
    }

    for (const match of mediaQuery.matchAll(
        /width\s*(<=|<|>=|>)\s*([\d.]+)\s*(px|rem|em)/giu
    )) {
        const parsedLength = parseLengthMatch(match[2], match[3]);

        if (!isDefined(parsedLength)) {
            continue;
        }

        const constraint = createTrailingWidthConstraint(
            match[1] ?? "",
            parsedLength.pixels
        );

        if (!isDefined(constraint)) {
            continue;
        }

        widthConstraints.push(constraint);
    }

    for (const match of mediaQuery.matchAll(
        /([\d.]+)\s*(px|rem|em)\s*(<=|<|>=|>)\s*width/giu
    )) {
        const parsedLength = parseLengthMatch(match[1], match[2]);

        if (!isDefined(parsedLength)) {
            continue;
        }

        const constraint = createLeadingWidthConstraint(
            match[3] ?? "",
            parsedLength.pixels
        );

        if (!isDefined(constraint)) {
            continue;
        }

        widthConstraints.push(constraint);
    }

    return widthConstraints;
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
