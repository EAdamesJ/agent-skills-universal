import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { parseFrontmatter, validatePack } from '../scripts/validate-universal-pack.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

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

test('the checked-in repository satisfies the universal pack contract', async () => {
  const errors = await validatePack(repositoryRoot);

  assert.deepEqual(errors, []);
});
