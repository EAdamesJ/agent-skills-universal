# Universal Agent Skills

Production-oriented workflows for AI coding agents, packaged once and usable from Claude Code, DeepSeek Harness, and Codex.

This repository keeps a portable `SKILL.md` core, native plugin metadata for Claude Code and Codex, and a checked-in `.agents/skills/` projection for DeepSeek Harness. It is designed for real engineering work: clarify requirements, plan small changes, implement incrementally, test, review, secure, and ship.

The portable core is derived from [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills), used under its MIT license. See [NOTICE.md](NOTICE.md) for attribution and the derivative-work boundary.

## Quick start

### Claude Code

Install the repository as a local plugin while developing:

```text
git clone https://github.com/EAdamesJ/agent-skills-universal.git
claude --plugin-dir ./agent-skills-universal
```

Or register the repository as a marketplace source:

```text
/plugin marketplace add https://github.com/EAdamesJ/agent-skills-universal.git
/plugin install universal-agent-skills@universal-agent-skills
```

### Codex

Codex consumes the canonical `skills/` directory through `.codex-plugin/plugin.json`:

```text
codex plugin marketplace add https://github.com/EAdamesJ/agent-skills-universal
codex plugin add universal-agent-skills@universal-agent-skills
```

After installation, invoke a skill explicitly with its native skill syntax, or let the host select it from the description metadata.

### DeepSeek Harness

DeepSeek Harness is currently a developer preview. Clone the repository into the workspace that Harness will open:

```text
git clone https://github.com/EAdamesJ/agent-skills-universal.git
cd agent-skills-universal
npx @deepseek-ai/dsh web
```

The checked-in `.agents/skills/` directory is the Harness discovery projection. It is intentionally committed so a fresh clone works without a build step. An optional official-format diagnostic bundle is documented in [docs/deepseek-harness.md](docs/deepseek-harness.md). Review that guide and [docs/safety.md](docs/safety.md) before enabling plugins or granting access to credentials, files, or network resources.

### Any compatible host

Skills are plain Markdown directories. Hosts that support the open Agent Skills convention can install the canonical tree directly:

```text
npx skills add EAdamesJ/agent-skills-universal
```

## What is included

- 25 portable lifecycle skills covering definition, planning, implementation, testing, review, security, performance, documentation, Git, CI, and release work.
- `deepseek-harness-plugin-development` for Cordis composition, plugin placement, and preview-runtime workflows.
- `deepseek-harness-safety-review` for threat modeling model-generated commands, plugin code, credentials, and filesystem access.
- Specialist personas in `agents/` for code review, testing, security, and web performance.
- Shared checklists in `references/`, routing cases in `evals/`, and host setup guides in `docs/`.
- A dependency-free validator and Node.js test suite.

## Architecture

```text
skills/                  canonical portable skills
.agents/skills/          DeepSeek Harness projection
.claude-plugin/          Claude Code plugin metadata
.codex-plugin/            Codex plugin metadata
agents/                  specialist personas
references/              shared checklists loaded on demand
evals/                   routing and behavioral evaluation cases
scripts/                 synchronization and validation
tests/                   Node.js standard-library tests
docs/                    setup, compatibility, safety, and decisions
tasks/                   current implementation plan
```

Edit `skills/` first. After adding or changing a skill, run:

```text
npm run sync:deepseek
npm test
npm run validate
```

## Commands

| Command | Purpose |
|---|---|
| `npm test` | Run focused repository tests. |
| `npm run validate` | Check frontmatter, adapters, mirror parity, docs, and secrets. |
| `npm run sync:deepseek` | Rebuild `.agents/skills/` from `skills/`. |
| `npm run smoke:deepseek` | Verify the optional DeepSeek Harness bundle in an isolated temporary profile. |
| `npm run check` | Run tests and validation together. |

The core validation commands do not need runtime dependency installation. The optional DeepSeek Harness smoke test downloads its pinned preview CLI into a temporary cache. Node.js 20 or newer is recommended.

## Safety

Skills can instruct an agent to read files, run commands, or use connected tools. Treat every skill as executable guidance: review unfamiliar changes, run agents with least privilege, keep secrets out of prompts and workspaces, and require confirmation for destructive actions. DeepSeek Harness is explicitly experimental and must not be treated as a security boundary. See [docs/safety.md](docs/safety.md).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md), [docs/skill-anatomy.md](docs/skill-anatomy.md), and the current plan in `tasks/` before proposing a change. New skills must be narrow, actionable, portable, and verifiable.

## License

MIT. See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md).
