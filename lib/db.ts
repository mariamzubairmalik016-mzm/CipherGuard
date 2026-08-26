import path from 'path';
import fs from 'fs';

// Database Interface Definition
export interface DatabaseDriver {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<{ rowCount?: number; lastInsertRowid?: number | string }>;
  getEngine(): 'Vercel Postgres (Serverless)' | 'Neon Postgres' | 'Local SQLite Engine';
}

let dbInstance: DatabaseDriver | null = null;

// Determine environment database driver
export async function getDb(): Promise<DatabaseDriver> {
  if (dbInstance) return dbInstance;

  const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;

  if (postgresUrl) {
    try {
      // Connect using Neon Serverless Postgres Driver (compatible with Vercel Postgres)
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(postgresUrl);

      dbInstance = {
        async query<T = unknown>(queryStr: string, params?: unknown[]): Promise<T[]> {
          let index = 1;
          let pgSql = queryStr.replace(/\?/g, () => `$${index++}`);
          if (pgSql.includes('INSERT OR REPLACE INTO')) {
            pgSql = pgSql.replace('INSERT OR REPLACE INTO', 'INSERT INTO') + ' ON CONFLICT (id) DO NOTHING';
          }
          const rows = await sql(pgSql, params || []);
          return rows as unknown as T[];
        },
        async execute(queryStr: string, params?: unknown[]): Promise<{ rowCount?: number }> {
          let index = 1;
          let pgSql = queryStr.replace(/\?/g, () => `$${index++}`);
          if (pgSql.includes('INSERT OR REPLACE INTO')) {
            pgSql = pgSql.replace('INSERT OR REPLACE INTO', 'INSERT INTO') + ' ON CONFLICT (id) DO NOTHING';
          }
          const res = await sql(pgSql, params || []);
          return { rowCount: Array.isArray(res) ? res.length : 1 };
        },
        getEngine() {
          return 'Vercel Postgres (Serverless)';
        }
      };

      await initializeSchema(dbInstance);
      return dbInstance;
    } catch (err) {
      console.warn('Postgres connection failed, falling back to SQLite:', err);
    }
  }

  // Local SQLite Fallback Driver
  const sqlite3 = (await import('sqlite3')).default;
  const dbPath = path.resolve(process.cwd(), 'cipherguard.db');

  const sqliteDb = new sqlite3.Database(dbPath);

  dbInstance = {
    query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
      return new Promise((resolve, reject) => {
        sqliteDb.all(sql, params || [], (err, rows) => {
          if (err) return reject(err);
          resolve((rows || []) as T[]);
        });
      });
    },
    execute(sql: string, params?: unknown[]): Promise<{ rowCount?: number; lastInsertRowid?: number | string }> {
      return new Promise((resolve, reject) => {
        sqliteDb.run(sql, params || [], function (err) {
          if (err) return reject(err);
          resolve({ rowCount: this.changes, lastInsertRowid: this.lastID });
        });
      });
    },
    getEngine() {
      return 'Local SQLite Engine';
    }
  };

  await initializeSchema(dbInstance);
  return dbInstance;
}

// Table Schema Migration
async function initializeSchema(db: DatabaseDriver) {
  try {
    // 1. Keys Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS keys (
        id TEXT PRIMARY KEY,
        owner TEXT NOT NULL,
        role TEXT NOT NULL,
        type TEXT NOT NULL,
        key_size INTEGER NOT NULL,
        public_key_pem TEXT NOT NULL,
        private_key_pem TEXT NOT NULL,
        math_primes_json TEXT,
        created_at TEXT NOT NULL
      )
    `);

    // 2. Emails Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS emails (
        id TEXT PRIMARY KEY,
        sender TEXT NOT NULL,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        encrypted_body TEXT,
        status TEXT NOT NULL,
        is_encrypted INTEGER DEFAULT 0,
        is_tampered INTEGER DEFAULT 0,
        tampered_by TEXT,
        original_body TEXT,
        timestamp TEXT NOT NULL
      )
    `);

    // 3. VPN Packets Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS vpn_packets (
        id TEXT PRIMARY KEY,
        sequence INTEGER NOT NULL,
        source TEXT NOT NULL,
        destination TEXT NOT NULL,
        protocol TEXT NOT NULL,
        payload_plaintext TEXT NOT NULL,
        payload_ciphertext TEXT NOT NULL,
        encrypted INTEGER NOT NULL,
        tls_step TEXT,
        timestamp TEXT NOT NULL,
        hex_dump TEXT
      )
    `);

    // 4. Digital Signatures Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS signatures (
        id TEXT PRIMARY KEY,
        sender TEXT NOT NULL,
        message_text TEXT NOT NULL,
        hash_digest_hex TEXT NOT NULL,
        signature_hex TEXT NOT NULL,
        is_tampered INTEGER NOT NULL,
        tampered_message TEXT,
        verification_status TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `);

    // 5. MITM Packets Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS mitm_packets (
        id TEXT PRIMARY KEY,
        scenario TEXT NOT NULL,
        source_ip TEXT NOT NULL,
        dest_ip TEXT NOT NULL,
        source_mac TEXT NOT NULL,
        dest_mac TEXT NOT NULL,
        protocol TEXT NOT NULL,
        raw_payload TEXT NOT NULL,
        modified_payload TEXT,
        intercepted INTEGER NOT NULL,
        forwarded INTEGER NOT NULL,
        dropped INTEGER NOT NULL,
        tampered INTEGER NOT NULL,
        hex_dump TEXT NOT NULL,
        security_status TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `);

    // 6. MITM Threats & Alerts Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS mitm_alerts (
        id TEXT PRIMARY KEY,
        level TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        mitigation TEXT NOT NULL,
        resolved INTEGER DEFAULT 0,
        timestamp TEXT NOT NULL
      )
    `);

    // 7. Audit Logs Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        module TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        details TEXT NOT NULL
      )
    `);
  } catch (err) {
    console.error('Error during table schema initialization:', err);
  }
}
