---
title: all
description: Full shareable config for stylelint-plugin-docusaurus.
---

# all

`configs.all` enables the full current public rule catalog.

## Usage

```js
import { configs } from "stylelint-plugin-docusaurus";

export default configs.all;
```

## Current behavior

Because the public rule catalog is currently empty, `all` is presently equivalent to `recommended`.

## Intended future role

As the plugin grows, `all` should remain the exhaustive opt-in surface for teams that want every stable public `docusaurus/*` rule enabled at once.

## Rules in this config

The public rule catalog is currently empty, so this config only registers the package surface for now.
