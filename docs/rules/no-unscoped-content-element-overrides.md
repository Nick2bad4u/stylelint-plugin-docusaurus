# no-unscoped-content-element-overrides

Disallow broad content-element overrides that are not scoped to a Docusaurus content wrapper or component-local selector.

## Targeted pattern scope

This rule looks for selectors that target content elements such as headings, paragraphs, lists, tables, blockquotes, `pre`, `code`, and links without any meaningful scope anchor.

Examples of good anchors include:

- documented Docusaurus wrappers like `.theme-doc-markdown`, `.markdown`, `.docs-doc-page`, `.blog-wrapper`, and `.mdx-page`
- a component-local class such as `.heroBanner`
- a local id or dedicated data attribute for an isolated subtree

## What this rule reports

This rule reports selectors like `h1`, `table`, or `[data-theme='dark'] h2` when they are not scoped under a wrapper that limits the effect to a specific content surface.

## Why this rule exists

Docusaurus is a single-page application with multiple content surfaces.

A bare `h1` or `table` override often leaks far beyond the docs content you meant to restyle:

- landing pages start inheriting doc typography
- blog pages pick up docs-specific table styling
- MDX pages and theme components drift unexpectedly

Scoped wrappers make those intent boundaries explicit.

## ❌ Incorrect

```css
h1 {
 margin-block-end: 0.5rem;
}
```

## ✅ Correct

```css
.theme-doc-markdown h1 {
 margin-block-end: 0.5rem;
}
```

## Behavior and migration notes

- This rule is intentionally about selector scope, not typography preferences.
- It allows custom component wrappers, not only Docusaurus built-ins.
- It is report-only because automatically choosing the right wrapper would be guesswork.

## Additional examples

### ✅ Correct — component-local content styling

```css
.heroBanner h1 {
 text-wrap: balance;
}
```

### ❌ Incorrect — color-mode-only selector is still too broad

```css
[data-theme="dark"] table {
 border-color: white;
}
```

### ✅ Correct — combine color mode with a content wrapper

```css
[data-theme="dark"] .theme-doc-markdown table {
 border-color: white;
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
 ...docusaurusPluginConfigs["docusaurus-all"],
 rules: {
  ...docusaurusPluginConfigs["docusaurus-all"].rules,
  "docusaurus/no-unscoped-content-element-overrides": true,
 },
};
```

## When not to use it

Disable this rule if your project intentionally wants site-wide typography or content-element overrides across every Docusaurus route.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)

> **Rule catalog ID:** R010

## Further reading

- [Docusaurus Styling and Layout — Theme class names](https://docusaurus.io/docs/styling-layout#theme-class-names)
- [Docusaurus Styling and Layout](https://docusaurus.io/docs/styling-layout)
