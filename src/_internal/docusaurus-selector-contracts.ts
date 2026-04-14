import { setHas } from "ts-extras";

/** Common markdown/content element names that often need a wrapper scope. */
export const docusaurusContentElementNames: ReadonlySet<string> = new Set([
    "a",
    "blockquote",
    "code",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "img",
    "li",
    "ol",
    "p",
    "pre",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr",
    "ul",
]);

/** Stable Docusaurus theme class names documented for custom CSS. */
export const stableDocusaurusThemeClassNames: ReadonlySet<string> = new Set([
    "theme-announcement-bar",
    "theme-back-to-top-button",
    "theme-code-block",
    "theme-doc-breadcrumbs",
    "theme-doc-card-container",
    "theme-doc-footer",
    "theme-doc-markdown",
    "theme-doc-sidebar-container",
    "theme-doc-sidebar-item-category",
    "theme-doc-sidebar-item-link",
    "theme-doc-sidebar-menu",
    "theme-doc-toc-desktop",
    "theme-doc-toc-mobile",
    "theme-edit-this-page",
    "theme-last-updated",
    "theme-layout-footer",
    "theme-layout-main",
    "theme-layout-navbar",
    "theme-layout-navbar-sidebar",
    "theme-tabs-container",
]);

/** Root-only element names that do not count as useful selector anchors. */
export const rootOnlyIgnoredTypeNames: ReadonlySet<string> = new Set([
    "article",
    "body",
    "html",
    "main",
]);

/** Root-only ids that do not count as useful selector anchors. */
export const rootOnlyIgnoredIdNames: ReadonlySet<string> = new Set([
    "__docusaurus",
]);

/** Root-only data attributes that do not count as useful selector anchors. */
export const rootOnlyIgnoredAttributeNames: ReadonlySet<string> = new Set([
    "data-theme",
]);

/** Known Docusaurus CSS-module/internal fragments with no stable CSS contract. */
export const unsafeThemeInternalSelectorFragments: ReadonlySet<string> =
    new Set([
        "announcementBarClose",
        "announcementBarContent",
        "docItemContainer",
        "tableOfContents",
        "tocCollapsible",
    ]);

/** Exact global theme class names that Docusaurus/Infima expose at runtime. */
const exactGlobalThemeClassNames: ReadonlySet<string> = new Set([
    "DocSearch",
    "footer",
    "footer--dark",
    "navbar",
    "navbar-sidebar",
    "navbar-sidebar--show",
    "pagination-nav",
    "table-of-contents",
]);

/** Prefixes for global Docusaurus/Infima class names exposed at runtime. */
const globalThemeClassPrefixes: readonly string[] = [
    "DocSearch-",
    "breadcrumbs__",
    "dropdown__",
    "footer__",
    "menu__",
    "navbar__",
    "navbar-",
    "pagination-nav__",
    "table-of-contents__",
    "tabs__",
    "theme-",
] as const;

/** Prefixes for curated Infima subcomponent selectors used by stricter rules. */
const targetedInfimaSubcomponentClassPrefixes: readonly string[] = [
    "breadcrumbs__",
    "dropdown__",
    "footer__",
    "menu__",
    "navbar__",
    "pagination-nav__",
    "table-of-contents__",
    "tabs__",
] as const;

/** Exact classes that still count as safe anchors for Infima subcomponent rules. */
export const infimaSubcomponentAnchorClassNames: ReadonlySet<string> = new Set([
    "breadcrumbs",
    "dropdown",
    "footer",
    "navbar",
    "pagination-nav",
    "table-of-contents",
    "tabs",
    ...stableDocusaurusThemeClassNames,
]);

/** Reserved Docusaurus cascade-layer names and prefixes. */
export const reservedDocusaurusCascadeLayerPrefix = "docusaurus";

/** Curated selector/property → token recommendations for strict token rules. */
export type StructuralTokenRecommendation = Readonly<{
    properties: readonly string[];
    selectorClassNames: readonly string[];
    tokenName: string;
}>;

/** Curated token recommendations for common Docusaurus/Infima surfaces. */
export const structuralTokenRecommendations: readonly StructuralTokenRecommendation[] =
    [
        {
            properties: ["background", "background-color"],
            selectorClassNames: ["navbar", "theme-layout-navbar"],
            tokenName: "--ifm-navbar-background-color",
        },
        {
            properties: [
                "block-size",
                "height",
                "min-height",
            ],
            selectorClassNames: ["navbar", "theme-layout-navbar"],
            tokenName: "--ifm-navbar-height",
        },
        {
            properties: ["box-shadow"],
            selectorClassNames: ["navbar", "theme-layout-navbar"],
            tokenName: "--ifm-navbar-shadow",
        },
        {
            properties: ["background", "background-color"],
            selectorClassNames: [
                "footer",
                "footer--dark",
                "theme-layout-footer",
            ],
            tokenName: "--ifm-footer-background-color",
        },
        {
            properties: ["border-radius"],
            selectorClassNames: ["pagination-nav", "pagination-nav__link"],
            tokenName: "--ifm-pagination-nav-border-radius",
        },
    ];

/** Check whether one element name is part of the content-element allowlist. */
export function isDocusaurusContentElementName(elementName: string): boolean {
    return setHas<string>(
        docusaurusContentElementNames,
        elementName.toLowerCase()
    );
}

/** Check whether a class name looks like a global Docusaurus/Infima selector. */
export function isLikelyDocusaurusGlobalThemeClassName(
    cssClassName: string
): boolean {
    const themeSelectorName = cssClassName;

    return (
        globalThemeClassPrefixes.some((prefix: string): boolean =>
            themeSelectorName.startsWith(prefix)
        ) ||
        setHas<string>(stableDocusaurusThemeClassNames, themeSelectorName) ||
        setHas<string>(exactGlobalThemeClassNames, themeSelectorName)
    );
}

/** Check whether a class name is a curated Infima subcomponent selector. */
export function isTargetedInfimaSubcomponentClassName(
    cssClassName: string
): boolean {
    return targetedInfimaSubcomponentClassPrefixes.some(
        (prefix: string): boolean => cssClassName.startsWith(prefix)
    );
}
