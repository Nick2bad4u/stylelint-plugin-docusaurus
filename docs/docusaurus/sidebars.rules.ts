import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/** Rule and config docs sidebar for the Stylelint plugin docs section. */
const sidebars = {
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
            ],
            label: "Rules",
            link: {
                description:
                    "Reference documentation for the first Docusaurus-specific Stylelint rules in this template.",
                title: "Rules",
                type: "generated-index",
            },
            type: "category",
        },
    ],
} satisfies SidebarsConfig;

export default sidebars;
