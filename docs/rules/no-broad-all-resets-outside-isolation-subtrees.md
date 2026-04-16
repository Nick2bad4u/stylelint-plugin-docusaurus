# no-broad-all-resets-outside-isolation-subtrees

Disallow broad `all: initial`, `all: revert`, and `all: unset` resets outside explicitly isolated local subtrees.

## Targeted pattern scope

This rule looks for declarations on the `all` property whose value contains one of these broad reset keywords:

- `initial`
- `revert`
- `unset`

It then checks whether the selector is anchored by a local wrapper class, local id, or dedicated non-root data attribute.

## What this rule reports

This rule reports broad `all` resets on selectors like `h1` or `.theme-doc-markdown` that are not isolated behind a local subtree wrapper.

## Why this rule exists

`all` resets are blunt tools.

On broad Docusaurus selectors they can wipe out far more of the framework styling contract than the author intended, including typography, spacing, and component defaults outside the immediate customization target.

Local isolation wrappers make that reset boundary obvious and much easier to review.

## ❌ Incorrect

```css
.theme-doc-markdown {
 all: revert;
}
```

```css
h1 {
 all: unset;
}
```

## ✅ Correct

```css
.sandbox {
 all: revert;
}
```

## Behavior and migration notes

- This rule accepts local wrapper classes, local ids, and dedicated data attributes as explicit isolation anchors.
- Stable global Docusaurus wrappers do not count as isolation anchors here.
- It only checks `all: initial`, `all: revert`, and `all: unset`.
- It intentionally does not overlap with `no-revert-layer-outside-isolation-subtrees`, which handles `revert-layer` separately.
- It is report-only because deciding where to introduce a local isolation wrapper is architectural work.

## Additional examples

### ✅ Correct — dedicated data attribute isolation

```css
[data-docusaurus-layer-isolation] {
 all: unset;
}
```

### ❌ Incorrect — broad global heading reset

```css
h1 {
 all: initial;
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
 ...docusaurusPluginConfigs["docusaurus-all"],
 rules: {
  ...docusaurusPluginConfigs["docusaurus-all"].rules,
  "docusaurus/no-broad-all-resets-outside-isolation-subtrees": true,
 },
};
```

## When not to use it

Disable this rule if your project intentionally applies broad `all` resets to site-wide Docusaurus wrappers and you accept the resulting reset scope.

## Package documentation

Docusaurus package documentation:

- [Docusaurus 3.8 release notes](https://docusaurus.io/blog/releases/3.8)

> **Rule catalog ID:** R025

## Further reading

- [Docusaurus 3.8 — CSS Cascade Layers](https://docusaurus.io/blog/releases/3.8#css-cascade-layers)
