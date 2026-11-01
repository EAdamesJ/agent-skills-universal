import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const expectedSkillCount = 27;

function stripQuotes(value) {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'")))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseFrontmatter(text, source = 'SKILL.md') {
  const lines = text.replaceAll('\r\n', '\n').split('\n');
  if (lines[0] !== '---') {
    throw new Error(`${source}: frontmatter must start with ---`);
  }

  const closingIndex = lines.slice(1).findIndex((line) => line === '---');
  if (closingIndex === -1) {
    throw new Error(`${source}: missing closing frontmatter delimiter`);
  }

  const fields = {};
  for (const line of lines.slice(1, closingIndex + 1)) {
    if (line.trim() === '') continue;
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!match) throw new Error(`${source}: invalid frontmatter line: ${line}`);
    fields[match[1]] = stripQuotes(match[2]);
  }

  return {
    fields,
    body: lines.slice(closingIndex + 2).join('\n'),
  };
}

async function listFiles(root, prefix = '') {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const relativePath = prefix ? join(prefix, entry.name) : entry.name;
    if (entry.isDirectory()) {
      files.push(...await listFiles(join(root, entry.name), relativePath));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }
  return files;
}

async function sha256(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

async function validateSkills(root, errors) {
  const skillsRoot = join(root, 'skills');
  const entries = (await readdir(skillsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .sort((left, right) => left.name.localeCompare(right.name));

  if (entries.length !== expectedSkillCount) {
    errors.push(`skills/: expected ${expectedSkillCount} skill directories, found ${entries.length}`);
  }

  for (const entry of entries) {
    const skillPath = join(skillsRoot, entry.name, 'SKILL.md');
    try {
      const contents = await readFile(skillPath, 'utf8');
      const { fields, body } = parseFrontmatter(contents, skillPath);
      if (fields.name !== entry.name) errors.push(`${skillPath}: name must match directory (${entry.name})`);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.name ?? '')) errors.push(`${skillPath}: invalid skill name`);
      if (!fields.description) errors.push(`${skillPath}: description is required`);
      if ((fields.description ?? '').length > 1024) errors.push(`${skillPath}: description exceeds 1024 characters`);
      if (!body.includes('## Verification')) errors.push(`${skillPath}: missing ## Verification section`);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : `${skillPath}: unable to read frontmatter`);
    }
  }

  return entries;
}

async function validateMirror(root, errors) {
  const sourceRoot = join(root, 'skills');
  const projectionRoot = join(root, '.agents', 'skills');
  const sourceFiles = await listFiles(sourceRoot);
  const projectionFiles = await listFiles(projectionRoot).catch(() => []);

  if (sourceFiles.join('\n') !== projectionFiles.join('\n')) {
    errors.push('.agents/skills/: file list differs from skills/; run npm run sync:deepseek');
    return;
  }

  for (const file of sourceFiles) {
    const sourceHash = await sha256(join(sourceRoot, file));
    const projectionHash = await sha256(join(projectionRoot, file));
    if (sourceHash !== projectionHash) {
      errors.push(`.agents/skills/${file}: differs from canonical skills/${file}; run npm run sync:deepseek`);
    }
  }
}

async function validateManifests(root, errors) {
  const manifestPaths = ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json'];
  for (const manifestPath of manifestPaths) {
    const absolutePath = join(root, manifestPath);
    try {
      const manifest = JSON.parse(await readFile(absolutePath, 'utf8'));
      const resolvedSkills = resolve(root, manifest.skills);
      if (resolvedSkills !== resolve(root, 'skills')) errors.push(`${manifestPath}: skills must resolve to ./skills`);
      if (manifest.name !== 'universal-agent-skills') errors.push(`${manifestPath}: unexpected plugin name`);
      if (manifest.version !== '0.1.0') errors.push(`${manifestPath}: unexpected initial version`);
    } catch (error) {
      errors.push(error instanceof Error ? `${manifestPath}: ${error.message}` : `${manifestPath}: invalid JSON`);
    }
  }

  for (const manifestPath of ['package.json', 'plugin.json']) {
    const absolutePath = join(root, manifestPath);
    try {
      const manifest = JSON.parse(await readFile(absolutePath, 'utf8'));
      if (manifest.name !== 'universal-agent-skills') errors.push(`${manifestPath}: unexpected name`);
      if (manifest.version !== '0.1.0') errors.push(`${manifestPath}: unexpected version`);
    } catch (error) {
      errors.push(error instanceof Error ? `${manifestPath}: ${error.message}` : `${manifestPath}: invalid JSON`);
    }
  }
}

async function validateDeepSeekBundle(root, errors) {
  const bundleRoot = join(root, 'integrations', 'deepseek-harness', 'universal-agent-skills-bundle');
  const manifestPath = join(bundleRoot, 'package.json');
  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    if (manifest.name !== 'universal-agent-skills-dsh-bundle') {
      errors.push(`${manifestPath}: unexpected bundle name`);
    }
    if (manifest.version !== '0.1.0') {
      errors.push(`${manifestPath}: unexpected bundle version`);
    }
    if (manifest.type !== 'module') {
      errors.push(`${manifestPath}: bundle must use ES modules`);
    }
    if (manifest.main !== 'index.js') {
      errors.push(`${manifestPath}: bundle main must be index.js`);
    }
    if (manifest.engines?.dsh !== '>=0.2.0-0 <0.3.0') {
      errors.push(`${manifestPath}: unexpected engines.dsh range`);
    }
    if (manifest.dsh?.bundle?.patch !== './cordis.patch.yml') {
      errors.push(`${manifestPath}: dsh.bundle.patch must be ./cordis.patch.yml`);
    }
    for (const file of ['index.js', 'cordis.patch.yml', 'README.md']) {
      if (!manifest.files?.includes(file)) errors.push(`${manifestPath}: files must include ${file}`);
      try {
        await stat(join(bundleRoot, file));
      } catch {
        errors.push(`${manifestPath}: missing bundle file ${file}`);
      }
    }

    const patch = await readFile(join(bundleRoot, 'cordis.patch.yml'), 'utf8');
    if (!patch.includes('id: universal-agent-skills-diagnostic') || !patch.includes('name: universal-agent-skills-dsh-bundle')) {
      errors.push(`${bundleRoot}/cordis.patch.yml: diagnostic plugin row is missing`);
    }

    const entry = await readFile(join(bundleRoot, 'index.js'), 'utf8');
    if (!entry.includes("export const name = 'universal-agent-skills-dsh-bundle'")) {
      errors.push(`${bundleRoot}/index.js: named plugin export is missing`);
    }
    if (!/export function apply\s*\(/.test(entry)) {
      errors.push(`${bundleRoot}/index.js: apply function is missing`);
    }
  } catch (error) {
    errors.push(error instanceof Error ? `${manifestPath}: ${error.message}` : `${manifestPath}: invalid JSON`);
  }
}

async function validateLinks(root, errors) {
  const files = [
    'README.md',
    'README.es.md',
    'SPEC.md',
    'AGENTS.md',
    'CLAUDE.md',
    'CONTRIBUTING.md',
    'docs/installation.md',
    'docs/deepseek-harness.md',
    'docs/compatibility.md',
    'docs/safety.md',
    'docs/decisions/ADR-001-cross-platform-skill-core.md',
    'tasks/plan.md',
  ];
  const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
  for (const file of files) {
    const absolutePath = join(root, file);
    const contents = await readFile(absolutePath, 'utf8');
    for (const match of contents.matchAll(linkPattern)) {
      const link = match[1].trim().replace(/^<|>$/g, '');
      if (/^(?:https?:|mailto:|#)/i.test(link)) continue;
      const target = link.split('#', 1)[0].split('?', 1)[0];
      if (!target) continue;
      const resolvedTarget = resolve(dirname(absolutePath), target);
      if (!resolvedTarget.startsWith(resolve(root) + sep) && resolvedTarget !== resolve(root)) {
        errors.push(`${file}: link escapes repository: ${link}`);
      } else {
        try {
          await stat(resolvedTarget);
        } catch {
          errors.push(`${file}: missing linked file: ${link}`);
        }
      }
    }
  }
}

async function validateSecrets(root, errors) {
  const patterns = [
    /ghp_[A-Za-z0-9]{20,}/,
    /github_pat_[A-Za-z0-9_]{20,}/,
    /AKIA[0-9A-Z]{16}/,
    /-----BEGIN (?:RSA|EC|OPENSSH) PRIVATE KEY-----/,
    /xox[baprs]-[A-Za-z0-9-]{20,}/,
  ];
  const files = (await listFiles(root)).filter((file) => /\.(?:md|json|mjs|js|yml|yaml|txt)$/i.test(file));
  for (const file of files) {
    const contents = await readFile(join(root, file), 'utf8');
    if (patterns.some((pattern) => pattern.test(contents))) errors.push(`${file}: possible secret pattern detected`);
  }
}

export async function validatePack(root = repositoryRoot) {
  const errors = [];
  await validateSkills(root, errors);
  await validateMirror(root, errors);
  await validateManifests(root, errors);
  await validateDeepSeekBundle(root, errors);
  await validateLinks(root, errors);
  await validateSecrets(root, errors);

  const notice = await readFile(join(root, 'NOTICE.md'), 'utf8');
  if (!notice.includes('addyosmani/agent-skills') || !notice.includes('MIT License')) {
    errors.push('NOTICE.md: upstream attribution and MIT notice are required');
  }

  return errors;
}

const invokedPath = process.argv[1] === undefined ? undefined : resolve(process.argv[1]);
if (invokedPath === fileURLToPath(import.meta.url)) {
  const errors = await validatePack();
  if (errors.length > 0) {
    console.error(`Validation failed with ${errors.length} issue(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`Validation passed: ${expectedSkillCount} canonical skills and matching DeepSeek projection.`);
  }
}
