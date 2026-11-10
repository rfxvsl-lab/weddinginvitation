/**
 * Logika pembayaran di server: harga, pembuatan order, dan penerapan
 * transaksi yang sudah lunas. Dipakai oleh route pembayaran, webhook, dan
 * persetujuan manual admin supaya ketiganya berperilaku sama.
 */

import * as repo from './repo';
import { PACKAGE_LIMITS, PACKAGE_PRICES, type PackageId } from '../lib/packageLimits';
import type { SaaSUser, TransactionReport } from '../types';
import { isPackageId } from './validate';

export const TIER_ORDER: PackageId[] = ['demo', 'reguler', 'premium', 'luxury'];

export const VALID_PAYMENT_METHODS = [
  'qris', 'bni_va', 'bri_va', 'cimb_niaga_va', 'permata_va',
  'maybank_va', 'sampoerna_va', 'bnc_va', 'atm_bersama_va', 'retail',
] as const;

export function normalizePaymentMethod(method: unknown): string {
  return typeof method === 'string' && (VALID_PAYMENT_METHODS as readonly string[]).includes(method)
    ? method
    : 'qris';
}

/** Harga paket ditentukan server; nominal dari browser tidak pernah dipakai. */
export function priceFor(packageId: PackageId, isCustomByRfx: boolean): number {
  return PACKAGE_PRICES[packageId][isCustomByRfx ? 'rfx' : 'mandiri'];
}

export type OrderPlan =
  | { ok: true; txType: 'signup' | 'upgrade' | 'extend'; packageId: PackageId; amount: number }
  | { ok: false; error: string };

/** Pendaftaran baru: bayar paket yang dipilih saat daftar. */
export function planSignupOrder(user: SaaSUser): OrderPlan {
  if (user.packageId === 'demo') return { ok: false, error: 'Paket demo tidak memerlukan pembayaran.' };
  if (user.paymentStatus === 'success') return { ok: false, error: 'Akun ini sudah lunas.' };
  const amount = priceFor(user.packageId, user.isCustomByRfx);
  if (!(amount > 0)) return { ok: false, error: 'Harga paket tidak valid.' };
  return { ok: true, txType: 'signup', packageId: user.packageId, amount };
}

/** Upgrade ke tier lebih tinggi, atau perpanjangan tier yang sama. */
export function planUpgradeOrder(user: SaaSUser, type: unknown, targetPackageId: unknown): OrderPlan {
  if (type !== 'upgrade' && type !== 'extend') return { ok: false, error: 'type harus "upgrade" atau "extend".' };
  if (!isPackageId(targetPackageId)) return { ok: false, error: 'Package ID tidak valid.' };

  const currentIdx = TIER_ORDER.indexOf(user.packageId);
  const targetIdx = TIER_ORDER.indexOf(targetPackageId);

  if (type === 'upgrade') {
    if (targetIdx <= currentIdx) return { ok: false, error: 'Upgrade hanya bisa ke paket yang lebih tinggi.' };
  } else {
    if (user.packageId === 'demo') return { ok: false, error: 'Paket demo tidak bisa diperpanjang.' };
    if (targetPackageId !== user.packageId) return { ok: false, error: 'Perpanjangan hanya untuk paket saat ini.' };
    if (user.paymentStatus !== 'success') return { ok: false, error: 'Selesaikan pembayaran paket Anda terlebih dahulu.' };
  }

  const amount = priceFor(targetPackageId, user.isCustomByRfx);
  if (!(amount > 0)) return { ok: false, error: 'Harga paket tidak valid.' };
  return { ok: true, txType: type, packageId: targetPackageId, amount };
}

/**
 * Terapkan transaksi yang sudah dipastikan lunas. Idempoten: hanya pemanggil
 * pertama yang menjalankan efek samping; pengiriman ulang webhook tidak
 * mengaktifkan atau memperpanjang dua kali.
 */
export async function settleTransaction(tx: TransactionReport): Promise<'applied' | 'already-settled'> {
  const claimed = await repo.claimPendingTransaction(tx.id);
  if (!claimed) return 'already-settled';

  try {
    const invitations = await repo.getInvitationsByUserId(tx.userId);
    const target =
      (tx.invitationId && invitations.find((inv) => inv.id === tx.invitationId)) || invitations[0] || null;
    const packageId: PackageId = isPackageId(tx.packageId) ? tx.packageId : 'reguler';

    if (tx.txType === 'upgrade') {
      await repo.setUserPackagePaid(tx.userId, packageId);
      if (target) await repo.activateInvitation(target.id, packageId);
    } else if (tx.txType === 'extend') {
      if (target) await repo.extendInvitation(target.id, PACKAGE_LIMITS[packageId].activeDays);
    } else {
      // Pendaftaran baru: tandai lunas; undangan yang belum aktif ikut diaktifkan.
      await repo.updateUserPaymentStatus(tx.userId, 'success');
      if (target && !target.activatedAt) await repo.activateInvitation(target.id, packageId);
    }
  } catch (err) {
    // Kembalikan ke pending supaya percobaan berikutnya bisa mengulang.
    await repo.updateTransactionStatus(tx.id, 'pending');
    throw err;
  }
  return 'applied';
}
