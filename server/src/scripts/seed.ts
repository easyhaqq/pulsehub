import bcrypt from 'bcrypt';
import { pool } from '../db/pool';

async function seed() {
  const hash = await bcrypt.hash('admin123', 12);
  console.log('Password hash:', hash);

  await pool.query(
    `INSERT INTO users (username, password_hash) VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    ['admin', hash]
  );

  console.log('✅ Admin user seeded: admin / admin123');
  await pool.end();
}

seed().catch(console.error);