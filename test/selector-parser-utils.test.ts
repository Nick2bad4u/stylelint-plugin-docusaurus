import { describe, expect, it } from "vitest";

import {
    getSelectors,
    parseSelectorList,
    selectorHasAttributeInPositiveScope,
    selectorHasClassInPositiveScope,
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
        ).toBe(false);
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
        ).toBe(true);
    });

    it("does not treat attributes hidden inside :not(...) as positive attribute matches", () => {
        expect.hasAssertions();

        expect(
            selectorHasAttributeInPositiveScope(
                getFirstSelector(":not([data-theme='dark']) .DocSearch-Button"),
                (attributeNode) =>
                    attributeNode.attribute.toLowerCase() === "data-theme"
            )
        ).toBe(false);
    });
});
