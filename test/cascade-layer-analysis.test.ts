import { describe, expect, it } from "vitest";

import {
    getDeclaredCascadeLayerNames,
    getImportedCascadeLayerNames,
} from "../src/_internal/cascade-layer-analysis.js";

describe("cascade-layer-analysis helpers", () => {
    it("decodes escaped identifiers in declared cascade layer names", () => {
        expect.hasAssertions();

        expect(
            getDeclaredCascadeLayerNames("docusaurus\\2e infima, app")
        ).toStrictEqual(["docusaurus.infima", "app"]);
    });

    it("decodes escaped import layer() identifiers and targets", () => {
        expect.hasAssertions();

        expect(
            getImportedCascadeLayerNames(
                "url('./theme.css') \\6c ayer(docusaurus\\2e widgets)"
            )
        ).toStrictEqual(["docusaurus.widgets"]);
    });
});
