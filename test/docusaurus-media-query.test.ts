import { describe, expect, it } from "vitest";

import {
    docusaurusDesktopNavbarMinWidthPx,
    mediaQueryProvidesMinimumWidth,
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
});
