# Capability map: Universal Agent Skills

| Module | Responsibility | Depends on |
|---|---|---|
| `portable-skills` | Markdown-first, model-agnostic engineering workflows and shared references | — |
| `host-adapters` | Native discovery and installation metadata for Claude Code, Codex, and DeepSeek Harness | `portable-skills` |
| `quality-system` | Validation, routing evals, secret checks, contribution rules, and CI | `portable-skills`, `host-adapters` |
| `distribution-docs` | Installation, compatibility, safety, attribution, and release guidance | `portable-skills`, `host-adapters`, `quality-system` |

Build order: `portable-skills` → `host-adapters` → `quality-system` → `distribution-docs`.
