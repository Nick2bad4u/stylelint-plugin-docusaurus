import { describe, expect, it } from "vitest";

import { stableDocusaurusThemeClassNames } from "../src/_internal/docusaurus-selector-contracts.js";
import { selectorListHasScopeAnchor } from "../src/_internal/selector-scope-analysis.js";

describe("selector scope analysis", () => {
    it("does not treat classes hidden inside :not(...) as positive scope anchors", () => {
        expect.hasAssertions();

        expect(
            selectorListHasScopeAnchor(":not(.theme-doc-markdown) h2", {
                additionalAnchorClassNames: stableDocusaurusThemeClassNames,
                includeGlobal: true,
            })
        ).toBeFalsy();
    });

    it("does not treat classes hidden inside :has(...) as positive scope anchors", () => {
        expect.hasAssertions();

        expect(
            selectorListHasScopeAnchor(":has(.theme-doc-markdown) h2", {
                additionalAnchorClassNames: stableDocusaurusThemeClassNames,
                includeGlobal: true,
            })
        ).toBeFalsy();
    });

    it("still treats positive wrapper pseudos such as :is(...) as scope anchors", () => {
        expect.hasAssertions();

        expect(
            selectorListHasScopeAnchor(":is(.theme-doc-markdown) h2", {
                additionalAnchorClassNames: stableDocusaurusThemeClassNames,
                includeGlobal: true,
            })
        ).toBeTruthy();
    });

    it("returns true immediately when ancestorHasScopeAnchor option is true", () => {
        expect.hasAssertions();

        // The shortcut on line ~88 exits early without scanning the selector
        expect(
            selectorListHasScopeAnchor("h2", { ancestorHasScopeAnchor: true })
        ).toBeTruthy();
    });

    it("returns true immediately when ancestorHasScopeAnchor is true even for complex selectors", () => {
        expect.hasAssertions();

        expect(
            selectorListHasScopeAnchor("div > span + p ~ ul", {
                ancestorHasScopeAnchor: true,
            })
        ).toBeTruthy();
    });

    it("treats an id selector as a meaningful scope anchor", () => {
        expect.hasAssertions();

        // An id selector that is NOT in rootOnlyIgnoredIdNames should count as anchor
        expect(
            selectorListHasScopeAnchor("#my-custom-section h2")
        ).toBeTruthy();
    });

    it("does not treat an id inside :not() as a scope anchor", () => {
        expect.hasAssertions();

        expect(selectorListHasScopeAnchor(":not(#my-section) h2")).toBeFalsy();
    });

    it("treats an attribute selector as a meaningful scope anchor", () => {
        expect.hasAssertions();

        // [data-custom] is not in rootOnlyIgnoredAttributeNames → it IS a valid anchor
        expect(
            selectorListHasScopeAnchor("[data-custom='foo'] h2")
        ).toBeTruthy();
    });

    it("does not treat an attribute in additionalIgnoredAttributeNames as a scope anchor", () => {
        expect.hasAssertions();

        expect(
            selectorListHasScopeAnchor("[data-color-mode] h2", {
                additionalIgnoredAttributeNames: new Set(["data-color-mode"]),
            })
        ).toBeFalsy();
    });

    it("returns false for an unparseable selector", () => {
        expect.hasAssertions();

        // ParseSelectorList returns undefined for ":::" → selectorListHasScopeAnchor returns false
        expect(selectorListHasScopeAnchor(":::")).toBeFalsy();
    });

    it("returns false for a plain element selector with no anchor", () => {
        expect.hasAssertions();

        expect(selectorListHasScopeAnchor("h2")).toBeFalsy();
    });
});
