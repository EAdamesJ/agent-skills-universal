# DeepSeek Harness adapter

DeepSeek Harness (`dsh`) is an open-source, plugin-oriented agent harness. Its upstream project describes the current release as a developer preview with compatibility-breaking changes possible. This repository therefore integrates through the stable filesystem convention rather than pretending to provide a long-lived internal plugin API.

## Discovery model

The Harness filesystem skill provider can discover project skills under `.agents/skills/`. This repository keeps a byte-equivalent projection there:

```text
skills/<skill-name>/SKILL.md
    ↓ npm run sync:deepseek
.agents/skills/<skill-name>/SKILL.md
```

The projection includes supporting files so relative references continue to resolve from the skill directory.

## Usage

1. Open the repository root as the Harness workspace.
2. Start the desired `dsh` profile.
3. Confirm the skill catalog lists the expected names.
4. Invoke a skill explicitly for the first run and inspect the resulting tool trace.
5. Run `npm run validate` after changes to the canonical tree.

## Harness-specific skills

- `deepseek-harness-plugin-development` covers Cordis extension placement, workspace bundles, profile installation, and new-session verification.
- `deepseek-harness-safety-review` covers the preview runtime's command, filesystem, network, credential, and prompt-injection risks.

These skills are not required for ordinary application development and should not be copied into a portable skill pack without their trigger conditions.

## Compatibility boundary

This repository does not ship a DSH runtime, Cordis package, or MCP server. It ships Markdown instructions and a workspace projection. For a real persistent plugin, follow the Harness project's current bundle and plugin-manager documentation rather than copying an old patch format from this repository.

## Sources

- [DeepSeek Harness repository](https://github.com/deepseek-ai/deepseek-harness)
- [DeepSeek Harness architecture](https://github.com/deepseek-ai/deepseek-harness/blob/main/docs/architecture.md)
- [DeepSeek Harness safety notice](https://github.com/deepseek-ai/deepseek-harness/blob/main/SAFETY.md)
