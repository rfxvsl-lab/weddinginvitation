import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyGoogleIdToken } from '../../src/server/google.ts';

const CLIENT_ID = 'app-123.apps.googleusercontent.com';
const TOKEN = 'aaaaaaaaaaaa.bbbbbbbbbbbb.cccccccccccc';
const NOW = 1_800_000_000_000;

const claims = (over: Record<string, unknown> = {}) => ({
  aud: CLIENT_ID,
  iss: 'https://accounts.google.com',
  email: 'Rian@Example.com',
  email_verified: 'true',
  exp: String(NOW / 1000 + 600),
  name: 'Rian',
  picture: 'https://lh3.googleusercontent.com/a/x',
  ...over,
});

const fetchReturning = (body: unknown, ok = true) => async () => ({ ok, json: async () => body });

test('token sah mengembalikan identitas dengan email huruf kecil', async () => {
  const id = await verifyGoogleIdToken(TOKEN, CLIENT_ID, fetchReturning(claims()), NOW);
  assert.deepEqual(id, { email: 'rian@example.com', name: 'Rian', picture: 'https://lh3.googleusercontent.com/a/x' });
});

test('token untuk aplikasi lain (aud berbeda) ditolak', async () => {
  assert.equal(await verifyGoogleIdToken(TOKEN, CLIENT_ID, fetchReturning(claims({ aud: 'lain' })), NOW), null);
});

test('email belum terverifikasi, issuer asing, atau kedaluwarsa ditolak', async () => {
  assert.equal(await verifyGoogleIdToken(TOKEN, CLIENT_ID, fetchReturning(claims({ email_verified: 'false' })), NOW), null);
  assert.equal(await verifyGoogleIdToken(TOKEN, CLIENT_ID, fetchReturning(claims({ iss: 'https://evil.test' })), NOW), null);
  assert.equal(await verifyGoogleIdToken(TOKEN, CLIENT_ID, fetchReturning(claims({ exp: String(NOW / 1000 - 1) })), NOW), null);
});

test('Google menolak token, atau jaringan gagal', async () => {
  assert.equal(await verifyGoogleIdToken(TOKEN, CLIENT_ID, fetchReturning({ error: 'invalid_token' }, false), NOW), null);
  assert.equal(
    await verifyGoogleIdToken(TOKEN, CLIENT_ID, async () => { throw new Error('network'); }, NOW),
    null
  );
});

test('bukan JWT atau client id kosong tidak pernah memanggil Google', async () => {
  let called = 0;
  const spy = async () => { called += 1; return { ok: true, json: async () => claims() }; };
  assert.equal(await verifyGoogleIdToken('bukan-jwt', CLIENT_ID, spy, NOW), null);
  assert.equal(await verifyGoogleIdToken({ email: 'x' }, CLIENT_ID, spy, NOW), null);
  assert.equal(await verifyGoogleIdToken(TOKEN, '', spy, NOW), null);
  assert.equal(called, 0);
});
