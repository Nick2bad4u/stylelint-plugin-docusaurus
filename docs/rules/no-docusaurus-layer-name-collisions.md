# no-docusaurus-layer-name-collisions

Disallow author-defined cascade layer names that collide with reserved Docusaurus-managed layer prefixes.

## Targeted pattern scope

This rule targets:

- `@layer ...` declarations
- `@import ... layer(...)` usages

It reports layer names that are exactly `docusaurus` or begin with the reserved `docusaurus.` prefix.

## What this rule reports

This rule reports author-defined layer names such as `docusaurus.infima` and `docusaurus.widgets`.

## Why this rule exists

Docusaurus has started introducing framework-managed CSS cascade layers.

If your own stylesheet reuses the same layer namespace, it becomes much harder to reason about which rules belong to the framework and which belong to your site.

## ❌ Incorrect

```css
@layer docusaurus.infima {
 .heroBanner {
  color: white;
 }
}
```

## ✅ Correct

```css
@layer app.components {
 .heroBanner {
  color: white;
 }
}
```

## Behavior and migration notes

- The reserved namespace check applies to both `@layer` blocks and import-layer syntax.
- This rule is report-only because renaming a layer can require coordinated changes across multiple files.

## Additional examples

### ❌ Incorrect — import-layer collision

```css
@import url("./theme.css") layer(docusaurus.widgets);
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
 ...docusaurusPluginConfigs["docusaurus-all"],
 rules: {
  ...docusaurusPluginConfigs["docusaurus-all"].rules,
  "docusaurus/no-docusaurus-layer-name-collisions": true,
 },
};
```

## When not to use it

Disable this rule if your project deliberately reuses the `docusaurus` layer namespace and you are willing to manage the ambiguity that creates.

## Package documentation

Docusaurus package documentation:

- [Docusaurus 3.8 release notes](https://docusaurus.io/blog/releases/3.8)

> **Rule catalog ID:** R019

## Further reading

- [Docusaurus 3.8 — CSS Cascade Layers](https://docusaurus.io/blog/releases/3.8#css-cascade-layers)
