import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import {
    extractMarkdownLinkMatches,
    normalizeLink,
    parsePositiveIntegerFlag,
    resolveExistingPathCandidate,
} from "../scripts/check-doc-links.mjs";

describe("check-doc-links script helpers", () => {
    it("ignores markdown-looking links inside inline code spans and fenced code blocks", () => {
        expect.hasAssertions();

        const linkMatches = extractMarkdownLinkMatches(`
Use [SECURITY.md](./SECURITY.md).

- \`:gitmoji: [type](scope?): subject\`

~~~md
[Ignore me](./code-example.md)
~~~
        `);

        expect(linkMatches.map((match) => match[1])).toStrictEqual([
            "./SECURITY.md",
        ]);
    });

    it("ignores markdown-looking links inside indented fenced code blocks that use longer closing fences", () => {
        expect.hasAssertions();

        const linkMatches = extractMarkdownLinkMatches(`
Use [SECURITY.md](./SECURITY.md).

   \`\`\`md
   [Ignore me](./indented-code-example.md)
   \`\`\`\`
        `);

        expect(linkMatches.map((match) => match[1])).toStrictEqual([
            "./SECURITY.md",
        ]);
    });

    it("extracts raw HTML anchor destinations from prose while ignoring anchors inside fenced code", async () => {
        expect.hasAssertions();

        const checkDocLinksModule =
            (await import("../scripts/check-doc-links.mjs")) as {
                extractHtmlAnchorLinks: (content: string) => readonly string[];
            };

        const htmlLinks = checkDocLinksModule.extractHtmlAnchorLinks(`
Use <a href="./README.md">the README</a>.
Or <a href='./docs/rules/overview.md'>overview</a>.

~~~html
<a href="./ignore-me.md">Ignore me</a>
~~~
        `);

        expect(htmlLinks).toStrictEqual([
            "./README.md",
            "./docs/rules/overview.md",
        ]);
    });

    it("normalizes valid inline-link destinations that include markdown titles", () => {
        expect.hasAssertions();

        expect(normalizeLink('./README.md "Repository homepage"')).toBe(
            "./README.md"
        );
        expect(normalizeLink('<./docs/rules/overview.md> "Overview"')).toBe(
            "./docs/rules/overview.md"
        );
    });

    it("parses documented numeric flags in both equals and spaced forms", () => {
        expect.hasAssertions();

        expect(
            parsePositiveIntegerFlag(["--concurrency=25"], "--concurrency", 50)
        ).toBe(25);
        expect(
            parsePositiveIntegerFlag(
                ["--concurrency", "25"],
                "--concurrency",
                50
            )
        ).toBe(25);
        expect(
            parsePositiveIntegerFlag(
                ["--max-path-display=80"],
                "--max-path-display",
                50,
                ["--max-path"]
            )
        ).toBe(80);
        expect(
            parsePositiveIntegerFlag(
                ["--max-path", "80"],
                "--max-path-display",
                50,
                ["--max-path"]
            )
        ).toBe(80);
    });

    it("rejects malformed explicit numeric flag values instead of silently falling back", () => {
        expect.hasAssertions();

        expect(() =>
            parsePositiveIntegerFlag(
                ["--concurrency=10workers"],
                "--concurrency",
                50
            )
        ).toThrow("Invalid value for --concurrency: 10workers");
        expect(() =>
            parsePositiveIntegerFlag(
                ["--concurrency", "10.5"],
                "--concurrency",
                50
            )
        ).toThrow("Invalid value for --concurrency: 10.5");
        expect(() =>
            parsePositiveIntegerFlag(
                ["--max-path-display=0"],
                "--max-path-display",
                50,
                ["--max-path"]
            )
        ).toThrow("--max-path-display must be a positive integer: 0");
        expect(() =>
            parsePositiveIntegerFlag(
                ["--max-path-display"],
                "--max-path-display",
                50,
                ["--max-path"]
            )
        ).toThrow("Invalid value for --max-path-display: (empty)");
    });

    it("requires links to resolve to files instead of bare directories", async () => {
        expect.hasAssertions();

        const temporaryDirectoryPath = await mkdtemp(
            path.join(tmpdir(), "stylelint-plugin-docusaurus-check-doc-links-")
        );

        try {
            const markdownPath = path.join(temporaryDirectoryPath, "guide.md");
            const linkedDirectoryPath = path.join(
                temporaryDirectoryPath,
                "plain-dir"
            );
            const indexedDirectoryPath = path.join(
                temporaryDirectoryPath,
                "indexed-dir"
            );

            await writeFile(markdownPath, "# Guide\n", "utf8");
            await mkdir(linkedDirectoryPath, { recursive: true });
            await mkdir(indexedDirectoryPath, { recursive: true });
            await writeFile(
                path.join(indexedDirectoryPath, "index.md"),
                "# Indexed\n",
                "utf8"
            );

            await expect(
                resolveExistingPathCandidate(markdownPath, "./plain-dir")
            ).resolves.toBeUndefined();
            await expect(
                resolveExistingPathCandidate(markdownPath, "./indexed-dir")
            ).resolves.toBe(path.join(indexedDirectoryPath, "index.md"));
        } finally {
            await rm(temporaryDirectoryPath, {
                force: true,
                recursive: true,
            });
        }
    });
});
