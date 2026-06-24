import { NextResponse } from 'next/server';
import { dbExecute } from '../../../lib/turso';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message, data } = body;

    const result = await dbExecute(
      'SELECT value FROM admin_settings WHERE key = :key LIMIT 1',
      { key: 'expo_push_token' }
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Admin Expo Push Token not found' },
        { status: 404 }
      );
    }

    const pushToken = result.rows[0].value as string;

    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        sound: 'default',
        title: title || 'Notifikasi Admin RFX',
        body: message || 'Ada pemberitahuan baru',
        data: data || {},
      }),
    });

    const expoResult = await expoResponse.json();

    return NextResponse.json({ success: true, expoResult });
  } catch (error: any) {
    console.error('Notify admin route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
