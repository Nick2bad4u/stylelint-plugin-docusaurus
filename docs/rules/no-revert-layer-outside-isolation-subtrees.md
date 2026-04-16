# no-revert-layer-outside-isolation-subtrees

Disallow `revert-layer` usage outside explicitly isolated local subtrees.

## Targeted pattern scope

This rule looks for declarations whose value contains the CSS-wide keyword `revert-layer`.

It then checks whether the selector is anchored by a local wrapper class, local id, or dedicated non-root data attribute.

## What this rule reports

This rule reports `revert-layer` usage on broad selectors like `h1` or `.theme-doc-markdown` that are not isolated behind a local subtree wrapper.

## Why this rule exists

`revert-layer` is powerful, but broad usage can undo more of the Docusaurus styling contract than the author intended.

Local isolation wrappers make that reset boundary obvious and much easier to review.

## ❌ Incorrect

```css
.theme-doc-markdown {
 all: revert-layer;
}
```

## ✅ Correct

```css
.sandbox {
 all: revert-layer;
}
```

## Behavior and migration notes

- This rule accepts local wrapper classes, local ids, and dedicated data attributes as explicit isolation anchors.
- Stable global Docusaurus wrappers do not count as isolation anchors here.
- It is report-only because deciding where to introduce a local isolation wrapper is architectural work.

## Additional examples

### ✅ Correct — dedicated data attribute isolation

```css
[data-docusaurus-layer-isolation] {
 color: revert-layer;
}
```

### ❌ Incorrect — global element reset

```css
h1 {
 color: revert-layer;
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
 ...docusaurusPluginConfigs["docusaurus-all"],
 rules: {
  ...docusaurusPluginConfigs["docusaurus-all"].rules,
  "docusaurus/no-revert-layer-outside-isolation-subtrees": true,
 },
};
```

## When not to use it

Disable this rule if your project intentionally applies `revert-layer` to broad site-wide wrappers and you accept the resulting reset scope.

## Package documentation

Docusaurus package documentation:

- [Docusaurus 3.8 release notes](https://docusaurus.io/blog/releases/3.8)

> **Rule catalog ID:** R020

## Further reading

- [Docusaurus 3.8 — CSS Cascade Layers](https://docusaurus.io/blog/releases/3.8#css-cascade-layers)
