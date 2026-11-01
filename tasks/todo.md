# Task checklist

- [x] Task 1: Add project specification, capability map, ADR, and repository governance files.
- [x] Task 2: Rebrand the reference metadata and root agent guidance.
- [x] Task 3: Add DeepSeek-specific skills and synchronize `.agents/skills/`.
- [x] Task 4: Add host installation and compatibility documentation.
- [x] Task 5: Add dependency-free validation and focused tests.
- [x] Task 6: Add CI quality gates and secret-scan protections.
- [x] Task 7: Review, commit, and publish the repository.
- [ ] Task 8: Add an official-format DeepSeek Harness reference bundle and installation guide.
- [ ] Task 9: Tighten DeepSeek skill routing and require rank-1 activation for safety prompts.
- [ ] Task 10: Add negative-path tests for mirror parity, manifests, links, and secret scanning.

## Checkpoint: Foundation

- [x] Spec and plan are committed.
- [x] Attribution and license are preserved.

## Checkpoint: Adapters

- [x] Claude metadata resolves `skills/`.
- [x] Codex metadata resolves `skills/`.
- [x] DeepSeek mirror is synchronized.

## Checkpoint: Release

- [x] Tests pass.
- [x] Validator passes.
- [x] Staged secret scan passes.
- [x] GitHub remote and pushed commit are verified.

## Checkpoint: Verified extension

- [ ] The DSH bundle manifest, patch, and entry point satisfy the documented format.
- [ ] DeepSeek trigger routing reaches 100% rank-1.
- [ ] Validator failure modes have regression tests.
