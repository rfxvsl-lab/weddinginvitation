import { NextResponse } from 'next/server';
import { requireUser } from '../../../server/session';
import { rateLimit } from '../../../server/rateLimit';
import { createGatewayOrder } from '../../../server/gateway';
import { normalizePaymentMethod, planSignupOrder } from '../../../server/payments';
import { errorResponse, jsonError, readJson } from '../../../server/http';

export const runtime = 'nodejs';

/**
 * Buat pembayaran untuk akun yang baru mendaftar.
 * User dan nominal diambil dari session + tabel harga; body hanya memilih metode.
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const limited = await rateLimit({ identifier: `create-payment:${user.id}`, max: 10, windowSecs: 10 * 60 });
    if (!limited.success) {
      return jsonError(`Terlalu banyak permintaan. Coba lagi dalam ${limited.resetIn} detik.`, 429, {
        'Retry-After': String(limited.resetIn),
      });
    }

    const body = await readJson(req);
    const plan = planSignupOrder(user);
    if (plan.ok === false) return jsonError(plan.error, 400);

    const order = await createGatewayOrder({
      user,
      method: normalizePaymentMethod(body.method),
      amount: plan.amount,
      packageId: plan.packageId,
      txType: plan.txType,
    });

    return NextResponse.json({ success: true, amount: plan.amount, ...order });
  } catch (error) {
    return errorResponse('create-payment', error);
  }
}
