# Universal Agent Skills — guía rápida en español

Colección de workflows de ingeniería para agentes de código. El mismo núcleo funciona con Claude Code, DeepSeek Harness y Codex.

## Instalación rápida

- Claude Code: clona el repo y ejecútalo con `claude --plugin-dir ./agent-skills-universal`, o instálalo desde el marketplace.
- Codex: registra el repo con `codex plugin marketplace add` y añade `universal-agent-skills@universal-agent-skills`.
- DeepSeek Harness: abre el repo como workspace y ejecuta `npx @deepseek-ai/dsh web`; la carpeta `.agents/skills/` ya contiene la proyección necesaria. El bundle diagnóstico opcional está documentado en la guía de DeepSeek Harness.

Consulta la guía completa en [README.md](README.md), la instalación detallada en [docs/installation.md](docs/installation.md) y las advertencias de seguridad en [docs/safety.md](docs/safety.md).

Este proyecto deriva del pack MIT de [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills). La atribución está en [NOTICE.md](NOTICE.md).
