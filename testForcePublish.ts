import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  url: process.env.VITE_TURSO_DATABASE_URL!,
  authToken: process.env.VITE_TURSO_AUTH_TOKEN!,
});

async function main() {
  await client.execute('UPDATE invitations SET is_published = 1');
  console.log("All invitations force published for testing.");
}

main();
