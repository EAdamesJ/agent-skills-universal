# Universal Agent Skills repository guidance

This file applies to agents modifying this repository. The reusable assets are the directories under `skills/`; this file governs repository maintenance.

## Source of truth

- Edit `skills/<skill-name>/SKILL.md` first.
- Keep every skill portable: do not assume Claude, Codex, or DeepSeek-specific tools in the shared core.
- Use `docs/adapters/` or a narrowly scoped host skill for host-specific behavior.
- Run `npm run sync:deepseek` after any canonical skill change.
- Never hand-edit `.agents/skills/`; it is a generated projection.

## Required workflow

1. Read `SPEC.md` and `tasks/plan.md` before a non-trivial change.
2. Select the applicable workflow skill from `skills/`.
3. Make one focused change at a time.
4. Run `npm test` and `npm run validate` after behavior or structure changes.
5. Review the staged diff for secrets and generated-file parity before committing.

## Skill format

Each skill lives at `skills/<kebab-case-name>/SKILL.md` and starts with YAML frontmatter containing `name` and `description`. Descriptions must say what the skill does and when to use it. Skill bodies should provide steps, anti-rationalization guidance, red flags, and verification evidence.

## Boundaries

- Do not commit secrets, API keys, tokens, credentials, or private user data.
- Do not add runtime dependencies without updating the specification and CI policy.
- Do not treat DeepSeek Harness preview isolation as a security guarantee.
- Do not silently change the upstream attribution or license.
- Do not publish a changed adapter until the local validation passes.

## Commands

```text
npm test
npm run validate
npm run sync:deepseek
```

See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/safety.md](docs/safety.md) for the full contributor and safety workflows.
