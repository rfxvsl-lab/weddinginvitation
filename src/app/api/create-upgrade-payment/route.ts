import { NextResponse } from 'next/server';
import { requireUser } from '../../../server/session';
import { rateLimit } from '../../../server/rateLimit';
import { createGatewayOrder } from '../../../server/gateway';
import { normalizePaymentMethod, planUpgradeOrder } from '../../../server/payments';
import { getInvitationMeta } from '../../../server/repo';
import { errorResponse, jsonError, readJson } from '../../../server/http';

export const runtime = 'nodejs';

/**
 * Buat pembayaran upgrade tier atau perpanjangan masa aktif.
 * Paket baru baru berlaku setelah webhook Pakasir mengonfirmasi pembayaran.
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const limited = await rateLimit({ identifier: `upgrade-payment:${user.id}`, max: 10, windowSecs: 10 * 60 });
    if (!limited.success) {
      return jsonError(`Terlalu banyak permintaan. Coba lagi dalam ${limited.resetIn} detik.`, 429, {
        'Retry-After': String(limited.resetIn),
      });
    }

    const body = await readJson(req);
    const plan = planUpgradeOrder(user, body.type, body.targetPackageId);
    if (plan.ok === false) return jsonError(plan.error, 400);

    // Undangan tujuan hanya diterima jika milik user ini.
    let invitationId: string | null = null;
    if (typeof body.invitationId === 'string' && body.invitationId) {
      const meta = await getInvitationMeta(body.invitationId);
      if (meta && meta.userId === user.id) invitationId = meta.id;
    }

    const order = await createGatewayOrder({
      user,
      method: normalizePaymentMethod(body.method),
      amount: plan.amount,
      packageId: plan.packageId,
      txType: plan.txType,
      invitationId,
    });

    return NextResponse.json({ success: true, amount: plan.amount, ...order });
  } catch (error) {
    return errorResponse('create-upgrade-payment', error);
  }
}
