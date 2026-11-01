import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function syncDeepSeekSkills(root = repositoryRoot) {
  const sourceRoot = join(root, 'skills');
  const projectionRoot = join(root, '.agents', 'skills');
  const entries = (await readdir(sourceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .sort((left, right) => left.name.localeCompare(right.name));

  if (entries.length === 0) {
    throw new Error(`No canonical skills found in ${sourceRoot}`);
  }

  await rm(projectionRoot, { recursive: true, force: true });
  await mkdir(projectionRoot, { recursive: true });

  for (const entry of entries) {
    await cp(join(sourceRoot, entry.name), join(projectionRoot, entry.name), {
      recursive: true,
      force: true,
    });
  }

  return { count: entries.length, sourceRoot, projectionRoot };
}

const invokedPath = process.argv[1] === undefined ? undefined : resolve(process.argv[1]);
if (invokedPath === fileURLToPath(import.meta.url)) {
  const result = await syncDeepSeekSkills();
  console.log(`Synchronized ${result.count} skills to .agents/skills/`);
}
