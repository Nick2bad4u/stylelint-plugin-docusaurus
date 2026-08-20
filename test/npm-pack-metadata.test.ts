import { spawnSync } from "node:child_process";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import {
    isDirectExecution,
    resolvePackedTarballFilename,
} from "../scripts/npm-pack-metadata.mjs";

describe("npm pack metadata normalization", () => {
    it("supports npm 11 array-shaped metadata", () => {
        expect.hasAssertions();

        expect(
            resolvePackedTarballFilename([
                {
                    filename: "stylelint-plugin-docusaurus-2.0.5.tgz",
                },
            ])
        ).toBe("stylelint-plugin-docusaurus-2.0.5.tgz");
    });

    it("supports npm 12 package-keyed metadata", () => {
        expect.hasAssertions();

        expect(
            resolvePackedTarballFilename({
                "stylelint-plugin-docusaurus": {
                    filename: "stylelint-plugin-docusaurus-2.0.5.tgz",
                },
            })
        ).toBe("stylelint-plugin-docusaurus-2.0.5.tgz");
    });

    it.each([
        null,
        [],
        [{ filename: "one.tgz" }, { filename: "two.tgz" }],
        { package: { filename: "../package.tgz" } },
        { package: { filename: String.raw`C:\temp\package.tgz` } },
        { package: { filename: "package.zip" } },
        { package: {} },
    ])("rejects ambiguous or unsafe metadata: %j", (metadata) => {
        expect.hasAssertions();

        expect(() => resolvePackedTarballFilename(metadata)).toThrow(
            "Expected npm pack metadata"
        );
    });

    it("uses a direct-execution guard", () => {
        expect.hasAssertions();

        const scriptPath = path.resolve("scripts", "npm-pack-metadata.mjs");
        const scriptUrl = pathToFileURL(scriptPath).href;

        expect(
            isDirectExecution({
                argvEntry: scriptPath,
                currentImportUrl: scriptUrl,
            })
        ).toBe(true);
        expect(
            isDirectExecution({
                argvEntry: path.resolve("test", "npm-pack-metadata.test.ts"),
                currentImportUrl: scriptUrl,
            })
        ).toBe(false);
    });

    it("rejects CLI-provided filesystem paths", () => {
        expect.hasAssertions();

        const result = spawnSync(
            process.execPath,
            ["scripts/npm-pack-metadata.mjs", "../outside.json"],
            {
                encoding: "utf8",
            }
        );

        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain(
            "This release helper does not accept filesystem paths."
        );
    });
});
