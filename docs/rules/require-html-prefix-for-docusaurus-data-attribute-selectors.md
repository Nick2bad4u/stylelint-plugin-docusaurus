# require-html-prefix-for-docusaurus-data-attribute-selectors

Require an `html` prefix for bare Docusaurus root data-attribute selectors that target global theme surfaces.

## Targeted pattern scope

This rule targets selectors that begin with a bare `data-*` attribute and then style a global Docusaurus surface such as `.navbar` or `#__docusaurus`.

It intentionally ignores `data-theme`, which is covered by the color-mode rules.

## What this rule reports

This rule reports selectors like `[data-navbar='false'] .navbar` and `[data-red-border] div#__docusaurus`.

## Why this rule exists

Docusaurus documents query-string-driven data attributes on the root HTML element.

Writing those selectors without an explicit `html` prefix makes the intent less clear and makes it easier to accidentally reuse the same selector pattern for non-root markup later.

## ❌ Incorrect

```css
[data-navbar="false"] .navbar {
 display: none;
}
```

## ✅ Correct

```css
html[data-navbar="false"] .navbar {
 display: none;
}
```

## Behavior and migration notes

- This rule focuses on selectors that look like Docusaurus root data-attribute styling.
- It intentionally does not report selectors such as `.widget[data-mode='iframe'] .navbar`, because those are component-local patterns rather than bare root-style selectors.
- It is report-only because adding `html` can change selector specificity.

## Additional examples

### ❌ Incorrect — bare root-looking `#__docusaurus` selector

```css
[data-red-border] div#__docusaurus {
 border: red solid thick;
}
```

### ✅ Correct — explicit HTML root attribute

```css
html[data-red-border] div#__docusaurus {
 border: red solid thick;
}
```

## Stylelint config example

```js
import { configs } from "stylelint-plugin-docusaurus";

export default {
 ...configs.recommended,
 rules: {
  ...configs.recommended.rules,
  "docusaurus/require-html-prefix-for-docusaurus-data-attribute-selectors": true,
 },
};
```

## When not to use it

Disable this rule if your project intentionally prefers bare root data-attribute selectors and accepts that those selectors do not explicitly name `html`.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)

> **Rule catalog ID:** R018

## Further reading

- [Docusaurus Styling and Layout — Data Attributes](https://docusaurus.io/docs/styling-layout#data-attributes)
