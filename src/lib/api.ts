/**
 * API Layer — CRUD Operations for Wedding SaaS
 * All database interactions go through this module.
 */

import { dbExecute, dbBatch, genId } from './turso';
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
    `INSERT INTO users (id, full_name, couple_groom, couple_bride, active_slug, email, password_hash, no_wa, sosmed, package_id, is_custom_by_rfx, payment_status, registered_at)
     VALUES (:id, :fullName, :groom, :bride, :slug, :email, :pwHash, :noWa, :sosmed, :packageId, :isRfx, :payStatus, :regAt)`,
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

export async function verifyUserPassword(email: string, password: string): Promise<SaaSUser | null> {
  const passwordHash = await hashPassword(password);
  const result = await dbExecute(
    'SELECT * FROM users WHERE email = :email AND password_hash = :pwHash LIMIT 1',
    { email: email.toLowerCase().trim(), pwHash: passwordHash }
  );
  if (result.rows.length === 0) return null;
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
}

export async function getAllUsers(): Promise<SaaSUser[]> {
  const result = await dbExecute('SELECT * FROM users ORDER BY created_at DESC');
  return result.rows.map(rowToUser);
}

export async function deleteUser(userId: string): Promise<void> {
  await dbExecute('DELETE FROM users WHERE id = :id', { id: userId });
}

function rowToUser(row: any): SaaSUser {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    coupleGroom: row.couple_groom as string,
    coupleBride: row.couple_bride as string,
    activeSlug: row.active_slug as string,
    email: row.email as string,
    noWa: row.no_wa as string,
    sosmed: (row.sosmed as string) || '',
    packageId: row.package_id as 'reguler' | 'medium' | 'premium',
    isCustomByRfx: Boolean(row.is_custom_by_rfx),
    paymentStatus: row.payment_status as 'pending' | 'success' | 'failed',
    registeredAt: row.registered_at as string,
  };
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
  const result = await dbExecute(
    `SELECT i.* FROM invitations i
     JOIN users u ON i.user_id = u.id
     WHERE u.active_slug = :slug AND i.is_published = 1
     ORDER BY i.created_at DESC LIMIT 1`,
    { slug }
  );
  if (result.rows.length === 0) return null;
  return rowToInvitation(result.rows[0]);
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
  await dbExecute(
    `UPDATE invitations SET is_published = 1, published_at = :now, updated_at = :now WHERE id = :id`,
    { now, id: invitationId }
  );
}

export async function unpublishInvitation(invitationId: string): Promise<void> {
  await dbExecute(
    `UPDATE invitations SET is_published = 0, updated_at = :now WHERE id = :id`,
    { now: new Date().toISOString(), id: invitationId }
  );
}

function rowToInvitation(row: any) {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    themeId: row.theme_id as string,
    weddingData: JSON.parse((row.wedding_data as string) || '{}') as WeddingData,
    isPublished: Boolean(row.is_published),
    publishedAt: row.published_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
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
     VALUES (:id, :userId, :userName, :userSlug, :userEmail, :pkgId, :isRfx, :nominal, :status, :ts, :proofUrl, :aiResult)`,
    {
      id,
      userId: tx.userId,
      userName: tx.userName,
      userSlug: tx.userSlug,
      userEmail: tx.userEmail,
      pkgId: tx.packageId,
      isRfx: tx.isCustomByRfx ? 1 : 0,
      nominal: tx.nominalExpected,
      status: tx.status || 'pending',
      ts: tx.timestamp || new Date().toLocaleString('id-ID'),
      proofUrl: tx.proofImage || '',
      aiResult: JSON.stringify(tx.aiResult || {}),
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
  let aiResult;
  try {
    aiResult = JSON.parse((row.ai_result as string) || '{}');
  } catch {
    aiResult = {};
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
    status: row.status as TransactionReport['status'],
    timestamp: row.timestamp as string,
    proofImage: (row.proof_image_url as string) || '',
    aiResult,
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
