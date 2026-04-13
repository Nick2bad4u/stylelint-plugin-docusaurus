import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
    createTypedocExecutionPlan,
    getConfigFileName,
    getTemporaryDriveRoots,
    selectRepositoryTemporarySubstMappings,
} from "../scripts/run-typedoc-docs.mjs";

describe("run-typedoc-docs wrapper", () => {
    it("supports both spaced and equals-style config arguments", () => {
        expect.hasAssertions();

        expect(
            getConfigFileName(["--config", "typedoc.local.config.mjs"])
        ).toBe("typedoc.local.config.mjs");
        expect(getConfigFileName(["--config=typedoc.local.config.mjs"])).toBe(
            "typedoc.local.config.mjs"
        );
        expect(getConfigFileName(["--options=typedoc.config.json"])).toBe(
            "typedoc.config.json"
        );
    });

    it("rejects missing or flag-like config values instead of misparsing them", () => {
        expect.hasAssertions();

        expect(() => getConfigFileName(["--config"])).toThrow(
            "Missing value for CLI argument: --config"
        );
        expect(() => getConfigFileName(["--config", "--help"])).toThrow(
            "Missing value for CLI argument: --config"
        );
        expect(() => getConfigFileName(["--options="])).toThrow(
            "Missing value for CLI argument: --options="
        );
    });

    it("defaults to typedoc.config.json when no config argument is present", () => {
        expect.hasAssertions();

        expect(getConfigFileName([])).toBe("typedoc.config.json");
    });

    it("computes a temporary-drive execution plan only for Windows paths with parentheses", () => {
        expect.hasAssertions();

        expect(
            createTypedocExecutionPlan({
                cliArgs: ["--config=typedoc.local.config.mjs"],
                platform: "win32",
                repositoryRoot:
                    "C:/Users/Nick/Dropbox/PC (2)/Documents/GitHub/stylelint-plugin-docusaurus",
            })
        ).toStrictEqual({
            configFile: "typedoc.local.config.mjs",
            docsWorkspaceDirectory:
                String.raw`C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\stylelint-plugin-docusaurus\docs\docusaurus`,
            docsWorkspaceRelativePath: String.raw`docs\docusaurus`,
            repositoryRoot:
                "C:/Users/Nick/Dropbox/PC (2)/Documents/GitHub/stylelint-plugin-docusaurus",
            useTemporaryDrive: true,
        });

        expect(
            createTypedocExecutionPlan({
                docsWorkspaceDirectory:
                    "/workspaces/stylelint-plugin-docusaurus/docs/docusaurus",
                platform: "linux",
                repositoryRoot: "/workspaces/stylelint-plugin-docusaurus",
            }).useTemporaryDrive
        ).toBeFalsy();
    });

    it("limits stale subst cleanup to reserved temporary drive roots for the repository", () => {
        expect.hasAssertions();

        expect(
            selectRepositoryTemporarySubstMappings(
                "C:/Repo",
                [
                    {
                        driveRoot: "Z:",
                        targetPath: "C:/Repo",
                    },
                    {
                        driveRoot: "Q:",
                        targetPath: "C:/Repo",
                    },
                    {
                        driveRoot: "Y:",
                        targetPath: "C:/Elsewhere",
                    },
                ],
                getTemporaryDriveRoots()
            )
        ).toStrictEqual([
            {
                driveRoot: "Z:",
                targetPath: "C:/Repo",
            },
        ]);
    });

    it("keeps the repository TypeDoc config free of the unsupported themeColor option", () => {
        expect.hasAssertions();

        const typedocConfig = JSON.parse(
            readFileSync(
                resolve("docs", "docusaurus", "typedoc.config.json"),
                "utf8"
            )
        ) as Record<string, unknown>;

        expect(typedocConfig["themeColor"]).toBeUndefined();
    });
});
