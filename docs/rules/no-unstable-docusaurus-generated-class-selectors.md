# no-unstable-docusaurus-generated-class-selectors

Disallow exact selectors that target Docusaurus theme CSS-module class names with unstable hash suffixes.

## Targeted pattern scope

This rule targets exact class selectors in global CSS that look like Docusaurus-generated CSS-module class names, such as:

- `.codeBlockContainer_RIuc`
- `.announcementBarContent_a1B2`

The rule intentionally does **not** report:

- stable theme class names
- Infima class names
- resilient attribute selectors like `[class*='codeBlockContainer']`
- CSS module source files such as `*.module.css`

## What this rule reports

This rule reports exact global selectors that appear to target generated Docusaurus CSS-module classes with a hash-like suffix.

## Why this rule exists

Docusaurus explicitly documents generated CSS-module class names as implementation details.

Those classes can change when Docusaurus, its bundler output, or theme internals change. A global selector that depends on the full generated class name is brittle and can silently break after an upgrade.

When there is no stable theme class name available, Docusaurus recommends using a more resilient selector that ignores the generated hash portion.

## ❌ Incorrect

```css
.codeBlockContainer_RIuc {
 border-radius: 8px;
}
```

## ✅ Correct

```css
[class*="codeBlockContainer"] {
 border-radius: 8px;
}
```

## Behavior and migration notes

- This rule only targets global stylesheet selectors.
- It ignores CSS module source files such as `Component.module.css` because those files define local source class names, not the final generated output class names.
- The rule is report-only because converting an exact selector into a safe stable selector requires human judgment.

## Additional examples

### ✅ Correct — stable theme class name

```css
.theme-doc-markdown {
 max-width: 72ch;
}
```

### ✅ Correct — Infima class name

```css
.navbar__brand {
 gap: 0.5rem;
}
```

## Stylelint config example

```js
import { configs } from "stylelint-plugin-docusaurus";

export default {
 ...configs.all,
 rules: {
  ...configs.all.rules,
  "docusaurus/no-unstable-docusaurus-generated-class-selectors": true,
 },
};
```

## When not to use it

Disable this rule if your project intentionally targets generated Docusaurus CSS-module class names and accepts that those selectors may break across upgrades.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)

> **Rule catalog ID:** R006

## Further reading

- [Docusaurus Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [MDN: Attribute selectors](https://developer.mozilla.org/docs/Web/CSS/Attribute_selectors)
