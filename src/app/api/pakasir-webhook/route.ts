import { NextResponse } from 'next/server';
import { getTransactionByOrderId } from '../../../server/repo';
import { isOrderCompleted } from '../../../server/gateway';
import { settleTransaction } from '../../../server/payments';
import { notifyAdmin } from '../../../server/notify';
import { readJson } from '../../../server/http';

export const runtime = 'nodejs';

/**
 * Webhook Pakasir.
 *
 * Pakasir tidak menandatangani webhook, jadi isi body tidak dipercaya sama
 * sekali selain sebagai petunjuk order mana yang perlu dicek. Urutannya:
 *   1. cari transaksi kita dari order_id,
 *   2. tanyakan langsung ke API Pakasir apakah order itu lunas dengan nominal
 *      yang KITA simpan (bukan nominal dari body),
 *   3. baru terapkan aktivasi/upgrade/perpanjangan, sekali saja.
 *
 * Jika verifikasi gagal dihubungi, balas 5xx supaya Pakasir mengirim ulang.
 */
export async function POST(req: Request) {
  const payload = await readJson(req);
  const orderId = typeof payload.order_id === 'string' ? payload.order_id : '';

  if (!orderId || !/^[A-Za-z0-9-]{6,64}$/.test(orderId)) {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }
  if (payload.status !== 'completed') {
    return NextResponse.json({ received: true, message: 'Status bukan completed, diabaikan.' });
  }

  try {
    const tx = await getTransactionByOrderId(orderId);
    if (!tx) {
      console.warn(`[pakasir-webhook] Order tidak dikenal: ${orderId}`);
      return NextResponse.json({ received: true, message: 'No matching order found' });
    }
    if (tx.status === 'success') {
      return NextResponse.json({ received: true, success: true, message: 'Sudah diproses.' });
    }

    let completed: boolean;
    try {
      completed = await isOrderCompleted(orderId, tx.nominalExpected);
    } catch (err) {
      console.error('[pakasir-webhook] Gagal verifikasi ke Pakasir:', err);
      return NextResponse.json({ error: 'Verification unavailable' }, { status: 502 });
    }
    if (!completed) {
      console.warn(`[pakasir-webhook] Order ${orderId} belum lunas menurut Pakasir. Diabaikan.`);
      return NextResponse.json({ error: 'Status verification failed' }, { status: 400 });
    }

    const outcome = await settleTransaction(tx);
    if (outcome === 'applied') {
      await notifyAdmin(
        'Pembayaran Pakasir Berhasil',
        `User: ${tx.userName} (Rp ${tx.nominalExpected.toLocaleString('id-ID')}). Order: ${orderId}. Jenis: ${tx.txType}.`,
        { userId: tx.userId, status: 'success' }
      );
    }
    return NextResponse.json({ received: true, success: true });
  } catch (error) {
    console.error('[pakasir-webhook] Handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
