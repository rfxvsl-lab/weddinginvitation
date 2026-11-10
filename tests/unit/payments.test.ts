import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createTestDatabase } from './helpers/db.ts';

createTestDatabase();

type Repo = typeof import('../../src/server/repo.ts');
type Payments = typeof import('../../src/server/payments.ts');
let repo: Repo;
let payments: Payments;
let db: typeof import('../../src/lib/turso.ts');

before(async () => {
  repo = await import('../../src/server/repo.ts');
  payments = await import('../../src/server/payments.ts');
  db = await import('../../src/lib/turso.ts');
});

let seq = 0;
async function newUser(packageId: 'demo' | 'reguler' | 'premium' | 'luxury', paymentStatus: 'pending' | 'success') {
  seq += 1;
  const user = await repo.createUser({
    fullName: `User ${seq}`,
    coupleGroom: 'Rian',
    coupleBride: 'Salsa',
    activeSlug: `slug-${seq}`,
    email: `User${seq}@Example.com`,
    password: 'rahasia123',
    noWa: '0812',
    sosmed: '',
    packageId,
    isCustomByRfx: false,
    paymentStatus,
  });
  const invitationId = await repo.createInvitation(user.id, 'Undangan', 'rfx-dark', {} as any);
  return { user, invitationId };
}

async function newTx(
  userId: string,
  orderId: string,
  txType: 'signup' | 'upgrade' | 'extend',
  packageId: 'reguler' | 'premium' | 'luxury',
  nominal: number
) {
  return repo.createTransaction({
    userId, userName: 'U', userSlug: 's', userEmail: 'e', packageId, isCustomByRfx: false,
    nominalExpected: nominal, status: 'pending', timestamp: 'now', proofImage: '', orderId, txType,
  });
}

const DAY = 24 * 60 * 60 * 1000;

test('akun baru: role user, email dinormalkan, password scrypt', async () => {
  const { user } = await newUser('reguler', 'pending');
  assert.equal(user.role, 'user');
  const stored = await repo.getUserById(user.id);
  assert.equal(stored?.email, user.email);
  assert.equal(stored?.email, stored?.email.toLowerCase());
  assert.equal((stored as any).password, undefined);
  const row = await db.dbExecute('SELECT password_hash FROM users WHERE id = :id', { id: user.id });
  assert.ok(String(row.rows[0].password_hash).startsWith('scrypt$'));
});

test('login: password benar diterima, salah ditolak, email tak dikenal ditolak', async () => {
  const { user } = await newUser('reguler', 'pending');
  assert.equal((await repo.verifyUserPassword(user.email, 'rahasia123'))?.id, user.id);
  assert.equal(await repo.verifyUserPassword(user.email, 'salah'), null);
  assert.equal(await repo.verifyUserPassword('tidak-ada@example.com', 'rahasia123'), null);
});

test('email admin yang belum terdaftar tidak lagi dibuatkan akun otomatis', async () => {
  process.env.ADMIN_EMAIL = 'bos@example.com';
  try {
    assert.equal(await repo.verifyUserPassword('bos@example.com', 'password-penyerang'), null);
    assert.equal(await repo.getUserByEmail('bos@example.com'), null);
  } finally {
    delete process.env.ADMIN_EMAIL;
  }
});

test('hash lama SHA-256 diterima sekali lalu diganti scrypt', async () => {
  const { user } = await newUser('reguler', 'pending');
  const legacy = createHash('sha256').update('lama12345').digest('hex');
  await db.dbExecute('UPDATE users SET password_hash = :h WHERE id = :id', { h: legacy, id: user.id });
  assert.equal((await repo.verifyUserPassword(user.email, 'lama12345'))?.id, user.id);
  const row = await db.dbExecute('SELECT password_hash FROM users WHERE id = :id', { id: user.id });
  assert.ok(String(row.rows[0].password_hash).startsWith('scrypt$'));
  assert.equal((await repo.verifyUserPassword(user.email, 'lama12345'))?.id, user.id);
});

test('peran admin hanya dari kolom role', async () => {
  const { user } = await newUser('reguler', 'success');
  await repo.setUserRole(user.id, 'admin');
  assert.equal((await repo.getUserById(user.id))?.role, 'admin');
});

test('harga ditentukan server', () => {
  assert.equal(payments.priceFor('reguler', false), 35000);
  assert.equal(payments.priceFor('luxury', true), 180000);
});

test('rencana order pendaftaran', async () => {
  const pending = (await newUser('premium', 'pending')).user;
  assert.deepEqual(payments.planSignupOrder(pending), { ok: true, txType: 'signup', packageId: 'premium', amount: 90000 });
  assert.equal(payments.planSignupOrder((await newUser('demo', 'success')).user).ok, false);
  assert.equal(payments.planSignupOrder((await newUser('reguler', 'success')).user).ok, false);
});

test('rencana order upgrade dan perpanjangan', async () => {
  const reguler = (await newUser('reguler', 'success')).user;
  assert.deepEqual(payments.planUpgradeOrder(reguler, 'upgrade', 'luxury'), { ok: true, txType: 'upgrade', packageId: 'luxury', amount: 150000 });
  assert.equal(payments.planUpgradeOrder(reguler, 'upgrade', 'reguler').ok, false);
  assert.equal(payments.planUpgradeOrder(reguler, 'upgrade', 'demo').ok, false);
  assert.equal(payments.planUpgradeOrder(reguler, 'upgrade', 'gratis').ok, false);
  assert.equal(payments.planUpgradeOrder(reguler, 'hadiah', 'luxury').ok, false);
  assert.deepEqual(payments.planUpgradeOrder(reguler, 'extend', 'reguler'), { ok: true, txType: 'extend', packageId: 'reguler', amount: 35000 });
  assert.equal(payments.planUpgradeOrder(reguler, 'extend', 'luxury').ok, false);
  assert.equal(payments.planUpgradeOrder((await newUser('demo', 'success')).user, 'extend', 'demo').ok, false);
});

test('pendaftaran lunas: user sukses, undangan aktif, dan hanya diterapkan sekali', async () => {
  const { user, invitationId } = await newUser('reguler', 'pending');
  const tx = await newTx(user.id, 'RU-SIGNUP-0001', 'signup', 'reguler', 35000);

  const found = await repo.getTransactionByOrderId('RU-SIGNUP-0001');
  assert.equal(found?.id, tx.id);
  assert.equal(found?.txType, 'signup');

  assert.equal(await payments.settleTransaction(found!), 'applied');
  assert.equal((await repo.getUserById(user.id))?.paymentStatus, 'success');
  const inv = await repo.getInvitationById(invitationId);
  assert.ok(inv?.activatedAt);
  const days = (new Date(inv!.expiresAt!).getTime() - Date.now()) / DAY;
  assert.ok(days > 19.9 && days <= 20, `masa aktif reguler 20 hari, dapat ${days}`);
  assert.equal((await repo.getTransactionById(tx.id))?.status, 'success');

  assert.equal(await payments.settleTransaction(found!), 'already-settled');
  assert.equal((await repo.getInvitationById(invitationId))?.expiresAt, inv!.expiresAt);
});

test('upgrade lunas: paket naik, status tetap sukses, masa aktif mengikuti tier baru', async () => {
  const { user, invitationId } = await newUser('reguler', 'success');
  await repo.activateInvitation(invitationId, 'reguler');
  const tx = await newTx(user.id, 'RU-UPGRADE-0001', 'upgrade', 'premium', 90000);

  assert.equal((await repo.getUserById(user.id))?.packageId, 'reguler', 'paket belum berubah sebelum lunas');
  assert.equal(await payments.settleTransaction(tx), 'applied');

  const after = await repo.getUserById(user.id);
  assert.equal(after?.packageId, 'premium');
  assert.equal(after?.paymentStatus, 'success');
  const days = (new Date((await repo.getInvitationById(invitationId))!.expiresAt!).getTime() - Date.now()) / DAY;
  assert.ok(days > 59.9 && days <= 60, `masa aktif premium 60 hari, dapat ${days}`);
});

test('perpanjangan lunas menambah masa aktif tepat satu kali walau webhook dikirim ulang', async () => {
  const { user, invitationId } = await newUser('reguler', 'success');
  await repo.activateInvitation(invitationId, 'reguler');
  const before = new Date((await repo.getInvitationById(invitationId))!.expiresAt!).getTime();
  const tx = await newTx(user.id, 'RU-EXTEND-0001', 'extend', 'reguler', 35000);

  const results = await Promise.all([payments.settleTransaction(tx), payments.settleTransaction(tx), payments.settleTransaction(tx)]);
  assert.equal(results.filter((r) => r === 'applied').length, 1);

  const after = new Date((await repo.getInvitationById(invitationId))!.expiresAt!).getTime();
  assert.equal(Math.round((after - before) / DAY), 20);
  assert.equal((await repo.getUserById(user.id))?.packageId, 'reguler');
});

test('transaksi lama tanpa kolom order_id tetap ditemukan, tanpa salah cocok', async () => {
  const { user } = await newUser('reguler', 'pending');
  const legacy = await repo.createTransaction({
    userId: user.id, userName: 'U', userSlug: 's', userEmail: 'e', packageId: 'reguler', isCustomByRfx: false,
    nominalExpected: 35000, status: 'pending', timestamp: 'now', proofImage: '',
    aiResult: { isAuthentic: false, reasons: ['Pakasir Order ID: RU-LEGACY-12', 'Method: qris'] },
  });
  assert.equal((await repo.getTransactionByOrderId('RU-LEGACY-12'))?.id, legacy.id);
  assert.equal(await repo.getTransactionByOrderId('RU-LEGACY-1'), null, 'awalan order ID tidak boleh cocok');
  assert.equal(await repo.getTransactionByOrderId("x' OR '1'='1"), null);
  assert.equal(await repo.getTransactionByOrderId('%'), null);
});

test('order_id unik', async () => {
  const { user } = await newUser('reguler', 'pending');
  await newTx(user.id, 'RU-UNIQUE-0001', 'signup', 'reguler', 35000);
  await assert.rejects(() => newTx(user.id, 'RU-UNIQUE-0001', 'signup', 'reguler', 35000));
});

test('lookup kepemilikan', async () => {
  const a = await newUser('premium', 'success');
  const b = await newUser('premium', 'success');
  const guest = await repo.addGuest(a.invitationId, { name: 'Tamu A', group: '', phoneNumber: '0811', paxLimit: 2, status: 'Draft' });
  assert.equal((await repo.getInvitationMeta(a.invitationId))?.userId, a.user.id);
  assert.notEqual((await repo.getInvitationMeta(a.invitationId))?.userId, b.user.id);
  assert.equal(await repo.getParentInvitationId('guest', guest.id), a.invitationId);
  assert.equal(await repo.getParentInvitationId('guest', 'tidak-ada'), null);
  assert.equal(await repo.getInvitationMeta('tidak-ada'), null);
  assert.equal(await repo.countGuestsByInvitation(a.invitationId), 1);
  assert.equal(await repo.countInvitationsByUser(b.user.id), 1);
});

test('rate limit bersama: menolak setelah batas dan pulih setelah jendela lewat', async () => {
  const { rateLimit } = await import('../../src/server/rateLimit.ts');
  const opts = { identifier: 'test:1.2.3.4', max: 3, windowSecs: 1 };
  assert.equal((await rateLimit(opts)).success, true);
  assert.equal((await rateLimit(opts)).success, true);
  assert.equal((await rateLimit(opts)).success, true);
  const blocked = await rateLimit(opts);
  assert.equal(blocked.success, false);
  assert.equal(blocked.remaining, 0);
  assert.equal((await rateLimit({ ...opts, identifier: 'test:5.6.7.8' })).success, true, 'kunci lain tidak terpengaruh');
  const stored = await db.dbExecute('SELECT count FROM rate_limits WHERE key = :k', { k: 'test:1.2.3.4' });
  assert.equal(Number(stored.rows[0].count), 4, 'hitungan tersimpan di database, bukan memori');
  await new Promise((r) => setTimeout(r, 1100));
  assert.equal((await rateLimit(opts)).success, true);
});
