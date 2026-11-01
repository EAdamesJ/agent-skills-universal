import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';

import { parseFrontmatter, validatePack } from '../scripts/validate-universal-pack.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function validateRepositoryCopy(mutator) {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'universal-agent-skills-'));
  const copyRoot = join(temporaryDirectory, 'repo');
  try {
    await cp(repositoryRoot, copyRoot, {
      recursive: true,
      filter(source) {
        return !source.includes(`${sep}.git${sep}`) && !source.includes(`${sep}node_modules${sep}`);
      },
    });
    await mutator(copyRoot);
    return await validatePack(copyRoot);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

test('parses the required skill frontmatter fields', () => {
  const result = parseFrontmatter(`---\nname: example-skill\ndescription: Use when validating an example skill.\n---\n\n# Example`);

  assert.equal(result.fields.name, 'example-skill');
  assert.equal(result.fields.description, 'Use when validating an example skill.');
  assert.match(result.body, /# Example/);
});

test('rejects a skill without a closing frontmatter delimiter', () => {
  assert.throws(
    () => parseFrontmatter('---\nname: broken\ndescription: Missing delimiter'),
    /closing frontmatter delimiter/,
  );
});

test('includes an official-format DeepSeek Harness reference bundle', async () => {
  const bundleRoot = resolve(repositoryRoot, 'integrations', 'deepseek-harness', 'universal-agent-skills-bundle');
  const manifest = JSON.parse(await readFile(resolve(bundleRoot, 'package.json'), 'utf8'));

  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml');
  assert.equal(existsSync(resolve(bundleRoot, 'cordis.patch.yml')), true);
  assert.equal(existsSync(resolve(bundleRoot, 'index.js')), true);
});

test('reports a stale DeepSeek projection', async () => {
  const errors = await validateRepositoryCopy(async (copyRoot) => {
    const projectionFile = resolve(copyRoot, '.agents', 'skills', 'api-and-interface-design', 'SKILL.md');
    const contents = await readFile(projectionFile, 'utf8');
    await writeFile(projectionFile, `${contents}\nprojection drift\n`);
  });

  assert.ok(errors.some((error) => error.includes('.agents/skills/') && error.includes('differs')));
});

test('reports an invalid host manifest', async () => {
  const errors = await validateRepositoryCopy(async (copyRoot) => {
    const manifestPath = resolve(copyRoot, '.codex-plugin', 'plugin.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    manifest.skills = './missing-skills';
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  });

  assert.ok(errors.some((error) => error.includes('.codex-plugin/plugin.json') && error.includes('skills')));
});

test('reports a broken documentation link', async () => {
  const errors = await validateRepositoryCopy(async (copyRoot) => {
    const readmePath = resolve(copyRoot, 'README.md');
    await writeFile(readmePath, `${await readFile(readmePath, 'utf8')}\n[broken local link](docs/does-not-exist.md)\n`);
  });

  assert.ok(errors.some((error) => error.includes('README.md') && error.includes('does-not-exist.md')));
});

test('reports a secret-shaped value in a repository file', async () => {
  const errors = await validateRepositoryCopy(async (copyRoot) => {
    const leakedToken = ['ghp', '_', 'A'.repeat(20)].join('');
    await writeFile(resolve(copyRoot, 'secret-fixture.md'), `token: ${leakedToken}\n`);
  });

  assert.ok(errors.some((error) => error.includes('secret-fixture.md') && error.includes('secret pattern')));
});

test('the checked-in repository satisfies the universal pack contract', async () => {
  const errors = await validatePack(repositoryRoot);

  assert.deepEqual(errors, []);
});
