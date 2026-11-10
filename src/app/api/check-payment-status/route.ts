import { NextResponse } from 'next/server';
import { requireUser } from '../../../server/session';
import { getTransactionByOrderId } from '../../../server/repo';
import { errorResponse, jsonError } from '../../../server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Status pembayaran untuk polling dari browser. Hanya membaca.
 *
 * - ?orderId=...  → status transaksi itu (harus milik user yang login)
 * - tanpa orderId → status bayar akun yang login
 */
export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const orderId = new URL(req.url).searchParams.get('orderId');

    if (orderId) {
      const tx = await getTransactionByOrderId(orderId);
      if (!tx || tx.userId !== user.id) return jsonError('Transaksi tidak ditemukan.', 404);
      return NextResponse.json({ status: tx.status, packageId: user.packageId, txType: tx.txType });
    }

    return NextResponse.json({ status: user.paymentStatus, packageId: user.packageId });
  } catch (error) {
    return errorResponse('check-payment-status', error);
  }
}
