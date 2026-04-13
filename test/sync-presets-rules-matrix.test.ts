import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it, vi } from "vitest";

import {
    getConfigDocPath,
    isDirectExecution,
    normalizeConfigNames,
    runCli,
} from "../scripts/sync-presets-rules-matrix.mjs";

describe("sync-presets-rules-matrix legacy alias", () => {
    it("re-exports the config-matrix helper surface through the deprecated alias", () => {
        expect.hasAssertions();

        expect(getConfigDocPath("strict", "C:/repo")).toBe(
            String.raw`C:\repo\docs\rules\configs\strict.md`
        );
        expect(
            normalizeConfigNames(
                [
                    "recommended",
                    "strict",
                    "recommended",
                ],
                {
                    recommended: {},
                    strict: {},
                }
            )
        ).toStrictEqual(["recommended", "strict"]);
    });

    it("warns once and delegates to the config-matrix CLI in legacy mode", async () => {
        expect.hasAssertions();

        const warn = vi.fn<(message: string) => void>();
        const runConfigMatrixCli = vi.fn<() => Promise<undefined>>(() =>
            Promise.resolve(undefined)
        );

        await runCli({
            runConfigMatrixCli,
            warn,
        });

        expect(warn).toHaveBeenCalledExactlyOnceWith(
            "sync-presets-rules-matrix.mjs is deprecated in this Stylelint template. Use sync-configs-rules-matrix.mjs instead."
        );
        expect(runConfigMatrixCli).toHaveBeenCalledWith({
            legacyAlias: true,
        });
    });

    it("exposes a direct-execution guard so imports do not run the alias CLI", () => {
        expect.hasAssertions();

        const scriptPath = path.resolve(
            "scripts",
            "sync-presets-rules-matrix.mjs"
        );
        const scriptUrl = pathToFileURL(scriptPath).href;

        expect(
            isDirectExecution({
                argvEntry: scriptPath,
                currentImportUrl: scriptUrl,
            })
        ).toBeTruthy();
        expect(
            isDirectExecution({
                argvEntry: path.resolve(
                    "test",
                    "sync-presets-rules-matrix.test.ts"
                ),
                currentImportUrl: scriptUrl,
            })
        ).toBeFalsy();
    });
});
