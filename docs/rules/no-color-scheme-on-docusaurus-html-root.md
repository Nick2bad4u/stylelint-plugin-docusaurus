# no-color-scheme-on-docusaurus-html-root

Disallow `color-scheme` declarations on Docusaurus root selectors managed by the framework.

## Targeted pattern scope

This rule walks all `color-scheme` property declarations and reports any that appear inside a CSS rule whose selector (or comma-separated selector list) matches one of the Docusaurus-managed root selectors:

- `:root`
- `html`
- `[data-theme]`
- `[data-theme="dark"]` / `[data-theme='dark']`
- `[data-theme="light"]` / `[data-theme='light']`
- `html[data-theme]`
- `html[data-theme="dark"]` / `html[data-theme='dark']`
- `html[data-theme="light"]` / `html[data-theme='light']`

## What this rule reports

A `color-scheme` declaration inside a rule that targets any of the selectors listed above.

## Why this rule exists

Docusaurus manages the page's `color-scheme` through its own theme-switching mechanism, which sets the `color-scheme` CSS property on the `<html>` element programmatically at runtime. Overriding this from custom CSS interferes with that mechanism in subtle ways:

- `color-scheme: dark` set on `:root` can prevent Docusaurus's light-mode from fully applying system-widget light styles (for example scrollbars, form inputs, date pickers).
- Overriding `color-scheme` on `[data-theme]` may produce a momentary flash when the theme toggle fires, because the JS and CSS updates race.
- The Docusaurus team may change how `color-scheme` is managed between minor releases; a CSS override may silently stop working or start conflicting.

The correct approach is to let Docusaurus manage `color-scheme` entirely, and use `[data-theme="dark"]` / `[data-theme="light"]` selectors only for setting values of other custom properties.

## ❌ Incorrect

```css
/* Overrides the color-scheme Docusaurus manages */
:root {
  color-scheme: dark light;
}
```

```css
/* Fights the theme-toggle mechanism */
html[data-theme="dark"] {
  color-scheme: dark;
}
```

```css
/* Caught when part of a comma-separated selector list */
html, :root {
  color-scheme: normal;
}
```

## ✅ Correct

```css
/* color-scheme on a custom component — not a framework root selector */
.my-widget {
  color-scheme: dark;
}
```

```css
/* Theme tokens on data-theme — fine as long as not color-scheme */
[data-theme="dark"] {
  --ifm-color-primary: #66b2ff;
  --ifm-navbar-background-color: #1a1b26;
}
```

```css
/* color-scheme inside a media query on a non-root selector — fine */
@media (prefers-color-scheme: dark) {
  .custom-code-block {
    color-scheme: dark;
  }
}
```

## Behavior and migration notes

- Selector matching is case-sensitive and exact after trimming and whitespace normalization.
- Multi-selector rules (comma-separated) are split and each part is checked individually.
- Nested `color-scheme` declarations inside nested rule blocks (for example inside `@layer`) still trigger when the resolved selector matches a managed root.
- This rule is report-only; no autofix removes the declaration.

## Additional examples

### ❌ Incorrect — comma-separated list includes a managed root

```css
html, .wrapper {
  color-scheme: dark;
}
```

Even though `.wrapper` is not managed by Docusaurus, the `html` part triggers the rule.

### ✅ Correct — scoped override for a specific sub-component

```css
.theme-code-block pre {
  color-scheme: dark;
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
  plugins: ["stylelint-plugin-docusaurus"],
  rules: {
    "docusaurus/no-color-scheme-on-docusaurus-html-root": true
  }
};
```

## When not to use it

Disable this rule if your Docusaurus site uses a custom theme that intentionally overrides `color-scheme` on the root element and you have verified that this does not conflict with the framework's theme-switching mechanism.

## Further reading

- [MDN: color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)
- [Docusaurus: Dark Mode](https://docusaurus.io/docs/api/themes/configuration#color-mode)
- [CSS Color Adjustment Specification](https://drafts.csswg.org/css-color-adjust/)

> **Rule catalog ID:** R032
