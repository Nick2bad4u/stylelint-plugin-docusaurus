import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it, vi } from "vitest";

import {
    assertPreferredVersionSupported,
    isDirectExecution,
    parseArguments,
    resolveMinimumEngineVersion,
    synchronizeNodeVersionFiles,
    validateVersionFiles,
    writeVersionFiles,
} from "../scripts/sync-node-version-files.mjs";

type TempNodeVersionFixtureInput = {
    enginesNode?: string;
    nodeVersion?: string;
    nvmrcVersion?: string;
};

function createTempNodeVersionFixture(input: TempNodeVersionFixtureInput = {}) {
    const enginesNode =
        input.enginesNode === undefined ? ">=22.0.0" : input.enginesNode;
    const nodeVersion =
        input.nodeVersion === undefined ? "25.8.1" : input.nodeVersion;
    const nvmrcVersion =
        input.nvmrcVersion === undefined ? nodeVersion : input.nvmrcVersion;

    mkdirSync("temp", { recursive: true });
    const tempRoot = mkdtempSync(resolve("temp", "sync-node-version-files-"));
    const packageJsonPath = resolve(tempRoot, "package.json");
    const nodeVersionFilePath = resolve(tempRoot, ".node-version");
    const nvmrcFilePath = resolve(tempRoot, ".nvmrc");

    writeFileSync(
        packageJsonPath,
        `${JSON.stringify(
            {
                engines: {
                    node: enginesNode,
                },
            },
            null,
            4
        )}\n`,
        "utf8"
    );
    writeFileSync(nodeVersionFilePath, `${nodeVersion}\n`, "utf8");
    writeFileSync(nvmrcFilePath, `${nvmrcVersion}\n`, "utf8");

    return {
        nvmrcFilePath,
        nodeVersionFilePath,
        packageJsonPath,
    };
}

describe("sync-node-version-files script", () => {
    it("parses the stricter current-version check mode and explicit version overrides", () => {
        expect.hasAssertions();

        expect(
            parseArguments(["--check-current", "--version=25.8.1"])
        ).toStrictEqual({
            checkCurrent: true,
            checkOnly: false,
            explicitVersion: "25.8.1",
        });

        expect(() => parseArguments(["--unknown"])).toThrow(
            "Unknown argument: --unknown"
        );
    });

    it("extracts normalized minimum versions from common >= engines.node ranges", () => {
        expect.hasAssertions();

        expect(
            resolveMinimumEngineVersion({
                node: ">=22",
            })
        ).toBe("22.0.0");
        expect(
            resolveMinimumEngineVersion({
                node: ">=22.5 <26",
            })
        ).toBe("22.5.0");
        expect(
            resolveMinimumEngineVersion({
                node: ">= 22.5.3 <26",
            })
        ).toBe("22.5.3");
    });

    it("keeps ambiguous union ranges opt-out so the guard does not infer the wrong floor", () => {
        expect.hasAssertions();

        expect(
            resolveMinimumEngineVersion({
                node: ">=22 || ^20.0.0",
            })
        ).toBeNull();
    });

    it("writes both Node version files from the preferred runtime version", async () => {
        expect.hasAssertions();

        const logger = { log: vi.fn() };
        const { nvmrcFilePath, nodeVersionFilePath, packageJsonPath } =
            createTempNodeVersionFixture({
                nodeVersion: "24.0.0",
            });

        await expect(
            synchronizeNodeVersionFiles({
                argumentList: [],
                currentRuntimeVersion: "25.8.1",
                logger,
                nvmrcFilePath,
                nodeVersionFilePath,
                packageJsonPath,
            })
        ).resolves.toBe("updated");

        expect(readFileSync(nodeVersionFilePath, "utf8")).toBe("25.8.1\n");
        expect(readFileSync(nvmrcFilePath, "utf8")).toBe("25.8.1\n");
        expect(logger.log).toHaveBeenCalledWith(
            "Synchronized .node-version and .nvmrc to 25.8.1"
        );
    });

    it("catches stale but internally synchronized files in --check-current mode", async () => {
        expect.hasAssertions();

        const { nvmrcFilePath, nodeVersionFilePath, packageJsonPath } =
            createTempNodeVersionFixture({
                nodeVersion: "24.9.0",
            });

        await expect(
            synchronizeNodeVersionFiles({
                argumentList: ["--check-current"],
                currentRuntimeVersion: "25.8.1",
                logger: { log: vi.fn() },
                nvmrcFilePath,
                nodeVersionFilePath,
                packageJsonPath,
            })
        ).rejects.toThrow(
            "Node version files do not match the expected version. Expected: 25.8.1. Actual: 24.9.0."
        );
    });

    it("still supports sync-only validation when callers explicitly request --check", async () => {
        expect.hasAssertions();

        const logger = { log: vi.fn() };
        const { nvmrcFilePath, nodeVersionFilePath } =
            createTempNodeVersionFixture({
                nodeVersion: "24.9.0",
            });

        await expect(
            validateVersionFiles({
                expectedVersion: null,
                logger,
                nvmrcFilePath,
                nodeVersionFilePath,
            })
        ).resolves.toBe("24.9.0");

        expect(logger.log).toHaveBeenCalledWith(
            "Node version files are synchronized: 24.9.0"
        );
    });

    it("rejects --check validation when synchronized files fall below package.json engines.node", async () => {
        expect.hasAssertions();

        const { nvmrcFilePath, nodeVersionFilePath, packageJsonPath } =
            createTempNodeVersionFixture({
                enginesNode: ">=22.0.0",
                nodeVersion: "21.9.0",
            });

        await expect(
            synchronizeNodeVersionFiles({
                argumentList: ["--check"],
                currentRuntimeVersion: "25.8.1",
                logger: { log: vi.fn() },
                nvmrcFilePath,
                nodeVersionFilePath,
                packageJsonPath,
            })
        ).rejects.toThrow(
            "Preferred Node.js version is below package.json engines.node. Preferred: 21.9.0. Minimum engine: 22.0.0."
        );
    });

    it("checks the file version against the minimum engine in the direct validator helper", async () => {
        expect.hasAssertions();

        const { nvmrcFilePath, nodeVersionFilePath } =
            createTempNodeVersionFixture({
                nodeVersion: "21.9.0",
            });

        await expect(
            validateVersionFiles({
                expectedVersion: null,
                logger: { log: vi.fn() },
                minimumEngineVersion: "22.0.0",
                nvmrcFilePath,
                nodeVersionFilePath,
            })
        ).rejects.toThrow(
            "Preferred Node.js version is below package.json engines.node. Preferred: 21.9.0. Minimum engine: 22.0.0."
        );
    });

    it("rejects preferred versions that fall below package.json engines.node", async () => {
        expect.hasAssertions();

        const { nvmrcFilePath, nodeVersionFilePath, packageJsonPath } =
            createTempNodeVersionFixture();

        await expect(
            synchronizeNodeVersionFiles({
                argumentList: ["--version", "21.9.0"],
                logger: { log: vi.fn() },
                nvmrcFilePath,
                nodeVersionFilePath,
                packageJsonPath,
            })
        ).rejects.toThrow(
            "Preferred Node.js version is below package.json engines.node. Preferred: 21.9.0. Minimum engine: 22.0.0."
        );
    });

    it("rejects preferred versions that fall below shorthand >=major engines.node ranges", () => {
        expect.hasAssertions();

        expect(() =>
            assertPreferredVersionSupported("21.9.0", "22.0.0")
        ).toThrow(
            "Preferred Node.js version is below package.json engines.node. Preferred: 21.9.0. Minimum engine: 22.0.0."
        );
    });

    it("uses a direct-execution guard so imports do not run the CLI", () => {
        expect.hasAssertions();

        const scriptPath = resolve("scripts", "sync-node-version-files.mjs");
        const scriptUrl = pathToFileURL(scriptPath).href;

        expect(
            isDirectExecution({
                argvEntry: scriptPath,
                currentImportUrl: scriptUrl,
            })
        ).toBeTruthy();

        expect(
            isDirectExecution({
                argvEntry: resolve("test", "sync-node-version-files.test.ts"),
                currentImportUrl: scriptUrl,
            })
        ).toBeFalsy();
    });

    it("writes exact normalized content through the direct helper", async () => {
        expect.hasAssertions();

        const { nvmrcFilePath, nodeVersionFilePath } =
            createTempNodeVersionFixture({
                nodeVersion: "24.0.0",
            });

        await expect(
            writeVersionFiles({
                preferredVersion: "v25.8.1",
                nvmrcFilePath,
                nodeVersionFilePath,
            })
        ).resolves.toBe("25.8.1");

        expect(readFileSync(nodeVersionFilePath, "utf8")).toBe("25.8.1\n");
        expect(readFileSync(nvmrcFilePath, "utf8")).toBe("25.8.1\n");
    });
});
