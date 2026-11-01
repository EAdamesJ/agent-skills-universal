import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_DSH_VERSION,
  assertSmokeOutput,
  buildNpxArgs,
} from '../scripts/smoke-deepseek-bundle.mjs';

test('pins the verified DeepSeek Harness CLI invocation', () => {
  assert.equal(DEFAULT_DSH_VERSION, '0.2.1-rc.5');
  assert.deepEqual(buildNpxArgs(['--version']), [
    '--yes',
    '--package',
    '@deepseek-ai/dsh@0.2.1-rc.5',
    'dsh',
    '--version',
  ]);
});

test('requires the bundle marker in runtime output', () => {
  assert.doesNotThrow(() => assertSmokeOutput(
    '[universal-agent-skills] DeepSeek Harness bundle loaded.',
    ['DeepSeek Harness bundle loaded.'],
    'profile boot',
  ));

  assert.throws(
    () => assertSmokeOutput('profile failed', ['DeepSeek Harness bundle loaded.'], 'profile boot'),
    /profile boot did not contain expected output/,
  );
});
