import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it, vi } from "vitest";

import {
    createPeerStylelintRange,
    isDirectExecution,
    minimumSupportedStylelintRange,
    synchronizePeerStylelintRange,
} from "../scripts/sync-peer-stylelint-range.mjs";

describe("sync-peer-stylelint-range script", () => {
    it("always keeps the template minimum floor in the peer range", () => {
        expect.hasAssertions();

        expect(
            createPeerStylelintRange({
                devDependencyStylelintRange: "^17.7.0",
            })
        ).toBe("^16.0.0 || ^17.7.0");

        expect(
            createPeerStylelintRange({
                devDependencyStylelintRange: minimumSupportedStylelintRange,
            })
        ).toBe(minimumSupportedStylelintRange);

        expect(
            createPeerStylelintRange({
                devDependencyStylelintRange: "^16.0.0 || ^17.7.0 || ^17.7.0",
            })
        ).toBe("^16.0.0 || ^17.7.0");

        expect(
            createPeerStylelintRange({
                devDependencyStylelintRange: "  ^17.7.0  ||  ^16.0.0  ",
            })
        ).toBe("^16.0.0 || ^17.7.0");
    });

    it("corrects a package that lost the minimum peer floor", async () => {
        expect.hasAssertions();

        mkdirSync("temp", { recursive: true });
        const tempRoot = mkdtempSync(
            path.resolve("temp", "sync-peer-stylelint-")
        );
        const packageJsonPath = path.resolve(tempRoot, "package.json");
        const logger = { log: vi.fn<(message: string) => void>() };

        writeFileSync(
            packageJsonPath,
            `${JSON.stringify(
                {
                    devDependencies: { stylelint: "^17.7.0" },
                    peerDependencies: { stylelint: "^17.7.0" },
                },
                null,
                4
            )}\n`,
            "utf8"
        );

        await expect(
            synchronizePeerStylelintRange({
                filePath: packageJsonPath,
                logger,
            })
        ).resolves.toBe("updated");

        const updatedPackageJson = JSON.parse(
            readFileSync(packageJsonPath, "utf8")
        ) as {
            peerDependencies?: {
                stylelint?: string;
            };
        };

        expect(updatedPackageJson.peerDependencies?.stylelint).toBe(
            "^16.0.0 || ^17.7.0"
        );
        expect(logger.log).toHaveBeenCalledWith(
            "Updated peerDependencies.stylelint to: ^16.0.0 || ^17.7.0"
        );
    });

    it("corrects an unsupported existing floor instead of preserving it", async () => {
        expect.hasAssertions();

        mkdirSync("temp", { recursive: true });
        const tempRoot = mkdtempSync(
            path.resolve("temp", "sync-peer-stylelint-")
        );
        const packageJsonPath = path.resolve(tempRoot, "package.json");
        const logger = { log: vi.fn<(message: string) => void>() };

        writeFileSync(
            packageJsonPath,
            `${JSON.stringify(
                {
                    devDependencies: { stylelint: "^17.7.0" },
                    peerDependencies: { stylelint: "^15.0.0 || ^17.7.0" },
                },
                null,
                4
            )}\n`,
            "utf8"
        );

        await synchronizePeerStylelintRange({
            filePath: packageJsonPath,
            logger,
        });

        const updatedPackageJson = JSON.parse(
            readFileSync(packageJsonPath, "utf8")
        ) as {
            peerDependencies?: {
                stylelint?: string;
            };
        };

        expect(updatedPackageJson.peerDependencies?.stylelint).toBe(
            "^16.0.0 || ^17.7.0"
        );
    });

    it("uses a direct-execution guard so imports do not run the CLI", () => {
        expect.hasAssertions();

        const scriptPath = path.resolve(
            "scripts",
            "sync-peer-stylelint-range.mjs"
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
                    "sync-peer-stylelint-range.test.ts"
                ),
                currentImportUrl: scriptUrl,
            })
        ).toBeFalsy();
    });
});
