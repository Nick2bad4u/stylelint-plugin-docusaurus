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
    ],
} satisfies SidebarsConfig;

export default sidebars;
