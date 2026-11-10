/**
 * Verifikasi Google ID token di server.
 *
 * Token dikirim ke endpoint tokeninfo milik Google, yang memeriksa tanda
 * tangan dan masa berlakunya. Kita lalu memastikan token itu memang diterbitkan
 * untuk aplikasi ini (aud) dan emailnya sudah terverifikasi.
 */

export interface GoogleIdentity {
  email: string;
  name: string;
  picture: string;
}

type FetchLike = (input: string, init?: { signal?: AbortSignal }) => Promise<{
  ok: boolean;
  json: () => Promise<any>;
}>;

const ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);

export async function verifyGoogleIdToken(
  credential: unknown,
  clientId: string,
  fetchImpl: FetchLike = fetch as unknown as FetchLike,
  nowMs: number = Date.now()
): Promise<GoogleIdentity | null> {
  if (!clientId) return null;
  if (typeof credential !== 'string' || credential.length < 20 || credential.length > 4096) return null;
  // ID token adalah JWT: tiga segmen base64url.
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(credential)) return null;

  let claims: any;
  try {
    const res = await fetchImpl(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    claims = await res.json();
  } catch {
    return null;
  }

  if (!claims || claims.aud !== clientId) return null;
  if (!ISSUERS.has(claims.iss)) return null;
  if (!(claims.email_verified === true || claims.email_verified === 'true')) return null;
  if (!(Number(claims.exp) * 1000 > nowMs)) return null;
  if (typeof claims.email !== 'string' || !claims.email.includes('@')) return null;

  return {
    email: claims.email.toLowerCase().trim(),
    name: typeof claims.name === 'string' ? claims.name.slice(0, 120) : '',
    picture: typeof claims.picture === 'string' ? claims.picture.slice(0, 2048) : '',
  };
}
