import { describe, expect, it } from "vitest";

import { configNames, ruleNames } from "../src/plugin";

describe("docs site catalog metadata", () => {
    it("keeps the homepage/sidebar catalog counts aligned with the plugin exports", async () => {
        expect.hasAssertions();

        /* eslint-disable import-x/no-relative-packages -- this test intentionally validates docs-workspace runtime data within the same monorepo */
        const docsCatalogModule =
            (await import("../docs/docusaurus/src/data/docsCatalog")) as {
                docsCatalogStats: {
                    configDocIds: readonly string[];
                    publicRuleCount: number;
                    ruleDocIds: readonly string[];
                    shareableConfigCount: number;
                };
            };
        /* eslint-enable import-x/no-relative-packages -- restore default package-boundary checks after this monorepo-specific import */
        const { docsCatalogStats } = docsCatalogModule;
        const sortedRuleDocIds: string[] = [];

        for (const ruleDocId of docsCatalogStats.ruleDocIds) {
            const insertionIndex = sortedRuleDocIds.findIndex(
                (existingRuleDocId) =>
                    existingRuleDocId.localeCompare(ruleDocId) > 0
            );

            if (insertionIndex === -1) {
                sortedRuleDocIds.push(ruleDocId);
            } else {
                sortedRuleDocIds.splice(insertionIndex, 0, ruleDocId);
            }
        }

        expect(docsCatalogStats.publicRuleCount).toBe(ruleNames.length);

        expect(sortedRuleDocIds).toStrictEqual([...ruleNames]);

        expect(docsCatalogStats.shareableConfigCount).toBe(configNames.length);
        expect(docsCatalogStats.configDocIds).toStrictEqual(
            configNames.map((configName) => `configs/${configName}`)
        );
    });
});
