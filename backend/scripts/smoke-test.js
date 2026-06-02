import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const waitForServer = async (url, timeoutMs = 15000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.status === 200 || res.status === 401) return true;
    } catch {
      // ignore until server is up
    }
    await wait(300);
  }
  return false;
};

const run = async () => {
  const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

  const server = spawn(process.execPath, ['server.js'], {
    cwd: backendDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });

  let stdout = '';
  let stderr = '';
  server.stdout.on('data', (d) => (stdout += d.toString()));
  server.stderr.on('data', (d) => (stderr += d.toString()));

  const base = 'http://localhost:5000';
  const ok = await waitForServer(`${base}/api/public/complaints/counts`);

  if (!ok) {
    server.kill('SIGTERM');
    console.error('❌ Backend did not become ready on :5000');
    if (stdout.trim()) console.error('\n--- backend stdout ---\n' + stdout.trim());
    if (stderr.trim()) console.error('\n--- backend stderr ---\n' + stderr.trim());
    process.exit(1);
  }

  const endpoints = [
    '/api/public/complaints/counts',
    '/api/public/complaints/heatmap',
    '/api/public/feedback',
    '/api/complaints/counts',
    '/api/feedback'
  ];

  const results = [];
  for (const ep of endpoints) {
    const res = await fetch(base + ep);
    const text = await res.text();
    results.push({ ep, status: res.status, body: text.slice(0, 500) });
  }

  server.kill('SIGTERM');

  console.log('✅ Backend smoke test results:');
  for (const r of results) {
    console.log(`- GET ${r.ep} -> ${r.status}`);
  }

  const bad = results.filter((r) => {
    // These private endpoints are expected to require auth; a 401 here is a healthy sign.
    if ((r.ep === '/api/feedback' || r.ep === '/api/complaints/counts') && r.status === 401) return false;
    return r.status >= 400;
  });
  if (bad.length) {
    console.log('\n❌ Some endpoints returned errors (showing first 500 chars):');
    for (const r of bad) {
      console.log(`\n--- ${r.ep} (${r.status}) ---\n${r.body}`);
    }
    process.exit(2);
  }
};

run().catch((err) => {
  console.error('❌ Smoke test failed:', err);
  process.exit(1);
});
