import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const client = createClient({
  url: process.env.VITE_TURSO_DATABASE_URL!,
  authToken: process.env.VITE_TURSO_AUTH_TOKEN!,
});

export async function addGuest(
  invitationId: string,
  guestData: any
) {
  const id = 'g' + Date.now();
  const initials = guestData.name
    .split(' ')
    .map((n: any) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
  const randomNum = Math.floor(100 + Math.random() * 900);
  const invitationCode = `W-${initials}${randomNum}`;

  await client.execute({
    sql: `INSERT INTO guests (id, invitation_id, name, group_name, phone_number, pax_limit, status, invitation_code)
     VALUES (:id, :invId, :name, :group, :phone, :pax, :status, :code)`,
    args: {
      id,
      invId: invitationId,
      name: guestData.name,
      group: guestData.group || '',
      phone: guestData.phoneNumber || '',
      pax: guestData.paxLimit || 2,
      status: guestData.status || 'Draft',
      code: invitationCode,
    }
  });

  return {
    ...guestData,
    id,
    invitationCode,
  };
}

async function main() {
  try {
    const res = await addGuest('test_inv_id', {
      name: 'Bapak Budi',
      group: 'Keluarga',
      phoneNumber: '0812',
      paxLimit: 2,
      status: 'Draft'
    });
    console.log("Add guest result:", res);
  } catch (err) {
    console.error("Add guest failed:", err);
  }
}

main();
