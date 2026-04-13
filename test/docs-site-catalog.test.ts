import { docsCatalogStats } from "@stylelint-plugin-docusaurus/docs/src/data/docsCatalog";
import { describe, expect, it } from "vitest";

import { configNames, ruleNames } from "../src/plugin";

describe("docs site catalog metadata", () => {
    it("keeps the homepage/sidebar catalog counts aligned with the plugin exports", () => {
        expect.hasAssertions();

        expect(docsCatalogStats.publicRuleCount).toBe(ruleNames.length);
        expect([...docsCatalogStats.ruleDocIds].toSorted()).toStrictEqual([
            ...ruleNames,
        ]);

        expect(docsCatalogStats.shareableConfigCount).toBe(configNames.length);
        expect(docsCatalogStats.configDocIds).toStrictEqual(
            configNames.map((configName) => `configs/${configName}`)
        );
    });
});
