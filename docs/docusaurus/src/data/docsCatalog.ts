import sidebars from "../../sidebars.rules";

type DocsCatalogBadge = "configs" | "rules";

type DocsCatalogStats = Readonly<{
    configDocIds: readonly string[];
    publicRuleCount: number;
    ruleDocIds: readonly string[];
    shareableConfigCount: number;
}>;

type SidebarCategoryItem = Readonly<{
    customProps?: unknown;
    items: readonly unknown[];
    type: "category";
}>;

type SidebarDocItem = Readonly<{
    id: string;
    type: "doc";
}>;

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isSidebarDocItem = (value: unknown): value is SidebarDocItem =>
    isObjectRecord(value) &&
    value["type"] === "doc" &&
    typeof value["id"] === "string";

const isSidebarCategoryItem = (value: unknown): value is SidebarCategoryItem =>
    isObjectRecord(value) &&
    value["type"] === "category" &&
    Array.isArray(value["items"]);

const getSidebarCategoryBadge = (
    categoryItem: SidebarCategoryItem
): string | undefined => {
    if (!isObjectRecord(categoryItem.customProps)) {
        return undefined;
    }

    const badge = categoryItem.customProps["badge"];

    return typeof badge === "string" ? badge : undefined;
};

const flattenSidebarDocIds = (items: readonly unknown[]): readonly string[] => {
    const docIds: string[] = [];

    for (const item of items) {
        if (isSidebarDocItem(item)) {
            docIds.push(item.id);
            continue;
        }

        if (isSidebarCategoryItem(item)) {
            docIds.push(...flattenSidebarDocIds(item.items));
        }
    }

    return docIds;
};

const getSidebarCategoryDocIds = (
    badge: DocsCatalogBadge
): readonly string[] => {
    const rulesSidebarItems = sidebars["rules"];

    if (!Array.isArray(rulesSidebarItems)) {
        throw new TypeError(
            "Expected the Docusaurus rules sidebar to be an array of sidebar items."
        );
    }

    const matchingCategory = rulesSidebarItems.find(
        (item) =>
            isSidebarCategoryItem(item) &&
            getSidebarCategoryBadge(item) === badge
    );

    if (
        matchingCategory === undefined ||
        !isSidebarCategoryItem(matchingCategory)
    ) {
        throw new Error(
            `Unable to locate the '${badge}' category in docs/docusaurus/sidebars.rules.ts.`
        );
    }

    return flattenSidebarDocIds(matchingCategory.items);
};

const configDocIds = getSidebarCategoryDocIds("configs");
const ruleDocIds = getSidebarCategoryDocIds("rules");

export const docsCatalogStats: DocsCatalogStats = Object.freeze({
    configDocIds,
    publicRuleCount: ruleDocIds.length,
    ruleDocIds,
    shareableConfigCount: configDocIds.length,
});
