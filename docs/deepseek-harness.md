# DeepSeek Harness adapter

DeepSeek Harness (`dsh`) is an open-source, plugin-oriented agent harness. Its upstream project describes the current release as a developer preview with compatibility-breaking changes possible. This repository uses the documented filesystem skill provider and ships an optional reference bundle that exercises the documented bundle seam.

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
2. Start the desired profile with `npx @deepseek-ai/dsh web` or an installed `dsh` CLI.
3. Confirm the skill catalog lists the expected names.
4. Invoke a skill explicitly for the first run and inspect the resulting tool trace.
5. Run `npm run validate` after changes to the canonical tree.

## Harness-specific skills

- `deepseek-harness-plugin-development` covers Cordis extension placement, workspace bundles, profile installation, and new-session verification.
- `deepseek-harness-safety-review` covers the preview runtime's command, filesystem, network, credential, and prompt-injection risks.

These skills are not required for ordinary application development and should not be copied into a portable skill pack without their trigger conditions.

## Optional native bundle

The repository includes [`integrations/deepseek-harness/universal-agent-skills-bundle/`](../integrations/deepseek-harness/universal-agent-skills-bundle/), an official-format `dsh.bundle` package. It inserts one diagnostic plugin and proves that a profile can install and remove the bundle; it deliberately grants no shell, filesystem, network, browser, or credential access.

Install it only into a disposable profile:

```text
dsh plugin --profile universal-agent-skills add ./integrations/deepseek-harness/universal-agent-skills-bundle
dsh --profile universal-agent-skills --dump-config
```

The normal `.agents/skills/` projection remains the recommended path when only skills are needed.

## Runtime smoke test

Maintainers can verify the full bundle path without changing a user profile or requiring an API key:

```text
npm run smoke:deepseek
```

The script pins the verified `@deepseek-ai/dsh@0.2.1-rc.5` CLI, creates a temporary `DSH_HOME` and npm cache, installs the local bundle, checks the composed configuration, and boots the profile until the diagnostic plugin reports that it loaded. The temporary profile and cache are removed when the check finishes.

## Compatibility boundary

This repository does not ship a DSH runtime or MCP server. It ships Markdown instructions, a workspace projection, and the optional diagnostic bundle above. For a production plugin, follow the Harness project's current bundle and plugin-manager documentation rather than copying an old patch format from this repository.

## Sources

- [DeepSeek Harness repository](https://github.com/deepseek-ai/deepseek-harness)
- [DeepSeek Harness architecture](https://deepseek-harness.github.io/deepseek-harness/en/reference/)
- [DeepSeek Harness first-plugin guide](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/)
- [DeepSeek Harness bundle guide](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish)
- [DeepSeek Harness filesystem skill provider](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/skill/skill-filesystem/README.md)
- [DeepSeek Harness safety notice](https://github.com/deepseek-ai/deepseek-harness/blob/master/SAFETY.md)
