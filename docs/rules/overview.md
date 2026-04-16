---
title: Overview
description: Overview of stylelint-plugin-docusaurus and its current package surface.
---

# stylelint-plugin-docusaurus

`stylelint-plugin-docusaurus` is a Stylelint plugin focused on Docusaurus styling conventions, theme-token hygiene, selector stability, CSS Modules boundaries, color-mode correctness, and mobile navbar safety.

The repository was intentionally converted from a mature ESLint-plugin template into a Stylelint-first package. The infrastructure was already strong; the public rule catalog has now grown into a broader Docusaurus-specific surface.

## What the package currently exports

- A default Stylelint plugin pack export.
- A plugin-scoped shareable config map: `docusaurusPluginConfigs`
  - `docusaurus-recommended`
  - `docusaurus-all`
  - `docusaurus-docs-safe`
- Static runtime metadata and typed helper infrastructure for future rule authoring.

## Current rule status

The public rule catalog now includes **26** Docusaurus-specific rules.

The current families cover:

- theme-token scope and Infima primary-scale guardrails
- color-mode selector correctness, prefers-color-scheme guidance, and DocSearch color-mode/token/root-scope correctness
- stable theme class usage and unsafe internal selector detection
- CSS Modules boundaries for global theme selectors, hidden global overrides, and token consumption
- mobile navbar/sidebar safety and breakpoint alignment
- cascade-layer, `revert-layer`, and broad `all` reset safety
- HTML data-attribute and content-wrapper selector hygiene

## What comes next

Future public rules can continue extending Docusaurus-specific authoring concerns such as:

- stricter curated stable-class mappings
- broader theme-surface token guidance
- additional swizzle-safe customization contracts
- more Docusaurus v4 cascade-layer guardrails

The package surface is still intentionally curated: the goal is Docusaurus-specific signal, not a duplicate of generic CSS linting plugins.
