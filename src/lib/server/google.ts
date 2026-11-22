import 'server-only';

export interface VerifiedGoogleIdentity {
  email: string;
  name: string;
  picture?: string;
}

/**
 * Verifikasi Google ID token di server (bukan decode di browser).
 * Memakai endpoint tokeninfo resmi Google: tanda tangan, masa berlaku, dan audience dicek.
 */
export async function verifyGoogleCredential(credential: string): Promise<VerifiedGoogleIdentity | null> {
  if (!credential || credential.length > 4096) return null;
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return null;
  const info = (await res.json()) as Record<string, string>;

  const expectedAud = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (expectedAud && info.aud !== expectedAud) return null;
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(info.iss)) return null;
  if (String(info.email_verified) !== 'true' || !info.email) return null;
  if (Number(info.exp) * 1000 < Date.now()) return null;

  return {
    email: info.email.toLowerCase().trim(),
    name: info.name || info.email.split('@')[0],
    picture: info.picture,
  };
}
