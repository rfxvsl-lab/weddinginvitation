import { NextResponse } from 'next/server';
import { pakasir } from '../../../lib/pakasir';
import { getAllTransactions, updateTransactionStatus, updateUserPaymentStatus } from '../../../lib/api';

export const runtime = 'nodejs';

/**
 * Sandbox Payment Simulation — HANYA untuk development/testing di localhost.
 * Memanggil Pakasir simulatePayment API + langsung update DB lokal.
 * 
 * Di production, payment dikonfirmasi oleh webhook dari Pakasir.
 * Endpoint ini TIDAK diperlukan di production.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, amount, userId } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'orderId dan amount diperlukan.' },
        { status: 400 }
      );
    }

    // 1. Call Pakasir sandbox simulation API
    let pakasirResult = null;
    try {
      pakasirResult = await pakasir.simulatePayment(orderId, amount);
      console.log('[simulate-payment] Pakasir simulation result:', pakasirResult);
    } catch (err: any) {
      console.warn('[simulate-payment] Pakasir simulation API error (mungkin sudah dibayar):', err.message);
    }

    // 2. Find matching transaction in local DB and update to success
    if (userId) {
      // Direct update by userId
      await updateUserPaymentStatus(userId, 'success');
      
      // Also update the transaction record
      const allTx = await getAllTransactions();
      const matchingTx = allTx.find(tx => {
        const reasons = tx.aiResult?.reasons || [];
        return reasons.some((r: string) => r.includes(orderId));
      });
      
      if (matchingTx) {
        await updateTransactionStatus(matchingTx.id, 'success');
      }

      console.log(`[simulate-payment] ✅ Updated user ${userId} to payment success (sandbox)`);
    }

    return NextResponse.json({
      success: true,
      message: 'Simulasi pembayaran berhasil. Status user diupdate ke success.',
      pakasirResult,
    });
  } catch (error: any) {
    console.error('[simulate-payment] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal melakukan simulasi.' },
      { status: 500 }
    );
  }
}
