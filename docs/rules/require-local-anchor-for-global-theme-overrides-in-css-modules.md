# require-local-anchor-for-global-theme-overrides-in-css-modules

Require a local selector anchor when overriding Docusaurus global theme surfaces inside CSS Modules.

## Targeted pattern scope

This rule runs only on CSS Modules files such as `*.module.css`, `*.module.scss`, `*.module.sass`, and `*.module.less`.

It reports selectors that intentionally escape to global Docusaurus theme surfaces without any local component anchor, for example:

- `:global(.navbar)`
- `:global(.DocSearch)`
- `[data-theme='dark']`
- `:root` when it declares Docusaurus theme tokens like `--ifm-*` or `--docsearch-*`

## What this rule reports

This rule reports CSS Module selectors that behave like hidden global styles because they are not anchored by any local class, local id, or non-root local `data-*` wrapper.

## Why this rule exists

CSS Modules are supposed to keep component styles local.

Sometimes you really do need to reach out to a Docusaurus runtime class or root color-mode selector, but doing so without a local wrapper turns the module into a disguised global stylesheet. That makes the file harder to reason about, easier to misuse during refactors, and more likely to leak styling across the whole site.

## ❌ Incorrect

```css
:global(.navbar) {
 background: black;
}
```

```css
[data-theme="dark"] {
 color: white;
}
```

```css
:root {
 --ifm-color-primary: #4e89e8;
}
```

## ✅ Correct

```css
.card :global(.navbar__link) {
 text-decoration: underline;
}
```

```css
[data-theme="dark"] .card {
 color: white;
}
```

## Behavior and migration notes

- This rule only runs in CSS Modules files.
- It is report-only because inventing an appropriate local wrapper class would be guesswork.
- It complements `no-unwrapped-global-theme-selectors-in-css-modules`.
  - That rule catches missing `:global(...)` wrappers.
  - This rule catches explicit global escapes that still lack a local anchor.

## Additional examples

### ✅ Correct — local wrapper plus explicit global DocSearch surface

```css
.searchSurface :global(.DocSearch-Button) {
 border-color: rebeccapurple;
}
```

### ❌ Incorrect — explicit global color-mode scope with no local anchor

```css
:global([data-theme="dark"]) :global(.DocSearch) {
 --docsearch-primary-color: #818cf8;
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
 ...docusaurusPluginConfigs["docusaurus-recommended"],
 rules: {
  ...docusaurusPluginConfigs["docusaurus-recommended"].rules,
  "docusaurus/require-local-anchor-for-global-theme-overrides-in-css-modules": true,
 },
};
```

## When not to use it

Disable this rule if your project intentionally uses CSS Modules files as a global override surface for Docusaurus theme classes and root color-mode selectors.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Creating Pages](https://docusaurus.io/docs/creating-pages)

> **Rule catalog ID:** R023

## Further reading

- [Docusaurus Styling and Layout — CSS modules](https://docusaurus.io/docs/styling-layout#css-modules)
- [Docusaurus Styling and Layout — Theme class names](https://docusaurus.io/docs/styling-layout#theme-class-names)
