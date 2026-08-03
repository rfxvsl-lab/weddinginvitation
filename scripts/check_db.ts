import * as dotenv from 'dotenv';
dotenv.config();

import { dbExecute } from '../src/lib/turso.js';

async function check() {
  const res = await dbExecute("PRAGMA table_info(invitations);");
  console.log(res.rows.map(r => r.name));
}
check().catch(console.error);
