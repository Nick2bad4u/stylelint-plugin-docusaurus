import { describe, expect, it } from "vitest";

import {
    getSelectors,
    parseSelectorList,
    selectorHasAttributeInPositiveScope,
    selectorHasClassInPositiveScope,
} from "../src/_internal/selector-parser-utils.js";

import {
    getAttributeNamesOutsideGlobal,
    getClassNamesOutsideGlobal,
    getIdNamesOutsideGlobal,
    getTypeNamesOutsideGlobal,
    selectorHasAttribute,
    selectorHasAttributeOutsideGlobal,
    selectorHasClass,
    selectorHasClassOutsideGlobal,
    selectorHasId,
    selectorHasIdOutsideGlobal,
    selectorHasNesting,
    selectorTrailingCompoundHasClass,
} from "../src/_internal/selector-parser-utils.js";

function getFirstSelector(selectorList: string) {
    const parsedSelectorList = parseSelectorList(selectorList);

    expect(parsedSelectorList).toBeDefined();

    const [selector] = getSelectors(parsedSelectorList!);

    expect(selector).toBeDefined();

    return selector!;
}

describe("selector-parser-utils positive-scope matching", () => {
    it("does not treat classes hidden inside :not(...) as positive class matches", () => {
        expect.hasAssertions();

        expect(
            selectorHasClassInPositiveScope(
                getFirstSelector(":not(.navbar--dark) .DocSearch-Button"),
                (className) => className === "navbar--dark"
            )
        ).toBeFalsy();
    });

    it("still treats classes inside positive wrappers such as :is(...) as positive class matches", () => {
        expect.hasAssertions();

        expect(
            selectorHasClassInPositiveScope(
                getFirstSelector(
                    ":is(.navbar--dark, .theme-layout-navbar) .DocSearch-Button"
                ),
                (className) => className === "navbar--dark"
            )
        ).toBeTruthy();
    });

    it("does not treat attributes hidden inside :not(...) as positive attribute matches", () => {
        expect.hasAssertions();

        expect(
            selectorHasAttributeInPositiveScope(
                getFirstSelector(":not([data-theme='dark']) .DocSearch-Button"),
                (attributeNode) =>
                    attributeNode.attribute.toLowerCase() === "data-theme"
            )
        ).toBeFalsy();
    });
});

describe("selector-parser-utils selectorHasClass / selectorHasId / selectorHasAttribute / selectorHasNesting", () => {
    it("selectorHasClass returns true when a class matches the predicate", () => {
        expect.hasAssertions();

        expect(
            selectorHasClass(
                getFirstSelector(".navbar .DocSearch"),
                (cls) => cls === "DocSearch"
            )
        ).toBe(true);
    });

    it("selectorHasClass returns false when no class matches the predicate", () => {
        expect.hasAssertions();

        expect(
            selectorHasClass(
                getFirstSelector(".navbar .DocSearch"),
                (cls) => cls === "missing"
            )
        ).toBe(false);
    });

    it("selectorHasClassOutsideGlobal returns true for a class outside :global()", () => {
        expect.hasAssertions();

        expect(
            selectorHasClassOutsideGlobal(
                getFirstSelector(".navbar"),
                (cls) => cls === "navbar"
            )
        ).toBe(true);
    });

    it("selectorHasClassOutsideGlobal returns false for a class inside :global()", () => {
        expect.hasAssertions();

        expect(
            selectorHasClassOutsideGlobal(
                getFirstSelector(":global(.navbar)"),
                (cls) => cls === "navbar"
            )
        ).toBe(false);
    });

    it("selectorHasId returns true when an id matches the predicate", () => {
        expect.hasAssertions();

        expect(
            selectorHasId(
                getFirstSelector("#__docusaurus .main"),
                (id) => id === "__docusaurus"
            )
        ).toBe(true);
    });

    it("selectorHasId returns false when no id matches the predicate", () => {
        expect.hasAssertions();

        expect(
            selectorHasId(
                getFirstSelector(".main"),
                (id) => id === "__docusaurus"
            )
        ).toBe(false);
    });

    it("selectorHasIdOutsideGlobal returns true for an id outside :global()", () => {
        expect.hasAssertions();

        expect(
            selectorHasIdOutsideGlobal(
                getFirstSelector("#my-section h2"),
                (id) => id === "my-section"
            )
        ).toBe(true);
    });

    it("selectorHasIdOutsideGlobal returns false for an id inside :global()", () => {
        expect.hasAssertions();

        expect(
            selectorHasIdOutsideGlobal(
                getFirstSelector(":global(#my-section) h2"),
                (id) => id === "my-section"
            )
        ).toBe(false);
    });

    it("selectorHasAttribute returns true when an attribute matches the predicate", () => {
        expect.hasAssertions();

        expect(
            selectorHasAttribute(
                getFirstSelector("[data-theme='dark'] .nav"),
                (attr) => attr.attribute === "data-theme"
            )
        ).toBe(true);
    });

    it("selectorHasAttribute returns false when no attribute matches the predicate", () => {
        expect.hasAssertions();

        expect(
            selectorHasAttribute(
                getFirstSelector(".nav"),
                (attr) => attr.attribute === "data-theme"
            )
        ).toBe(false);
    });

    it("selectorHasAttributeOutsideGlobal returns true for an attribute outside :global()", () => {
        expect.hasAssertions();

        expect(
            selectorHasAttributeOutsideGlobal(
                getFirstSelector("[data-theme='dark'] .nav"),
                (attr) => attr.attribute === "data-theme"
            )
        ).toBe(true);
    });

    it("selectorHasAttributeOutsideGlobal returns false for an attribute inside :global()", () => {
        expect.hasAssertions();

        expect(
            selectorHasAttributeOutsideGlobal(
                getFirstSelector(":global([data-theme='dark']) .nav"),
                (attr) => attr.attribute === "data-theme"
            )
        ).toBe(false);
    });

    it("selectorHasNesting returns true for a selector with nesting (&)", () => {
        expect.hasAssertions();

        expect(selectorHasNesting(getFirstSelector("& .child"))).toBe(true);
    });

    it("selectorHasNesting returns false for a selector without nesting", () => {
        expect.hasAssertions();

        expect(selectorHasNesting(getFirstSelector(".parent .child"))).toBe(
            false
        );
    });

    it("selectorTrailingCompoundHasClass returns true when the last compound has the class", () => {
        expect.hasAssertions();

        expect(
            selectorTrailingCompoundHasClass(
                getFirstSelector(".parent .DocSearch"),
                (cls) => cls === "DocSearch"
            )
        ).toBe(true);
    });

    it("selectorTrailingCompoundHasClass returns false when the trailing compound lacks the class", () => {
        expect.hasAssertions();

        expect(
            selectorTrailingCompoundHasClass(
                getFirstSelector(".DocSearch .child"),
                (cls) => cls === "DocSearch"
            )
        ).toBe(false);
    });
});

describe("selector-parser-utils outside-global collection helpers", () => {
    it("getClassNamesOutsideGlobal returns class names not wrapped in :global()", () => {
        expect.hasAssertions();

        const parsed = parseSelectorList(".navbar :global(.hidden) .visible");

        expect(parsed).toBeDefined();

        const classNames = getClassNamesOutsideGlobal(parsed!);

        expect(classNames).toContain("navbar");
        expect(classNames).toContain("visible");
        expect(classNames).not.toContain("hidden");
    });

    it("getIdNamesOutsideGlobal returns id names not wrapped in :global()", () => {
        expect.hasAssertions();

        const parsed = parseSelectorList("#visible :global(#hidden) .child");

        expect(parsed).toBeDefined();

        const idNames = getIdNamesOutsideGlobal(parsed!);

        expect(idNames).toContain("visible");
        expect(idNames).not.toContain("hidden");
    });

    it("getTypeNamesOutsideGlobal returns type names not wrapped in :global()", () => {
        expect.hasAssertions();

        const parsed = parseSelectorList("article :global(span) div");

        expect(parsed).toBeDefined();

        const typeNames = getTypeNamesOutsideGlobal(parsed!);

        expect(typeNames).toContain("article");
        expect(typeNames).toContain("div");
        expect(typeNames).not.toContain("span");
    });

    it("getAttributeNamesOutsideGlobal returns attribute names not wrapped in :global()", () => {
        expect.hasAssertions();

        const parsed = parseSelectorList(
            "[data-visible] :global([data-hidden]) .child"
        );

        expect(parsed).toBeDefined();

        const attrNames = getAttributeNamesOutsideGlobal(parsed!);

        expect(attrNames).toContain("data-visible");
        expect(attrNames).not.toContain("data-hidden");
    });
});
