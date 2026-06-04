import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  url: process.env.VITE_TURSO_DATABASE_URL!,
  authToken: process.env.VITE_TURSO_AUTH_TOKEN!,
});

async function main() {
  try {
    const res = await client.execute({
      sql: `INSERT INTO rsvps (id, invitation_id, guest_id, guest_name, status, pax_count, wishes, timestamp)
            VALUES (:id, :invId, :guestId, :name, :status, :pax, :wishes, :ts)`,
      args: {
        id: 'rsvp123' + Date.now(),
        invId: 'test_inv_id',
        guestId: null,
        name: 'Guest RSVP',
        status: 'Hadir',
        pax: 2,
        wishes: 'Congrats',
        ts: new Date().toISOString()
      }
    });
    console.log("Insert success:", res);
  } catch (err) {
    console.error("Insert failed:", err);
  }
}

main();
