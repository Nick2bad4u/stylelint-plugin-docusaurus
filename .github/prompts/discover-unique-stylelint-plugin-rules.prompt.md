---
name: discover-unique-stylelint-plugin-rules
description: "🤖🤖 Use this prompt to discover and implement net-new Stylelint rule opportunities for this repository."
argument-hint: Provide the domain focus (for example Docusaurus theme tokens, Infima variables, MDX component CSS, or color-mode selectors).
---

# Task: Discover and Implement Net-New Rule Opportunities for This Stylelint Plugin Repository

Research and identify Stylelint rule ideas that are relevant to this repository's domain and goals but are not already well-covered by the wider Stylelint ecosystem.

## Research expectations

1. Inspect the current repo so you understand the existing rule surface, docs, configs, tests, and Docusaurus styling context.
2. Research nearby ecosystems and competing plugins such as official Stylelint rules, `stylelint-plugin-defensive-css`, `stylelint-plugin-logical-css`, `stylelint-no-restricted-syntax`, `stylelint-no-unresolved-module`, and any other relevant plugin families.
3. Prefer domain-specific opportunities over generic CSS linting that another plugin already covers well.
4. If the repo targets Docusaurus, Infima, CSS Modules, or MDX styling, use web/research tools to write accurate rule ideas and docs.

## Implementation bar

If you implement a rule, it must include:

- a typed rule module
- static rule metadata and docs metadata
- high-quality rule docs
- Vitest coverage using real `stylelint.lint(...)` execution
- safe fixer behavior only when deterministic

## Deliverable

At the end, provide:

- the rule ideas you evaluated
- which ones you implemented and why
- what gaps remain intentionally unimplemented
- validation steps and remaining follow-up work
