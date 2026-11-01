# Spec: Universal Agent Skills

## Objective

Create a public, MIT-licensed skill pack that gives Claude Code, DeepSeek Harness, and Codex the same production-oriented engineering workflows. The repository should be useful as a plugin, as a project-local skills directory, and as a source for future adapters.

Success means a contributor can clone the repository, validate it with one command, install the requested host adapter, and invoke the same lifecycle skills without platform-specific rewrites.

## Scope

### In scope

- Preserve the 25 portable engineering skills from the MIT-licensed reference pack with attribution.
- Add DeepSeek Harness-specific guidance for Cordis/plugin work and preview-runtime safety.
- Provide native metadata and setup paths for Claude Code, Codex, and DeepSeek Harness.
- Keep `skills/` as the canonical source and publish a checked-in `.agents/skills/` mirror for DeepSeek Harness discovery.
- Add deterministic validation for frontmatter, adapter paths, mirror parity, documentation links, and obvious secret leakage.
- Add a Node.js standard-library test suite and GitHub Actions quality gate.
- Document compatibility limits, especially DeepSeek Harness developer-preview status.

### Out of scope

- A runtime agent, model router, MCP server, or UI.
- Making claims about model quality or benchmark superiority.
- Treating DeepSeek Harness sandboxing as a security boundary.
- Shipping proprietary or unlicensed third-party skill content.
- Requiring network access or package installation to run validation.

## Technical decisions

- **Canonical format:** Each skill is a directory containing `SKILL.md` with YAML frontmatter fields `name` and `description`.
- **Canonical source:** `skills/<skill-name>/SKILL.md` and its optional resources.
- **DeepSeek projection:** `.agents/skills/` contains a generated mirror of `skills/`, preserving resource paths so the Harness filesystem provider can discover the pack from a workspace checkout.
- **Metadata:** `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` point at the canonical `skills/` directory.
- **Validation:** `node --test` covers the validator contract; `npm run validate` runs repository checks without third-party packages.
- **Versioning:** The initial release was `0.1.0`; additive releases follow SemVer and keep the changelog human-readable.

## Commands

```text
npm test       Run deterministic repository tests.
npm run validate  Validate skills, adapters, mirror parity, docs, and secrets.
npm run sync:deepseek  Rebuild .agents/skills from skills/.
```

## Project structure

```text
skills/                  Canonical portable skills.
.agents/skills/          DeepSeek Harness discovery mirror.
.claude-plugin/          Claude Code plugin metadata.
.codex-plugin/            Codex plugin metadata.
agents/                  Specialist personas.
references/               Shared checklists loaded on demand.
evals/                    Routing and behavioral evaluation cases.
scripts/                  Validation and adapter synchronization.
tests/                    Node.js standard-library tests.
docs/                     Installation, compatibility, safety, and decisions.
tasks/                    Implementation plan and task checklist.
```

## Testing strategy

- Validate every canonical `SKILL.md` frontmatter block.
- Confirm skill names match directory names and meet the portable naming constraints.
- Confirm `.agents/skills/` has the same skill names and byte-equivalent files after synchronization.
- Confirm Claude/Codex manifests resolve the canonical directory.
- Confirm documentation links that point to repository files resolve.
- Scan tracked text for common secret patterns before commit.
- Run the same checks in GitHub Actions on pushes and pull requests.

## Boundaries

- **Always:** Keep canonical skills portable; include explicit trigger conditions and verification criteria; run validation before commits; preserve license and attribution notices.
- **Ask first:** Changing license; adding executable scripts to a skill; adding network-dependent validation; publishing a new host adapter; changing the public repository name.
- **Never:** Commit API keys or tokens; copy unlicensed skill content; claim a DeepSeek Harness security guarantee; silently diverge the `.agents/skills/` mirror from `skills/`.

## Success criteria

- [ ] The repository documents installation for Claude Code, DeepSeek Harness, and Codex.
- [ ] The canonical catalog contains the 25 reference workflows plus DeepSeek-specific additions.
- [ ] The validator passes locally and in CI.
- [ ] The DeepSeek mirror is synchronized and validated.
- [ ] A clean Git history contains atomic commits for the foundation, adapters, quality system, and documentation.
- [ ] The repository is published publicly under the authenticated GitHub account only after all local gates pass.

## Open questions

- The repository name is provisional; the initial build uses `agent-skills-universal` because no existing repository with that name was found under the active account.
- DeepSeek Harness is a developer preview. Its adapter is intentionally filesystem-first and may need a small follow-up when the Harness plugin API stabilizes.
