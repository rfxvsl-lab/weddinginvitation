import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { hashPassword, isLegacyHash, verifyPassword } from '../../src/server/password.ts';

test('hash scrypt memakai salt acak dan bisa diverifikasi', async () => {
  const a = await hashPassword('rahasia123');
  const b = await hashPassword('rahasia123');
  assert.ok(a.startsWith('scrypt$'));
  assert.notEqual(a, b);
  assert.equal(await verifyPassword('rahasia123', a), true);
  assert.equal(await verifyPassword('salah', a), false);
});

test('hash lama SHA-256 masih bisa diverifikasi', async () => {
  const legacy = createHash('sha256').update('rahasia123').digest('hex');
  assert.equal(isLegacyHash(legacy), true);
  assert.equal(await verifyPassword('rahasia123', legacy), true);
  assert.equal(await verifyPassword('salah', legacy), false);
});

test('hash kosong, tidak dikenal, atau rusak selalu gagal', async () => {
  assert.equal(await verifyPassword('apa-saja', ''), false);
  assert.equal(await verifyPassword('apa-saja', 'x'), false);
  assert.equal(await verifyPassword('apa-saja', 'scrypt$16384$AAAA'), false);
  assert.equal(await verifyPassword('', await hashPassword('rahasia123')), false);
});
