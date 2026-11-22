import 'server-only';
import { dbExecute } from '../turso';

/** Kirim push notification ke aplikasi admin (Expo). Gagal = diam, tidak memutus alur utama. */
export async function notifyAdmin(title: string, message: string, data: Record<string, unknown> = {}) {
  try {
    const result = await dbExecute('SELECT value FROM admin_settings WHERE key = :key LIMIT 1', {
      key: 'expo_push_token',
    });
    const pushToken = result.rows[0]?.value as string | undefined;
    if (!pushToken) return { ok: false, reason: 'no-token' };
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: pushToken, sound: 'default', title, body: message, data }),
    });
    return { ok: res.ok, result: await res.json().catch(() => null) };
  } catch (err) {
    console.error('[notifyAdmin]', err);
    return { ok: false, reason: 'error' };
  }
}
