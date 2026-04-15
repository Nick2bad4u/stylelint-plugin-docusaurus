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
        ).toBeTruthy();
    });

    it("treats standalone CSS keywords case-insensitively", () => {
        expect.hasAssertions();

        expect(
            cssValueHasStandaloneIdentifier("REVERT-LAYER", "revert-layer")
        ).toBeTruthy();
    });

    it("does not treat raw url() contents as standalone identifiers", () => {
        expect.hasAssertions();

        expect(
            cssValueHasStandaloneIdentifier(
                "url(/assets/revert-layer.svg)",
                "revert-layer"
            )
        ).toBeFalsy();
    });

    it("returns false immediately when the identifier is an empty string (line 29)", () => {
        expect.hasAssertions();

        // identifier.length === 0 early-return path
        expect(cssValueHasStandaloneIdentifier("some value", "")).toBe(false);
    });

    it("does not match identifier text inside a single-quoted string", () => {
        expect.hasAssertions();

        // text inside quotes is stripped to spaces
        expect(
            cssValueHasStandaloneIdentifier("'hello world' target", "hello")
        ).toBe(false);
    });

    it("does not match identifier text inside a double-quoted string", () => {
        expect.hasAssertions();

        expect(
            cssValueHasStandaloneIdentifier('"hello world" target', "hello")
        ).toBe(false);
    });

    it("handles a backslash escape sequence inside a quoted string (isDefined(nextChar) path)", () => {
        expect.hasAssertions();

        // The backslash+n inside the double-quoted string are consumed together (index += 2)
        // "target" outside the quotes is still a standalone identifier
        expect(
            // eslint-disable-next-line no-useless-escape -- intentional CSS escape within quoted value
            cssValueHasStandaloneIdentifier('"hello\\n world" target', "target")
        ).toBe(true);
    });

    it("handles a backslash at the end of a quoted string (undefined nextChar path)", () => {
        expect.hasAssertions();

        // The quoted string "test\ (backslash at end) never closes
        // "test" inside is stripped; result does not match "test"
        // JS string '"test\\' = chars: " t e s t \
        expect(cssValueHasStandaloneIdentifier('"test\\', "test")).toBe(false);
    });

    it("does not treat a function prefixed with an identifier char before 'url' as stripped", () => {
        expect.hasAssertions();

        // "myurl(foo)" has an identifier char 'y' before "url", so tryConsumeNamedFunctionCall
        // returns undefined (line 278) and the content is not stripped
        expect(cssValueHasStandaloneIdentifier("myurl(foo)", "foo")).toBe(true);
    });

    it("strips url() calls that have whitespace before the opening parenthesis", () => {
        expect.hasAssertions();

        // "url  (foo)" has spaces between "url" and "("; the function call is still consumed
        // (lines 282-290 whitespace-skipping loop), so "foo" inside is stripped
        expect(cssValueHasStandaloneIdentifier("url  (foo)", "foo")).toBe(
            false
        );
    });

    it("does not strip a url token that is not followed by a parenthesis (line 294)", () => {
        expect.hasAssertions();

        // "url foo" — "url" is not followed by "(" so tryConsumeNamedFunctionCall returns
        // undefined; "foo" is left in place and matched as standalone
        expect(cssValueHasStandaloneIdentifier("url foo", "foo")).toBe(true);
    });
});
