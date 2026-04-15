import { describe, expect, it } from "vitest";

import {
    getDeclaredCascadeLayerNames,
    getImportedCascadeLayerNames,
} from "../src/_internal/cascade-layer-analysis.js";

describe("cascade-layer-analysis helpers", () => {
    it("decodes escaped identifiers in declared cascade layer names", () => {
        expect.hasAssertions();

        expect(
            getDeclaredCascadeLayerNames(String.raw`docusaurus\2e infima, app`)
        ).toStrictEqual(["docusaurus.infima", "app"]);
    });

    it("decodes escaped import layer() identifiers and targets", () => {
        expect.hasAssertions();

        expect(
            getImportedCascadeLayerNames(
                String.raw`url('./theme.css') \6c ayer(docusaurus\2e widgets)`
            )
        ).toStrictEqual(["docusaurus.widgets"]);
    });

    it("skips quoted strings when scanning imported layer names", () => {
        expect.hasAssertions();

        // The quoted URL string at the start should be skipped over (lines 26-27)
        expect(
            getImportedCascadeLayerNames('"theme.css" layer(app)')
        ).toStrictEqual(["app"]);
    });

    it("skips block comments when scanning imported layer names", () => {
        expect.hasAssertions();

        // A block comment before the layer(...) call should be skipped (lines 31-32)
        expect(
            getImportedCascadeLayerNames("/* comment */ layer(app)")
        ).toStrictEqual(["app"]);
    });

    it("gracefully handles a lone backslash in imported parameters", () => {
        expect.hasAssertions();

        // A lone backslash at end: consumeEscapedIdentifier returns undefined (lines 49-50)
        expect(getImportedCascadeLayerNames("\\")).toStrictEqual([]);
    });

    it("stops scanning when a function call has an unclosed parenthesis", () => {
        expect.hasAssertions();

        // FindMatchingClosingParenthesis returns undefined → break (line 72)
        expect(getImportedCascadeLayerNames("layer(unclosed")).toStrictEqual(
            []
        );
    });

    it("skips quoted strings in comma-separated declared layer names", () => {
        expect.hasAssertions();

        // A quoted string token inside the layer list is skipped (splitTopLevelCommaSeparatedValues)
        expect(getDeclaredCascadeLayerNames("'quoted', real")).toStrictEqual([
            "real",
        ]);
    });

    it("skips block comments in declared layer names", () => {
        expect.hasAssertions();

        // A block comment is stripped from the layer name text
        expect(
            getDeclaredCascadeLayerNames("/* comment */ real")
        ).toStrictEqual(["real"]);
    });

    it("handles a backslash at the end of a declared layer name string", () => {
        expect.hasAssertions();

        // Backslash at end: escapedCharacter is undefined → decodedText: "" (lines ~112-115)
        expect(getDeclaredCascadeLayerNames("layer\\")).toStrictEqual([
            "layer",
        ]);
    });

    it("decodes an escaped newline in a declared layer name to an empty string", () => {
        expect.hasAssertions();

        // CSS escape: backslash + newline → empty string (lines ~233-234)
        // In JavaScript: "layer\\\n" = "layer" + backslash + newline
        expect(
            // eslint-disable-next-line no-useless-concat -- intentional runtime string with embedded newline
            getDeclaredCascadeLayerNames("layer\\\n" + "layer2")
        ).toStrictEqual(["layerlayer2"]);
    });

    it("decodes a null codepoint escape to the replacement character", () => {
        expect.hasAssertions();

        // CSS escape: \0 (null codepoint) → U+FFFD replacement char (lines ~195-210)
        // "\\0 abc" in JS = backslash + "0" + " " + "abc"
        expect(getDeclaredCascadeLayerNames(String.raw`\0 abc`)).toStrictEqual([
            "\uFFFDabc",
        ]);
    });

    it("decodes a 6-digit hex escape and returns the corresponding character", () => {
        expect.hasAssertions();

        // CSS escape: \000041 = codepoint 65 = "A" (exercises the loop exit at 6-digit limit)
        expect(getDeclaredCascadeLayerNames(String.raw`\000041`)).toStrictEqual(
            ["A"]
        );
    });
});
