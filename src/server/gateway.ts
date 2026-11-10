/**
 * Pembuatan order di gateway Pakasir, dipakai route pembayaran baru dan upgrade.
 */

import { pakasir, generateOrderId } from '../lib/pakasir';
import * as repo from './repo';
import { SITE } from '../lib/site';
import type { SaaSUser } from '../types';
import type { PackageId } from '../lib/packageLimits';

export interface GatewayOrder {
  orderId: string;
  method: string;
  qrCode: string;
  paymentUrl: string;
  paymentNumber: string;
  vaNumber: string;
  expiredAt: string;
}

function hostedPaymentUrl(orderId: string, amount: number): string {
  const redirect = encodeURIComponent(`${SITE.appUrl}/auth?payment=success`);
  return `https://app.pakasir.com/pay/${process.env.PAKASIR_PROJECT_SLUG}/${amount}?order_id=${orderId}&redirect=${redirect}`;
}

/**
 * Buat order di Pakasir lalu simpan transaksi 'pending' dengan order_id-nya.
 * Nominal selalu berasal dari server.
 */
export async function createGatewayOrder(opts: {
  user: SaaSUser;
  method: string;
  amount: number;
  packageId: PackageId;
  txType: 'signup' | 'upgrade' | 'extend';
  invitationId?: string | null;
}): Promise<GatewayOrder> {
  const { user, method, amount } = opts;
  const orderId = generateOrderId(user.id);

  const order: GatewayOrder = {
    orderId,
    method,
    qrCode: '',
    paymentUrl: '',
    paymentNumber: '',
    vaNumber: '',
    expiredAt: '',
  };

  if (method === 'qris') {
    try {
      const payment = await pakasir.createPaymentWithQRAndURL(orderId, amount, {
        qrOptions: { size: 300 },
        urlOptions: { redirect: `${SITE.appUrl}/auth?payment=success` },
      });
      order.qrCode = payment.dataUrl || '';
      order.paymentUrl = payment.paymentUrl || '';
      order.paymentNumber = payment.paymentNumber || '';
      order.expiredAt = payment.expiredAt || '';
    } catch (err: any) {
      console.warn('[gateway] QRIS gagal, memakai halaman pembayaran:', err?.message);
      order.paymentUrl = hostedPaymentUrl(orderId, amount);
    }
  } else {
    const tx = await pakasir.createTransaction(method as any, orderId, amount);
    order.vaNumber = tx.payment?.payment_number || '';
    order.expiredAt = tx.payment?.expired_at || '';
    order.paymentUrl = hostedPaymentUrl(orderId, amount);
  }

  await repo.createTransaction({
    userId: user.id,
    userName: user.fullName,
    userSlug: user.activeSlug,
    userEmail: user.email,
    packageId: opts.packageId,
    isCustomByRfx: user.isCustomByRfx,
    nominalExpected: amount,
    status: 'pending',
    timestamp: new Date().toLocaleString('id-ID'),
    proofImage: '',
    aiResult: {
      isAuthentic: false,
      reasons: [`Pakasir Order ID: ${orderId}`, `Method: ${method}`, `Type: ${opts.txType}`],
    },
    orderId,
    txType: opts.txType,
    invitationId: opts.invitationId || null,
  });

  return order;
}

/**
 * Tanyakan status order langsung ke Pakasir. Webhook tidak ditandatangani,
 * jadi hanya jawaban API inilah yang dipercaya.
 */
export async function isOrderCompleted(orderId: string, amount: number): Promise<boolean> {
  const res = (await pakasir.checkTransactionStatus(orderId, amount)) as any;
  const tx = res?.transaction ?? res;
  return tx?.status === 'completed' && String(tx?.order_id) === orderId && Number(tx?.amount) === amount;
}
