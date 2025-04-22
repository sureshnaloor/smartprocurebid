import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from './src/shared/schema';

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Please create a PostgreSQL database and set the DATABASE_URL environment variable.');
    process.exit(1);
  }

  try {
    console.log('Connecting to the database...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    console.log('Pushing schema to the database...');
    
    // Push the schema changes to the database
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
    
    console.log('Creating tables...');
    // Create tables using SQL directly since we don't have a migration yet
    try {
      // Users
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          uuid UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255),
          role VARCHAR(50) NOT NULL,
          company_name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);

      // Vendors
      await pool.query(`
        CREATE TABLE IF NOT EXISTS vendors (
          id SERIAL PRIMARY KEY,
          uuid UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,
          buyer_id INTEGER NOT NULL REFERENCES users(id),
          company_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          contact_name VARCHAR(255),
          phone VARCHAR(50),
          tier VARCHAR(50) NOT NULL,
          location VARCHAR(255),
          material_class VARCHAR(255)
        );
      `);

      // Bids
      await pool.query(`
        CREATE TABLE IF NOT EXISTS bids (
          id SERIAL PRIMARY KEY,
          uuid UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,
          buyer_id INTEGER NOT NULL REFERENCES users(id),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          due_date TIMESTAMP NOT NULL,
          last_reminder_sent TIMESTAMP
        );
      `);

      // Bid Requirements
      await pool.query(`
        CREATE TABLE IF NOT EXISTS bid_requirements (
          id SERIAL PRIMARY KEY,
          bid_id INTEGER NOT NULL REFERENCES bids(id),
          tier VARCHAR(50) NOT NULL,
          material_class VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          min_bid_amount INTEGER NOT NULL
        );
      `);

      // Bid Items
      await pool.query(`
        CREATE TABLE IF NOT EXISTS bid_items (
          id SERIAL PRIMARY KEY,
          uuid UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,
          bid_id INTEGER NOT NULL REFERENCES bids(id),
          material_code VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          uom VARCHAR(50) NOT NULL,
          packaging VARCHAR(100),
          remarks TEXT
        );
      `);

      // Vendor Invitations
      await pool.query(`
        CREATE TABLE IF NOT EXISTS vendor_invitations (
          id SERIAL PRIMARY KEY,
          bid_id INTEGER NOT NULL REFERENCES bids(id),
          vendor_id INTEGER NOT NULL REFERENCES vendors(id),
          has_responded BOOLEAN DEFAULT FALSE NOT NULL,
          responded_at TIMESTAMP,
          UNIQUE(bid_id, vendor_id)
        );
      `);

      // Vendor Submissions
      await pool.query(`
        CREATE TABLE IF NOT EXISTS vendor_submissions (
          id SERIAL PRIMARY KEY,
          uuid UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,
          bid_id INTEGER NOT NULL REFERENCES bids(id),
          vendor_id INTEGER NOT NULL REFERENCES vendors(id),
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          incoterm VARCHAR(100),
          payment_terms VARCHAR(100),
          additional_notes TEXT,
          UNIQUE(bid_id, vendor_id)
        );
      `);

      // Vendor Item Responses
      await pool.query(`
        CREATE TABLE IF NOT EXISTS vendor_item_responses (
          id SERIAL PRIMARY KEY,
          submission_id INTEGER NOT NULL REFERENCES vendor_submissions(id),
          item_id INTEGER NOT NULL REFERENCES bid_items(id),
          price INTEGER NOT NULL,
          lead_time INTEGER NOT NULL,
          incoterm VARCHAR(100) NOT NULL,
          payment_terms VARCHAR(100) NOT NULL
        );
      `);

      console.log('Database schema has been successfully created!');
    } catch (error) {
      console.error('Error creating tables:', error);
    }

    await pool.end();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Database push failed:', error);
  }
}

main();