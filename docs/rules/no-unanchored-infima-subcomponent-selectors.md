# no-unanchored-infima-subcomponent-selectors

Disallow unanchored Infima subcomponent selectors in global Docusaurus stylesheets.

## Targeted pattern scope

This rule targets curated Infima implementation-detail selectors such as:

- `.menu__link`
- `.dropdown__menu`
- `.dropdown__link`
- `.navbar__link`
- `.footer__link-item`
- `.tabs__item`

It reports those selectors when they are used without a stable Docusaurus wrapper, a known container anchor, or a project-local wrapper class.

## What this rule reports

This rule reports brittle selectors like `.menu__link` or `.dropdown__menu .dropdown__link` when they are not anchored to a more meaningful surface.

## Why this rule exists

Infima classes are real runtime classes, but multiple low-level selectors are still implementation details.

Using them naked makes your CSS harder to maintain because it assumes too much about how the theme is assembled. Anchoring them under a stable Docusaurus wrapper or your own component wrapper makes the selector much more intentional.

## ❌ Incorrect

```css
.menu__link {
 font-weight: 700;
}
```

## ✅ Correct

```css
.theme-doc-sidebar-menu .menu__link {
 font-weight: 700;
}
```

## Behavior and migration notes

- This rule is intentionally curated. It does not try to model every Infima class.
- CSS Modules are ignored here because `no-unwrapped-global-theme-selectors-in-css-modules` already covers the module-specific failure mode.
- It is report-only because there is no safe automatic way to choose the right wrapper.

## Additional examples

### ✅ Correct — anchored by a local component wrapper

```css
.sidebarNav .menu__link {
 font-weight: 700;
}
```

### ❌ Incorrect — chained internal selectors still lack a real anchor

```css
.dropdown__menu .dropdown__link {
 color: white;
}
```

## Stylelint config example

```js
import { configs } from "stylelint-plugin-docusaurus";

export default {
 ...configs.all,
 rules: {
  ...configs.all.rules,
  "docusaurus/no-unanchored-infima-subcomponent-selectors": true,
 },
};
```

## When not to use it

Disable this rule if your project intentionally styles naked Infima internals across the whole site and you accept the upgrade risk that comes with that choice.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)

> **Rule catalog ID:** R011

## Further reading

- [Docusaurus Styling and Layout — Theme class names](https://docusaurus.io/docs/styling-layout#theme-class-names)
- [Infima Navbar](https://infima.dev/docs/components/navbar)
- [Infima Footer](https://infima.dev/docs/components/footer)
