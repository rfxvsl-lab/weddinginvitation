import { NextResponse } from 'next/server';
import { pakasir, generateOrderId } from '../../../lib/pakasir';
import { createTransaction, updateUserPackage, extendInvitation, getInvitationsByUserId } from '../../../lib/api';
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit';
import { PACKAGE_LIMITS } from '../../../lib/packageLimits';

export const runtime = 'nodejs';

/**
 * Create payment for upgrade or extension.
 * type='upgrade' → upgrade tier + reset masa aktif
 * type='extend'  → perpanjang masa aktif tanpa ganti tier
 */

const VALID_METHODS = [
  'qris', 'bni_va', 'bri_va', 'cimb_niaga_va', 'permata_va',
  'maybank_va', 'sampoerna_va', 'bnc_va', 'atm_bersama_va', 'retail',
];

export async function POST(req: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit({
      identifier: `upgrade-payment:${clientIp}`,
      max: 10,
      windowSecs: 10 * 60,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan. Coba lagi dalam ${rateLimit.resetIn} detik.` },
        { status: 429, headers: { 'Retry-After': String(rateLimit.resetIn) } }
      );
    }

    const body = await req.json();
    const { userId, userName, userEmail, type, currentPackageId, targetPackageId, invitationId, amount, method, isCustomByRfx } = body;

    if (!userId || !amount || !type || !targetPackageId) {
      return NextResponse.json(
        { error: 'Parameter userId, amount, type, dan targetPackageId diperlukan.' },
        { status: 400 }
      );
    }

    // Validate type
    if (type !== 'upgrade' && type !== 'extend') {
      return NextResponse.json({ error: 'type harus "upgrade" atau "extend".' }, { status: 400 });
    }

    const paymentMethod = method && VALID_METHODS.includes(method) ? method : 'qris';
    const orderId = generateOrderId(userId);

    let qrCode = '';
    let paymentUrl = '';
    let paymentNumber = '';
    let expiredAt = '';
    let vaNumber = '';

    if (paymentMethod === 'qris') {
      try {
        const payment = await pakasir.createPaymentWithQRAndURL(orderId, amount, {
          qrOptions: { size: 300 },
          urlOptions: { redirect: 'https://ruanghadir.net/auth?payment=success' },
        });

        qrCode = payment.dataUrl || '';
        paymentUrl = payment.paymentUrl || '';
        paymentNumber = payment.paymentNumber || '';
        expiredAt = payment.expiredAt || '';

        console.log('[upgrade-payment] ✅ QRIS created:', { orderId, type, targetPackageId });
      } catch (qrisErr: any) {
        console.warn('[upgrade-payment] QRIS failed, falling back to URL:', qrisErr.message);
        paymentUrl = `https://app.pakasir.com/pay/${process.env.PAKASIR_PROJECT_SLUG}/${amount}?order_id=${orderId}&redirect=${encodeURIComponent('https://ruanghadir.net/auth?payment=success')}`;
      }
    } else {
      try {
        const tx = await pakasir.createTransaction(paymentMethod, orderId, amount);
        vaNumber = tx.payment?.payment_number || '';
        expiredAt = tx.payment?.expired_at || '';
        paymentUrl = `https://app.pakasir.com/pay/${process.env.PAKASIR_PROJECT_SLUG}/${amount}?order_id=${orderId}&redirect=${encodeURIComponent('https://ruanghadir.net/auth?payment=success')}`;

        console.log('[upgrade-payment] ✅ VA created:', { orderId, method: paymentMethod, vaNumber });
      } catch (vaErr: any) {
        console.error('[upgrade-payment] VA creation failed:', vaErr.message);
        throw vaErr;
      }
    }

    // Save pending transaction to Turso DB
    await createTransaction({
      userId,
      userName: userName || '',
      userSlug: '',
      userEmail: userEmail || '',
      packageId: targetPackageId,
      isCustomByRfx: isCustomByRfx || false,
      nominalExpected: amount,
      status: 'pending',
      timestamp: new Date().toLocaleString('id-ID'),
      proofImage: '',
      aiResult: {
        isAuthentic: false,
        reasons: [
          `Pakasir Order ID: ${orderId}`,
          `Method: ${paymentMethod}`,
          `Type: ${type}`,
          `From: ${currentPackageId} → To: ${targetPackageId}`,
        ],
      },
    });

    return NextResponse.json({
      success: true,
      orderId,
      method: paymentMethod,
      qrCode,
      paymentUrl,
      paymentNumber,
      vaNumber,
      expiredAt,
    });
  } catch (error: any) {
    console.error('[upgrade-payment] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat transaksi upgrade.' },
      { status: 500 }
    );
  }
}
