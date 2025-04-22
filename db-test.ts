import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Required for Neon Serverless
neonConfig.webSocketConstructor = ws;

async function main() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const { rows } = await pool.query('SELECT NOW() as time');
    console.log('Database connection successful!');
    console.log('Current time:', rows[0].time);
    await pool.end();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

main();