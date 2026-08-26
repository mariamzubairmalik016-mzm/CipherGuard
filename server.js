const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const dbPath = path.resolve(__dirname, 'cipherguard.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to CipherGuard SQLite Database at:', dbPath);
  }
});

// Create Database Schema Tables
db.serialize(() => {
  // 1. Keys Table
  db.run(`
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
  db.run(`
    CREATE TABLE IF NOT EXISTS emails (
      id TEXT PRIMARY KEY,
      sender TEXT NOT NULL,
      recipient TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      encrypted_body TEXT,
      status TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);

  // 3. VPN Packets Table
  db.run(`
    CREATE TABLE IF NOT EXISTS vpn_packets (
      id TEXT PRIMARY KEY,
      sequence INTEGER NOT NULL,
      source TEXT NOT NULL,
      destination TEXT NOT NULL,
      protocol TEXT NOT NULL,
      payload_plaintext TEXT NOT NULL,
      payload_ciphertext TEXT NOT NULL,
      encrypted INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      hex_dump TEXT
    )
  `);

  // 4. Digital Signatures Table
  db.run(`
    CREATE TABLE IF NOT EXISTS signatures (
      id TEXT PRIMARY KEY,
      sender TEXT NOT NULL,
      message_text TEXT NOT NULL,
      hash_digest_hex TEXT NOT NULL,
      signature_hex TEXT NOT NULL,
      is_tampered INTEGER NOT NULL,
      verification_status TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);

  // 5. Audit Logs Table
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      module TEXT NOT NULL,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      details TEXT NOT NULL
    )
  `);
});

// REST API ROUTES

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', system: 'CipherGuard Express SQLite Backend', timestamp: new Date() });
});

// -------------------------------------------------------------
// KEYS API
// -------------------------------------------------------------
app.get('/api/keys', (req, res) => {
  db.all(`SELECT * FROM keys ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const formatted = rows.map(r => ({
      id: r.id,
      owner: r.owner,
      role: r.role,
      type: r.type,
      keySize: r.key_size,
      publicKeyPem: r.public_key_pem,
      privateKeyPem: r.private_key_pem,
      mathPrimes: r.math_primes_json ? JSON.parse(r.math_primes_json) : undefined,
      createdAt: r.created_at,
    }));
    res.json(formatted);
  });
});

app.post('/api/keys', (req, res) => {
  const { id, owner, role, type, keySize, publicKeyPem, privateKeyPem, mathPrimes, createdAt } = req.body;
  const sql = `INSERT INTO keys (id, owner, role, type, key_size, public_key_pem, private_key_pem, math_primes_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [id, owner, role, type, keySize, publicKeyPem, privateKeyPem, mathPrimes ? JSON.stringify(mathPrimes) : null, createdAt || new Date().toISOString()];
  
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id, message: 'Key pair saved to database' });
  });
});

// -------------------------------------------------------------
// EMAILS API
// -------------------------------------------------------------
app.get('/api/emails', (req, res) => {
  db.all(`SELECT * FROM emails ORDER BY timestamp DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/emails', (req, res) => {
  const { id, sender, recipient, subject, body, encryptedBody, status, timestamp } = req.body;
  const sql = `INSERT INTO emails (id, sender, recipient, subject, body, encrypted_body, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [id, sender, recipient, subject, body, encryptedBody, status, timestamp || new Date().toISOString()];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id, message: 'Email saved to database' });
  });
});

// -------------------------------------------------------------
// VPN PACKETS API
// -------------------------------------------------------------
app.get('/api/vpn/packets', (req, res) => {
  db.all(`SELECT * FROM vpn_packets ORDER BY sequence ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/vpn/packets', (req, res) => {
  const { id, sequence, source, destination, protocol, payloadPlaintext, payloadCiphertext, encrypted, timestamp, hexDump } = req.body;
  const sql = `INSERT INTO vpn_packets (id, sequence, source, destination, protocol, payload_plaintext, payload_ciphertext, encrypted, timestamp, hex_dump) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [id, sequence, source, destination, protocol, payloadPlaintext, payloadCiphertext, encrypted ? 1 : 0, timestamp || new Date().toISOString(), hexDump];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id, message: 'VPN packet saved to database' });
  });
});

// -------------------------------------------------------------
// SIGNATURES API
// -------------------------------------------------------------
app.get('/api/signatures', (req, res) => {
  db.all(`SELECT * FROM signatures ORDER BY timestamp DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/signatures', (req, res) => {
  const { id, sender, messageText, hashDigestHex, signatureHex, isTampered, verificationStatus, timestamp } = req.body;
  const sql = `INSERT INTO signatures (id, sender, message_text, hash_digest_hex, signature_hex, is_tampered, verification_status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [id, sender, messageText, hashDigestHex, signatureHex, isTampered ? 1 : 0, verificationStatus, timestamp || new Date().toISOString()];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id, message: 'Digital signature saved to database' });
  });
});

// -------------------------------------------------------------
// AUDIT LOGS API
// -------------------------------------------------------------
app.get('/api/logs', (req, res) => {
  db.all(`SELECT * FROM audit_logs ORDER BY rowid DESC LIMIT 100`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/logs', (req, res) => {
  const { id, timestamp, module, severity, title, details } = req.body;
  const sql = `INSERT INTO audit_logs (id, timestamp, module, severity, title, details) VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [id, timestamp || new Date().toLocaleTimeString(), module, severity, title, details];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id, message: 'Audit log saved to database' });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=====================================================`);
  console.log(`CipherGuard Backend REST API running at http://localhost:${PORT}`);
  console.log(`SQLite Database file: ${dbPath}`);
  console.log(`=====================================================`);
});
