# no-unwrapped-global-theme-selectors-in-css-modules

Disallow unwrapped Docusaurus and Infima runtime theme selectors inside CSS Modules.

## Targeted pattern scope

This rule runs on CSS Modules files such as `*.module.css`, `*.module.scss`, and `*.module.sass`.

It reports global Docusaurus or Infima class selectors like `.navbar`, `.theme-doc-sidebar-menu`, `.menu__link`, and `.DocSearch` when they appear directly in a CSS Module selector instead of being wrapped with `:global(...)`.

## What this rule reports

This rule reports CSS Module selectors that rely on runtime theme classes without marking them global.

CSS Modules localize class selectors by default, so a selector like `.navbar` inside `Component.module.css` does **not** target the real Docusaurus navbar unless you explicitly opt out of localization.

## Why this rule exists

This is one of the most common Docusaurus + CSS Modules mistakes.

Authors often move a working selector from `src/css/custom.css` into a CSS Module and assume it still targets the same markup. It does not. The selector silently becomes local, the runtime class stops matching, and the override appears to "randomly" stop working.

## ❌ Incorrect

```css
.theme-doc-sidebar-menu .menu__link {
 font-weight: 700;
}
```

## ✅ Correct

```css
:global(.theme-doc-sidebar-menu) :global(.menu__link) {
 font-weight: 700;
}
```

## Behavior and migration notes

- This rule only runs for CSS Modules file names.
- It is report-only because automatically inserting `:global(...)` can change selector meaning in nested selectors and CSS Modules syntax.
- It intentionally focuses on Docusaurus and Infima runtime classes rather than trying to lint every possible global class name.

## Additional examples

### ❌ Incorrect — unwrapped DocSearch selector in a module

```css
.DocSearch {
 --docsearch-primary-color: #818cf8;
}
```

### ✅ Correct — local component class plus explicit global runtime selector

```css
.card :global(.navbar__link) {
 text-decoration: underline;
}
```

## Stylelint config example

```js
import { configs } from "stylelint-plugin-docusaurus";

export default {
 ...configs.recommended,
 rules: {
  ...configs.recommended.rules,
  "docusaurus/no-unwrapped-global-theme-selectors-in-css-modules": true,
 },
};
```

## When not to use it

Disable this rule if your CSS Modules setup intentionally avoids `:global(...)` syntax or if your build chain rewrites theme selectors in a non-standard way.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)

> **Rule catalog ID:** R009

## Further reading

- [Docusaurus Styling and Layout — CSS modules](https://docusaurus.io/docs/styling-layout#css-modules)
- [Docusaurus Styling and Layout — Theme class names](https://docusaurus.io/docs/styling-layout#theme-class-names)
