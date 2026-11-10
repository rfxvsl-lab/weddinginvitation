import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  clampInt,
  clampText,
  isOwnCloudinaryUrl,
  isPackageId,
  isRsvpStatus,
  isValidEmail,
  normalizeSlug,
} from '../../src/server/validate.ts';

test('clampText memotong dan menolak non-string', () => {
  assert.equal(clampText('  halo  ', 10), 'halo');
  assert.equal(clampText('x'.repeat(50), 5), 'xxxxx');
  assert.equal(clampText(undefined, 5), '');
  assert.equal(clampText({ a: 1 }, 5), '');
});

test('clampInt menjaga rentang', () => {
  assert.equal(clampInt(5, 1, 10, 1), 5);
  assert.equal(clampInt(999, 1, 10, 1), 10);
  assert.equal(clampInt(-3, 1, 10, 1), 1);
  assert.equal(clampInt('abc', 1, 10, 2), 2);
});

test('normalizeSlug', () => {
  assert.equal(normalizeSlug('Rian-Salsa'), 'rian-salsa');
  assert.equal(normalizeSlug('ab'), null);
  assert.equal(normalizeSlug('a'.repeat(51)), null);
  assert.equal(normalizeSlug('../admin'), 'admin');
  assert.equal(normalizeSlug(42), null);
});

test('isOwnCloudinaryUrl hanya menerima akun Cloudinary sendiri', () => {
  const cloud = 'demo';
  assert.equal(isOwnCloudinaryUrl('https://res.cloudinary.com/demo/image/upload/a.jpg', cloud), true);
  assert.equal(isOwnCloudinaryUrl('http://res.cloudinary.com/demo/image/upload/a.jpg', cloud), false);
  assert.equal(isOwnCloudinaryUrl('https://res.cloudinary.com/orang-lain/image/upload/a.jpg', cloud), false);
  assert.equal(isOwnCloudinaryUrl('https://res.cloudinary.com.evil.test/demo/a.jpg', cloud), false);
  assert.equal(isOwnCloudinaryUrl('https://user@res.cloudinary.com/demo/a.jpg', cloud), false);
  assert.equal(isOwnCloudinaryUrl('http://169.254.169.254/latest/meta-data', cloud), false);
  assert.equal(isOwnCloudinaryUrl('javascript:alert(1)', cloud), false);
  assert.equal(isOwnCloudinaryUrl(undefined, cloud), false);
});

test('enum paket, RSVP, dan email', () => {
  assert.equal(isPackageId('premium'), true);
  assert.equal(isPackageId('superadmin'), false);
  assert.equal(isRsvpStatus('Hadir'), true);
  assert.equal(isRsvpStatus('hadir'), false);
  assert.equal(isValidEmail('a@b.co'), true);
  assert.equal(isValidEmail('bukan-email'), false);
});
