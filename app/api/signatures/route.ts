import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { DigitalSignatureRecord } from '@/lib/types';

interface SigRow {
  id: string;
  sender: string;
  message_text: string;
  hash_digest_hex: string;
  signature_hex: string;
  is_tampered: number;
  tampered_message?: string;
  verification_status: string;
  timestamp: string;
}

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db.query<SigRow>(`SELECT * FROM signatures ORDER BY timestamp DESC`);
    const formatted: DigitalSignatureRecord[] = rows.map(r => ({
      id: r.id,
      sender: r.sender,
      messageText: r.message_text,
      hashDigestHex: r.hash_digest_hex,
      signatureHex: r.signature_hex,
      isTampered: Boolean(r.is_tampered),
      tamperedMessage: r.tampered_message,
      verificationStatus: r.verification_status as DigitalSignatureRecord['verificationStatus'],
      timestamp: r.timestamp,
    }));
    return NextResponse.json(formatted);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, sender, messageText, hashDigestHex, signatureHex, isTampered, tamperedMessage, verificationStatus, timestamp } = body;
    const db = await getDb();

    await db.execute(
      `INSERT OR REPLACE INTO signatures (id, sender, message_text, hash_digest_hex, signature_hex, is_tampered, tampered_message, verification_status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        sender,
        messageText,
        hashDigestHex,
        signatureHex,
        isTampered ? 1 : 0,
        tamperedMessage || null,
        verificationStatus || 'PENDING',
        timestamp || new Date().toISOString(),
      ]
    );

    return NextResponse.json({ id, message: 'Digital signature record saved' }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const db = await getDb();
    await db.execute(`DELETE FROM signatures`);
    return NextResponse.json({ message: 'All signatures cleared' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
