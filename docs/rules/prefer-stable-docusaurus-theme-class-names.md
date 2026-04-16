# prefer-stable-docusaurus-theme-class-names

Prefer documented stable Docusaurus theme class names over attribute-selector fallbacks for known theme components.

## Targeted pattern scope

This rule targets attribute selectors such as `[class*='...']` and `[class^='...']` when Docusaurus already exposes a documented stable theme class on the same element.

The initial curated mappings in this rule cover:

- `codeBlockContainer` → `.theme-code-block`
- `announcementBar` → `.theme-announcement-bar`
- `backToTopButton` → `.theme-back-to-top-button`
- `tocMobile` → `.theme-doc-toc-mobile`

## What this rule reports

This rule reports resilient attribute-selector fallbacks like `[class*='codeBlockContainer']` when Docusaurus already provides a stable theme class that should be targeted instead.

## Why this rule exists

Docusaurus documents stable theme class names as the maintainable customization surface for global CSS.

Attribute selectors that target CSS-module implementation details are sometimes more resilient than exact hashed class names, but they are still a fallback. When a stable theme class already exists, that stable class is the better long-term contract.

## ❌ Incorrect

```css
[class*="codeBlockContainer"] {
 border-radius: 8px;
}
```

## ✅ Correct

```css
.theme-code-block {
 border-radius: 8px;
}
```

## Behavior and migration notes

- This rule is intentionally curated. It only reports attribute selectors for known Docusaurus component mappings where a stable theme class is documented on the same element.
- It does not autofix because replacing an attribute selector with a stable theme class can change selector specificity and may need human review.
- This rule complements `no-unstable-docusaurus-generated-class-selectors`: that rule catches exact hashed class selectors, while this rule catches fallback attribute selectors when a better stable class already exists.

## Additional examples

### ✅ Correct — stable announcement bar class

```css
.theme-announcement-bar {
 padding-block: 1rem;
}
```

### ✅ Correct — stable mobile table-of-contents class

```css
.theme-doc-toc-mobile {
 margin-top: 1rem;
}
```

### ✅ Allowed — no known stable equivalent in the rule map yet

```css
[class*="announcementBarContent"] {
 max-width: 60rem;
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
 ...docusaurusPluginConfigs["docusaurus-all"],
 rules: {
  ...docusaurusPluginConfigs["docusaurus-all"].rules,
  "docusaurus/prefer-stable-docusaurus-theme-class-names": true,
 },
};
```

## When not to use it

Disable this rule if your project intentionally relies on attribute selectors for these known Docusaurus theme internals and you accept that choice over the documented stable class surface.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)

> **Rule catalog ID:** R007

## Further reading

- [Docusaurus Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [MDN: Attribute selectors](https://developer.mozilla.org/docs/Web/CSS/Attribute_selectors)
