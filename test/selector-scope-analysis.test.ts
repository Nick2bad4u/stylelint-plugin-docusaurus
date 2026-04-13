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
});
