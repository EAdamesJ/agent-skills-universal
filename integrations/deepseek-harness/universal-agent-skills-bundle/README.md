# Universal Agent Skills — DeepSeek Harness bundle

This is a minimal, safe reference bundle for the official DeepSeek Harness
bundle format. It inserts one diagnostic plugin and prints a load message; it
does not grant shell, filesystem, network, browser, or credential access.

The skills themselves remain available through the checked-in `.agents/skills/`
project root. The bundle is optional and exists to verify the persistent plugin
installation seam without replacing the Harness skill provider.

## Install into a disposable profile

From the repository root, with `dsh` installed:

```sh
dsh plugin --profile universal-agent-skills add ./integrations/deepseek-harness/universal-agent-skills-bundle
dsh --profile universal-agent-skills --dump-config
dsh --profile universal-agent-skills
```

The dump should include a `universal-agent-skills-diagnostic` row, and startup
should print the bundle-loaded message. Remove it again with:

```sh
dsh plugin --profile universal-agent-skills remove universal-agent-skills-dsh-bundle
```

Use the normal workspace projection when you only need skills:

```sh
npx @deepseek-ai/dsh web
```

Read the [official bundle guide](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish)
and the [DeepSeek Harness safety notice](https://github.com/deepseek-ai/deepseek-harness/blob/master/SAFETY.md)
before installing third-party bundles. DeepSeek Harness is developer-preview
software; verify the installed version satisfies the `engines.dsh` range.
