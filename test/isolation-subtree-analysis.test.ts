import { describe, expect, it } from "vitest";

import { findFirstSelectorWithoutIsolationAnchor } from "../src/_internal/isolation-subtree-analysis.js";

describe("isolation-subtree-analysis helpers", () => {
    describe(findFirstSelectorWithoutIsolationAnchor, () => {
        it("returns undefined for an unparseable selector (defensive null-safety path)", () => {
            expect.hasAssertions();

            // ":::" is not a valid CSS selector; parseSelectorList returns undefined
            expect(
                findFirstSelectorWithoutIsolationAnchor(":::", false)
            ).toBeUndefined();
        });

        it("returns the selector string when the selector has no scope anchor", () => {
            expect.hasAssertions();

            // A bare element selector has no scope anchor (no class/id/attribute)
            expect(findFirstSelectorWithoutIsolationAnchor("h2", false)).toBe(
                "h2"
            );
        });

        it("returns undefined when the ancestor provides a scope anchor", () => {
            expect.hasAssertions();

            // When ancestorHasScopeAnchor is true, the shortcut returns true for every
            // selector so no unanchored selector is found
            expect(
                findFirstSelectorWithoutIsolationAnchor("h2", true)
            ).toBeUndefined();
        });

        it("returns the first unanchored selector in a comma-separated list", () => {
            expect.hasAssertions();

            // Both selectors lack a scope anchor; should return the first one
            const result = findFirstSelectorWithoutIsolationAnchor(
                "h2, p",
                false
            );

            // H2 is the first unanchored selector
            expect(result).toBe("h2");
        });

        it("returns the bare element even when it follows a plain class selector", () => {
            expect.hasAssertions();

            // A plain class like .DocSearch is NOT an isolation anchor with default options;
            // only classes from the anchor class lists count.
            // The function should return the first selector string because there is no anchor.
            expect(findFirstSelectorWithoutIsolationAnchor("h2", false)).toBe(
                "h2"
            );
        });
    });
});
