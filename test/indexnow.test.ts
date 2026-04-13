import { describe, expect, it } from "vitest";

import * as indexNowModule from "../scripts/indexnow.mjs";

const {
    collectRouteManifestEntriesFromData,
    normalizeDocusaurusSourcePath,
    resolveChangedUrlsFromManifest,
} = indexNowModule;

describe("indexNow route-manifest helpers", () => {
    it("rejects route sources that escape the configured Docusaurus site directory", () => {
        expect.hasAssertions();

        const manifestEntries = collectRouteManifestEntriesFromData({
            permalink: "/malicious/",
            source: "@site/../../package.json",
        });

        expect(manifestEntries).toStrictEqual([]);
    });

    it("rejects route sources that resolve to directories instead of files", () => {
        expect.hasAssertions();

        const manifestEntries = collectRouteManifestEntriesFromData({
            permalink: "/directory-source/",
            source: "@site/src",
        });

        expect(manifestEntries).toStrictEqual([]);
    });

    it("keeps valid Docusaurus source files inside the site directory", () => {
        expect.hasAssertions();

        expect(normalizeDocusaurusSourcePath("@site/src/pages/index.jsx")).toBe(
            "docs/docusaurus/src/pages/index.tsx"
        );
    });

    it("resolves all manifest permalinks for a changed source file instead of collapsing to one route", () => {
        expect.hasAssertions();

        expect(
            resolveChangedUrlsFromManifest({
                changedPaths: ["docs/docusaurus/blog/example.md"],
                manifestEntries: [
                    {
                        permalink: "/stylelint-plugin-docusaurus/blog/example/",
                        sourcePath: "docs/docusaurus/blog/example.md",
                    },
                    {
                        permalink:
                            "/stylelint-plugin-docusaurus/blog/tags/example/",
                        sourcePath: "docs/docusaurus/blog/example.md",
                    },
                ],
                siteUrl:
                    "https://nick2bad4u.github.io/stylelint-plugin-docusaurus/",
            })
        ).toStrictEqual([
            "https://nick2bad4u.github.io/stylelint-plugin-docusaurus/blog/example/",
            "https://nick2bad4u.github.io/stylelint-plugin-docusaurus/blog/tags/example/",
        ]);
    });

    it("deduplicates identical resolved URLs even when the manifest repeats the same source-permalink pair", () => {
        expect.hasAssertions();

        expect(
            resolveChangedUrlsFromManifest({
                changedPaths: ["docs/rules/overview.md"],
                manifestEntries: [
                    {
                        permalink:
                            "/stylelint-plugin-docusaurus/docs/rules/overview",
                        sourcePath: "docs/rules/overview.md",
                    },
                    {
                        permalink:
                            "/stylelint-plugin-docusaurus/docs/rules/overview",
                        sourcePath: "docs/rules/overview.md",
                    },
                ],
                siteUrl:
                    "https://nick2bad4u.github.io/stylelint-plugin-docusaurus/",
            })
        ).toStrictEqual([
            "https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/overview",
        ]);
    });

    it("requires strictly numeric positive integers for CLI numeric options", () => {
        expect.hasAssertions();

        const parsePositiveInteger = Reflect.get(
            indexNowModule,
            "parsePositiveInteger"
        ) as
            | ((
                  rawValue: string | undefined,
                  defaultValue: number,
                  label: string
              ) => number)
            | undefined;

        expect(parsePositiveInteger).toBeTypeOf("function");

        expect(parsePositiveInteger?.(undefined, 25, "Batch size")).toBe(25);
        expect(parsePositiveInteger?.(" 0042 ", 25, "Batch size")).toBe(42);

        for (const invalidValue of [
            "0",
            "10.5",
            "1e3",
            "15000ms",
            "+5",
        ]) {
            expect(() =>
                parsePositiveInteger?.(invalidValue, 25, "Batch size")
            ).toThrowError("Batch size must be a positive integer.");
        }
    });
});
