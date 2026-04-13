import { describe, expect, it } from "vitest";

import {
    getLeadingDocusaurusColorMode,
    isAllowedThemeScopeSelector,
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
});
