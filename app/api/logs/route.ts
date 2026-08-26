import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { AuditLogEntry } from '@/lib/types';

interface LogRow {
  id: string;
  timestamp: string;
  module: string;
  severity: string;
  title: string;
  details: string;
}

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db.query<LogRow>(`SELECT * FROM audit_logs ORDER BY rowid DESC LIMIT 200`);
    const formatted: AuditLogEntry[] = rows.map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      module: r.module,
      severity: r.severity as AuditLogEntry['severity'],
      title: r.title,
      details: r.details,
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
    const { id, timestamp, module, severity, title, details } = body;
    const db = await getDb();

    await db.execute(
      `INSERT INTO audit_logs (id, timestamp, module, severity, title, details) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id || `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp || new Date().toLocaleTimeString(),
        module,
        severity || 'INFO',
        title,
        details,
      ]
    );

    return NextResponse.json({ message: 'Audit log entry recorded' }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const db = await getDb();
    await db.execute(`DELETE FROM audit_logs`);
    return NextResponse.json({ message: 'All audit logs cleared' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
