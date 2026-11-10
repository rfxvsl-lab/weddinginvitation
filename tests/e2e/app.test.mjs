/**
 * Test end-to-end terhadap build produksi (dijalankan lewat tests/e2e/run.mjs).
 *
 * Mencakup alur kritis dan test negatif keamanan:
 *   1. daftar → dashboard → session bertahan → keluar → masuk
 *   2. user lain tidak bisa menyentuh data lewat server action
 *   3. bayar paket: status hanya berubah setelah gateway mengonfirmasi
 *   4. upgrade tidak bisa didapat tanpa membayar
 *   5. panel admin hanya untuk akun ber-role admin
 *   6. halaman undangan publik tidak membocorkan data tamu
 */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createClient } from '@libsql/client';
import { startFakePakasir } from './fakePakasir.mjs';

const require = createRequire(import.meta.url);
function loadChromium() {
  for (const name of ['playwright-core', 'playwright']) {
    try {
      return require(name).chromium;
    } catch {
      /* coba paket berikutnya */
    }
  }
  throw new Error('Butuh paket playwright-core (npm install) dan browser Chromium (npx playwright-core install chromium).');
}

const BASE = process.env.E2E_BASE_URL;
const rawDb = createClient({ url: process.env.E2E_DB_URL });

/**
 * Test dan server membuka file SQLite yang sama dari dua proses, jadi sesekali
 * terkunci sesaat. Ulangi saja; ini tidak terjadi pada Turso di production.
 */
const db = {
  async execute(stmt) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await rawDb.execute(stmt);
      } catch (err) {
        if (attempt >= 40 || !/SQLITE_BUSY|database is locked/i.test(String(err?.message || err))) throw err;
        await new Promise((r) => setTimeout(r, 100));
      }
    }
  },
  close: () => rawDb.close(),
};

let browser;
let gateway;

before(async () => {
  gateway = await startFakePakasir(Number(process.env.E2E_GATEWAY_PORT));
  browser = await loadChromium().launch();
});

after(async () => {
  await browser?.close();
  await gateway?.close();
  db.close();
});

// ---------- helper ----------

let counter = 0;
function person(packageId) {
  counter += 1;
  const tag = `${Date.now().toString(36)}${counter}`;
  return {
    fullName: `Pengguna Uji ${counter}`,
    groom: `Rian${counter}`,
    bride: `Salsa${counter}`,
    email: `uji-${tag}@example.com`,
    password: 'rahasia-123',
    packageId,
  };
}

let ipCounter = 0;
/** Tiap pengunjung datang dari IP berbeda, seperti di balik proxy production. */
function nextIp() {
  ipCounter += 1;
  return `203.0.113.${ipCounter}`;
}

async function newSession() {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    extraHTTPHeaders: { 'x-forwarded-for': nextIp() },
  });
  const page = await context.newPage();
  /** Semua pemanggilan server action yang dilakukan halaman ini. */
  const actions = [];
  page.on('request', (req) => {
    const id = req.headers()['next-action'];
    if (req.method() === 'POST' && id) {
      actions.push({ url: req.url(), id, body: req.postData() || '', headers: req.headers() });
    }
  });
  return { context, page, actions };
}

/** Isi wizard pendaftaran tiga langkah. */
async function register(page, who) {
  await page.goto(`${BASE}/auth?mode=register&package=${who.packageId}`);
  await page.fill('#signup-fullname', who.fullName);
  await page.fill('#signup-groom', who.groom);
  await page.fill('#signup-bride', who.bride);
  await page.getByRole('button', { name: /Lanjut/ }).click();
  await page.fill('#signup-email', who.email);
  await page.fill('#signup-password', who.password);
  await page.fill('#signup-wa', '081200000001');
  await page.fill('#signup-sosmed', '@uji');
  await page.getByRole('button', { name: /Lanjut/ }).click();
  await page.waitForSelector('#signup-slug');
  // Tunggu pengecekan slug (debounce) selesai sebelum mengirim.
  await page.waitForTimeout(900);
  await page.getByRole('button', { name: who.packageId === 'demo' ? /Mulai Sekarang/ : /Lanjut ke Pembayaran/ }).click();
}

async function userRow(email) {
  const res = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
  return res.rows[0];
}

async function invitationOf(userId) {
  const res = await db.execute({ sql: 'SELECT * FROM invitations WHERE user_id = ? ORDER BY created_at DESC', args: [userId] });
  return res.rows[0];
}

/** Dashboard membuat undangan pertama secara asinkron; tunggu sampai ada. */
function firstInvitation(userId) {
  return waitFor(() => invitationOf(userId), 'undangan pertama dibuat');
}

/**
 * Panggil endpoint dari dalam halaman, memakai cookie browser yang sebenarnya.
 * (Cookie session bertanda Secure; klien HTTP di luar browser tidak mengirimnya lewat http.)
 */
function api(page, method, path, body) {
  return page.evaluate(
    async ({ method, path, body }) => {
      const res = await fetch(path, {
        method,
        headers: body === undefined ? {} : { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        redirect: 'manual',
      });
      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {
        /* bukan JSON */
      }
      return { status: res.status, type: res.type, text, json };
    },
    { method, path, body }
  );
}

/** Ulangi sebuah server action yang terekam, dari halaman (session) lain. */
function replayAction(page, act) {
  return page.evaluate(
    async ({ path, id, body, contentType }) => {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'next-action': id, 'content-type': contentType, accept: 'text/x-component' },
        body,
      });
      const text = await res.text();
      // Next.js bisa membalas action yang melempar error dengan HTTP 200 dan
      // baris error ("<n>:E{...}") di dalam payload, jadi keduanya diperiksa.
      const rejected = res.status >= 400 || /^[0-9a-f]+:E\{/m.test(text);
      return { status: res.status, text, rejected };
    },
    {
      path: new URL(act.url).pathname,
      id: act.id,
      body: act.body,
      contentType: act.headers['content-type'] || 'text/plain;charset=UTF-8',
    }
  );
}

async function waitFor(fn, message, timeoutMs = 15000) {
  const start = Date.now();
  for (;;) {
    const value = await fn();
    if (value) return value;
    if (Date.now() - start > timeoutMs) throw new Error(`Timeout: ${message}`);
    await new Promise((r) => setTimeout(r, 250));
  }
}

function webhook(orderId, amount, status = 'completed') {
  return fetch(`${BASE}/api/pakasir-webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ order_id: orderId, amount, project: 'e2e-project', status, payment_method: 'qris' }),
  });
}

async function openDashboardSection(page, label) {
  await page.getByRole('button', { name: 'Buka menu navigasi' }).click();
  await page.getByRole('button', { name: label, exact: true }).click();
}

// ---------- 1. daftar, session, keluar, masuk ----------

test('daftar demo → dashboard; session httpOnly bertahan setelah reload; keluar lalu masuk lagi', async () => {
  const who = person('demo');
  const { context, page } = await newSession();
  try {
    await register(page, who);
    await page.waitForURL(`${BASE}/dashboard`);
    await page.getByText('Pilihan Tema Undangan').waitFor();

    const cookies = await context.cookies();
    const session = cookies.find((c) => c.name === 'rh_session');
    assert.ok(session, 'cookie session dibuat');
    assert.equal(session.httpOnly, true, 'cookie tidak bisa dibaca JavaScript');
    assert.equal(session.sameSite, 'Lax');
    assert.equal(cookies.some((c) => c.name === 'saas_user_session'), false, 'cookie lama tidak dibuat');
    assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), [], 'tidak ada data user di localStorage');
    assert.equal(await page.evaluate(() => document.cookie.includes('rh_session')), false);

    const row = await userRow(who.email);
    assert.equal(row.role, 'user');
    assert.equal(row.payment_status, 'success', 'paket demo langsung aktif');
    assert.ok(String(row.password_hash).startsWith('scrypt$'));
    assert.ok(await firstInvitation(row.id), 'undangan pertama dibuat');

    await page.reload();
    await page.getByText('Pilihan Tema Undangan').waitFor();

    // Keluar: cookie hilang dan dashboard terkunci.
    await page.getByRole('button', { name: 'Buka menu navigasi' }).click();
    await page.getByRole('button', { name: 'Keluar Akun' }).click();
    await page.waitForSelector('#signin-email');
    await waitFor(async () => !(await context.cookies()).some((c) => c.name === 'rh_session'), 'cookie session dihapus');
    await page.goto(`${BASE}/dashboard`);
    await page.waitForURL(/\/auth\?redirect=%2Fdashboard/);

    // Password salah ditolak, password benar diterima.
    await page.fill('#signin-email', who.email);
    await page.fill('#signin-password', 'password-salah');
    await page.click('#signin-submit');
    await page.getByText('Email atau password salah').first().waitFor();
    assert.equal((await context.cookies()).some((c) => c.name === 'rh_session'), false);

    await page.fill('#signin-password', who.password);
    await page.click('#signin-submit');
    await page.waitForURL(`${BASE}/dashboard`);
    await page.getByText('Pilihan Tema Undangan').waitFor();
  } finally {
    await context.close();
  }
});

// ---------- 2. isolasi antar-user ----------

test('user B dan pengunjung tanpa login tidak bisa membaca atau mengubah data user A lewat server action', async () => {
  const a = person('demo');
  const b = person('demo');
  const sa = await newSession();
  const sb = await newSession();
  try {
    await register(sa.page, a);
    await sa.page.waitForURL(`${BASE}/dashboard`);
    await sa.page.getByText('Pilihan Tema Undangan').waitFor();

    // A menambah satu tamu lewat UI.
    await openDashboardSection(sa.page, 'Daftar Tamu');
    await sa.page.getByRole('button', { name: /Tambah Tamu Baru/ }).click();
    await sa.page.getByPlaceholder('e.g. Bapak Budi Prasetyo').fill('Tamu Rahasia A');
    await sa.page.getByPlaceholder('e.g. 081234567890').fill('0811222333');
    await sa.page.getByPlaceholder('e.g. Bapak Budi Prasetyo').press('Enter');
    await sa.page.getByText('Tamu Rahasia A').first().waitFor();

    const rowA = await userRow(a.email);
    const invA = await firstInvitation(rowA.id);
    const guestCount = async () =>
      Number((await db.execute({ sql: 'SELECT COUNT(*) AS n FROM guests WHERE invitation_id = ?', args: [invA.id] })).rows[0].n);
    await waitFor(async () => (await guestCount()) === 1, 'tamu A tersimpan');

    await register(sb.page, b);
    await sb.page.waitForURL(`${BASE}/dashboard`);
    await sb.page.getByText('Pilihan Tema Undangan').waitFor();

    // Semua action milik A yang menyebut undangan A: baca tamu, tambah tamu, simpan data, dst.
    const targeted = sa.actions.filter((act) => act.body.includes(invA.id));
    assert.ok(targeted.length >= 3, `terekam ${targeted.length} action yang menyentuh undangan A`);
    const addGuest = targeted.find((act) => act.body.includes('Tamu Rahasia A'));
    assert.ok(addGuest, 'action tambah tamu terekam');

    const anonymous = await newSession();
    try {
      await anonymous.page.goto(`${BASE}/auth`);
      for (const [label, page] of [['user B', sb.page], ['tanpa login', anonymous.page]]) {
        for (const act of targeted) {
          const res = await replayAction(page, act);
          assert.ok(
            res.rejected,
            `${label}: action ${act.id.slice(0, 8)} harus ditolak, dapat status ${res.status}: ${res.text.slice(0, 200)} | body=${act.body.slice(0, 120)}`
          );
          assert.equal(res.text.includes('Tamu Rahasia A'), false, `${label}: nama tamu A tidak bocor`);
          assert.equal(res.text.includes('0811222333'), false, `${label}: telepon tamu A tidak bocor`);
        }
      }
    } finally {
      await anonymous.context.close();
    }
    assert.equal(await guestCount(), 1, 'tidak ada tamu yang ditambahkan oleh pihak lain');
    const invAfter = await invitationOf(rowA.id);
    assert.equal(invAfter.wedding_data, invA.wedding_data, 'isi undangan A tidak berubah');
    assert.equal(invAfter.theme_id, invA.theme_id);
    assert.equal(invAfter.expires_at, invA.expires_at, 'masa aktif undangan A tidak berubah');

    // Kontrol positif: action yang sama dari session A sendiri berhasil.
    const own = await replayAction(sa.page, addGuest);
    assert.equal(own.rejected, false, own.text.slice(0, 200));
    await waitFor(async () => (await guestCount()) === 2, 'replay dari pemilik menambah tamu');
  } finally {
    await sa.context.close();
    await sb.context.close();
  }
});

// ---------- 3. pembayaran ----------

test('bayar paket: nominal dari server, status berubah hanya setelah gateway mengonfirmasi, webhook idempoten', async () => {
  const who = person('reguler');
  const { context, page } = await newSession();
  try {
    await register(page, who);
    await page.getByText('Selesaikan Pembayaran').waitFor();
    const row = await userRow(who.email);
    assert.equal(row.payment_status, 'pending');

    // Dashboard tidak bisa dipakai sebelum lunas: tetap di layar pembayaran.
    await page.goto(`${BASE}/dashboard`);
    await page.getByText('Selesaikan Pembayaran').waitFor();

    // Nominal kiriman browser diabaikan.
    const forged = await api(page, 'POST', '/api/create-payment', {
      userId: 'user-lain', amount: 1, packageId: 'luxury', method: 'qris',
    });
    assert.equal(forged.status, 200, forged.text);
    const forgedBody = forged.json;
    assert.equal(forgedBody.amount, 35000, 'harga reguler dari server, bukan Rp 1');
    assert.equal(gateway.orders.get(forgedBody.orderId).amount, 35000);

    await page.getByRole('button', { name: /QRIS/ }).click();
    await page.getByAltText('QRIS Payment').waitFor();
    const tx = await waitFor(async () => {
      const res = await db.execute({
        sql: "SELECT * FROM transactions WHERE user_id = ? AND status = 'pending' ORDER BY rowid DESC LIMIT 1",
        args: [row.id],
      });
      return res.rows[0]?.order_id !== forgedBody.orderId ? res.rows[0] : null;
    }, 'transaksi pending tersimpan');
    assert.equal(tx.nominal_expected, 35000);
    assert.equal(tx.tx_type, 'signup');
    const orderId = tx.order_id;
    await page.getByText(orderId).waitFor();

    // Webhook palsu: gateway belum menyatakan lunas → ditolak, akun tetap pending.
    const fake = await webhook(orderId, 35000);
    assert.equal(fake.status, 400);
    assert.equal((await userRow(who.email)).payment_status, 'pending');

    // Gateway lunas tetapi sedang tidak bisa dihubungi → 502, belum diaktifkan, boleh diulang.
    gateway.complete(orderId);
    gateway.setDown(true);
    const unreachable = await webhook(orderId, 35000);
    assert.equal(unreachable.status, 502);
    assert.equal((await userRow(who.email)).payment_status, 'pending');
    gateway.setDown(false);

    // Webhook sah.
    const ok = await webhook(orderId, 35000);
    assert.equal(ok.status, 200);
    const paid = await userRow(who.email);
    assert.equal(paid.payment_status, 'success');
    const inv = await firstInvitation(paid.id);
    assert.ok(inv.activated_at && inv.expires_at, 'undangan diaktifkan');

    // Dikirim ulang: tidak mengubah apa pun.
    const again = await webhook(orderId, 35000);
    assert.equal(again.status, 200);
    assert.equal((await invitationOf(paid.id)).expires_at, inv.expires_at);

    // Browser mendeteksi sendiri lewat polling dan masuk dashboard.
    await page.getByText('Pilihan Tema Undangan').waitFor({ timeout: 20000 });
  } finally {
    await context.close();
  }
});

// ---------- 4. upgrade ----------

test('upgrade: paket tidak berubah sampai order upgrade itu sendiri lunas', async () => {
  const who = person('demo');
  const { context, page } = await newSession();
  try {
    await register(page, who);
    await page.waitForURL(`${BASE}/dashboard`);
    await page.getByText('Pilihan Tema Undangan').waitFor();
    const row = await userRow(who.email);
    assert.equal(row.payment_status, 'success');

    // Endpoint lama yang menerapkan upgrade dari browser sudah tidak ada.
    const legacy = await api(page, 'POST', '/api/apply-upgrade', { userId: row.id, type: 'upgrade', targetPackageId: 'luxury' });
    assert.equal(legacy.status, 404);

    // Permintaan yang tidak masuk akal ditolak.
    for (const body of [
      { type: 'upgrade', targetPackageId: 'demo' },
      { type: 'upgrade', targetPackageId: 'gratis' },
      { type: 'extend', targetPackageId: 'luxury' },
      { type: 'hadiah', targetPackageId: 'luxury' },
    ]) {
      const res = await api(page, 'POST', '/api/create-upgrade-payment', body);
      assert.equal(res.status, 400, `${JSON.stringify(body)} → ${res.text}`);
    }

    await openDashboardSection(page, 'Upgrade Akun');
    await page.getByRole('button', { name: 'Upgrade ke Premium' }).click();
    await page.getByRole('button', { name: 'Bayar Sekarang' }).click();
    await page.getByText('Menunggu Pembayaran').waitFor();

    const tx = await waitFor(async () => {
      const res = await db.execute({ sql: "SELECT * FROM transactions WHERE user_id = ? AND tx_type = 'upgrade'", args: [row.id] });
      return res.rows[0];
    }, 'transaksi upgrade tersimpan');
    assert.equal(tx.nominal_expected, 90000);
    assert.equal(tx.package_id, 'premium');

    // Akun sudah "success" sejak daftar; itu tidak boleh dianggap bukti bayar upgrade.
    await page.waitForTimeout(6500); // lewat satu siklus polling
    assert.equal(await page.getByText('Menunggu Pembayaran').isVisible(), true, 'UI masih menunggu');
    assert.equal((await userRow(who.email)).package_id, 'demo', 'paket belum berubah');

    // Order milik user lain tidak bisa diintip, baik tanpa login maupun oleh user lain.
    const stranger = await newSession();
    try {
      await stranger.page.goto(`${BASE}/auth`);
      assert.equal((await api(stranger.page, 'GET', `/api/check-payment-status?orderId=${tx.order_id}`)).status, 401);
      await register(stranger.page, person('demo'));
      await stranger.page.waitForURL(`${BASE}/dashboard`);
      assert.equal((await api(stranger.page, 'GET', `/api/check-payment-status?orderId=${tx.order_id}`)).status, 404);
    } finally {
      await stranger.context.close();
    }
    assert.equal((await api(page, 'GET', `/api/check-payment-status?orderId=${tx.order_id}`)).json.status, 'pending');

    gateway.complete(tx.order_id);
    assert.equal((await webhook(tx.order_id, 90000)).status, 200);
    const upgraded = await userRow(who.email);
    assert.equal(upgraded.package_id, 'premium');
    assert.equal(upgraded.payment_status, 'success');
    const days = (new Date((await firstInvitation(row.id)).expires_at).getTime() - Date.now()) / 86400000;
    assert.ok(days > 59 && days <= 60, `masa aktif premium, dapat ${days.toFixed(2)} hari`);
  } finally {
    await context.close();
  }
});

// ---------- 5. admin ----------

test('panel admin: ditolak untuk user biasa, terbuka setelah role admin diberikan di database', async () => {
  const who = person('demo');
  const { context, page, actions } = await newSession();
  try {
    await register(page, who);
    await page.waitForURL(`${BASE}/dashboard`);
    await page.getByText('Pilihan Tema Undangan').waitFor();

    await page.goto(`${BASE}/admin`);
    await page.waitForURL(`${BASE}/dashboard`);

    // Jalur lama: /auth?admin=true dulu menampilkan seluruh user tanpa login.
    const anonymous = await newSession();
    try {
      await anonymous.page.goto(`${BASE}/auth?admin=true#admin`);
      await anonymous.page.waitForSelector('#signin-email');
      assert.equal(await anonymous.page.getByText(who.email).count(), 0);
      await anonymous.page.goto(`${BASE}/admin`);
      await anonymous.page.waitForURL(/\/auth\?redirect=%2Fadmin/);
    } finally {
      await anonymous.context.close();
    }

    // Role diberikan di database; token lama masih 'user' sehingga perlu login ulang.
    await db.execute({ sql: "UPDATE users SET role = 'admin' WHERE email = ?", args: [who.email] });
    await page.getByRole('button', { name: 'Buka menu navigasi' }).click();
    await page.getByRole('button', { name: 'Keluar Akun' }).click();
    await page.waitForSelector('#signin-email');
    await page.fill('#signin-email', who.email);
    await page.fill('#signin-password', who.password);
    await page.click('#signin-submit');
    // AuthGate tampil di URL /dashboard juga, jadi tunggu isi dashboard, bukan URL-nya.
    await page.getByText('Pilihan Tema Undangan').waitFor();

    await page.goto(`${BASE}/admin`);
    await page.getByRole('heading', { name: 'Panel Admin' }).waitFor();
    await page.getByText(who.email).first().waitFor();

    // Admin melihat user lain di panel.
    const other = person('demo');
    const otherSession = await newSession();
    try {
      await register(otherSession.page, other);
      await otherSession.page.waitForURL(`${BASE}/dashboard`);
    } finally {
      await otherSession.context.close();
    }
    await page.reload();
    await page.getByText(other.email).first().waitFor();

    // Kontrol positif: selagi admin, action di halaman ini mengembalikan data user lain.
    const adminActions = actions.filter((act) => new URL(act.url).pathname === '/admin');
    assert.ok(adminActions.length >= 2, 'action admin terekam');
    const asAdmin = await Promise.all(adminActions.map((act) => replayAction(page, act)));
    assert.ok(asAdmin.some((res) => res.text.includes(other.email)), 'admin bisa membaca daftar user');

    // Role dicabut di database: cookie yang sama (token masih bertuliskan admin) tidak lagi berlaku.
    await db.execute({ sql: "UPDATE users SET role = 'user' WHERE email = ?", args: [who.email] });
    const asUser = await Promise.all(adminActions.map((act) => replayAction(page, act)));
    assert.ok(asUser.filter((res) => res.rejected).length >= 2, 'action daftar user dan transaksi ditolak');
    for (const res of asUser) {
      assert.equal(res.text.includes(other.email), false, 'data user lain tidak bocor setelah role dicabut');
    }
    await page.goto(`${BASE}/admin`);
    await page.waitForURL(`${BASE}/dashboard`);
  } finally {
    await context.close();
  }
});

// ---------- 6. halaman undangan publik ----------

test('undangan publik: terbuka tanpa login, tidak membocorkan telepon tamu, aman dari injeksi script, mencatat kunjungan', async () => {
  const who = person('demo');
  const owner = await newSession();
  const visitor = await newSession();
  try {
    await register(owner.page, who);
    await owner.page.waitForURL(`${BASE}/dashboard`);
    await owner.page.getByText('Pilihan Tema Undangan').waitFor();
    const row = await userRow(who.email);
    const inv = await firstInvitation(row.id);

    await db.execute({
      sql: "INSERT INTO guests (id, invitation_id, name, group_name, phone_number, pax_limit, status, invitation_code) VALUES ('g-e2e-1', ?, 'Budi Tamu', 'Keluarga', '0899777666', 2, 'Sent', 'W-BT777')",
      args: [inv.id],
    });
    // Nama mempelai berisi upaya menutup tag <script> JSON-LD.
    const data = JSON.parse(inv.wedding_data);
    data.couple.groom.fullName = 'Rian</script><script>window.__xss = 1</script>';
    await db.execute({ sql: 'UPDATE invitations SET wedding_data = ? WHERE id = ?', args: [JSON.stringify(data), inv.id] });

    const res = await visitor.page.goto(`${BASE}/${row.active_slug}?to=${encodeURIComponent('Budi Tamu')}`);
    assert.equal(res.status(), 200);
    await visitor.page.waitForLoadState('networkidle');
    assert.equal(await visitor.page.evaluate(() => window.__xss), undefined, 'script sisipan tidak dijalankan');

    const html = await visitor.page.content();
    assert.equal(html.includes('0899777666'), false, 'telepon tamu tidak ada di HTML');
    assert.ok(html.includes('Budi Tamu'), 'nama tamu yang dituju tampil');

    // Kunjungan tercatat lewat action publik dengan waktu dari server.
    const log = await waitFor(async () => {
      const r = await db.execute({ sql: 'SELECT * FROM visitor_logs WHERE invitation_id = ?', args: [inv.id] });
      return r.rows[0];
    }, 'log kunjungan tersimpan');
    assert.equal(log.guest_name, 'Budi Tamu');
    assert.ok(Math.abs(new Date(log.timestamp).getTime() - Date.now()) < 60000);

    // Slug yang tidak ada tidak membuat data apa pun.
    await visitor.page.goto(`${BASE}/slug-yang-tidak-ada-${Date.now()}`);
    await visitor.page.getByText('Undangan Tidak Ditemukan').waitFor();
  } finally {
    await owner.context.close();
    await visitor.context.close();
  }
});
