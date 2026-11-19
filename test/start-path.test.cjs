const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, cpSync, copyFileSync, rmSync, readFileSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const net = require('node:net');
const { randomBytes } = require('node:crypto');
const { execFileSync, spawn } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');

const repository = path.resolve(__dirname, '..');
const npmCli = process.env.npm_execpath;

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

async function start(fixture) {
  const port = await freePort();
  const child = spawn(process.execPath, [npmCli, 'start'], {
    cwd: fixture,
    env: {
      ...process.env, NODE_ENV: 'test', PORT: String(port),
      JWT_SECRET: randomBytes(32).toString('hex'), ADMIN_EMAIL: '', ADMIN_PASSWORD: '',
    },
    detached: process.platform !== 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  let exited = false;
  const done = new Promise(resolve => child.once('close', (code, signal) => {
    exited = true;
    resolve({ code, signal });
  }));
  child.stdout.on('data', chunk => { output += chunk.toString(); });
  child.stderr.on('data', chunk => { output += chunk.toString(); });
  async function stop() {
    if (!exited) {
      if (process.platform === 'win32') child.kill('SIGTERM');
      else {
        try { process.kill(-child.pid, 'SIGTERM'); }
        catch (error) { if (error.code !== 'ESRCH') throw error; }
      }
    }
    await Promise.race([done, delay(5000).then(() => {
      if (!exited) {
        if (process.platform === 'win32') child.kill('SIGKILL');
        else {
          try { process.kill(-child.pid, 'SIGKILL'); }
          catch (error) { if (error.code !== 'ESRCH') throw error; }
        }
      }
    })]);
  }
  async function ready() {
    for (let attempt = 0; attempt < 150; attempt++) {
      if (exited) throw new Error(`npm start exited before serving requests:\n${output}`);
      try {
        const response = await fetch(`http://127.0.0.1:${port}/api/v1/services`, {
          signal: AbortSignal.timeout(500),
        });
        await response.text();
        return;
      } catch { await delay(100); }
    }
    throw new Error(`npm start did not become ready:\n${output}`);
  }
  return { port, ready, stop, done, output: () => output };
}

async function assertProtected(port) {
  const base = `http://127.0.0.1:${port}/api/v1`;
  for (const [method, route] of [
    ['GET', '/bookings'], ['GET', '/bookings/bkg_001'], ['POST', '/bookings'],
    ['PUT', '/bookings/bkg_001'], ['PATCH', '/bookings/bkg_001'], ['DELETE', '/bookings/bkg_001'],
  ]) {
    const response = await fetch(base + route, { method });
    assert.equal(response.status, 401, `${method} ${route} must reject unauthenticated access`);
    assert.equal(response.headers.get('www-authenticate'), 'Bearer');
    await response.text();
  }
  const services = await fetch(base + '/services');
  assert.equal(services.status, 200);
  assert.equal((await services.json()).data.length, 2);
}

test('normal npm start protects a clean installation', { timeout: 120000 }, async (t) => {
  assert.ok(npmCli, 'Run through npm test so the npm CLI is available');
  const fixture = mkdtempSync(path.join(tmpdir(), 'booking-clean-start-'));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  // Copy source/config only; never copy the developer\'s built output or .env.
  cpSync(path.join(repository, 'src'), path.join(fixture, 'src'), { recursive: true });
  for (const file of ['package.json', 'package-lock.json', 'tsconfig.json']) {
    copyFileSync(path.join(repository, file), path.join(fixture, file));
  }
  // Reproduce the tracked artifact that a clean checkout receives, including stale output.
  const archive = execFileSync('git', ['archive', 'HEAD', 'dist'], { cwd: repository });
  execFileSync('tar', ['-xf', '-', '-C', fixture], { input: archive });
  // Install from the lockfile rather than sharing the developer's node_modules.
  execFileSync(process.execPath, [npmCli, 'ci', '--include=dev', '--no-audit', '--no-fund'], {
    cwd: fixture, timeout: 60000, stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });

  await t.test('npm ci followed directly by npm start replaces stale artifacts', async () => {
    const server = await start(fixture);
    try {
      await server.ready();
      await assertProtected(server.port);
      assert.match(server.output(), /tsc/);
    } finally { await server.stop(); }
  });

  await t.test('npm start also works when dist is absent', async () => {
    rmSync(path.join(fixture, 'dist'), { recursive: true, force: true });
    const server = await start(fixture);
    try {
      await server.ready();
      await assertProtected(server.port);
    } finally { await server.stop(); }
  });

  await t.test('a failed build never falls back to an older application', async () => {
    const main = path.join(fixture, 'src', 'main.ts');
    writeFileSync(main, 'const broken: = ;\n' + readFileSync(main, 'utf8'));
    const server = await start(fixture);
    try {
      const result = await Promise.race([
        server.done,
        delay(15000).then(() => { throw new Error('Expected npm start to fail promptly'); }),
      ]);
      assert.notEqual(result.code, 0);
      assert.doesNotMatch(server.output(), /Nest application successfully started/);
      await assert.rejects(fetch(`http://127.0.0.1:${server.port}/api/v1/bookings`, {
        signal: AbortSignal.timeout(1000),
      }));
    } finally { await server.stop(); }
  });
});
