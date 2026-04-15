import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/** Rule and config docs sidebar for the Stylelint plugin docs section. */
const sidebars: SidebarsConfig = {
    rules: [
        {
            className: "sb-doc-overview",
            id: "overview",
            label: "🏁 Overview",
            type: "doc",
        },
        {
            className: "sb-doc-getting-started",
            id: "getting-started",
            label: "🚀 Getting Started",
            type: "doc",
        },
        {
            className: "sb-cat-configs",
            collapsed: false,
            customProps: {
                badge: "configs",
            },
            items: [
                {
                    className: "sb-config-recommended",
                    id: "configs/recommended",
                    label: "🟡 recommended",
                    type: "doc",
                },
                {
                    className: "sb-config-all",
                    id: "configs/all",
                    label: "🟣 all",
                    type: "doc",
                },
                {
                    className: "sb-config-docusaurus-docs-safe",
                    id: "configs/docusaurus-docs-safe",
                    label: "🛡️ docusaurus-docs-safe",
                    type: "doc",
                },
            ],
            label: "Configs",
            link: {
                id: "configs/index",
                type: "doc",
            },
            type: "category",
        },
        {
            className: "sb-cat-guides",
            collapsed: false,
            customProps: {
                badge: "guides",
            },
            items: [
                {
                    id: "guides/current-status",
                    label: "🧭 Current Status",
                    type: "doc",
                },
            ],
            label: "Guides",
            link: {
                description:
                    "Migration notes and template status for the Stylelint conversion.",
                title: "Guides",
                type: "generated-index",
            },
            type: "category",
        },
        {
            className: "sb-cat-rules",
            collapsed: false,
            customProps: {
                badge: "rules",
            },
            items: [
                {
                    id: "no-invalid-theme-custom-property-scope",
                    label: "R001 no-invalid-theme-custom-property-scope",
                    type: "doc",
                },
                {
                    id: "require-ifm-color-primary-scale",
                    label: "R002 require-ifm-color-primary-scale",
                    type: "doc",
                },
                {
                    id: "prefer-data-theme-color-mode",
                    label: "R003 prefer-data-theme-color-mode",
                    type: "doc",
                },
                {
                    id: "no-mobile-navbar-backdrop-filter",
                    label: "R004 no-mobile-navbar-backdrop-filter",
                    type: "doc",
                },
                {
                    id: "prefer-data-theme-docsearch-overrides",
                    label: "R005 prefer-data-theme-docsearch-overrides",
                    type: "doc",
                },
                {
                    id: "no-unstable-docusaurus-generated-class-selectors",
                    label: "R006 no-unstable-docusaurus-generated-class-selectors",
                    type: "doc",
                },
                {
                    id: "prefer-stable-docusaurus-theme-class-names",
                    label: "R007 prefer-stable-docusaurus-theme-class-names",
                    type: "doc",
                },
                {
                    id: "no-mobile-navbar-stacking-context-traps",
                    label: "R008 no-mobile-navbar-stacking-context-traps",
                    type: "doc",
                },
                {
                    id: "no-unwrapped-global-theme-selectors-in-css-modules",
                    label: "R009 no-unwrapped-global-theme-selectors-in-css-modules",
                    type: "doc",
                },
                {
                    id: "no-unscoped-content-element-overrides",
                    label: "R010 no-unscoped-content-element-overrides",
                    type: "doc",
                },
                {
                    id: "no-unanchored-infima-subcomponent-selectors",
                    label: "R011 no-unanchored-infima-subcomponent-selectors",
                    type: "doc",
                },
                {
                    id: "no-subtree-data-theme-selectors",
                    label: "R012 no-subtree-data-theme-selectors",
                    type: "doc",
                },
                {
                    id: "no-navbar-breakpoint-desync",
                    label: "R013 no-navbar-breakpoint-desync",
                    type: "doc",
                },
                {
                    id: "require-ifm-color-primary-scale-per-color-mode",
                    label: "R014 require-ifm-color-primary-scale-per-color-mode",
                    type: "doc",
                },
                {
                    id: "require-docsearch-color-mode-pairs",
                    label: "R015 require-docsearch-color-mode-pairs",
                    type: "doc",
                },
                {
                    id: "prefer-infima-theme-tokens-over-structural-overrides",
                    label: "R016 prefer-infima-theme-tokens-over-structural-overrides",
                    type: "doc",
                },
                {
                    id: "no-unsafe-theme-internal-selectors",
                    label: "R017 no-unsafe-theme-internal-selectors",
                    type: "doc",
                },
                {
                    id: "require-html-prefix-for-docusaurus-data-attribute-selectors",
                    label: "R018 require-html-prefix-for-docusaurus-data-attribute-selectors",
                    type: "doc",
                },
                {
                    id: "no-docusaurus-layer-name-collisions",
                    label: "R019 no-docusaurus-layer-name-collisions",
                    type: "doc",
                },
                {
                    id: "no-revert-layer-outside-isolation-subtrees",
                    label: "R020 no-revert-layer-outside-isolation-subtrees",
                    type: "doc",
                },
                {
                    id: "no-direct-theme-token-consumption-in-css-modules",
                    label: "R021 no-direct-theme-token-consumption-in-css-modules",
                    type: "doc",
                },
                {
                    id: "prefer-data-theme-over-prefers-color-scheme",
                    label: "R022 prefer-data-theme-over-prefers-color-scheme",
                    type: "doc",
                },
                {
                    id: "require-local-anchor-for-global-theme-overrides-in-css-modules",
                    label: "R023 require-local-anchor-for-global-theme-overrides-in-css-modules",
                    type: "doc",
                },
                {
                    id: "prefer-docsearch-theme-tokens-over-structural-overrides",
                    label: "R024 prefer-docsearch-theme-tokens-over-structural-overrides",
                    type: "doc",
                },
                {
                    id: "no-broad-all-resets-outside-isolation-subtrees",
                    label: "R025 no-broad-all-resets-outside-isolation-subtrees",
                    type: "doc",
                },
                {
                    id: "require-docsearch-root-scope-for-docsearch-token-overrides",
                    label: "R026 require-docsearch-root-scope-for-docsearch-token-overrides",
                    type: "doc",
                },
            ],
            label: "Rules",
            link: {
                description:
                    "Reference documentation for the public Docusaurus-specific Stylelint rule catalog in this package.",
                title: "Rules",
                type: "generated-index",
            },
            type: "category",
        },
    ],
} satisfies SidebarsConfig;

export default sidebars;
