# Installation by host

The repository has one canonical skill tree and host-specific installation paths. Choose one installation mode per host; do not maintain a hand-edited copy beside the generated projection.

## Claude Code

For a local checkout:

```text
git clone https://github.com/EAdamesJ/agent-skills-universal.git
claude --plugin-dir ./agent-skills-universal
```

For a marketplace installation:

```text
/plugin marketplace add https://github.com/EAdamesJ/agent-skills-universal.git
/plugin install universal-agent-skills@universal-agent-skills
```

Claude Code custom skills are filesystem-based. If you are embedding selected skills in a project rather than installing the plugin, copy the required directories from `skills/` to the project's `.claude/skills/` directory.

## Codex

Register the repository as a plugin marketplace and install the named plugin:

```text
codex plugin marketplace add https://github.com/EAdamesJ/agent-skills-universal
codex plugin add universal-agent-skills@universal-agent-skills
```

The `.codex-plugin/plugin.json` manifest points Codex at `skills/`. The canonical directory can also be copied into a project-local Codex skill location when the host is configured for filesystem skills.

## DeepSeek Harness

DeepSeek Harness discovers workspace skills through its filesystem skill provider. Keep the repository root as the Harness workspace so `.agents/skills/` is visible:

```text
git clone https://github.com/EAdamesJ/agent-skills-universal.git
cd agent-skills-universal
npx @deepseek-ai/dsh web
```

If you modify `skills/`, regenerate the projection:

```text
npm run sync:deepseek
```

The Harness is in developer preview and its plugin APIs can change. Read [deepseek-harness.md](deepseek-harness.md) and [safety.md](safety.md) before enabling persistent bundles or credentials.

The optional reference bundle lives at `integrations/deepseek-harness/universal-agent-skills-bundle/`. Install it only into a disposable profile; it is a diagnostic bundle and does not grant additional tools or permissions.

## Keeping an installation current

Pin a release tag for reproducibility when the host supports it. For a checkout, pull updates, run `npm run sync:deepseek`, and run `npm run check` before using the updated skills in a sensitive workspace.
