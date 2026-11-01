import { execFile, spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const DEFAULT_DSH_VERSION = '0.2.1-rc.5';
export const RUNTIME_MARKER = '[universal-agent-skills] DeepSeek Harness bundle loaded.';

const PROFILE_NAME = 'universal-agent-skills';
const PROFILE_BOOT_TIMEOUT_MS = 120_000;
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const bundleRoot = resolve(
  repositoryRoot,
  'integrations',
  'deepseek-harness',
  'universal-agent-skills-bundle',
);

export function buildNpxArgs(args) {
  return [
    '--yes',
    '--package',
    `@deepseek-ai/dsh@${DEFAULT_DSH_VERSION}`,
    'dsh',
    ...args,
  ];
}

export function assertSmokeOutput(output, expected, label) {
  const expectedValues = Array.isArray(expected) ? expected : [expected];
  const missing = expectedValues.filter((value) => !output.includes(value));

  if (missing.length > 0) {
    throw new Error(
      `${label} did not contain expected output: ${missing.join(', ')}\n${output}`,
    );
  }
}

function npxInvocation(args) {
  if (process.platform === 'win32') {
    const npxCli = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npx-cli.js');
    return {
      command: process.execPath,
      args: [npxCli, ...buildNpxArgs(args)],
    };
  }

  return {
    command: 'npx',
    args: buildNpxArgs(args),
  };
}

function isolatedEnvironment(dshHome, npmCache) {
  return {
    ...process.env,
    DSH_HOME: dshHome,
    npm_config_cache: npmCache,
    npm_config_ignore_scripts: 'true',
  };
}

async function runNpx(args, environment) {
  const invocation = npxInvocation(args);

  try {
    const result = await execFileAsync(invocation.command, invocation.args, {
      cwd: repositoryRoot,
      env: environment,
      maxBuffer: 2 * 1024 * 1024,
      windowsHide: true,
    });

    return `${result.stdout}\n${result.stderr}`;
  } catch (error) {
    const output = [error.stdout, error.stderr]
      .filter((value) => value !== undefined && value !== '')
      .join('\n');
    const details = [error.code, error.message, output]
      .filter((value) => value !== undefined && value !== '')
      .join('\n');
    throw new Error(`DeepSeek Harness command failed.\n${details}`, { cause: error });
  }
}

async function terminateProcessTree(child) {
  if (process.platform === 'win32') {
    try {
      await execFileAsync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
        windowsHide: true,
      });
      return;
    } catch {
      // The launcher may have exited before taskkill inspected its process tree.
    }
  }

  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    child.kill();
  }
}

async function bootProfileAndObserveMarker(environment) {
  return new Promise((resolvePromise, rejectPromise) => {
    const invocation = npxInvocation(['--profile', PROFILE_NAME, '--help']);
    const child = spawn(
      invocation.command,
      invocation.args,
      {
        cwd: repositoryRoot,
        env: environment,
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: process.platform !== 'win32',
        windowsHide: true,
      },
    );

    let output = '';
    let settled = false;
    const timeout = setTimeout(() => {
      finish(new Error(`Profile boot timed out after 120 seconds.\n${output}`));
    }, PROFILE_BOOT_TIMEOUT_MS);

    const collectOutput = (chunk) => {
      output += chunk.toString();
      if (output.includes(RUNTIME_MARKER)) finish();
    };

    child.stdout.on('data', collectOutput);
    child.stderr.on('data', collectOutput);
    child.once('error', (error) => finish(error));
    child.once('close', (code) => {
      if (output.includes(RUNTIME_MARKER)) {
        finish();
      } else {
        finish(new Error(`Profile boot exited with code ${code}.\n${output}`));
      }
    });

    function finish(error) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      terminateProcessTree(child).then(() => {
        if (error) {
          rejectPromise(error);
        } else {
          resolvePromise(output);
        }
      });
    }
  });
}

export async function runSmokeTest() {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'universal-agent-skills-dsh-'));
  const environment = isolatedEnvironment(
    join(temporaryRoot, 'dsh-home'),
    join(temporaryRoot, 'npm-cache'),
  );

  try {
    const versionOutput = await runNpx(['--version'], environment);
    assertSmokeOutput(versionOutput, DEFAULT_DSH_VERSION, 'dsh --version');

    const installOutput = await runNpx(
      ['plugin', '--profile', PROFILE_NAME, 'add', bundleRoot],
      environment,
    );
    assertSmokeOutput(installOutput, 'universal-agent-skills-dsh-bundle', 'bundle install');

    const configOutput = await runNpx(
      ['--profile', PROFILE_NAME, '--dump-config'],
      environment,
    );
    assertSmokeOutput(
      configOutput,
      ['universal-agent-skills-diagnostic', 'universal-agent-skills-dsh-bundle'],
      'profile configuration',
    );

    const runtimeOutput = await bootProfileAndObserveMarker(environment);
    assertSmokeOutput(runtimeOutput, RUNTIME_MARKER, 'profile boot');

    return {
      version: DEFAULT_DSH_VERSION,
      profile: PROFILE_NAME,
    };
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  runSmokeTest()
    .then(({ profile, version }) => {
      console.log(`DeepSeek Harness smoke passed: ${version}, profile ${profile}.`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
