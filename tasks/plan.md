# Implementation Plan: Universal Agent Skills

## Overview

Turn the MIT-licensed reference pack into a clearly attributed, cross-host distribution with a canonical skill tree, Claude/Codex metadata, a DeepSeek Harness mirror, and deterministic quality gates.

## Architecture decisions

- Keep the upstream 25-skill lifecycle as the portable core instead of forking each host's instruction format.
- Add only the DeepSeek-specific workflows that cannot be expressed as generic engineering guidance.
- Prefer generated projection plus parity checks over maintaining three hand-edited copies.
- Keep validation dependency-free so a fresh clone can verify itself before installing anything.

## Task list

### Phase 1: Foundation

- [x] Task 1: Add project specification, capability map, ADR, and repository governance files.
- [x] Task 2: Rebrand the reference metadata and root agent guidance for the universal distribution.

### Phase 2: Host adapters

- [x] Task 3: Add DeepSeek-specific skills and the `.agents/skills/` projection workflow.
- [x] Task 4: Add Claude, Codex, and DeepSeek installation/compatibility documentation.

### Checkpoint: Adapter foundation

- [x] Canonical skill count and metadata are correct.
- [x] DeepSeek mirror is synchronized and parity checks pass.
- [x] Installation commands are explicit and preview caveats are visible.

### Phase 3: Quality system

- [x] Task 5: Add dependency-free validator and focused Node tests.
- [x] Task 6: Add CI quality gates and secret-scan protections.

### Phase 4: Ship

- [ ] Task 7: Review the full diff, run release checks, commit atomically, and publish to GitHub.

### Checkpoint: Complete

- [x] `npm test` passes.
- [x] `npm run validate` passes.
- [x] No secrets are present in the staged diff.
- [ ] GitHub repository URL and pushed commit are verified.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| DeepSeek Harness changes its preview filesystem conventions | Medium | Keep adapter filesystem-first, document preview status, and isolate DSH-specific guidance. |
| Mirror drifts from canonical skills | High | Generate it and fail validation on any mismatch. |
| Upstream content attribution is lost | High | Preserve MIT license and add a clear upstream notice. |
| A skill contains unsafe executable guidance | High | Add safety guidance, review scripts, and keep execution opt-in. |
| GitHub publish targets the wrong account/repository | High | Resolve the active account and check repository existence before creating the remote. |

## Verification checkpoints

- After foundation: inspect metadata and repository guidance.
- After adapters: run sync and parity checks.
- After quality system: run focused tests, full validation, and staged secret scan.
- Before publish: review diff, ensure clean working tree, push only the intended branch, and verify the remote URL.
