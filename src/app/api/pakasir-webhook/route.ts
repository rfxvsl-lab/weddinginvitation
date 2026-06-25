import { NextResponse } from 'next/server';
import { pakasir } from '../../../lib/pakasir';
import { updateTransactionStatus, getAllTransactions, updateUserPaymentStatus, updateUserPackage, extendInvitation, getInvitationsByUserId, activateInvitation } from '../../../lib/api';
import { PACKAGE_LIMITS } from '../../../lib/packageLimits';
import type { WebhookPayload } from 'pakasir-client';

export const runtime = 'nodejs';

/**
 * Pakasir Webhook Handler
 * Pakasir sends POST when payment is completed.
 * We verify via checkTransactionStatus, then update DB.
 * Handles: new signups, upgrades, and extensions.
 */
export async function POST(req: Request) {
  try {
    const payload: WebhookPayload = await req.json();

    // 1. Validate webhook payload
    if (!pakasir.validateWebhook(payload)) {
      console.warn('[pakasir-webhook] Invalid webhook payload:', payload);
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    // 2. Only process completed payments
    if (payload.status !== 'completed') {
      return NextResponse.json({ received: true, message: 'Status bukan completed, diabaikan.' });
    }

    console.log(`[pakasir-webhook] Payment completed: order=${payload.order_id}, amount=${payload.amount}, method=${payload.payment_method}`);

    // 3. Double-check via Pakasir API for security
    try {
      const statusCheck = await pakasir.checkTransactionStatus(payload.order_id, payload.amount) as any;
      if (!statusCheck || statusCheck.status !== 'completed') {
        console.warn('[pakasir-webhook] Status check mismatch. Ignoring.');
        return NextResponse.json({ error: 'Status verification failed' }, { status: 400 });
      }
    } catch (verifyErr) {
      console.error('[pakasir-webhook] Failed to verify with Pakasir API:', verifyErr);
      // Continue anyway — webhook is validated, and Pakasir may have rate limits on check
    }

    // 4. Find matching transaction in DB by order_id embedded in aiResult.reasons
    const allTx = await getAllTransactions();
    const matchingTx = allTx.find(tx => {
      const reasons = tx.aiResult?.reasons || [];
      return reasons.some((r: string) => r.includes(payload.order_id));
    });

    if (!matchingTx) {
      console.warn(`[pakasir-webhook] No matching transaction found for order ${payload.order_id}`);
      return NextResponse.json({ received: true, message: 'No matching order found' });
    }

    // 5. Update transaction status to success
    await updateTransactionStatus(matchingTx.id, 'success');

    // 6. Update user payment status to success
    await updateUserPaymentStatus(matchingTx.userId, 'success');

    console.log(`[pakasir-webhook] ✅ Updated user ${matchingTx.userId} payment to success`);

    // 7. Detect if this is an upgrade/extend transaction
    const reasons = matchingTx.aiResult?.reasons || [];
    const typeReason = reasons.find((r: string) => r.startsWith('Type:'));
    const fromReason = reasons.find((r: string) => r.startsWith('From:'));

    if (typeReason) {
      const txType = typeReason.replace('Type: ', '').trim(); // 'upgrade' or 'extend'
      const targetPkg = matchingTx.packageId || 'reguler';
      const targetLimits = PACKAGE_LIMITS[targetPkg as keyof typeof PACKAGE_LIMITS];

      // Get user's invitations
      const invitations = await getInvitationsByUserId(matchingTx.userId);
      const firstInv = invitations?.[0];

      if (txType === 'upgrade') {
        // Upgrade tier + reset/extend masa aktif
        await updateUserPackage(matchingTx.userId, targetPkg);
        // Set payment status back to success (updateUserPackage sets to 'pending')
        await updateUserPaymentStatus(matchingTx.userId, 'success');

        if (firstInv && targetLimits) {
          await activateInvitation(firstInv.id, targetPkg);
        }
        console.log(`[pakasir-webhook] ✅ Upgraded user ${matchingTx.userId} to ${targetPkg}`);
      } else if (txType === 'extend') {
        // Extend masa aktif tanpa ganti tier
        if (firstInv && targetLimits) {
          await extendInvitation(firstInv.id, targetLimits.activeDays);
        }
        console.log(`[pakasir-webhook] ✅ Extended user ${matchingTx.userId} by ${targetLimits?.activeDays} days`);
      }
    } else {
      // Regular new signup — activate invitation
      const invitations = await getInvitationsByUserId(matchingTx.userId);
      const firstInv = invitations?.[0];
      if (firstInv) {
        await activateInvitation(firstInv.id, matchingTx.packageId || 'reguler');
        console.log(`[pakasir-webhook] ✅ Activated invitation for new user ${matchingTx.userId}`);
      }
    }

    // 8. Notify admin (optional)
    try {
      const baseUrl = req.headers.get('origin') || req.headers.get('host') || '';
      const notifyUrl = baseUrl.startsWith('http') ? `${baseUrl}/api/notify-admin` : `https://${baseUrl}/api/notify-admin`;
      await fetch(notifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '✅ Pembayaran Pakasir Berhasil',
          message: `User: ${matchingTx.userName} (Rp ${payload.amount.toLocaleString('id-ID')}). Order: ${payload.order_id}. Metode: ${payload.payment_method}${typeReason ? `. ${typeReason}` : ''}`,
          data: { userId: matchingTx.userId, status: 'success' },
        }),
      });
    } catch (e) {
      console.error('[pakasir-webhook] Failed to notify admin:', e);
    }

    return NextResponse.json({ received: true, success: true });
  } catch (error: any) {
    console.error('[pakasir-webhook] Handler error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
