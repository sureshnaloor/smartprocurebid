import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../src/shared/schema";

// Required for Neon Serverless in a Node.js environment
neonConfig.webSocketConstructor = ws;

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a database connection pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
});

// Create a Drizzle ORM instance with the schema
export const db = drizzle(pool, { schema });