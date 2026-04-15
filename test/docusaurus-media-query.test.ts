import { describe, expect, it } from "vitest";

import {
    docusaurusDesktopNavbarMinWidthPx,
    mediaQueryProvidesMinimumWidth,
} from "../src/_internal/docusaurus-media-query.js";

import {
    docusaurusMobileMaxWidthPx,
    extractWidthBreakpointConstraints,
    isDefaultDocusaurusNavbarBreakpoint,
    widthConstraintProvidesMinimumWidth,
} from "../src/_internal/docusaurus-media-query.js";

describe("docusaurus-media-query helpers", () => {
    it("does not treat print-only minimum-width branches as desktop guards", () => {
        expect.hasAssertions();

        expect(
            mediaQueryProvidesMinimumWidth(
                "print and (min-width: 997px)",
                docusaurusDesktopNavbarMinWidthPx
            )
        ).toBeFalsy();
    });

    it("does not treat negated desktop guards as providing a minimum width", () => {
        expect.hasAssertions();

        expect(
            mediaQueryProvidesMinimumWidth(
                "not all and (min-width: 997px)",
                docusaurusDesktopNavbarMinWidthPx
            )
        ).toBeFalsy();
    });

    it("still recognizes non-negated top-level branches inside comma-separated media queries", () => {
        expect.hasAssertions();

        expect(
            mediaQueryProvidesMinimumWidth(
                "print, (min-width: 997px)",
                docusaurusDesktopNavbarMinWidthPx
            )
        ).toBeTruthy();
    });

    it("recognizes range-syntax min-width query (width >= 997px) as providing minimum width", () => {
        expect.hasAssertions();

        expect(
            mediaQueryProvidesMinimumWidth(
                "(width >= 997px)",
                docusaurusDesktopNavbarMinWidthPx
            )
        ).toBeTruthy();
    });

    it("recognizes range-syntax max-width query (width <= 996px) as NOT providing minimum width", () => {
        expect.hasAssertions();

        expect(
            mediaQueryProvidesMinimumWidth("(width <= 996px)", 997)
        ).toBeFalsy();
    });

    describe("extractWidthBreakpointConstraints", () => {
        it("extracts a trailing <= range-syntax constraint as max/inclusive", () => {
            expect.hasAssertions();

            const constraints =
                extractWidthBreakpointConstraints("(width <= 997px)");

            expect(constraints).toHaveLength(1);
            expect(constraints[0]).toMatchObject({
                inclusive: true,
                kind: "max",
                pixels: 997,
            });
        });

        it("extracts a trailing < range-syntax constraint as max/exclusive", () => {
            expect.hasAssertions();

            const constraints =
                extractWidthBreakpointConstraints("(width < 997px)");

            expect(constraints).toHaveLength(1);
            expect(constraints[0]).toMatchObject({
                inclusive: false,
                kind: "max",
                pixels: 997,
            });
        });

        it("extracts a trailing >= range-syntax constraint as min/inclusive", () => {
            expect.hasAssertions();

            const constraints =
                extractWidthBreakpointConstraints("(width >= 997px)");

            expect(constraints).toHaveLength(1);
            expect(constraints[0]).toMatchObject({
                inclusive: true,
                kind: "min",
                pixels: 997,
            });
        });

        it("extracts a trailing > range-syntax constraint as min/exclusive", () => {
            expect.hasAssertions();

            const constraints =
                extractWidthBreakpointConstraints("(width > 996px)");

            expect(constraints).toHaveLength(1);
            expect(constraints[0]).toMatchObject({
                inclusive: false,
                kind: "min",
                pixels: 996,
            });
        });

        it("extracts a leading <= range-syntax constraint as min/inclusive", () => {
            expect.hasAssertions();

            const constraints =
                extractWidthBreakpointConstraints("(997px <= width)");

            expect(constraints).toHaveLength(1);
            expect(constraints[0]).toMatchObject({
                inclusive: true,
                kind: "min",
                pixels: 997,
            });
        });

        it("extracts a leading < range-syntax constraint as min/exclusive", () => {
            expect.hasAssertions();

            const constraints =
                extractWidthBreakpointConstraints("(996px < width)");

            expect(constraints).toHaveLength(1);
            expect(constraints[0]).toMatchObject({
                inclusive: false,
                kind: "min",
                pixels: 996,
            });
        });

        it("extracts a leading >= range-syntax constraint as max/inclusive", () => {
            expect.hasAssertions();

            const constraints =
                extractWidthBreakpointConstraints("(997px >= width)");

            expect(constraints).toHaveLength(1);
            expect(constraints[0]).toMatchObject({
                inclusive: true,
                kind: "max",
                pixels: 997,
            });
        });

        it("extracts a leading > range-syntax constraint as max/exclusive", () => {
            expect.hasAssertions();

            const constraints =
                extractWidthBreakpointConstraints("(997px > width)");

            expect(constraints).toHaveLength(1);
            expect(constraints[0]).toMatchObject({
                inclusive: false,
                kind: "max",
                pixels: 997,
            });
        });
    });

    describe("widthConstraintProvidesMinimumWidth", () => {
        it("returns false for a max-width constraint (only min-width constraints provide a minimum)", () => {
            expect.hasAssertions();

            expect(
                widthConstraintProvidesMinimumWidth(
                    { inclusive: true, kind: "max", pixels: 997 },
                    997
                )
            ).toBe(false);
        });

        it("returns true for an inclusive min-width constraint equal to the threshold", () => {
            expect.hasAssertions();

            expect(
                widthConstraintProvidesMinimumWidth(
                    { inclusive: true, kind: "min", pixels: 997 },
                    997
                )
            ).toBe(true);
        });

        it("returns false for an inclusive min-width constraint below the threshold", () => {
            expect.hasAssertions();

            expect(
                widthConstraintProvidesMinimumWidth(
                    { inclusive: true, kind: "min", pixels: 996 },
                    997
                )
            ).toBe(false);
        });

        it("returns true for an exclusive min-width constraint whose floor+1 meets the threshold", () => {
            expect.hasAssertions();

            // exclusive 996px → effectively ≥ 997px (Math.floor(996)+1 = 997)
            expect(
                widthConstraintProvidesMinimumWidth(
                    { inclusive: false, kind: "min", pixels: 996 },
                    997
                )
            ).toBe(true);
        });

        it("returns false for an exclusive min-width constraint whose floor+1 is below the threshold", () => {
            expect.hasAssertions();

            expect(
                widthConstraintProvidesMinimumWidth(
                    { inclusive: false, kind: "min", pixels: 995 },
                    997
                )
            ).toBe(false);
        });
    });

    describe("isDefaultDocusaurusNavbarBreakpoint", () => {
        it("recognizes the canonical inclusive min-width 997px breakpoint", () => {
            expect.hasAssertions();

            expect(
                isDefaultDocusaurusNavbarBreakpoint({
                    inclusive: true,
                    kind: "min",
                    pixels: docusaurusDesktopNavbarMinWidthPx,
                })
            ).toBe(true);
        });

        it("recognizes the canonical inclusive max-width 996px breakpoint", () => {
            expect.hasAssertions();

            expect(
                isDefaultDocusaurusNavbarBreakpoint({
                    inclusive: true,
                    kind: "max",
                    pixels: docusaurusMobileMaxWidthPx,
                })
            ).toBe(true);
        });

        it("recognizes the exclusive max-width 997px breakpoint (width < 997px)", () => {
            expect.hasAssertions();

            expect(
                isDefaultDocusaurusNavbarBreakpoint({
                    inclusive: false,
                    kind: "max",
                    pixels: docusaurusDesktopNavbarMinWidthPx,
                })
            ).toBe(true);
        });

        it("recognizes the exclusive min-width 996px breakpoint (width > 996px)", () => {
            expect.hasAssertions();

            expect(
                isDefaultDocusaurusNavbarBreakpoint({
                    inclusive: false,
                    kind: "min",
                    pixels: docusaurusMobileMaxWidthPx,
                })
            ).toBe(true);
        });

        it("returns false for an inclusive min-width that is not the canonical value", () => {
            expect.hasAssertions();

            expect(
                isDefaultDocusaurusNavbarBreakpoint({
                    inclusive: true,
                    kind: "min",
                    pixels: 998,
                })
            ).toBe(false);
        });

        it("returns false for an inclusive max-width that is not the canonical value", () => {
            expect.hasAssertions();

            expect(
                isDefaultDocusaurusNavbarBreakpoint({
                    inclusive: true,
                    kind: "max",
                    pixels: 900,
                })
            ).toBe(false);
        });
    });
});
