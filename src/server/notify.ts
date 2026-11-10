/**
 * Push notification ke aplikasi admin (Expo). Dipanggil langsung dari kode
 * server; tidak ada endpoint HTTP publik untuk ini.
 */

import { dbExecute } from '../lib/turso';

export async function notifyAdmin(title: string, message: string, data: Record<string, unknown> = {}): Promise<void> {
  try {
    const result = await dbExecute('SELECT value FROM admin_settings WHERE key = :key LIMIT 1', {
      key: 'expo_push_token',
    });
    const pushToken = result.rows[0]?.value as string | undefined;
    if (!pushToken) return;

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: pushToken, sound: 'default', title, body: message, data }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error('[notifyAdmin] gagal mengirim notifikasi:', err);
  }
}
