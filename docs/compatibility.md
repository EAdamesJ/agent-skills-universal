# Compatibility matrix

| Host | Native path | Status | Notes |
|---|---|---|---|
| Claude Code | `.claude-plugin/plugin.json` → `skills/` | Supported | Use the plugin install flow or copy selected skills into `.claude/skills/`. |
| Codex | `.codex-plugin/plugin.json` → `skills/` | Supported | The canonical tree is the plugin payload. |
| DeepSeek Harness | `.agents/skills/` | Preview adapter | Filesystem discovery is supported; Harness plugin APIs are still changing. |
| Other Agent Skills hosts | `skills/` | Best effort | Plain `SKILL.md` directories are portable, but host-specific loading and commands vary. |

## Compatibility policy

Portable skills must not require host tools. Host-specific skills use an explicit prefix and document the dependency. A compatibility claim is only made for a documented filesystem or plugin path that can be validated locally.
