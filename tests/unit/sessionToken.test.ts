import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSessionToken, verifySessionToken, getSessionSecret } from '../../src/server/sessionToken.ts';

const SECRET = 'a'.repeat(48);
const NOW = 1_800_000_000_000;

test('token yang sah diverifikasi dan mengembalikan payload', () => {
  const token = createSessionToken({ uid: 'user-1', role: 'user' }, SECRET, NOW);
  const payload = verifySessionToken(token, SECRET, NOW);
  assert.equal(payload?.uid, 'user-1');
  assert.equal(payload?.role, 'user');
});

test('cookie lama (JSON base64 tanpa tanda tangan) ditolak', () => {
  const legacy = Buffer.from(JSON.stringify({ email: 'x@y.z', isAdmin: true })).toString('base64');
  assert.equal(verifySessionToken(legacy, SECRET, NOW), null);
});

test('payload yang diubah menjadi admin ditolak', () => {
  const token = createSessionToken({ uid: 'user-1', role: 'user' }, SECRET, NOW);
  const [v, , sig] = token.split('.');
  const forgedBody = Buffer.from(JSON.stringify({ uid: 'user-1', role: 'admin', exp: 9_999_999_999 })).toString('base64url');
  assert.equal(verifySessionToken(`${v}.${forgedBody}.${sig}`, SECRET, NOW), null);
});

test('token yang ditandatangani secret lain ditolak', () => {
  const token = createSessionToken({ uid: 'user-1', role: 'admin' }, 'b'.repeat(48), NOW);
  assert.equal(verifySessionToken(token, SECRET, NOW), null);
});

test('token kedaluwarsa ditolak', () => {
  const token = createSessionToken({ uid: 'user-1', role: 'user' }, SECRET, NOW, 60);
  assert.ok(verifySessionToken(token, SECRET, NOW + 59_000));
  assert.equal(verifySessionToken(token, SECRET, NOW + 61_000), null);
});

test('input rusak tidak melempar error', () => {
  for (const bad of [undefined, null, '', 'abc', 'v1.x', 'v1..', 'v2.a.b', 'v1.%%%.%%%']) {
    assert.equal(verifySessionToken(bad as any, SECRET, NOW), null);
  }
});

test('SESSION_SECRET yang kosong atau pendek ditolak', () => {
  const prev = process.env.SESSION_SECRET;
  try {
    delete process.env.SESSION_SECRET;
    assert.throws(() => getSessionSecret(), /SESSION_SECRET/);
    process.env.SESSION_SECRET = 'pendek';
    assert.throws(() => getSessionSecret(), /SESSION_SECRET/);
    process.env.SESSION_SECRET = SECRET;
    assert.equal(getSessionSecret(), SECRET);
  } finally {
    if (prev === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = prev;
  }
});
