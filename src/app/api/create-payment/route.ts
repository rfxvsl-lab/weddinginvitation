import { NextResponse } from 'next/server';
import { pakasir, generateOrderId } from '../../../lib/pakasir';
import { createTransaction } from '../../../lib/api';
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit';

export const runtime = 'nodejs';

/**
 * Supported payment methods from Pakasir
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
      identifier: `create-payment:${clientIp}`,
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
    const { userId, userName, userSlug, userEmail, packageId, isCustomByRfx, amount, method } = body;

    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'Parameter userId dan amount diperlukan.' },
        { status: 400 }
      );
    }

    const paymentMethod = method && VALID_METHODS.includes(method) ? method : 'qris';
    const orderId = generateOrderId(userId);

    let qrCode = '';
    let paymentUrl = '';
    let paymentNumber = '';
    let expiredAt = '';
    let vaNumber = '';

    if (paymentMethod === 'qris') {
      // QRIS — generate QR code + payment URL
      try {
        const payment = await pakasir.createPaymentWithQRAndURL(orderId, amount, {
          qrOptions: { size: 300 },
          urlOptions: { redirect: 'https://ruanghadir.net/auth?payment=success' },
        });

        qrCode = payment.dataUrl || '';
        paymentUrl = payment.paymentUrl || '';
        paymentNumber = payment.paymentNumber || '';
        expiredAt = payment.expiredAt || '';
        
        console.log('[create-payment] ✅ QRIS created:', { orderId, hasQR: !!qrCode });
      } catch (qrisErr: any) {
        console.warn('[create-payment] QRIS failed, falling back to URL:', qrisErr.message);
        paymentUrl = `https://app.pakasir.com/pay/${process.env.PAKASIR_PROJECT_SLUG}/${amount}?order_id=${orderId}&redirect=${encodeURIComponent('https://ruanghadir.net/auth?payment=success')}`;
      }
    } else {
      // Virtual Account / Retail — create transaction with specific method
      try {
        const tx = await pakasir.createTransaction(paymentMethod, orderId, amount);
        vaNumber = tx.payment?.payment_number || '';
        expiredAt = tx.payment?.expired_at || '';
        paymentUrl = `https://app.pakasir.com/pay/${process.env.PAKASIR_PROJECT_SLUG}/${amount}?order_id=${orderId}&redirect=${encodeURIComponent('https://ruanghadir.net/auth?payment=success')}`;
        
        console.log('[create-payment] ✅ VA/Retail created:', { orderId, method: paymentMethod, vaNumber });
      } catch (vaErr: any) {
        console.error('[create-payment] VA creation failed:', vaErr.message);
        throw vaErr;
      }
    }

    // Save pending transaction to Turso DB
    await createTransaction({
      userId,
      userName: userName || '',
      userSlug: userSlug || '',
      userEmail: userEmail || '',
      packageId: packageId || 'reguler',
      isCustomByRfx: isCustomByRfx || false,
      nominalExpected: amount,
      status: 'pending',
      timestamp: new Date().toLocaleString('id-ID'),
      proofImage: '',
      aiResult: {
        isAuthentic: false,
        reasons: [`Pakasir Order ID: ${orderId}`, `Method: ${paymentMethod}`],
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
    console.error('[create-payment] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat transaksi pembayaran.' },
      { status: 500 }
    );
  }
}
