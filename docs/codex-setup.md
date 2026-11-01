# Using Universal Agent Skills with Codex

This repository is a Codex plugin. Codex consumes the root `skills/` directory through `.codex-plugin/plugin.json`; no copy of the canonical skills is needed for the Codex installation.

## Install

```text
codex plugin marketplace add https://github.com/EAdamesJ/agent-skills-universal
codex plugin add universal-agent-skills@universal-agent-skills
```

The first command registers this repository as the `universal-agent-skills` marketplace. The second installs the plugin from that marketplace. Start a new Codex session after installation so the skill catalog is refreshed.

A local checkout can be registered during development:

```text
codex plugin marketplace add /path/to/agent-skills-universal
codex plugin add universal-agent-skills@universal-agent-skills
```

## Usage

Invoke a skill explicitly with `@`, for example `@spec-driven-development`, or describe the task and let Codex select a skill from its name and description metadata. The 27 skills under `skills/` are available to the plugin.

[Codex uses progressive disclosure](https://developers.openai.com/codex/skills): metadata is available first, and the full `SKILL.md` is loaded only when selected. Do not paste the complete meta-router into an always-on prompt as well as installing the plugin; that duplicates routing work.

## How it works

- `.codex-plugin/plugin.json` is the Codex plugin manifest.
- `.agents/plugins/marketplace.json` declares the repository root as the local marketplace source.
- `skills/<name>/SKILL.md` is shared with Claude Code and other compatible hosts.
- `.agents/skills/` is the separate DeepSeek Harness projection and is not used by Codex's plugin loader.

Claude Code wrappers in `.claude/commands/` are host-specific. On Codex, invoke the underlying skill directly, such as `@spec-driven-development` instead of `/spec`.
