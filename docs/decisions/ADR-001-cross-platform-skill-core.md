# ADR-001: Use one portable skill core with host projections

## Status

Accepted

## Date

2026-11-01

## Context

Claude Code, Codex, and DeepSeek Harness all consume filesystem-based instructions, but they discover those instructions through different native paths and metadata. Maintaining separate hand-edited copies would make behavior drift likely and would make fixes land inconsistently.

## Decision

Keep `skills/` as the single canonical source. Publish native Claude and Codex plugin metadata that points at it. Generate `.agents/skills/` as a DeepSeek Harness projection and fail validation when the projection differs from the canonical tree.

## Alternatives considered

### Separate skill implementations per host

Rejected because the workflows would drift and most instructions do not depend on a host-specific API.

### Symlinks from host directories to `skills/`

Rejected as the default because Windows clones may not preserve or resolve symlinks without additional developer settings.

### Runtime download from a remote repository

Rejected because it adds a network dependency, weakens reproducibility, and creates a supply-chain change at install time.

## Consequences

- Contributors edit the canonical skill once and run the sync command for DeepSeek Harness.
- The repository stores generated files so a fresh clone works without a build step.
- The validator must compare the projection and canonical source.
- Host-specific guidance belongs in adapter documentation or narrowly scoped skills, not in every portable workflow.
