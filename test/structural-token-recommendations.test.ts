import { describe, expect, it } from "vitest";

import { structuralTokenRecommendations } from "../src/_internal/docusaurus-selector-contracts.js";
import { findStructuralTokenRecommendationMatch } from "../src/_internal/structural-token-recommendations.js";

describe("structural-token-recommendations helpers", () => {
    describe("findStructuralTokenRecommendationMatch", () => {
        it("returns undefined for an unparseable selector (defensive null-safety path)", () => {
            expect.hasAssertions();

            // ":::" is not a valid CSS selector; parseSelectorList returns undefined
            expect(
                findStructuralTokenRecommendationMatch(
                    ":::",
                    "background-color",
                    structuralTokenRecommendations
                )
            ).toBeUndefined();
        });

        it("returns a match when the selector class and property match a recommendation", () => {
            expect.hasAssertions();

            // .navbar with background-color → --ifm-navbar-background-color
            const result = findStructuralTokenRecommendationMatch(
                ".navbar",
                "background-color",
                structuralTokenRecommendations
            );

            expect(result).toBeDefined();
            expect(result?.recommendation.tokenName).toBe(
                "--ifm-navbar-background-color"
            );
        });

        it("returns a match for footer background-color", () => {
            expect.hasAssertions();

            const result = findStructuralTokenRecommendationMatch(
                ".footer",
                "background-color",
                structuralTokenRecommendations
            );

            expect(result).toBeDefined();
            expect(result?.recommendation.tokenName).toBe(
                "--ifm-footer-background-color"
            );
        });

        it("returns a match for navbar height", () => {
            expect.hasAssertions();

            const result = findStructuralTokenRecommendationMatch(
                ".navbar",
                "height",
                structuralTokenRecommendations
            );

            expect(result).toBeDefined();
            expect(result?.recommendation.tokenName).toBe(
                "--ifm-navbar-height"
            );
        });

        it("returns undefined when the property name does not match any recommendation", () => {
            expect.hasAssertions();

            // .navbar exists but "color" is not in any recommendation's property list
            expect(
                findStructuralTokenRecommendationMatch(
                    ".navbar",
                    "color",
                    structuralTokenRecommendations
                )
            ).toBeUndefined();
        });

        it("returns undefined when the selector class does not match any recommendation", () => {
            expect.hasAssertions();

            // .unrelated-component doesn't appear in any recommendation
            expect(
                findStructuralTokenRecommendationMatch(
                    ".unrelated-component",
                    "background-color",
                    structuralTokenRecommendations
                )
            ).toBeUndefined();
        });

        it("returns the selector string used in the match", () => {
            expect.hasAssertions();

            const result = findStructuralTokenRecommendationMatch(
                ".navbar",
                "box-shadow",
                structuralTokenRecommendations
            );

            expect(result).toBeDefined();
            expect(result?.selector).toContain("navbar");
        });

        it("returns undefined for an empty recommendation list", () => {
            expect.hasAssertions();

            expect(
                findStructuralTokenRecommendationMatch(
                    ".navbar",
                    "background-color",
                    []
                )
            ).toBeUndefined();
        });
    });
});
