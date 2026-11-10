/**
 * Helper untuk route handler: session, rate limit, dan respons error yang
 * tidak membocorkan detail internal.
 */

import { NextResponse } from 'next/server';
import { AuthError } from './session';

export function jsonError(message: string, status: number, headers?: Record<string, string>) {
  return NextResponse.json({ error: message }, { status, headers });
}

/** Ubah error menjadi respons. Pesan internal hanya masuk log, tidak ke klien. */
export function errorResponse(scope: string, error: unknown) {
  if (error instanceof AuthError) {
    return jsonError(error.message, error.code === 'UNAUTHENTICATED' ? 401 : 403);
  }
  console.error(`[${scope}]`, error);
  return jsonError('Terjadi kesalahan di server. Silakan coba lagi.', 500);
}

export async function readJson(req: Request): Promise<Record<string, any>> {
  try {
    const body = await req.json();
    return body && typeof body === 'object' ? body : {};
  } catch {
    return {};
  }
}
