import postcss from "postcss";
import { describe, expect, it } from "vitest";

import {
    getSourceFilePath,
    isCssModuleFilePath,
    isCssModuleRoot,
    normalizeSourceFilePath,
} from "../src/_internal/source-file-context.js";

describe("source-file-context helpers", () => {
    describe("getSourceFilePath", () => {
        it("returns undefined when filePath is an empty string", () => {
            expect.hasAssertions();

            // PostCSS treats from:"" as falsy, so input.file stays undefined (typeof check fires).
            // To exercise the filePath.length === 0 branch we inject the empty string manually.
            const root = postcss.parse("a { color: red; }");

            if (root.source) {
                (root.source.input as unknown as { file: string }).file = "";
            }

            expect(getSourceFilePath(root)).toBeUndefined();
        });

        it("returns undefined when source is undefined", () => {
            expect.hasAssertions();

            const root = postcss.parse("a { color: red; }");

            (root as { source?: unknown }).source = undefined;

            expect(getSourceFilePath(root)).toBeUndefined();
        });

        it("returns a defined forward-slash-only path for a valid from option", () => {
            expect.hasAssertions();

            // PostCSS resolves relative paths to absolute paths on all platforms.
            // We only verify the result is defined, is a string, and contains no backslashes.
            const root = postcss.parse("a { color: red; }", {
                from: "src/styles/main.css",
            });

            const result = getSourceFilePath(root);

            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
            expect(result).not.toContain("\\");
            expect(result).toMatch(/src\/styles\/main\.css$/u);
        });

        it("converts backslashes to forward slashes in the returned path", () => {
            expect.hasAssertions();

            // Use a Windows-style backslash path. PostCSS resolves it to an absolute
            // path (with OS-native separators), then normalizeSourceFilePath converts
            // all backslashes to forward slashes.
            const root = postcss.parse("a { color: red; }", {
                from: "src\\styles\\main.css",
            });

            const result = getSourceFilePath(root);

            expect(result).toBeDefined();
            // The returned path must never contain a Windows backslash
            expect(result).not.toContain("\\");
        });
    });

    describe("isCssModuleFilePath", () => {
        it("returns true for a .module.css path", () => {
            expect.hasAssertions();

            expect(isCssModuleFilePath("src/Button.module.css")).toBe(true);
        });

        it("returns true for a .module.scss path", () => {
            expect.hasAssertions();

            expect(isCssModuleFilePath("src/Button.module.scss")).toBe(true);
        });

        it("returns false for a plain .css path", () => {
            expect.hasAssertions();

            expect(isCssModuleFilePath("src/global.css")).toBe(false);
        });

        it("returns false for undefined", () => {
            expect.hasAssertions();

            expect(isCssModuleFilePath(undefined)).toBe(false);
        });
    });

    describe("isCssModuleRoot", () => {
        it("returns true when the root was parsed from a .module.css file", () => {
            expect.hasAssertions();

            const root = postcss.parse("a { color: red; }", {
                from: "src/Button.module.css",
            });

            expect(isCssModuleRoot(root)).toBe(true);
        });

        it("returns false when the root was parsed from a plain .css file", () => {
            expect.hasAssertions();

            const root = postcss.parse("a { color: red; }", {
                from: "src/global.css",
            });

            expect(isCssModuleRoot(root)).toBe(false);
        });
    });

    describe("normalizeSourceFilePath", () => {
        it("converts backslashes to forward slashes", () => {
            expect.hasAssertions();

            expect(
                normalizeSourceFilePath("src\\styles\\components\\Button.css")
            ).toBe("src/styles/components/Button.css");
        });

        it("leaves forward-slash paths unchanged", () => {
            expect.hasAssertions();

            expect(
                normalizeSourceFilePath("src/styles/components/Button.css")
            ).toBe("src/styles/components/Button.css");
        });

        it("handles mixed separators", () => {
            expect.hasAssertions();

            expect(normalizeSourceFilePath("src\\styles/main.css")).toBe(
                "src/styles/main.css"
            );
        });
    });
});
