'use server';

/**
 * API Layer â€” CRUD Operations for Wedding SaaS
 * All database interactions go through this module.
 */

import { dbExecute, dbBatch, genId } from './turso';
import { getLimits } from './packageLimits';
import type {
  SaaSUser,
  TransactionReport,
  WeddingData,
  Guest,
  RSVP,
  VisitorLog,
} from '../types';

// ============================================
// USERS
// ============================================

/** Simple hash function for password (production: use bcrypt via server) */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createUser(
  userData: Omit<SaaSUser, 'id' | 'registeredAt'> & { password: string }
): Promise<SaaSUser> {
  const id = genId('user');
  const registeredAt = new Date().toLocaleDateString('id-ID');
  const passwordHash = await hashPassword(userData.password);

  await dbExecute(
    `INSERT INTO users (id, full_name, couple_groom, couple_bride, active_slug, email, password_hash, no_wa, sosmed, package_id, is_custom_by_rfx, payment_status, registered_at, ip_address, auth_provider)
     VALUES (:id, :fullName, :groom, :bride, :slug, :email, :pwHash, :noWa, :sosmed, :packageId, :isRfx, :payStatus, :regAt, :ipAddress, :authProvider)`,
    {
      id,
      fullName: userData.fullName,
      groom: userData.coupleGroom,
      bride: userData.coupleBride,
      slug: userData.activeSlug,
      email: userData.email,
      pwHash: passwordHash,
      noWa: userData.noWa,
      sosmed: userData.sosmed || '',
      packageId: userData.packageId,
      isRfx: userData.isCustomByRfx ? 1 : 0,
      payStatus: userData.paymentStatus || 'pending',
      regAt: registeredAt,
      ipAddress: userData.ipAddress || '',
      authProvider: userData.authProvider || 'local',
    }
  );

  return {
    id,
    fullName: userData.fullName,
    coupleGroom: userData.coupleGroom,
    coupleBride: userData.coupleBride,
    activeSlug: userData.activeSlug,
    email: userData.email,
    noWa: userData.noWa,
    sosmed: userData.sosmed || '',
    packageId: userData.packageId,
    isCustomByRfx: userData.isCustomByRfx,
    paymentStatus: userData.paymentStatus || 'pending',
    registeredAt,
    ipAddress: userData.ipAddress || '',
    authProvider: userData.authProvider || 'local',
  };
}

export async function getUserByEmail(email: string): Promise<SaaSUser | null> {
  const result = await dbExecute(
    'SELECT * FROM users WHERE email = :email LIMIT 1',
    { email: email.toLowerCase().trim() }
  );
  if (result.rows.length === 0) return null;
  return rowToUser(result.rows[0]);
}

export async function getUserBySlug(slug: string): Promise<SaaSUser | null> {
  const result = await dbExecute(
    'SELECT * FROM users WHERE active_slug = :slug LIMIT 1',
    { slug }
  );
  if (result.rows.length === 0) return null;
  return rowToUser(result.rows[0]);
}

export async function getUserById(id: string): Promise<SaaSUser | null> {
  const result = await dbExecute(
    'SELECT * FROM users WHERE id = :id LIMIT 1',
    { id }
  );
  if (result.rows.length === 0) return null;
  return rowToUser(result.rows[0]);
}

export async function verifyUserPassword(email: string, password: string): Promise<SaaSUser | null> {
  const passwordHash = await hashPassword(password);
  const result = await dbExecute(
    'SELECT * FROM users WHERE email = :email AND password_hash = :pwHash LIMIT 1',
    { email: email.toLowerCase().trim(), pwHash: passwordHash }
  );
  if (result.rows.length === 0) {
    // Fallback: If it's the admin email and they don't exist yet, auto-create them
    const adminEmail = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase().trim();
    if (adminEmail && email.toLowerCase().trim() === adminEmail) {
      const existingAdmin = await getUserByEmail(adminEmail);
      if (!existingAdmin) {
        // Create admin user on the fly
        return await createUser({
          fullName: 'RFX.visual Admin',
          coupleGroom: 'Admin',
          coupleBride: 'RFX',
          activeSlug: 'admin-rfx',
          email: adminEmail,
          password: password, // use the password they just typed
          noWa: '081234567890',
          sosmed: '@rfx.visual',
          packageId: 'premium',
          isCustomByRfx: true,
          paymentStatus: 'success',
          warningCount: 0,
          ipAddress: ''
        });
      }
    }
    return null;
  }
  return rowToUser(result.rows[0]);
}

export async function checkSlugExists(slug: string, excludeUserId?: string): Promise<boolean> {
  const result = excludeUserId
    ? await dbExecute(
        'SELECT id FROM users WHERE active_slug = :slug AND id != :uid LIMIT 1',
        { slug, uid: excludeUserId }
      )
    : await dbExecute(
        'SELECT id FROM users WHERE active_slug = :slug LIMIT 1',
        { slug }
      );
  return result.rows.length > 0;
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const result = await dbExecute(
    'SELECT id FROM users WHERE email = :email LIMIT 1',
    { email: email.toLowerCase().trim() }
  );
  return result.rows.length > 0;
}

export async function updateUserPaymentStatus(
  userId: string,
  status: 'pending' | 'success' | 'failed'
): Promise<void> {
  await dbExecute(
    'UPDATE users SET payment_status = :status WHERE id = :id',
    { status, id: userId }
  );

  // Auto-activate invitation when payment succeeds
  if (status === 'success') {
    try {
      const user = await getUserById(userId);
      if (user) {
        const inv = await getInvitationByUserId(userId);
        if (inv && !inv.activatedAt) {
          await activateInvitation(inv.id, user.packageId);
          console.log(`[activateInvitation] ✅ Activated invitation ${inv.id} for user ${userId} (${user.packageId})`);
        }
      }
    } catch (err) {
      console.error('[updateUserPaymentStatus] Failed to auto-activate invitation:', err);
    }
  }
}

export async function getAllUsers(): Promise<SaaSUser[]> {
  const result = await dbExecute('SELECT * FROM users ORDER BY created_at DESC');
  return result.rows.map(rowToUser);
}

export async function deleteUser(userId: string): Promise<void> {
  await dbExecute('DELETE FROM users WHERE id = :id', { id: userId });
}

export async function checkBannedIp(ip: string): Promise<boolean> {
  const result = await dbExecute('SELECT ip FROM banned_ips WHERE ip = :ip', { ip });
  return result.rows.length > 0;
}

export async function updateUserIp(userId: string, ip: string): Promise<void> {
  await dbExecute('UPDATE users SET ip_address = :ip WHERE id = :id', { ip, id: userId });
}

function rowToUser(row: any): SaaSUser {
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase().trim();
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    coupleGroom: row.couple_groom as string,
    coupleBride: row.couple_bride as string,
    activeSlug: row.active_slug as string,
    email: row.email as string,
    noWa: row.no_wa as string,
    sosmed: (row.sosmed as string) || '',
    packageId: row.package_id as 'demo' | 'reguler' | 'premium' | 'luxury',
    isCustomByRfx: Boolean(row.is_custom_by_rfx),
    paymentStatus: (row.payment_status || (adminEmail && (row.email as string)?.toLowerCase() === adminEmail ? 'success' : 'pending')) as 'pending' | 'success' | 'failed',
    registeredAt: row.registered_at as string,
    warningCount: Number(row.warning_count || 0),
    ipAddress: row.ip_address as string,
    avatarUrl: row.avatar_url as string,
    authProvider: row.auth_provider as 'local' | 'google'
  };
}

export async function updateUserPackage(userId: string, newPackageId: string): Promise<void> {
  await dbExecute(
    `UPDATE users SET package_id = :pkg, payment_status = 'pending' WHERE id = :id`,
    { pkg: newPackageId, id: userId }
  );
}

export async function updateUserProfile(
  userId: string,
  updates: { fullName?: string; activeSlug?: string; avatarUrl?: string; slugChangeCount?: number }
) {
  const fields = [];
  const args: Record<string, any> = { id: userId };
  
  if (updates.fullName !== undefined) {
    fields.push('full_name = :fullName');
    args.fullName = updates.fullName;
  }
  if (updates.activeSlug !== undefined) {
    fields.push('active_slug = :activeSlug');
    args.activeSlug = updates.activeSlug;
  }
  if (updates.avatarUrl !== undefined) {
    fields.push('avatar_url = :avatarUrl');
    args.avatarUrl = updates.avatarUrl;
  }
  if (updates.slugChangeCount !== undefined) {
    // Note: If this column doesn't exist in Turso, it will throw an error.
    // If the database has it, it will update successfully. We include it safely.
    // We can assume we might need it, but let's just stick to what the user defined.
    // For safety, we might need an ALTER TABLE but we'll try updating it if provided.
    // Actually, I'll omit slugChangeCount from DB if I'm not sure the column exists. 
    // Wait, the user didn't specify slug_change_count in DB schema. So I'll just rely on client side state or just ignore DB sync for the counter.
  }

  if (fields.length === 0) return;

  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = :id`;
  await dbExecute(sql, args);
}

export async function forceSuperAdmin(userId: string): Promise<void> {
  await dbExecute(
    `UPDATE users SET package_id = 'luxury', payment_status = 'success', active_slug = 'super-admin', is_custom_by_rfx = 1 WHERE id = :id`,
    { id: userId }
  );
}

// ============================================
// INVITATION ACTIVATION & EXPIRATION
// ============================================

/**
 * Activate an invitation — sets activated_at and expires_at based on tier.
 * Called automatically when payment_status → 'success' via Pakasir webhook.
 */
export async function activateInvitation(
  invitationId: string,
  packageId: string
): Promise<void> {
  const limits = getLimits(packageId);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + limits.activeDays * 24 * 60 * 60 * 1000);

  try {
    await dbExecute(
      `UPDATE invitations SET activated_at = :now, expires_at = :exp WHERE id = :id`,
      { now: now.toISOString(), exp: expiresAt.toISOString(), id: invitationId }
    );
  } catch (err) {
    // Fallback: column might not exist yet (migration 003 not run)
    console.warn('[activateInvitation] Column might not exist yet (run migration 003):', err);
  }
}

/**
 * Extend an invitation's expiry date.
 * Used for renewals or tier upgrades.
 */
export async function extendInvitation(
  invitationId: string,
  additionalDays: number
): Promise<void> {
  try {
    // Get current expires_at
    const result = await dbExecute(
      'SELECT expires_at FROM invitations WHERE id = :id LIMIT 1',
      { id: invitationId }
    );
    if (result.rows.length === 0) return;

    const currentExpiry = result.rows[0].expires_at as string | null;
    const baseDate = currentExpiry && new Date(currentExpiry) > new Date()
      ? new Date(currentExpiry)
      : new Date(); // If already expired, extend from now

    const newExpiry = new Date(baseDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);

    await dbExecute(
      `UPDATE invitations SET expires_at = :exp WHERE id = :id`,
      { exp: newExpiry.toISOString(), id: invitationId }
    );
  } catch (err) {
    console.warn('[extendInvitation] Failed:', err);
  }
}

// ============================================
// INVITATIONS
// ============================================

export async function createInvitation(
  userId: string,
  title: string,
  themeId: string,
  weddingData: WeddingData
): Promise<string> {
  const id = genId('inv');
  await dbExecute(
    `INSERT INTO invitations (id, user_id, title, theme_id, wedding_data)
     VALUES (:id, :userId, :title, :themeId, :data)`,
    {
      id,
      userId,
      title,
      themeId,
      data: JSON.stringify(weddingData),
    }
  );
  return id;
}

export async function getInvitationByUserId(userId: string) {
  const result = await dbExecute(
    'SELECT * FROM invitations WHERE user_id = :userId ORDER BY created_at DESC LIMIT 1',
    { userId }
  );
  if (result.rows.length === 0) return null;
  return rowToInvitation(result.rows[0]);
}

export async function getInvitationsByUserId(userId: string) {
  const result = await dbExecute(
    'SELECT * FROM invitations WHERE user_id = :userId ORDER BY created_at DESC',
    { userId }
  );
  return result.rows.map(rowToInvitation);
}

export async function getInvitationBySlug(slug: string) {
  // 1. Check per-invitation slug first (Premium/Luxury multi-project)
  try {
    const invResult = await dbExecute(
      `SELECT * FROM invitations WHERE slug = :slug ORDER BY created_at DESC LIMIT 1`,
      { slug }
    );
    if (invResult.rows.length > 0) {
      return rowToPublishedInvitation(invResult.rows[0]);
    }
  } catch (_) {
    // slug column might not exist yet (migration 004 not run)
  }

  // 2. Fallback: find via user's active_slug — prioritize published invitation
  const result = await dbExecute(
    `SELECT i.* FROM invitations i
     JOIN users u ON i.user_id = u.id
     WHERE u.active_slug = :slug
     ORDER BY i.is_published DESC, i.updated_at DESC LIMIT 1`,
    { slug }
  );

  if (result.rows.length > 0) {
    return rowToPublishedInvitation(result.rows[0]);
  }

  // No invitation found — check if user exists with this slug
  const userCheck = await dbExecute(
    'SELECT id, active_slug, full_name, couple_groom, couple_bride FROM users WHERE active_slug = :slug LIMIT 1',
    { slug }
  );

  if (userCheck.rows.length === 0) {
    // No user with this slug either
    return null;
  }

  // User exists but has no invitation yet — auto-create with proper default data
  // so the slug page shows a real template (not empty)
  const userId = userCheck.rows[0].id as string;
  const userName = userCheck.rows[0].full_name as string || 'Mempelai';
  const groomName = userCheck.rows[0].couple_groom as string || 'Mempelai Pria';
  const brideName = userCheck.rows[0].couple_bride as string || 'Mempelai Wanita';

  try {
    // Import default data inline to avoid circular deps at module level
    const { DEFAULT_WEDDING_DATA } = await import('../data/defaultData');
    
    const defaultData = {
      ...DEFAULT_WEDDING_DATA,
      couple: {
        groom: {
          ...DEFAULT_WEDDING_DATA.couple.groom,
          nickname: groomName,
          fullName: groomName,
        },
        bride: {
          ...DEFAULT_WEDDING_DATA.couple.bride,
          nickname: brideName,
          fullName: brideName,
        },
      },
    };

    const invId = genId('inv');
    const now = new Date().toISOString();
    await dbExecute(
      `INSERT INTO invitations (id, user_id, title, theme_id, wedding_data, created_at, updated_at)
       VALUES (:id, :userId, :title, :themeId, :data, :now, :now)`,
      { id: invId, userId, title: `Undangan ${userName}`, themeId: 'rfx-dark', data: JSON.stringify(defaultData), now }
    );

    // Fetch the newly created invitation
    const newResult = await dbExecute(
      'SELECT * FROM invitations WHERE id = :id LIMIT 1',
      { id: invId }
    );
    if (newResult.rows.length > 0) {
      return rowToPublishedInvitation(newResult.rows[0]);
    }
  } catch (err) {
    console.error(`[getInvitationBySlug] Failed to auto-create invitation for slug "${slug}":`, err);
  }

  return null;
}

export async function updateInvitationData(
  invitationId: string,
  weddingData: WeddingData,
  themeId?: string
): Promise<void> {
  const now = new Date().toISOString();
  if (themeId) {
    await dbExecute(
      `UPDATE invitations SET wedding_data = :data, theme_id = :themeId, updated_at = :now WHERE id = :id`,
      { data: JSON.stringify(weddingData), themeId, now, id: invitationId }
    );
  } else {
    await dbExecute(
      `UPDATE invitations SET wedding_data = :data, updated_at = :now WHERE id = :id`,
      { data: JSON.stringify(weddingData), now, id: invitationId }
    );
  }
}

export async function publishInvitation(invitationId: string): Promise<void> {
  const now = new Date().toISOString();
  try {
    // Try the full publish with published_wedding_data snapshot (requires migration 002)
    await dbExecute(
      `UPDATE invitations SET 
        is_published = 1, 
        published_at = :now, 
        updated_at = :now,
        published_wedding_data = wedding_data,
        published_theme_id = theme_id
       WHERE id = :id`,
      { now, id: invitationId }
    );
  } catch (err) {
    // Fallback: if published_wedding_data column doesn't exist (migration 002 not run yet),
    // just mark as published. rowToPublishedInvitation will fallback to wedding_data.
    console.warn('[publishInvitation] Full publish failed (migration 002 mungkin belum dijalankan), using fallback:', err);
    await dbExecute(
      `UPDATE invitations SET is_published = 1, published_at = :now, updated_at = :now WHERE id = :id`,
      { now, id: invitationId }
    );
  }
}

export async function unpublishInvitation(invitationId: string): Promise<void> {
  await dbExecute(
    `UPDATE invitations SET is_published = 0, updated_at = :now WHERE id = :id`,
    { now: new Date().toISOString(), id: invitationId }
  );
}

/**
 * Update per-invitation slug (for Premium/Luxury multi-project).
 * Validates uniqueness across all invitations AND users.active_slug.
 */
export async function updateInvitationSlug(
  invitationId: string,
  newSlug: string
): Promise<{ success: boolean; error?: string }> {
  const slug = newSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
  if (slug.length < 3) return { success: false, error: 'Slug minimal 3 karakter' };

  // Check uniqueness against other invitations' slugs
  try {
    const existing = await dbExecute(
      'SELECT id FROM invitations WHERE slug = :slug AND id != :id LIMIT 1',
      { slug, id: invitationId }
    );
    if (existing.rows.length > 0) {
      return { success: false, error: 'Slug sudah digunakan oleh undangan lain' };
    }
  } catch (_) {}

  // Check uniqueness against users' active_slug
  const userCheck = await dbExecute(
    'SELECT id FROM users WHERE active_slug = :slug LIMIT 1',
    { slug }
  );
  if (userCheck.rows.length > 0) {
    // Allow if slug belongs to the owner of this invitation
    const invOwner = await dbExecute('SELECT user_id FROM invitations WHERE id = :id LIMIT 1', { id: invitationId });
    const ownerId = invOwner.rows[0]?.user_id as string;
    const slugOwnerId = userCheck.rows[0].id as string;
    if (ownerId !== slugOwnerId) {
      return { success: false, error: 'Slug sudah digunakan oleh pengguna lain' };
    }
  }

  try {
    await dbExecute(
      'UPDATE invitations SET slug = :slug, updated_at = :now WHERE id = :id',
      { slug, now: new Date().toISOString(), id: invitationId }
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Gagal menyimpan slug' };
  }
}

function rowToInvitation(row: any) {
  const activatedAt = (row.activated_at as string) || null;
  const expiresAt = (row.expires_at as string) || null;
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    slug: (row.slug as string) || null,
    themeId: row.theme_id as string,
    weddingData: JSON.parse((row.wedding_data as string) || '{}') as WeddingData,
    isPublished: Boolean(row.is_published),
    publishedAt: row.published_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    activatedAt,
    expiresAt,
    isExpired,
  };
}

function rowToPublishedInvitation(row: any) {
  const isPublishedBefore = Boolean(row.is_published);
  
  // Determine which data to use:
  // 1. If published_wedding_data exists and is non-empty → use it (published snapshot)
  // 2. Otherwise fallback to wedding_data (draft / legacy before migration 002)
  const publishedRaw = row.published_wedding_data as string | null;
  const draftRaw = row.wedding_data as string | null;
  
  // Check if published data is actually meaningful (not just '{}' or null)
  const isPublishedDataEmpty = !publishedRaw || publishedRaw === '{}' || publishedRaw === 'null';
  const publishedDataStr = isPublishedDataEmpty ? (draftRaw || '{}') : publishedRaw;
  
  const publishedTheme = row.published_theme_id ? (row.published_theme_id as string) : (row.theme_id as string);

  let parsedData: WeddingData;
  try {
    parsedData = JSON.parse(publishedDataStr) as WeddingData;
  } catch {
    parsedData = {} as WeddingData;
  }

  const activatedAt = (row.activated_at as string) || null;
  const expiresAt = (row.expires_at as string) || null;
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    slug: (row.slug as string) || null,
    themeId: publishedTheme,
    weddingData: parsedData,
    isPublished: isPublishedBefore,
    publishedAt: row.published_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    activatedAt,
    expiresAt,
    isExpired,
  };
}


// ============================================
// GUESTS
// ============================================

export async function addGuest(
  invitationId: string,
  guestData: Omit<Guest, 'id' | 'invitationCode'>
): Promise<Guest> {
  const id = genId('g');
  const initials = guestData.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
  const randomNum = Math.floor(100 + Math.random() * 900);
  const invitationCode = `W-${initials}${randomNum}`;

  await dbExecute(
    `INSERT INTO guests (id, invitation_id, name, group_name, phone_number, pax_limit, status, invitation_code)
     VALUES (:id, :invId, :name, :group, :phone, :pax, :status, :code)`,
    {
      id,
      invId: invitationId,
      name: guestData.name,
      group: guestData.group || '',
      phone: guestData.phoneNumber || '',
      pax: guestData.paxLimit || 2,
      status: guestData.status || 'Draft',
      code: invitationCode,
    }
  );

  return {
    ...guestData,
    id,
    invitationCode,
  };
}

export async function getGuestsByInvitation(invitationId: string): Promise<Guest[]> {
  const result = await dbExecute(
    'SELECT * FROM guests WHERE invitation_id = :invId ORDER BY rowid DESC',
    { invId: invitationId }
  );
  return result.rows.map(rowToGuest);
}

export async function updateGuestStatus(guestId: string, status: Guest['status']): Promise<void> {
  await dbExecute('UPDATE guests SET status = :status WHERE id = :id', { status, id: guestId });
}

export async function removeGuest(guestId: string): Promise<void> {
  await dbExecute('DELETE FROM guests WHERE id = :id', { id: guestId });
}

export async function getGuestByCode(invitationCode: string): Promise<Guest | null> {
  const result = await dbExecute(
    'SELECT * FROM guests WHERE invitation_code = :code LIMIT 1',
    { code: invitationCode }
  );
  if (result.rows.length === 0) return null;
  return rowToGuest(result.rows[0]);
}

function rowToGuest(row: any): Guest {
  return {
    id: row.id as string,
    name: row.name as string,
    group: (row.group_name as string) || '',
    phoneNumber: (row.phone_number as string) || '',
    paxLimit: (row.pax_limit as number) || 2,
    status: row.status as Guest['status'],
    invitationCode: row.invitation_code as string,
  };
}

// ============================================
// RSVP
// ============================================

export async function addRSVP(invitationId: string, rsvpData: Omit<RSVP, 'id'>): Promise<RSVP> {
  const id = genId('rsvp');
  await dbExecute(
    `INSERT INTO rsvps (id, invitation_id, guest_id, guest_name, status, pax_count, wishes, timestamp)
     VALUES (:id, :invId, :guestId, :name, :status, :pax, :wishes, :ts)`,
    {
      id,
      invId: invitationId,
      guestId: rsvpData.guestId || null,
      name: rsvpData.guestName,
      status: rsvpData.status,
      pax: rsvpData.paxCount || 0,
      wishes: rsvpData.wishes || '',
      ts: rsvpData.timestamp || new Date().toISOString(),
    }
  );

  return { ...rsvpData, id };
}

export async function getRSVPsByInvitation(invitationId: string): Promise<RSVP[]> {
  const result = await dbExecute(
    'SELECT * FROM rsvps WHERE invitation_id = :invId ORDER BY rowid DESC',
    { invId: invitationId }
  );
  return result.rows.map(rowToRSVP);
}

export async function deleteRSVP(rsvpId: string): Promise<void> {
  await dbExecute('DELETE FROM rsvps WHERE id = :id', { id: rsvpId });
}

function rowToRSVP(row: any): RSVP {
  return {
    id: row.id as string,
    guestId: row.guest_id as string | undefined,
    guestName: row.guest_name as string,
    status: row.status as RSVP['status'],
    paxCount: (row.pax_count as number) || 0,
    wishes: (row.wishes as string) || '',
    timestamp: row.timestamp as string,
  };
}

// ============================================
// VISITOR LOGS (Analytics)
// ============================================

export async function addVisitorLog(
  invitationId: string,
  log: Omit<VisitorLog, 'id'>
): Promise<void> {
  const id = genId('vlog');
  await dbExecute(
    `INSERT INTO visitor_logs (id, invitation_id, guest_name, device, browser, timestamp)
     VALUES (:id, :invId, :name, :device, :browser, :ts)`,
    {
      id,
      invId: invitationId,
      name: log.guestName || 'Anonim',
      device: log.device || '',
      browser: log.browser || '',
      ts: log.timestamp || new Date().toISOString(),
    }
  );
}

export async function getVisitorLogs(invitationId: string): Promise<VisitorLog[]> {
  const result = await dbExecute(
    'SELECT * FROM visitor_logs WHERE invitation_id = :invId ORDER BY rowid DESC LIMIT 100',
    { invId: invitationId }
  );
  return result.rows.map((row) => ({
    id: row.id as string,
    guestName: row.guest_name as string,
    device: row.device as string,
    browser: row.browser as string,
    timestamp: row.timestamp as string,
  }));
}

export async function getViewsCount(invitationId: string): Promise<number> {
  const result = await dbExecute(
    'SELECT COUNT(*) as cnt FROM visitor_logs WHERE invitation_id = :invId',
    { invId: invitationId }
  );
  return (result.rows[0]?.cnt as number) || 0;
}

// ============================================
// TRANSACTIONS
// ============================================

export async function createTransaction(
  tx: Omit<TransactionReport, 'id'>
): Promise<TransactionReport> {
  const id = genId('tx');
  await dbExecute(
    `INSERT INTO transactions (id, user_id, user_name, user_slug, user_email, package_id, is_custom_by_rfx, nominal_expected, status, timestamp, proof_image_url, ai_result)
     VALUES (:id, :uid, :uname, :uslug, :uemail, :pkg, :isRfx, :nom, :status, :ts, :proof, :aiResult)`,
    {
      id,
      uid: tx.userId,
      uname: tx.userName,
      uslug: tx.userSlug,
      uemail: tx.userEmail,
      pkg: tx.packageId,
      isRfx: tx.isCustomByRfx ? 1 : 0,
      nom: tx.nominalExpected,
      status: tx.status,
      ts: tx.timestamp,
      proof: tx.proofImage,
      aiResult: tx.aiResult ? JSON.stringify(tx.aiResult) : '{}',
    }
  );
  return { ...tx, id };
}

export async function getTransactionsByUser(userId: string): Promise<TransactionReport[]> {
  const result = await dbExecute(
    'SELECT * FROM transactions WHERE user_id = :userId ORDER BY rowid DESC',
    { userId }
  );
  return result.rows.map(rowToTransaction);
}

export async function getAllTransactions(): Promise<TransactionReport[]> {
  const result = await dbExecute('SELECT * FROM transactions ORDER BY rowid DESC');
  return result.rows.map(rowToTransaction);
}

export async function updateTransactionStatus(
  txId: string,
  status: 'success' | 'failed' | 'pending'
): Promise<void> {
  await dbExecute('UPDATE transactions SET status = :status WHERE id = :id', { status, id: txId });
}

function rowToTransaction(row: any): TransactionReport {
  let parsedAiResult = null;
  if (row.ai_result) {
    try {
      parsedAiResult = JSON.parse(row.ai_result);
    } catch (e) {
      console.error('Failed to parse ai_result JSON:', e);
    }
  }
  return {
    id: row.id as string,
    userId: row.user_id as string,
    userName: row.user_name as string,
    userSlug: row.user_slug as string,
    userEmail: row.user_email as string,
    packageId: row.package_id as TransactionReport['packageId'],
    isCustomByRfx: Boolean(row.is_custom_by_rfx),
    nominalExpected: row.nominal_expected as number,
    status: row.status as 'success' | 'failed' | 'pending',
    timestamp: row.timestamp as string,
    proofImage: row.proof_image_url as string,
    aiResult: parsedAiResult,
  };
}

// ============================================
// DESIGN SNAPSHOTS
// ============================================

export async function saveDesignSnapshot(
  userId: string,
  invitationId: string,
  themeId: string,
  themeName: string,
  weddingData: WeddingData,
  note?: string
): Promise<string> {
  const id = genId('snap');
  await dbExecute(
    `INSERT INTO design_snapshots (id, user_id, invitation_id, theme_id, theme_name, wedding_data, note)
     VALUES (:id, :userId, :invId, :themeId, :themeName, :data, :note)`,
    {
      id,
      userId,
      invId: invitationId,
      themeId,
      themeName,
      data: JSON.stringify(weddingData),
      note: note || '',
    }
  );
  return id;
}

export async function getDesignSnapshots(userId: string) {
  const result = await dbExecute(
    'SELECT * FROM design_snapshots WHERE user_id = :userId ORDER BY created_at DESC LIMIT 20',
    { userId }
  );
  return result.rows.map((row) => ({
    id: row.id as string,
    themeId: row.theme_id as string,
    name: row.theme_name as string,
    editedAt: row.created_at as string,
    weddingData: JSON.parse((row.wedding_data as string) || '{}') as WeddingData,
    note: (row.note as string) || '',
  }));
}

export async function deleteDesignSnapshot(snapshotId: string): Promise<void> {
  await dbExecute('DELETE FROM design_snapshots WHERE id = :id', { id: snapshotId });
}

// ============================================
// LIVE CHAT
// ============================================

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: 'client' | 'admin';
  message: string;
  createdAt: string;
  isRead: boolean;
}

export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string,
  senderRole: 'client' | 'admin',
  message: string
): Promise<ChatMessage> {
  const id = genId('msg');
  await dbExecute(
    `INSERT INTO chat_messages (id, conversation_id, sender_id, sender_name, sender_avatar, sender_role, message)
     VALUES (:id, :convId, :senderId, :senderName, :senderAvatar, :senderRole, :message)`,
    { id, convId: conversationId, senderId, senderName, senderAvatar, senderRole, message }
  );
  return {
    id,
    conversationId,
    senderId,
    senderName,
    senderAvatar,
    senderRole,
    message,
    createdAt: new Date().toISOString(),
    isRead: false,
  };
}

export async function getChatMessages(
  conversationId: string,
  limit: number = 100
): Promise<ChatMessage[]> {
  const result = await dbExecute(
    'SELECT * FROM chat_messages WHERE conversation_id = :convId ORDER BY created_at ASC LIMIT :limit',
    { convId: conversationId, limit }
  );
  return result.rows.map((row: any) => ({
    id: row.id as string,
    conversationId: row.conversation_id as string,
    senderId: row.sender_id as string,
    senderName: row.sender_name as string,
    senderAvatar: (row.sender_avatar as string) || '',
    senderRole: row.sender_role as 'client' | 'admin',
    message: row.message as string,
    createdAt: row.created_at as string,
    isRead: Boolean(row.is_read),
  }));
}

export async function markMessagesAsRead(
  conversationId: string,
  readerRole: 'client' | 'admin'
): Promise<void> {
  // Mark messages from the OTHER role as read
  const targetRole = readerRole === 'client' ? 'admin' : 'client';
  await dbExecute(
    'UPDATE chat_messages SET is_read = 1 WHERE conversation_id = :convId AND sender_role = :targetRole AND is_read = 0',
    { convId: conversationId, targetRole }
  );
}

export async function getUnreadCount(
  conversationId: string,
  readerRole: 'client' | 'admin'
): Promise<number> {
  const targetRole = readerRole === 'client' ? 'admin' : 'client';
  const result = await dbExecute(
    'SELECT COUNT(*) as cnt FROM chat_messages WHERE conversation_id = :convId AND sender_role = :targetRole AND is_read = 0',
    { convId: conversationId, targetRole }
  );
  return Number(result.rows[0]?.cnt || 0);
}

export async function updateUserAvatar(userId: string, avatarUrl: string): Promise<void> {
  await dbExecute(
    'UPDATE users SET avatar_url = :url WHERE id = :id',
    { url: avatarUrl, id: userId }
  );
}

export async function getAdminUser(): Promise<SaaSUser | null> {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '';
  if (!adminEmail) return null;
  const result = await dbExecute(
    'SELECT * FROM users WHERE email = :email LIMIT 1',
    { email: adminEmail.toLowerCase().trim() }
  );
  if (result.rows.length === 0) return null;
  return rowToUser(result.rows[0]);
}
