import { scrypt as scryptCb, randomBytes, timingSafeEqual, createHash } from 'node:crypto';

/**
 * Password hashing — scrypt dengan salt acak per user.
 * Format tersimpan: "scrypt$<saltHex>$<hashHex>"
 *
 * Hash lama (SHA-256 hex tanpa salt) tetap diterima sekali saat login,
 * lalu otomatis di-upgrade ke scrypt (lihat `needsRehash`).
 */

const KEYLEN = 64;
const COST = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function scrypt(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password.normalize('NFKC'), salt, KEYLEN, COST, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(
  password: string,
  stored: string | null | undefined
): Promise<{ ok: boolean; needsRehash: boolean }> {
  if (!stored || !password) return { ok: false, needsRehash: false };

  if (stored.startsWith('scrypt$')) {
    const [, saltHex, hashHex] = stored.split('$');
    if (!saltHex || !hashHex) return { ok: false, needsRehash: false };
    const expected = Buffer.from(hashHex, 'hex');
    const actual = await scrypt(password, Buffer.from(saltHex, 'hex'));
    const ok = expected.length === actual.length && timingSafeEqual(expected, actual);
    return { ok, needsRehash: false };
  }

  // Legacy: SHA-256 hex tanpa salt
  if (/^[a-f0-9]{64}$/i.test(stored)) {
    const legacy = createHash('sha256').update(password).digest();
    const expected = Buffer.from(stored, 'hex');
    const ok = timingSafeEqual(expected, legacy);
    return { ok, needsRehash: ok };
  }

  return { ok: false, needsRehash: false };
}

export function validatePasswordStrength(password: string): string | null {
  if (!password || password.length < 8) return 'Password minimal 8 karakter.';
  if (password.length > 200) return 'Password terlalu panjang.';
  return null;
}
