import { NextResponse } from 'next/server';
import { updateUserPackage, updateUserPaymentStatus, extendInvitation, getInvitationsByUserId, activateInvitation, getUserById } from '../../../lib/api';
import { PACKAGE_LIMITS } from '../../../lib/packageLimits';

export const runtime = 'nodejs';

/**
 * Apply upgrade or extension after payment is confirmed.
 * Called by the client after polling detects payment success.
 * 
 * type='upgrade' → update package + reset masa aktif
 * type='extend'  → extend masa aktif tanpa ganti tier
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, type, targetPackageId, invitationId } = body;

    if (!userId || !type || !targetPackageId) {
      return NextResponse.json(
        { error: 'Parameter userId, type, dan targetPackageId diperlukan.' },
        { status: 400 }
      );
    }

    // Verify user exists and payment is success
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
    }

    if (user.paymentStatus !== 'success') {
      return NextResponse.json({ error: 'Pembayaran belum dikonfirmasi.' }, { status: 400 });
    }

    const targetLimits = PACKAGE_LIMITS[targetPackageId as keyof typeof PACKAGE_LIMITS];
    if (!targetLimits) {
      return NextResponse.json({ error: 'Package ID tidak valid.' }, { status: 400 });
    }

    // Get user's invitations
    const invitations = await getInvitationsByUserId(userId);
    const targetInv = invitationId 
      ? invitations?.find((inv: any) => inv.id === invitationId) 
      : invitations?.[0];

    if (type === 'upgrade') {
      // 1. Update user package in DB
      await updateUserPackage(userId, targetPackageId);
      // updateUserPackage sets paymentStatus to 'pending', so set it back to 'success'
      await updateUserPaymentStatus(userId, 'success');

      // 2. Reset/set masa aktif based on new tier
      if (targetInv) {
        await activateInvitation(targetInv.id, targetPackageId);
      }

      console.log(`[apply-upgrade] ✅ Upgraded user ${userId} to ${targetPackageId}`);
    } else if (type === 'extend') {
      // Extend masa aktif without changing tier
      if (targetInv) {
        await extendInvitation(targetInv.id, targetLimits.activeDays);
      }

      console.log(`[apply-upgrade] ✅ Extended user ${userId} by ${targetLimits.activeDays} days`);
    } else {
      return NextResponse.json({ error: 'type harus "upgrade" atau "extend".' }, { status: 400 });
    }

    return NextResponse.json({ success: true, type, targetPackageId });
  } catch (error: any) {
    console.error('[apply-upgrade] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menerapkan upgrade.' },
      { status: 500 }
    );
  }
}
