import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import {
    createWorkspaceMetadataJson,
    generateDevToolsWorkspaceMetadata,
    isDirectExecution,
    readExistingUuid,
    selectWorkspaceUuid,
} from "../scripts/generate-devtools-workspace-metadata.mjs";

describe("generate-devtools-workspace-metadata helpers", () => {
    it("reuses only canonical existing UUID values unless regeneration is requested", () => {
        expect.hasAssertions();

        const replacementUuid = "123e4567-e89b-42d3-a456-426614174111";

        expect(
            selectWorkspaceUuid({
                cliArgs: [],
                createUuid: () => replacementUuid,
                existingUuid: "123e4567-e89b-42d3-a456-426614174000",
            })
        ).toBe("123e4567-e89b-42d3-a456-426614174000");

        expect(
            selectWorkspaceUuid({
                cliArgs: [],
                createUuid: () => replacementUuid,
                existingUuid: "not-a-uuid",
            })
        ).toBe(replacementUuid);

        expect(
            selectWorkspaceUuid({
                cliArgs: ["--regenerate"],
                createUuid: () => replacementUuid,
                existingUuid: "123e4567-e89b-42d3-a456-426614174000",
            })
        ).toBe(replacementUuid);
    });

    it("throws when an existing metadata file contains an invalid persisted UUID", () => {
        expect.hasAssertions();

        mkdirSync("temp", { recursive: true });

        const tempRoot = mkdtempSync(
            path.resolve("temp", "devtools-metadata-")
        );
        const packageJsonPath = path.resolve(tempRoot, "package.json");
        const metadataOutputPath = path.resolve(
            tempRoot,
            "docs",
            "docusaurus",
            "static",
            ".well-known",
            "appspecific",
            "com.chrome.devtools.json"
        );
        const replacementUuid = "123e4567-e89b-42d3-a456-426614174111";

        writeFileSync(
            packageJsonPath,
            '{"name":"fixture-devtools-workspace"}\n'
        );
        mkdirSync(path.dirname(metadataOutputPath), { recursive: true });
        writeFileSync(
            metadataOutputPath,
            '{"workspace":{"uuid":"broken-uuid"}}\n'
        );

        expect(() =>
            generateDevToolsWorkspaceMetadata({
                cliArgs: [],
                createUuid: () => replacementUuid,
                metadataOutputPath,
                packageJsonPath,
                repositoryRootPath: String.raw`C:\Workspace\Example Repo`,
            })
        ).toThrow(
            `Existing DevTools workspace metadata file contains an invalid workspace.uuid: ${metadataOutputPath}. Fix the file or rerun with --regenerate to replace it.`
        );
        expect(readFileSync(metadataOutputPath, "utf8")).toBe(
            '{"workspace":{"uuid":"broken-uuid"}}\n'
        );
    });

    it("allows --regenerate to replace malformed persisted metadata explicitly", () => {
        expect.hasAssertions();

        mkdirSync("temp", { recursive: true });

        const tempRoot = mkdtempSync(
            path.resolve("temp", "devtools-metadata-")
        );
        const packageJsonPath = path.resolve(tempRoot, "package.json");
        const metadataOutputPath = path.resolve(
            tempRoot,
            "docs",
            "docusaurus",
            "static",
            ".well-known",
            "appspecific",
            "com.chrome.devtools.json"
        );
        const replacementUuid = "123e4567-e89b-42d3-a456-426614174111";

        writeFileSync(
            packageJsonPath,
            '{"name":"fixture-devtools-workspace"}\n'
        );
        mkdirSync(path.dirname(metadataOutputPath), { recursive: true });
        writeFileSync(
            metadataOutputPath,
            '{"workspace":{"uuid":"broken-uuid"}}\n'
        );

        const result = generateDevToolsWorkspaceMetadata({
            cliArgs: ["--regenerate"],
            createUuid: () => replacementUuid,
            metadataOutputPath,
            packageJsonPath,
            repositoryRootPath: String.raw`C:\Workspace\Example Repo`,
        });
        const writtenMetadata = JSON.parse(
            readFileSync(metadataOutputPath, "utf8")
        ) as {
            workspace?: {
                root?: string;
                uuid?: string;
            };
        };

        expect(result).toStrictEqual({
            metadataOutputPath,
            packageName: "fixture-devtools-workspace",
            repositoryRoot: String.raw`C:\Workspace\Example Repo`,
            workspaceUuid: replacementUuid,
        });
        expect(readExistingUuid(metadataOutputPath)).toBe(replacementUuid);
        expect(writtenMetadata).toStrictEqual({
            workspace: {
                root: "C:/Workspace/Example Repo",
                uuid: replacementUuid,
            },
        });
    });

    it("exposes a direct-execution guard so imports do not trigger writes", () => {
        expect.hasAssertions();

        const scriptPath = path.resolve(
            "scripts",
            "generate-devtools-workspace-metadata.mjs"
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
                    "generate-devtools-workspace-metadata.test.ts"
                ),
                currentImportUrl: scriptUrl,
            })
        ).toBeFalsy();
    });

    it("serializes workspace metadata with normalized forward slashes", () => {
        expect.hasAssertions();

        expect(
            createWorkspaceMetadataJson({
                repositoryRootPath: String.raw`C:\Workspace\Example Repo`,
                workspaceUuid: "123e4567-e89b-42d3-a456-426614174000",
            })
        ).toContain('"root": "C:/Workspace/Example Repo"');
    });
});
