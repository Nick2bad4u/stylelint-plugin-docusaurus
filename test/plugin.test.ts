import { describe, expect, it } from "vitest";

import plugins, {
    configNames,
    configs,
    meta,
    ruleIds,
    ruleNames,
    rules,
} from "../src/plugin";
import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("stylelint-plugin-docusaurus runtime scaffold", () => {
    it("exports stable package metadata", () => {
        expect.hasAssertions();

        expect(meta.name).toBe("stylelint-plugin-docusaurus");
        expect(meta.namespace).toBe("docusaurus");
        expect(meta.version).toMatch(/^\d+\.\d+\.\d+/v);
    });

    it("keeps rule registry exports internally consistent", () => {
        expect.hasAssertions();

        expect(ruleNames).toHaveLength(ruleIds.length);
        expect(Object.keys(rules)).toStrictEqual([...ruleNames]);

        for (const ruleId of ruleIds) {
            expect(ruleId.startsWith("docusaurus/")).toBeTruthy();
        }
    });

    it("exposes the expected shareable config names", () => {
        expect.hasAssertions();

        expect(configNames).toStrictEqual(["recommended", "all"]);
        expect(Object.keys(configs)).toStrictEqual(["all", "recommended"]);
    });

    it("lets the recommended config lint baseline CSS without parse errors", async () => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: `
                .heroBanner {
                    color: var(--ifm-color-primary);
                }
            `,
            config: {
                ...configs.recommended,
                // eslint-disable-next-line @typescript-eslint/no-misused-spread -- This is a plugin array copy, not text decomposition.
                plugins: [...configs.recommended.plugins],
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("keeps `recommended` and `all` aligned while the public rule catalog is empty", () => {
        expect.hasAssertions();

        expect(configs.recommended.plugins).toStrictEqual([...plugins]);
        expect(configs.all.plugins).toStrictEqual([...plugins]);
        expect(configs.recommended.rules).toStrictEqual({});
        expect(configs.all.rules).toStrictEqual({});
    });
});
