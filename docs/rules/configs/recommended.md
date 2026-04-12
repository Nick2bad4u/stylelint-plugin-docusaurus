---
title: recommended
description: Default shareable config for stylelint-plugin-docusaurus.
---

# recommended

`configs.recommended` is the default shareable config for this package.

## Usage

```js
import { configs } from "stylelint-plugin-docusaurus";

export default configs.recommended;
```

## What it enables

This config registers the local plugin pack and enables the rules marked as recommended.

At the moment the public rule catalog is still empty, so the config currently behaves as a lightweight package-registration scaffold.

## Intended future role

As Docusaurus-specific rules are added, `recommended` should stay focused on low-noise, broadly applicable rules that are safe to enable in most Docusaurus codebases.

## Rules in this config

The public rule catalog is currently empty, so this config only registers the package surface for now.
