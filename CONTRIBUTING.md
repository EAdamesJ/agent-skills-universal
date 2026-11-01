# Contributing

Thanks for helping improve Universal Agent Skills. Contributions should make agent behavior more specific, safer, and easier to verify.

## Before proposing a skill

1. Search `skills/`, `agents/`, `references/`, and open issues for an existing workflow that already covers the request.
2. Prefer extending an existing skill over adding a near-duplicate.
3. Define a narrow trigger in the frontmatter description.
4. Keep the portable core free of host-specific commands and assumptions.
5. If the workflow is DeepSeek Harness-specific, prefix the skill with `deepseek-harness-` and document the preview-runtime dependency.

## Skill requirements

Every new skill must:

- live in `skills/<kebab-case-name>/SKILL.md`;
- contain valid YAML frontmatter with `name` and `description`;
- explain when it applies and when it does not;
- provide concrete steps and a verification section;
- treat external data and model output as untrusted;
- avoid secrets, destructive defaults, and unbounded network or shell operations;
- include supporting files only when they materially improve the workflow.

Use [docs/skill-anatomy.md](docs/skill-anatomy.md) as the format reference.

## Validation

Run the following from the repository root:

```text
npm test
npm run validate
```

If a canonical skill changed, regenerate the DeepSeek projection first:

```text
npm run sync:deepseek
```

Do not hand-edit `.agents/skills/`. The validator will fail if the projection differs from `skills/`.

## Pull requests

- Keep each pull request focused and reviewable.
- Explain the user-facing problem and why the workflow belongs in this pack.
- Include verification commands and their results.
- Preserve upstream attribution when modifying derived files.
- Do not include secrets, generated build output, personal data, or unrelated formatting changes.

## License

By contributing, you agree that your contribution is provided under the repository's MIT license. The repository contains derived MIT-licensed content; see [NOTICE.md](NOTICE.md).
