# Safety and trust model

Skills are instruction packages, not inert documentation. A host may allow them to read files, run commands, call tools, access network resources, or modify the workspace. Review a skill like code before installing it into an environment that contains secrets or production data.

## Minimum safe operating mode

- Use a disposable repository or VM for unfamiliar skills.
- Grant the least filesystem, process, network, and credential access needed.
- Keep API keys and personal data out of prompts and test workspaces.
- Require confirmation before deletes, overwrites, credential use, or external network calls.
- Treat model output, repository content, fetched pages, logs, and tool results as untrusted data.
- Validate model-generated arguments before passing them to a shell, SQL engine, HTML renderer, or file operation.

## DeepSeek Harness warning

The upstream DeepSeek Harness safety notice says the project is developer-preview software and has not undergone a security audit. Sandboxing, approval prompts, and permission controls reduce risk but do not guarantee isolation. Do not treat Harness as the sole security control for untrusted workloads.

## Supply-chain checks

Before installing or updating a pack:

1. Review the complete diff, including scripts and generated resources.
2. Confirm the license and attribution.
3. Run the repository validator and secret scan.
4. Pin a tag or commit for sensitive work.
5. Re-run the review after any dependency, permission, or network change.

## Reporting a concern

Do not publish an exploit or secret in an issue. Follow the repository's private security-reporting path when one is configured, and include the affected skill, version, minimal reproduction, impact, and mitigation without exposing credentials.
