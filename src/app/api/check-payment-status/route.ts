import { NextResponse } from 'next/server';
import { getUserById } from '../../../lib/api';

export const runtime = 'nodejs';

/**
 * Check payment status for frontend polling
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      status: user.paymentStatus,
      packageId: user.packageId,
    });
  } catch (error: any) {
    console.error('[check-payment-status] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
