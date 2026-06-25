import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const client = createClient({
  url: process.env.VITE_TURSO_DATABASE_URL!,
  authToken: process.env.VITE_TURSO_AUTH_TOKEN!,
});

async function main() {
  const result = await client.execute('SELECT id, user_id, is_published FROM invitations');
  console.log("Invitations:", result.rows);
}

main();
