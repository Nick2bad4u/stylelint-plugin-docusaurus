# require-docsearch-color-mode-pairs

Require paired light and dark DocSearch token override blocks when customizing DocSearch by color mode.

## Targeted pattern scope

This rule checks explicit DocSearch token overrides under selectors such as:

- `[data-theme='light'] .DocSearch`
- `[data-theme='dark'] .DocSearch`

It only applies when the rule finds `--docsearch-*` declarations in those color-mode-scoped DocSearch selectors.

## What this rule reports

This rule reports cases where DocSearch tokens are customized for one color mode but not the other.

## Why this rule exists

Docusaurus documents DocSearch theming through explicit light and dark blocks.

When only one mode is customized, search UI colors can drift away from the rest of the site during color-mode changes, especially when the base site theme has already been customized.

## ❌ Incorrect

```css
[data-theme="light"] .DocSearch {
 --docsearch-primary-color: #4f46e5;
}
```

## ✅ Correct

```css
[data-theme="light"] .DocSearch {
 --docsearch-primary-color: #4f46e5;
}

[data-theme="dark"] .DocSearch {
 --docsearch-primary-color: #818cf8;
}
```

## Behavior and migration notes

- This rule only checks explicit color-mode-scoped DocSearch token blocks.
- It intentionally does not report a plain `.DocSearch { --docsearch-* }` block because that is not a color-mode pair.
- It is report-only because the missing counterpart values depend on your search theme design.

## Additional examples

### ✅ Correct — paired modal background overrides

```css
[data-theme="light"] .DocSearch {
 --docsearch-modal-background: white;
}

[data-theme="dark"] .DocSearch {
 --docsearch-modal-background: #111827;
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
 ...docusaurusPluginConfigs["docusaurus-all"],
 rules: {
  ...docusaurusPluginConfigs["docusaurus-all"].rules,
  "docusaurus/require-docsearch-color-mode-pairs": true,
 },
};
```

## When not to use it

Disable this rule if your project intentionally customizes DocSearch in only one color mode and accepts the framework defaults in the other mode.

## Package documentation

Docusaurus package documentation:

- [Search](https://docusaurus.io/docs/search)

> **Rule catalog ID:** R015

## Further reading

- [Docusaurus Search — Styling your Algolia search](https://docusaurus.io/docs/search#styling-your-algolia-search)
