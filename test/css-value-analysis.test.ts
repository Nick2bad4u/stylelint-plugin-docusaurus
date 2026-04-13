import { describe, expect, it } from "vitest";

import {
    cssValueHasCustomPropertyReference,
    cssValueHasStandaloneIdentifier,
} from "../src/_internal/css-value-analysis.js";

describe("css value analysis helpers", () => {
    it("treats var() function names case-insensitively", () => {
        expect.hasAssertions();

        expect(
            cssValueHasCustomPropertyReference(
                "VAR(--ifm-navbar-background-color)",
                "--ifm-navbar-background-color"
            )
        ).toBe(true);
    });

    it("treats standalone CSS keywords case-insensitively", () => {
        expect.hasAssertions();

        expect(
            cssValueHasStandaloneIdentifier("REVERT-LAYER", "revert-layer")
        ).toBe(true);
    });

    it("does not treat raw url() contents as standalone identifiers", () => {
        expect.hasAssertions();

        expect(
            cssValueHasStandaloneIdentifier(
                "url(/assets/revert-layer.svg)",
                "revert-layer"
            )
        ).toBe(false);
    });
});
