import postcss from "postcss";
import { describe, expect, it } from "vitest";

import { isAllowedDocSearchRootScopeRule } from "../src/_internal/docsearch-root-scope.js";

describe("docsearch-root-scope helpers", () => {
    describe(isAllowedDocSearchRootScopeRule, () => {
        it("returns false for an unparseable selector (defensive null-safety path)", () => {
            expect.hasAssertions();

            // ":::" is not a valid CSS selector; parseSelectorList returns undefined
            const rule = postcss.rule({ selector: ":::" });

            expect(isAllowedDocSearchRootScopeRule(rule)).toBeFalsy();
        });

        it("returns true when the selector ends with the .DocSearch class", () => {
            expect.hasAssertions();

            const rule = postcss.rule({ selector: ".DocSearch" });

            expect(isAllowedDocSearchRootScopeRule(rule)).toBeTruthy();
        });

        it("returns true when multiple selectors all end with .DocSearch", () => {
            expect.hasAssertions();

            const rule = postcss.rule({
                selector: ".DocSearch, .navbar .DocSearch",
            });

            expect(isAllowedDocSearchRootScopeRule(rule)).toBeTruthy();
        });

        it("returns false when the selector does not end with .DocSearch", () => {
            expect.hasAssertions();

            const rule = postcss.rule({ selector: ".navbar" });

            expect(isAllowedDocSearchRootScopeRule(rule)).toBeFalsy();
        });

        it("returns false when only some selectors end with .DocSearch", () => {
            expect.hasAssertions();

            const rule = postcss.rule({
                selector: ".DocSearch, .navbar--dark",
            });

            expect(isAllowedDocSearchRootScopeRule(rule)).toBeFalsy();
        });

        it("returns false for an empty selector (no selectors in list)", () => {
            expect.hasAssertions();

            const rule = postcss.rule({ selector: "" });

            expect(isAllowedDocSearchRootScopeRule(rule)).toBeFalsy();
        });
    });
});
