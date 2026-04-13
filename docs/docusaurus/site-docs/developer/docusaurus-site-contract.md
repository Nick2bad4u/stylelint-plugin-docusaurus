---
title: Docs Site Contract
description: Source-of-truth rules for maintaining the Docusaurus documentation app in this repository.
---

# Docs Site Contract

This docs app has clear source-of-truth boundaries.

## Hand-authored content

The following areas are hand-authored and should be updated directly:

- `docs/rules/**`
- `docs/docusaurus/site-docs/**`
- `docs/docusaurus/src/**`
- Docusaurus config and sidebar files

## Generated content

The following areas are generated and should not be hand-edited:

- `docs/docusaurus/site-docs/developer/api/**`
- built site output under `docs/docusaurus/build/**`
- generated inspector output under `docs/docusaurus/static/*-inspector/**`

## Update workflow

When docs changes affect generated surfaces:

1. update the upstream authored source
2. run the relevant sync or generation script
3. validate links, typecheck, and build output

That contract keeps the repository maintainable as the Stylelint template grows.
