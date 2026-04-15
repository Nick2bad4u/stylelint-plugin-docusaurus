import postcss, { type AtRule, type Rule } from "postcss";
import { describe, expect, it } from "vitest";

import {
    findLegacyThemeColorModeSelector,
    getContainingRule,
    getContainingRules,
    getLeadingDocusaurusColorMode,
    isAllowedThemeScopeRule,
    isAllowedThemeScopeSelector,
    isDocsearchThemeCustomPropertyName,
    isDocusaurusThemeCustomPropertyName,
    isIfmColorPrimaryScaleVariable,
    normalizeLegacyThemeColorModeSelectors,
    normalizeSelectorList,
    walkThemeScopeDeclarations,
} from "../src/_internal/docusaurus-theme-scope";

describe("docusaurus theme-scope helpers", () => {
    it("classifies legacy theme-dark and theme-light root scopes", () => {
        expect.hasAssertions();

        expect(getLeadingDocusaurusColorMode(".theme-dark .navbar")).toBe(
            "dark"
        );
        expect(getLeadingDocusaurusColorMode("html.theme-light .footer")).toBe(
            "light"
        );
    });

    it("classifies global-wrapped legacy and data-theme root scopes", () => {
        expect.hasAssertions();

        expect(
            getLeadingDocusaurusColorMode(
                ":global(.theme-dark) :global(.DocSearch)"
            )
        ).toBe("dark");
        expect(
            getLeadingDocusaurusColorMode(
                ":global([data-theme='light']) :global(.DocSearch)"
            )
        ).toBe("light");
    });

    it("still accepts global-wrapped standalone theme scopes", () => {
        expect.hasAssertions();

        expect(isAllowedThemeScopeSelector(":global(:root)")).toBeTruthy();
        expect(
            isAllowedThemeScopeSelector(":global(html[data-theme='dark'])")
        ).toBeTruthy();
    });

    it("getLeadingDocusaurusColorMode returns light for :root when allowRootLight is true", () => {
        expect.hasAssertions();

        expect(
            getLeadingDocusaurusColorMode(":root", { allowRootLight: true })
        ).toBe("light");
    });

    it("getLeadingDocusaurusColorMode returns undefined for :root without allowRootLight", () => {
        expect.hasAssertions();

        expect(getLeadingDocusaurusColorMode(":root")).toBeUndefined();
    });

    describe(findLegacyThemeColorModeSelector, () => {
        it("returns the matched .theme-dark selector node text", () => {
            expect.hasAssertions();

            const result = findLegacyThemeColorModeSelector(
                ".theme-dark .navbar"
            );

            expect(result).toBeDefined();
            expect(result).toContain("theme-dark");
        });

        it("returns the matched .theme-light selector node text", () => {
            expect.hasAssertions();

            const result = findLegacyThemeColorModeSelector(
                ".theme-light .footer"
            );

            expect(result).toBeDefined();
            expect(result).toContain("theme-light");
        });

        it("returns undefined when the selector has no legacy theme class", () => {
            expect.hasAssertions();

            expect(findLegacyThemeColorModeSelector(".navbar")).toBeUndefined();
        });

        it("returns undefined for an unparseable selector", () => {
            expect.hasAssertions();

            expect(findLegacyThemeColorModeSelector(":::")).toBeUndefined();
        });
    });

    describe(normalizeLegacyThemeColorModeSelectors, () => {
        it("replaces .theme-dark with [data-theme='dark']", () => {
            expect.hasAssertions();

            expect(
                normalizeLegacyThemeColorModeSelectors(".theme-dark .navbar")
            ).toContain("[data-theme");
        });

        it("replaces .theme-light with [data-theme='light']", () => {
            expect.hasAssertions();

            expect(
                normalizeLegacyThemeColorModeSelectors(".theme-light .footer")
            ).toContain("light");
        });

        it("returns the selector unchanged when there is no legacy theme class", () => {
            expect.hasAssertions();

            expect(
                normalizeLegacyThemeColorModeSelectors(".regular-class")
            ).toBe(".regular-class");
        });
    });

    describe(normalizeSelectorList, () => {
        it("splits a comma-separated selector list into trimmed parts", () => {
            expect.hasAssertions();

            const result = normalizeSelectorList(":root, [data-theme='dark']");

            expect(result).toContain(":root");
            expect(result).toHaveLength(2);
        });

        it("returns an empty array for an empty selector list", () => {
            expect.hasAssertions();

            expect(normalizeSelectorList("")).toStrictEqual([]);
        });
    });

    describe(isIfmColorPrimaryScaleVariable, () => {
        it("returns true for --ifm-color-primary", () => {
            expect.hasAssertions();

            expect(
                isIfmColorPrimaryScaleVariable("--ifm-color-primary")
            ).toBeTruthy();
        });

        it("returns true for --ifm-color-primary-dark", () => {
            expect.hasAssertions();

            expect(
                isIfmColorPrimaryScaleVariable("--ifm-color-primary-dark")
            ).toBeTruthy();
        });

        it("returns false for --ifm-navbar-background-color", () => {
            expect.hasAssertions();

            expect(
                isIfmColorPrimaryScaleVariable("--ifm-navbar-background-color")
            ).toBeFalsy();
        });

        it("returns false for a non-ifm custom property", () => {
            expect.hasAssertions();

            expect(
                isIfmColorPrimaryScaleVariable("--my-primary-color")
            ).toBeFalsy();
        });
    });

    describe(isDocsearchThemeCustomPropertyName, () => {
        it("returns true for --docsearch-* custom properties", () => {
            expect.hasAssertions();

            expect(
                isDocsearchThemeCustomPropertyName("--docsearch-primary-color")
            ).toBeTruthy();
        });

        it("returns false for --ifm-* custom properties", () => {
            expect.hasAssertions();

            expect(
                isDocsearchThemeCustomPropertyName("--ifm-color-primary")
            ).toBeFalsy();
        });

        it("returns false for arbitrary custom properties", () => {
            expect.hasAssertions();

            expect(
                isDocsearchThemeCustomPropertyName("--my-custom-color")
            ).toBeFalsy();
        });
    });

    describe(isDocusaurusThemeCustomPropertyName, () => {
        it("returns true for --ifm-* custom properties", () => {
            expect.hasAssertions();

            expect(
                isDocusaurusThemeCustomPropertyName("--ifm-color-primary")
            ).toBeTruthy();
        });

        it("returns true for --docsearch-* custom properties", () => {
            expect.hasAssertions();

            expect(
                isDocusaurusThemeCustomPropertyName("--docsearch-primary-color")
            ).toBeTruthy();
        });

        it("returns false for arbitrary custom properties", () => {
            expect.hasAssertions();

            expect(
                isDocusaurusThemeCustomPropertyName("--my-custom-color")
            ).toBeFalsy();
        });
    });

    describe(getContainingRule, () => {
        it("returns the parent rule for a declaration inside a rule", () => {
            expect.hasAssertions();

            const root = postcss.parse("a { color: red; }");
            const rule = root.first as Rule;
            const decl = rule.first!;

            expect(getContainingRule(decl)).toBe(rule);
        });

        it("returns undefined when a declaration has no parent rule", () => {
            expect.hasAssertions();

            // Declaration at root level (inside an at-rule, not a rule)
            const root = postcss.parse("@layer base { color: red; }");
            const atRule = root.first as AtRule;
            const decl = atRule.first!;

            expect(getContainingRule(decl)).toBeUndefined();
        });
    });

    describe(getContainingRules, () => {
        it("returns all containing rules from nearest to outermost", () => {
            expect.hasAssertions();

            const root = postcss.parse("a { .b { color: red; } }");
            const outerRule = root.first as Rule;
            const innerRule = outerRule.first as Rule;
            const decl = innerRule.first!;

            const containingRules = getContainingRules(decl);

            // Should return both containing rules (nearest first)
            expect(containingRules.length).toBeGreaterThanOrEqual(1);
            expect(containingRules[0]).toBe(innerRule);
        });

        it("returns an empty array when there are no containing rules", () => {
            expect.hasAssertions();

            const root = postcss.parse("@layer base { color: red; }");
            const atRule = root.first as AtRule;
            const decl = atRule.first!;

            expect(getContainingRules(decl)).toStrictEqual([]);
        });
    });

    describe(walkThemeScopeDeclarations, () => {
        it("visits declarations directly inside a rule", () => {
            expect.hasAssertions();

            const root = postcss.parse("a { color: red; font-size: 1rem; }");
            const rule = root.first as Rule;
            const collected: string[] = [];

            walkThemeScopeDeclarations(rule, (decl) => {
                collected.push(decl.prop);
            });

            expect(collected).toStrictEqual(["color", "font-size"]);
        });

        it("recurses into at-rules to visit nested declarations", () => {
            expect.hasAssertions();

            const root = postcss.parse(
                "@supports (display: grid) { color: red; }"
            );
            const atRule = root.first as AtRule;
            const collected: string[] = [];

            walkThemeScopeDeclarations(atRule, (decl) => {
                collected.push(decl.prop);
            });

            expect(collected).toContain("color");
        });

        it("does NOT recurse into nested child rules", () => {
            expect.hasAssertions();

            const root = postcss.parse(
                "a { color: red; .nested { font-size: 1rem; } }"
            );
            const rule = root.first as Rule;
            const collected: string[] = [];

            walkThemeScopeDeclarations(rule, (decl) => {
                collected.push(decl.prop);
            });

            // Should see "color" but NOT "font-size" (it's inside a nested rule)
            expect(collected).toStrictEqual(["color"]);
        });
    });

    describe(isAllowedThemeScopeRule, () => {
        it("allows a rule whose selector is :root", () => {
            expect.hasAssertions();

            // :root is a standard Docusaurus theme scope selector
            const rule = postcss.rule({ selector: ":root" });

            expect(isAllowedThemeScopeRule(rule)).toBeTruthy();
        });

        it("allows a rule with [data-theme='dark'] selector", () => {
            expect.hasAssertions();

            const rule = postcss.rule({
                selector: "[data-theme='dark']",
            });

            expect(isAllowedThemeScopeRule(rule)).toBeTruthy();
        });

        it("rejects a rule whose selector is not an allowed theme scope", () => {
            expect.hasAssertions();

            const rule = postcss.rule({ selector: ".navbar" });

            expect(isAllowedThemeScopeRule(rule)).toBeFalsy();
        });
    });
});
