# prefer-docsearch-theme-tokens-over-structural-overrides

Prefer curated DocSearch theme tokens over hard-coded structural overrides on common DocSearch UI surfaces.

## Targeted pattern scope

This rule is intentionally curated.

The initial coverage focuses on common DocSearch surfaces that Docusaurus documents through `--docsearch-*` variables, including:

- DocSearch button / search box background → `--docsearch-searchbox-background`
- DocSearch button text color → `--docsearch-text-color`
- DocSearch container background → `--docsearch-container-background`
- DocSearch modal background → `--docsearch-modal-background`
- DocSearch hit background → `--docsearch-hit-background`
- DocSearch hit text color → `--docsearch-hit-color`
- DocSearch footer background → `--docsearch-footer-background`

## What this rule reports

This rule reports direct structural declarations like `background`, `background-color`, or `color` on those curated DocSearch surfaces when the declaration hard-codes a value instead of consuming the documented DocSearch token.

## Why this rule exists

Docusaurus already exposes a documented token surface for DocSearch theming.

Using those tokens keeps DocSearch customization aligned with the official integration path, makes color-mode overrides easier to audit, and avoids scattering brittle structural overrides across curated `.DocSearch-*` selectors.

## ❌ Incorrect

```css
.DocSearch-Button {
 background-color: rgb(17 24 39 / 80%);
}
```

```css
.DocSearch-Modal {
 background: #111827;
}
```

## ✅ Correct

```css
[data-theme="dark"] .DocSearch {
 --docsearch-searchbox-background: rgb(17 24 39 / 80%);
 --docsearch-modal-background: #111827;
}
```

```css
.DocSearch-Button {
 background-color: var(--docsearch-searchbox-background);
}
```

## Behavior and migration notes

- This rule only reports the curated selector/property combinations documented above.
- It does not report declarations that already consume the matching DocSearch token, such as `background-color: var(--docsearch-searchbox-background)`.
- It is report-only because automatically moving structural declarations into DocSearch token scopes would be unsafe.

## Additional examples

### ❌ Incorrect — hard-coded footer background

```css
.DocSearch-Footer {
 background-color: #111827;
}
```

### ✅ Correct — token-driven footer styling

```css
[data-theme="dark"] .DocSearch {
 --docsearch-footer-background: var(--ifm-background-surface-color);
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
 ...docusaurusPluginConfigs["docusaurus-all"],
 rules: {
  ...docusaurusPluginConfigs["docusaurus-all"].rules,
  "docusaurus/prefer-docsearch-theme-tokens-over-structural-overrides": true,
 },
};
```

## When not to use it

Disable this rule if your site intentionally bypasses the documented DocSearch token surface and you prefer direct `.DocSearch-*` structural overrides for those curated surfaces.

## Package documentation

Docusaurus package documentation:

- [Search](https://docusaurus.io/docs/search)
- [Styling and Layout](https://docusaurus.io/docs/styling-layout)

> **Rule catalog ID:** R024

## Further reading

- [Docusaurus Search — Styling your Algolia search](https://docusaurus.io/docs/search#styling-your-algolia-search)
- [DocSearch Docusaurus adapter](https://docsearch.algolia.com/docs/docusaurus-adapter)
