import nick2bad4u from "eslint-config-nick2bad4u";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nick2bad4u.configs.all,

    {
        files: ["**/*.{ts,tsx,cts,mts}"],
        rules: {
            "no-use-before-define": [
                "error",
                {
                    allowNamedExports: false,
                    classes: true,
                    functions: false,
                    variables: true,
                },
            ],
        },
    },

    {
        files: ["docs/docusaurus/**/*.{ts,tsx}"],
        rules: {
            "@typescript-eslint/consistent-type-definitions": "off",
            "@typescript-eslint/dot-notation": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-unsafe-type-assertion": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "canonical/filename-no-index": "off",
            "n/no-process-env": "off",
            "n/no-sync": "off",
            "perfectionist/sort-imports": "off",
            "perfectionist/sort-jsx-props": "off",
            "perfectionist/sort-object-types": "off",
            "perfectionist/sort-objects": "off",
            "regexp/require-unicode-sets-regexp": "off",
            "unicorn/escape-case": "off",
            "unicorn/filename-case": "off",
            "unicorn/import-style": "off",
            "unicorn/no-non-function-verb-prefix": "off",
            "unicorn/no-typeof-undefined": "off",
            "unicorn/no-unnecessary-global-this": "off",
            "unicorn/no-unreadable-new-expression": "off",
            "unicorn/no-useless-fallback-in-spread": "off",
            "unicorn/prefer-short-arrow-method": "off",
            "unicorn/prefer-temporal": "off",
            "unicorn/prefer-unicode-code-point-escapes": "off",
            "unicorn/prefer-url-href": "off",
            "unicorn/relative-url-style": "off",
        },
    },

    {
        files: ["**/*.md"],
        rules: {
            "remark/remark": "off",
        },
    },

    {
        files: [".remarkrc.mjs"],
        rules: {
            "perfectionist/sort-objects": "off",
        },
    },

    {
        files: ["src/**/*.ts"],
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/restrict-plus-operands": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            complexity: "off",
            "import-x/max-dependencies": "off",
            "no-duplicate-imports": "off",
            "no-undef-init": "off",
            "sonarjs/no-invariant-returns": "off",
            "sonarjs/slow-regex": "off",
            "sonarjs/updated-loop-counter": "off",
            "typefest/prefer-type-fest-array-values": "off",
            "unicorn/comment-content": "off",
            "unicorn/consistent-boolean-name": "off",
            "unicorn/no-break-in-nested-loop": "off",
            "unicorn/no-declarations-before-early-exit": "off",
            "unicorn/no-duplicate-loops": "off",
            "unicorn/no-manually-wrapped-comments": "off",
            "unicorn/no-negated-array-predicate": "off",
            "unicorn/no-unreadable-for-of-expression": "off",
            "unicorn/no-unsafe-string-replacement": "off",
            "unicorn/no-useless-concat": "off",
            "unicorn/no-useless-fallback-in-spread": "off",
            "unicorn/prefer-includes-over-repeated-comparisons": "off",
            "unicorn/prefer-number-coercion": "off",
            "unicorn/prefer-unicode-code-point-escapes": "off",
        },
    },

    {
        files: ["test/**/*.ts"],
        rules: {
            "canonical/no-barrel-import": "off",
            "no-duplicate-imports": "off",
            "test-signal/no-tautological-length-assertions": "off",
            "test-signal/no-weak-existence-assertions": "off",
            "test-signal/no-weak-truthy-assertions": "off",
            "test-signal/require-negative-path": "off",
            "unicorn/consistent-boolean-name": "off",
            "unicorn/no-break-in-nested-loop": "off",
            "unicorn/no-useless-concat": "off",
            "unicorn/prefer-unicode-code-point-escapes": "off",
        },
    },

    {
        files: ["stryker.config.mjs"],
        rules: {
            "@typescript-eslint/dot-notation": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "unicorn/no-unnecessary-global-this": "off",
        },
    },
];

export default config;
