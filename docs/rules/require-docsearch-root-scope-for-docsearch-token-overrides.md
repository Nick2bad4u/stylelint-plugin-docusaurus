# require-docsearch-root-scope-for-docsearch-token-overrides

Require DocSearch token overrides to live on the `.DocSearch` root scope instead of descendant or non-DocSearch selectors.

## Targeted pattern scope

This rule checks declarations of `--docsearch-*` custom properties.

It reports those declarations unless every selector in the containing rule scopes the token override to the `.DocSearch` root itself, optionally with a leading site color-mode scope like `[data-theme='dark'] .DocSearch`.

## What this rule reports

This rule reports DocSearch token declarations on selectors such as:

- root theme scopes without `.DocSearch`, like `[data-theme='dark']`
- descendant DocSearch selectors such as `.DocSearch-Button`
- other non-root selectors that happen to mention DocSearch only indirectly

## Why this rule exists

The Docusaurus search documentation shows DocSearch theming through `--docsearch-*` variables applied on the `.DocSearch` root scope.

Keeping those variables on the root DocSearch surface makes the override contract predictable, keeps color-mode blocks easier to audit, and avoids splitting the DocSearch token surface across descendants that are really structural implementation details.

## ❌ Incorrect

```css
[data-theme="dark"] {
 --docsearch-primary-color: #8ab4f8;
}
```

```css
.DocSearch-Button {
 --docsearch-primary-color: #8ab4f8;
}
```

## ✅ Correct

```css
[data-theme="dark"] .DocSearch {
 --docsearch-primary-color: #8ab4f8;
}
```

## Behavior and migration notes

- This rule only checks declarations of `--docsearch-*` custom properties.
- It complements `prefer-docsearch-theme-tokens-over-structural-overrides`.
  - That rule prefers tokens over structural declarations.
  - This rule keeps those token declarations on the right root scope once you use them.
- It is report-only because automatically moving declarations to the correct `.DocSearch` root scope could require selector restructuring.

## Additional examples

### ✅ Correct — CSS Modules with explicit global DocSearch root scope

```css
[data-theme="dark"] :global(.DocSearch) {
 --docsearch-primary-color: #8ab4f8;
}
```

### ❌ Incorrect — descendant DocSearch selector

```css
[data-theme="dark"] .DocSearch-Button {
 --docsearch-primary-color: #8ab4f8;
}
```

## Stylelint config example

```js
import { configs } from "stylelint-plugin-docusaurus";

export default {
 ...configs.all,
 rules: {
  ...configs.all.rules,
  "docusaurus/require-docsearch-root-scope-for-docsearch-token-overrides": true,
 },
};
```

## When not to use it

Disable this rule if your project intentionally declares `--docsearch-*` variables on descendant selectors or global theme scopes outside `.DocSearch` and you accept that more fragmented token contract.

## Package documentation

Docusaurus package documentation:

- [Search](https://docusaurus.io/docs/search)
- [Styling and Layout](https://docusaurus.io/docs/styling-layout)

> **Rule catalog ID:** R026

## Further reading

- [Docusaurus Search — Styling your Algolia search](https://docusaurus.io/docs/search#styling-your-algolia-search)
- [DocSearch Docusaurus adapter](https://docsearch.algolia.com/docs/docusaurus-adapter)
