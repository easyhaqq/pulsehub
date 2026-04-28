import { Pool } from 'pg';

export const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'pulsehub',
  user: 'postgres',        // ← your pgAdmin username
  password: 'Ololade@1999',    // ← your pgAdmin password
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB error:', err);
  process.exit(-1);
});