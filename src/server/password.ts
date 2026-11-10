/**
 * Hash password dengan scrypt (bawaan Node, tanpa dependensi native).
 *
 * Format baru : scrypt$<N>$<salt base64>$<hash base64>
 * Format lama : 64 karakter hex SHA-256 tanpa salt. Masih bisa diverifikasi
 *               supaya user lama tetap bisa login, lalu di-upgrade saat login.
 */

import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

function scrypt(password: string, salt: Buffer, N: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, salt, KEY_LENGTH, { N, r: SCRYPT_R, p: SCRYPT_P }, (err, key) => {
      if (err) reject(err);
      else resolve(key as Buffer);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, SCRYPT_N);
  return `scrypt$${SCRYPT_N}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export function isLegacyHash(stored: string): boolean {
  return /^[0-9a-f]{64}$/.test(stored);
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored || typeof password !== 'string' || password.length === 0) return false;

  if (stored.startsWith('scrypt$')) {
    const parts = stored.split('$');
    if (parts.length !== 4) return false;
    const N = Number(parts[1]);
    if (!Number.isInteger(N) || N < 2 || N > 1 << 20) return false;
    const salt = Buffer.from(parts[2], 'base64');
    const expected = Buffer.from(parts[3], 'base64');
    if (expected.length !== KEY_LENGTH) return false;
    const actual = await scrypt(password, salt, N);
    return timingSafeEqual(actual, expected);
  }

  if (isLegacyHash(stored)) {
    const actual = createHash('sha256').update(password, 'utf8').digest();
    const expected = Buffer.from(stored, 'hex');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  return false;
}

/** Hash acak yang tidak bisa dicocokkan password apa pun (untuk akun Google). */
export async function unusablePasswordHash(): Promise<string> {
  return hashPassword(randomBytes(32).toString('base64'));
}
