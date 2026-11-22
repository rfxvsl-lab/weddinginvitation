import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Slug publik undangan yang ditampilkan/dibagikan.
 * Undangan lama memiliki slug otomatis "inv-…"; untuk proyek utama
 * (akun dengan satu undangan) gunakan tautan pilihan user saat mendaftar.
 */
export function resolvePublicSlug(
  invitationSlug: string | null | undefined,
  userSlug: string | null | undefined,
  invitationCount = 1
): string {
  const inv = invitationSlug || '';
  if (inv && !(inv.startsWith('inv-') && invitationCount <= 1)) return inv;
  return userSlug || inv || '';
}
