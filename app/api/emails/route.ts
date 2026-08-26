import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { EmailMessage } from '@/lib/types';

interface EmailRow {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  encrypted_body?: string;
  status: string;
  is_encrypted: number;
  is_tampered: number;
  tampered_by?: string;
  original_body?: string;
  timestamp: string;
}

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db.query<EmailRow>(`SELECT * FROM emails ORDER BY timestamp DESC`);
    const formatted: EmailMessage[] = rows.map(r => ({
      id: r.id,
      sender: r.sender,
      recipient: r.recipient,
      subject: r.subject,
      body: r.body,
      encryptedBody: r.encrypted_body,
      status: r.status as EmailMessage['status'],
      isEncrypted: Boolean(r.is_encrypted),
      isTampered: Boolean(r.is_tampered),
      tamperedBy: r.tampered_by,
      originalBody: r.original_body,
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
    const { id, sender, recipient, subject, body: emailBody, encryptedBody, status, isEncrypted, isTampered, tamperedBy, originalBody, timestamp } = body;
    const db = await getDb();

    await db.execute(
      `INSERT OR REPLACE INTO emails (id, sender, recipient, subject, body, encrypted_body, status, is_encrypted, is_tampered, tampered_by, original_body, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        sender,
        recipient,
        subject,
        emailBody,
        encryptedBody || null,
        status || 'transmitted',
        isEncrypted ? 1 : 0,
        isTampered ? 1 : 0,
        tamperedBy || null,
        originalBody || null,
        timestamp || new Date().toISOString(),
      ]
    );

    return NextResponse.json({ id, message: 'Email saved successfully' }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const db = await getDb();
    await db.execute(`DELETE FROM emails`);
    return NextResponse.json({ message: 'All emails cleared' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
