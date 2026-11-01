---
name: deepseek-harness-safety-review
description: "Performs a DeepSeek Harness security preflight and plugin audit: threat model, abuse-case tests, least-privilege controls, go-no-go decision, and rollback plan for untrusted dsh plugins and extensions, model-generated commands, prompt injection, credentials, filesystem, process, and network access. Use before enabling or installing unfamiliar Harness code or opening a sensitive workspace."
---

# DeepSeek Harness safety review

## Overview

DeepSeek Harness can run model-generated commands, load third-party plugins, and access the files, processes, credentials, and network resources exposed to it. It is a developer preview, not a security boundary. This workflow turns that warning into a concrete preflight review.

## When to Use

Use this workflow before enabling an unfamiliar Harness plugin, installing a bundle, exposing credentials or network access, or opening a sensitive workspace to a model-driven session.

Do not treat a passing review as a permanent approval: re-review changes to code, dependencies, configuration, or permissions.

## Process

### 1. Identify assets and trust boundaries

List what the extension can read, write, execute, or transmit:

- source code, generated artifacts, and user documents;
- environment variables, API keys, SSH material, and cloud credentials;
- child processes, shells, terminals, browsers, and network destinations;
- session history, prompts, tool arguments, and model-generated output.

For each boundary, ask how an attacker could spoof, tamper with, disclose, exhaust, or escalate access. Treat repository files, fetched pages, logs, tool results, and model output as untrusted input.

### 2. Inspect the complete extension

Read the manifest, patch, `SKILL.md`, scripts, templates, configuration, and install instructions. Check for:

- hidden network calls or telemetry;
- shell commands assembled from model or user text;
- broad recursive delete, move, or overwrite operations;
- secret collection, logging, or prompt injection;
- dynamic code execution, unsafe deserialization, or unbounded loops;
- dependencies and install scripts that are not required for the stated purpose.

Do not approve a plugin based only on its README or display name.

### 3. Constrain execution

Use a disposable workspace or VM for untrusted extensions. Grant the least filesystem, network, process, and credential access needed for the test. Keep credentials out of the environment whenever possible. Require confirmation before destructive or irreversible actions.

Validate paths against an allowlisted root, reject symlink escapes, cap input sizes and loop depth, and allowlist network destinations. Do not rely on a prompt instruction as an authorization control.

### 4. Test abuse cases

At minimum, test:

1. a malicious instruction embedded in a repository file;
2. a model response that requests a command outside the task;
3. a path traversal or symlink escape;
4. a missing or malformed configuration value;
5. a revoked or unavailable credential;
6. a network timeout and an unexpected redirect.

The expected result is a visible, bounded failure that leaves the workspace and credentials intact.

### 5. Record the decision

Report the reviewed files, permissions granted, abuse cases run, findings, residual risk, and rollback steps. Mark the extension approved, approved only in a disposable environment, or rejected. Re-review after changes to plugin code, dependencies, or permissions.

## Common Rationalizations

| Excuse | Required response |
|---|---|
| "It is an official-looking plugin." | Review code and permissions; names do not prove trust. |
| "The model will follow the system prompt." | Enforce permissions in code and the host, not in prompts. |
| "The command only runs locally." | Local execution can delete files or exfiltrate credentials. Isolate it. |
| "The skill needs all workspace access." | Start with the smallest allowlisted root and expand only with evidence. |
| "The audit found no dependency CVE." | Audits do not detect malicious behavior, prompt injection, or unsafe defaults. |

## Red Flags

- Broad permissions with no documented reason.
- Network calls to user-controlled URLs.
- Secrets copied into prompts, logs, or artifacts.
- Model output interpolated into shell commands or file paths.
- A cleanup command whose target is derived from untrusted input.
- Failed checks hidden by a fallback or a silent catch.

## Verification

- [ ] Assets and trust boundaries are written down.
- [ ] All extension files and dependencies were reviewed.
- [ ] Least-privilege execution was used.
- [ ] Abuse cases fail safely and visibly.
- [ ] Residual risk, permissions, and rollback steps are recorded.
