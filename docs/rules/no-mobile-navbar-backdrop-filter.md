# no-mobile-navbar-backdrop-filter

Disallow unsafe navbar backdrop filters that bleed into the Docusaurus mobile sidebar.

## Targeted pattern scope

This rule targets `backdrop-filter` and `-webkit-backdrop-filter` declarations on selectors that style the Docusaurus navbar itself, such as `.navbar` and `.navbar--fixed-top`.

The rule ignores safe reset values like `none`, `initial`, and `unset`, and it also allows navbar blur that is explicitly guarded behind Docusaurus's desktop breakpoint with `@media (min-width: 997px)`.

## What this rule reports

This rule reports navbar blur declarations that can affect the mobile sidebar.

Docusaurus renders the mobile sidebar inside the `<nav>` element, so a blur applied to the navbar can also affect the sidebar and its backdrop when the site collapses below the default desktop breakpoint.

## Why this rule exists

This is one of the easiest ways to accidentally break Docusaurus on mobile.

A translucent blurred navbar often looks fine on desktop, but the same rule can make the mobile sidebar render incorrectly, blur the wrong surface, or become harder to interact with.

The safest default is to keep navbar blur off the mobile navbar entirely and only opt into it above the desktop breakpoint.

## ❌ Incorrect

```css
.navbar {
  backdrop-filter: blur(16px);
  background: rgb(20 20 20 / 70%);
}
```

## ✅ Correct

```css
@media (min-width: 997px) {
  .navbar {
    -webkit-backdrop-filter: blur(16px);
    backdrop-filter: blur(16px);
    background: rgb(20 20 20 / 70%);
  }
}
```

## Behavior and migration notes

- This rule checks both `backdrop-filter` and `-webkit-backdrop-filter`.
- It treats `@media (min-width: 997px)` as the safe desktop guard because that matches Docusaurus's default desktop navbar breakpoint.
- The rule is report-only because automatically moving the blur to another selector or wrapping it in a media query would be unsafe.

## Additional examples

### ✅ Correct — apply the effect to a different element

```css
.heroBanner {
  backdrop-filter: blur(12px);
}
```

### ✅ Correct — explicit mobile reset

```css
.navbar-sidebar--show {
  backdrop-filter: none;
}
```

## Stylelint config example

```js
import { configs } from "stylelint-plugin-docusaurus";

export default {
  ...configs.recommended,
  rules: {
    ...configs.recommended.rules,
    "docusaurus/no-mobile-navbar-backdrop-filter": true,
  },
};
```

## When not to use it

Disable this rule if your site has swizzled the navbar layout or otherwise changed the mobile DOM structure enough that navbar blur is known to be safe below the default Docusaurus breakpoint.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Mobile sidebar backdrop-filter issue](https://github.com/facebook/docusaurus/issues/6996)

> **Rule catalog ID:** R004

## Further reading

- [Docusaurus Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Docusaurus issue #6996: mobile sidebar not working with backdrop-filter](https://github.com/facebook/docusaurus/issues/6996)
- [Infima source for `.navbar` and `.navbar-sidebar`](https://github.com/facebookincubator/infima)
